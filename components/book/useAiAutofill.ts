'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { BookingFormData } from './schema';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  filledSummary?: string[];
  missingFields?: string[];
}

interface UseAiAutofillOptions {
  currentFormData: Partial<BookingFormData>;
  onApplyFields: (fields: Partial<BookingFormData>) => void;
}

export function useAiAutofill({ currentFormData, onApplyFields }: UseAiAutofillOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [latestFilledCount, setLatestFilledCount] = useState<number | null>(null);

  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-GB';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let transcriptAccumulator = '';
        for (let i = 0; i < event.results.length; i++) {
          transcriptAccumulator += event.results[i][0].transcript + ' ';
        }
        setInput(transcriptAccumulator.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access was denied. You can still type your event details.');
        } else if (event.error !== 'no-speech') {
          setErrorMsg(`Voice input: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition setup failed:', err);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      setErrorMsg('Speech recognition is not supported in this browser. Please type your details.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
    } else {
      setErrorMsg(null);
      setIsOpen(true);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setIsListening(false);
      }
    }
  }, [isListening]);

  const handleSubmit = useCallback(
    async (textToSubmit?: string) => {
      const text = (textToSubmit ?? input).trim();
      if (!text) {
        setErrorMsg('Please describe your event or speak into the microphone first.');
        return;
      }

      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
        setIsListening(false);
      }

      setIsLoading(true);
      setErrorMsg(null);

      const userMessage = text;
      setInput('');

      try {
        const res = await fetch('/api/ai-autofill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: userMessage,
            currentData: currentFormData,
            conversationHistory: chatHistory.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || 'Failed to analyze event details.');
        }

        if (data.fields && typeof data.fields === 'object') {
          const fieldCount = Object.keys(data.fields).filter(
            (k) => data.fields[k] !== null && data.fields[k] !== undefined && data.fields[k] !== ''
          ).length;

          onApplyFields(data.fields);
          setLatestFilledCount(fieldCount);
        }

        setChatHistory((prev) => [
          ...prev,
          { role: 'user', content: userMessage },
          {
            role: 'assistant',
            content: data.assistantMessage || "I've updated your booking form with your details!",
            filledSummary: data.filledFieldsSummary || [],
            missingFields: data.missingFields || [],
          },
        ]);
      } catch (err: any) {
        console.error('Auto-fill error:', err);
        setErrorMsg(err.message || 'Unable to autofill. Please try again.');
        setInput(userMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isListening, currentFormData, chatHistory, onApplyFields]
  );

  const handleClearHistory = useCallback(() => {
    setChatHistory([]);
    setLatestFilledCount(null);
    setInput('');
    setErrorMsg(null);
  }, []);

  return {
    isOpen,
    setIsOpen,
    input,
    setInput,
    isLoading,
    isListening,
    speechSupported,
    errorMsg,
    chatHistory,
    latestFilledCount,
    toggleListening,
    handleSubmit,
    handleClearHistory,
  };
}

export type AiAutofillController = ReturnType<typeof useAiAutofill>;
