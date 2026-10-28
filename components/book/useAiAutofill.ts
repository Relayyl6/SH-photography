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
 * Cleans consecutive duplicate words and repeated phrases
 */
export function cleanSpeechDuplicates(text: string): string {
  if (!text) return '';
  let cleaned = text;

  cleaned = cleaned.replace(/\b([a-zA-Z0-9]+)\s+\1\b/gi, (_m, p1) => p1);
  cleaned = cleaned.replace(/\b([a-zA-Z0-9]+)\s+\1\b/gi, (_m, p1) => p1);
  cleaned = cleaned.replace(/\b([a-zA-Z0-9]+\s+[a-zA-Z0-9]+)\s+\1\b/gi, (_m, p1) => p1);
  cleaned = cleaned.replace(/\b([a-zA-Z0-9]+\s+[a-zA-Z0-9]+\s+[a-zA-Z0-9]+)\s+\1\b/gi, (_m, p1) => p1);

  return cleaned.replace(/\s+/g, ' ').trim();
}

function appendSpeechChunk(existing: string, newChunk: string): string {
  const cleanExisting = existing.trim();
  const cleanNew = cleanSpeechDuplicates(newChunk.trim());
  if (!cleanNew) return cleanExisting;
  if (!cleanExisting) return cleanNew;

  const existingLower = cleanExisting.toLowerCase();
  const newLower = cleanNew.toLowerCase();

  if (existingLower.endsWith(newLower)) {
    return cleanExisting;
  }

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

function getSupportedMimeType(): string {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return 'audio/webm';
  }
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg',
    'audio/wav',
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) {
      return c;
    }
  }
  return '';
}

