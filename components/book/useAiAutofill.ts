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

/**
 * Cleans consecutive duplicate words and repeated phrases frequently generated
 * by mobile speech engines (e.g. "wedding wedding", "in Manchester in Manchester")
 */
export function cleanSpeechDuplicates(text: string): string {
  if (!text) return '';
  let cleaned = text;

  // 1. Remove consecutive identical words (case-insensitive) e.g. "wedding wedding" -> "wedding"
  cleaned = cleaned.replace(/\b([a-zA-Z0-9]+)\s+\1\b/gi, (_m, p1) => p1);
  cleaned = cleaned.replace(/\b([a-zA-Z0-9]+)\s+\1\b/gi, (_m, p1) => p1);

  // 2. Remove consecutive identical 2-word phrases e.g. "in Manchester in Manchester" -> "in Manchester"
  cleaned = cleaned.replace(/\b([a-zA-Z0-9]+\s+[a-zA-Z0-9]+)\s+\1\b/gi, (_m, p1) => p1);

  // 3. Remove consecutive identical 3-word phrases e.g. "for my wedding for my wedding" -> "for my wedding"
  cleaned = cleaned.replace(/\b([a-zA-Z0-9]+\s+[a-zA-Z0-9]+\s+[a-zA-Z0-9]+)\s+\1\b/gi, (_m, p1) => p1);

  // 4. Normalize multiple spaces
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Appends a new speech chunk onto already committed text while avoiding
 * tail/head overlapping words common in mobile SpeechRecognition chunk streaming.
 */
function appendSpeechChunk(existing: string, newChunk: string): string {
  const cleanExisting = existing.trim();
  const cleanNew = cleanSpeechDuplicates(newChunk.trim());
  if (!cleanNew) return cleanExisting;
  if (!cleanExisting) return cleanNew;

  const existingLower = cleanExisting.toLowerCase();
  const newLower = cleanNew.toLowerCase();

  // If the new chunk is already identical to the tail, ignore it
  if (existingLower.endsWith(newLower)) {
    return cleanExisting;
  }

  // Check for multi-word overlap at the boundary
  const existingWords = cleanExisting.split(/\s+/);
  const newWords = cleanNew.split(/\s+/);

  for (let overlap = Math.min(existingWords.length, newWords.length); overlap > 0; overlap--) {
    const existingTail = existingWords.slice(-overlap).join(' ').toLowerCase();
    const newHead = newWords.slice(0, overlap).join(' ').toLowerCase();
    if (existingTail === newHead) {
      const rest = newWords.slice(overlap).join(' ');
      const combined = rest ? `${cleanExisting} ${rest}` : cleanExisting;
      return cleanSpeechDuplicates(combined);
    }
  }

  return cleanSpeechDuplicates(`${cleanExisting} ${cleanNew}`);
}

export function useAiAutofill({ currentFormData, onApplyFields }: UseAiAutofillOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInputState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [latestFilledCount, setLatestFilledCount] = useState<number | null>(null);

  const recognitionRef = useRef<any>(null);
  const isUserWantsListeningRef = useRef<boolean>(false);
  const committedTextRef = useRef<string>('');
  const interimTextRef = useRef<string>('');
  const restartTimeoutRef = useRef<any>(null);
  const isMobileRef = useRef<boolean>(false);
  const silentRestartCountRef = useRef<number>(0);

  // Synchronized input setter that keeps committedTextRef aligned
  const setInput = useCallback((value: string | ((prev: string) => string)) => {
    setInputState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      committedTextRef.current = next;
      interimTextRef.current = '';
      return next;
    });
  }, []);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    isMobileRef.current = isAndroid || isIOS;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      // continuous = true keeps the microphone open without stopping on pauses or triggering annoying OS beeps
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-GB';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          const text = item[0]?.transcript || '';
          if (item.isFinal) {
            finalChunk += text + ' ';
          } else {
            interimChunk += text;
          }
        }

        if (finalChunk.trim()) {
          committedTextRef.current = appendSpeechChunk(
            committedTextRef.current,
            finalChunk
          );
          interimTextRef.current = '';
          setInputState(committedTextRef.current);
        } else if (interimChunk.trim()) {
          interimTextRef.current = cleanSpeechDuplicates(interimChunk.trim());
          const base = committedTextRef.current.trim();
          const live = base ? `${base} ${interimTextRef.current}` : interimTextRef.current;
          setInputState(live);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        // Ignore benign silence and normal abort events
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          isUserWantsListeningRef.current = false;
          setIsListening(false);
          setErrorMsg('Microphone access was denied. Please allow microphone permissions or type your details.');
        } else if (event.error === 'audio-capture') {
          isUserWantsListeningRef.current = false;
          setIsListening(false);
          setErrorMsg('No microphone was detected on this device.');
        }
      };

      recognition.onend = () => {
        // Flush any pending interim speech
        if (interimTextRef.current) {
          committedTextRef.current = appendSpeechChunk(
            committedTextRef.current,
            interimTextRef.current
          );
          interimTextRef.current = '';
          setInputState(committedTextRef.current);
        }

        // Clean finish without annoying restart-beep loops
        isUserWantsListeningRef.current = false;
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition setup failed:', err);
      setSpeechSupported(false);
    }

    return () => {
      clearTimeout(restartTimeoutRef.current);
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

    if (isListening || isUserWantsListeningRef.current) {
      // User tapped Stop
      isUserWantsListeningRef.current = false;
      silentRestartCountRef.current = 0;
      clearTimeout(restartTimeoutRef.current);
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);

      if (interimTextRef.current) {
        committedTextRef.current = appendSpeechChunk(
          committedTextRef.current,
          interimTextRef.current
        );
        interimTextRef.current = '';
        setInputState(committedTextRef.current);
      }
    } else {
      // User tapped Speak
      setErrorMsg(null);
      setIsOpen(true);
      isUserWantsListeningRef.current = true;
      silentRestartCountRef.current = 0;

      // Preserve existing text in box so new voice appends smoothly
      committedTextRef.current = input.trim();
      interimTextRef.current = '';

      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        if (err?.name === 'InvalidStateError') {
          setIsListening(true);
        } else {
          console.error('Failed to start speech recognition:', err);
          isUserWantsListeningRef.current = false;
          setIsListening(false);
          setErrorMsg('Could not activate microphone. You can type your event details instead.');
        }
      }
    }
  }, [input, isListening]);

  const handleSubmit = useCallback(
    async (textToSubmit?: string) => {
      // If voice is currently running, stop it cleanly
      if (isUserWantsListeningRef.current || isListening) {
        isUserWantsListeningRef.current = false;
        silentRestartCountRef.current = 0;
        clearTimeout(restartTimeoutRef.current);
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (_) {}
        }
        setIsListening(false);
      }

      // Flush any lingering interim voice chunk
      let rawText = textToSubmit ?? input;
      if (interimTextRef.current) {
        rawText = appendSpeechChunk(rawText, interimTextRef.current);
        interimTextRef.current = '';
      }

      const text = cleanSpeechDuplicates(rawText.trim());
      if (!text) {
        setErrorMsg('Please describe your event or speak into the microphone first.');
        return;
      }

      setIsLoading(true);
      setErrorMsg(null);

      const userMessage = text;
      committedTextRef.current = '';
      interimTextRef.current = '';
      setInputState('');

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
        setInputState(userMessage);
        committedTextRef.current = userMessage;
      } finally {
        setIsLoading(false);
      }
    },
    [input, isListening, currentFormData, chatHistory, onApplyFields]
  );

  const handleClearHistory = useCallback(() => {
    setChatHistory([]);
    setLatestFilledCount(null);
    setInputState('');
    committedTextRef.current = '';
    interimTextRef.current = '';
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