export function useAiAutofill({ currentFormData, onApplyFields }: UseAiAutofillOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInputState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
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

  // MediaRecorder refs for zero-beep continuous voice capture with pauses
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const setInput = useCallback((value: string | ((prev: string) => string)) => {
    setInputState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      committedTextRef.current = next;
      interimTextRef.current = '';
      return next;
    });
  }, []);

  // Initialize environment detection & Web Speech API for desktop
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    isMobileRef.current = isAndroid || isIOS;

    const hasMediaRecorder = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!hasMediaRecorder && !SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    if (SpeechRecognition) {
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
          if (event.error === 'no-speech' || event.error === 'aborted') {
            return;
          }
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            isUserWantsListeningRef.current = false;
            setIsListening(false);
            setErrorMsg('Microphone access was denied. Please allow microphone permissions or type details.');
          } else if (event.error === 'audio-capture') {
            isUserWantsListeningRef.current = false;
            setIsListening(false);
            setErrorMsg('No microphone was detected on this device.');
          }
        };

        recognition.onend = () => {
          if (interimTextRef.current) {
            committedTextRef.current = appendSpeechChunk(
              committedTextRef.current,
              interimTextRef.current
            );
            interimTextRef.current = '';
            setInputState(committedTextRef.current);
          }

          // On desktop, auto-restart allows pauses without annoying OS tones
          if (!isMobileRef.current && isUserWantsListeningRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = setTimeout(() => {
              if (isUserWantsListeningRef.current && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (_) {}
              }
            }, 100);
          } else {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition setup notice:', err);
      }
    }

    return () => {
      clearTimeout(restartTimeoutRef.current);
      clearInterval(recordingTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Submit audio or text to /api/ai-autofill
  const sendToAiEndpoint = useCallback(
    async (payload: { transcript?: string; audio?: { base64: string; mimeType: string } }) => {
      setIsLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch('/api/ai-autofill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: payload.transcript,
            audio: payload.audio,
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

        const userMessageText = data.userTranscript || payload.transcript || '🎤 Voice message';

        setChatHistory((prev) => [
          ...prev,
          { role: 'user', content: userMessageText },
          {
            role: 'assistant',
            content: data.assistantMessage || "I've updated your booking form with your details!",
            filledSummary: data.filledFieldsSummary || [],
            missingFields: data.missingFields || [],
          },
        ]);

        committedTextRef.current = '';
        interimTextRef.current = '';
        setInputState('');
      } catch (err: any) {
        console.error('Auto-fill error:', err);
        setErrorMsg(err.message || 'Unable to autofill. Please try again.');
        if (payload.transcript) {
          setInputState(payload.transcript);
          committedTextRef.current = payload.transcript;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [currentFormData, chatHistory, onApplyFields]
  );

  // Stop MediaRecorder and return base64
  const stopAudioRecording = useCallback((): Promise<{ base64: string; mimeType: string } | null> => {
    return new Promise((resolve) => {
      clearInterval(recordingTimerRef.current);
      setRecordingSeconds(0);
      setIsRecordingAudio(false);
      setIsListening(false);
      isUserWantsListeningRef.current = false;

      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }
        resolve(null);
        return;
      }

      const recorder = mediaRecorderRef.current;
      recorder.onstop = () => {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }

        const mime = recorder.mimeType || getSupportedMimeType() || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mime });
        audioChunksRef.current = [];

        if (blob.size < 100) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          const base64 = res.split(',')[1] || '';
          resolve({ base64, mimeType: mime });
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      };

      try {
        recorder.stop();
      } catch (_) {
        resolve(null);
      }
    });
  }, []);

  // Main Submit action
  const handleSubmit = useCallback(
    async (textToSubmit?: string) => {
      // If voice recording is in progress, stop it and submit audio
      if (isRecordingAudio) {
        const audioData = await stopAudioRecording();
        if (audioData) {
          await sendToAiEndpoint({ audio: audioData });
          return;
        }
      }

      // If Web Speech API was running on desktop, stop it
      if (isListening) {
        isUserWantsListeningRef.current = false;
        clearTimeout(restartTimeoutRef.current);
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (_) {}
        }
        setIsListening(false);
      }

      // Flush any lingering interim voice text
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

      await sendToAiEndpoint({ transcript: text });
    },
    [isRecordingAudio, isListening, input, stopAudioRecording, sendToAiEndpoint]
  );

  // Toggle listening / voice recording
  const toggleListening = useCallback(async () => {
    setErrorMsg(null);
    setIsOpen(true);

    // 1. If currently active, STOP and SUBMIT cleanly
    if (isListening || isRecordingAudio) {
      await handleSubmit();
      return;
    }

    // 2. Start Voice Capture:
    // On mobile devices, use MediaRecorder for ZERO-BEEP continuous recording with unlimited pauses.
    // On desktop, use Web Speech API for real-time live typing (fallback to MediaRecorder if unsupported).
    const useMediaRecording = isMobileRef.current || !recognitionRef.current;

    if (useMediaRecording) {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorMsg('Voice recording is not supported in this browser. Please type your details.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const mime = getSupportedMimeType();
        const options = mime ? { mimeType: mime } : undefined;
        const recorder = new MediaRecorder(stream, options);

        audioChunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.start(250);
        mediaRecorderRef.current = recorder;
        setIsRecordingAudio(true);
        setIsListening(true);
        isUserWantsListeningRef.current = true;

        setRecordingSeconds(0);
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds((s) => s + 1);
        }, 1000);
      } catch (err: any) {
        console.error('Microphone start error:', err);
        setIsRecordingAudio(false);
        setIsListening(false);
        setErrorMsg('Microphone access was denied. Please allow microphone permissions or type details.');
      }
    } else {
      // Desktop live dictation
      isUserWantsListeningRef.current = true;
      committedTextRef.current = input.trim();
      interimTextRef.current = '';

      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        if (err?.name === 'InvalidStateError') {
          setIsListening(true);
        } else {
          console.error('Web Speech start error:', err);
          isUserWantsListeningRef.current = false;
          setIsListening(false);
          setErrorMsg('Could not start speech recognition. You can type your event details instead.');
        }
      }
    }
  }, [isListening, isRecordingAudio, input, handleSubmit]);

  const handleClearHistory = useCallback(() => {
    setChatHistory([]);
    setLatestFilledCount(null);
    setInputState('');
    committedTextRef.current = '';
    interimTextRef.current = '';
    setErrorMsg(null);
  }, []);

  const cancelRecording = useCallback(() => {
    clearInterval(recordingTimerRef.current);
    setRecordingSeconds(0);
    setIsRecordingAudio(false);
    setIsListening(false);
    isUserWantsListeningRef.current = false;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    audioChunksRef.current = [];
  }, []);

  return {
    isOpen,
    setIsOpen,
    input,
    setInput,
    isLoading,
    isListening,
    isRecordingAudio,
    recordingSeconds,
    speechSupported,
    errorMsg,
    chatHistory,
    latestFilledCount,
    toggleListening,
    handleSubmit,
    handleClearHistory,
    cancelRecording,
  };
}

export type AiAutofillController = ReturnType<typeof useAiAutofill>;
