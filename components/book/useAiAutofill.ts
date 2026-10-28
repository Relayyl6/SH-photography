'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
 * Dynamically counts how many fields are currently filled in the booking form
 */
export function countFilledFields(data?: Partial<BookingFormData> | null): number {
  if (!data || typeof data !== 'object') return 0;
  let count = 0;

  for (const [, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim().length > 0) {
      count++;
    } else if (typeof value === 'boolean' && value === true) {
      count++;
    } else if (Array.isArray(value) && value.length > 0) {
      count++;
    } else if (typeof value === 'number' && !isNaN(value)) {
      count++;
    }
  }

  return count;
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
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [latestFilledCount, setLatestFilledCount] = useState<number | null>(null);

  // Dynamically calculate the real-time filled field count from the live form data
  const filledCount = useMemo(() => {
    return countFilledFields(currentFormData);
  }, [currentFormData]);

  const recognitionRef = useRef<any>(null);
  const isUserWantsListeningRef = useRef<boolean>(false);
  const baseTextRef = useRef<string>('');
  const liveSpeechTextRef = useRef<string>('');
  const inputStateRef = useRef<string>('');
  const restartTimeoutRef = useRef<any>(null);
  const isMobileRef = useRef<boolean>(false);

  // MediaRecorder refs for audio capture
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  useEffect(() => {
    inputStateRef.current = input;
  }, [input]);

  const setInput = useCallback((value: string | ((prev: string) => string)) => {
    setInputState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      baseTextRef.current = next;
      liveSpeechTextRef.current = '';
      return next;
    });
  }, []);

  // Initialize environment detection & Web Speech API for real-time live typing
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
        recognition.lang = (typeof navigator !== 'undefined' && navigator.language) || 'en-GB';

        recognition.onstart = () => {
          setIsListening(true);
          setErrorMsg(null);
        };

        recognition.onresult = (event: any) => {
          let sessionFinal = '';
          let sessionInterim = '';

          for (let i = 0; i < event.results.length; i++) {
            const item = event.results[i];
            const text = item[0]?.transcript || '';
            if (item.isFinal) {
              sessionFinal += text + ' ';
            } else {
              sessionInterim += text;
            }
          }

          const currentSpoken = `${sessionFinal}${sessionInterim}`.trim();
          const base = baseTextRef.current.trim();
          const liveText = base && currentSpoken ? `${base} ${currentSpoken}` : (currentSpoken || base);

          liveSpeechTextRef.current = currentSpoken;
          setInputState(liveText);
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'no-speech' || event.error === 'aborted') {
            return;
          }
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            console.warn('SpeechRecognition permission notice:', event.error);
            if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
              isUserWantsListeningRef.current = false;
              setIsListening(false);
              setErrorMsg('Microphone access was denied. Please allow microphone permissions or type details.');
            }
          }
        };

        recognition.onend = () => {
          if (isUserWantsListeningRef.current) {
            // When auto-restarting after natural pauses, lock in what has been spoken so far as base
            baseTextRef.current = (inputStateRef.current || '').trim();
            liveSpeechTextRef.current = '';
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = setTimeout(() => {
              if (isUserWantsListeningRef.current && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (_) {}
              }
            }, 150);
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

  // Submit text to /api/ai-autofill
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

        baseTextRef.current = '';
        liveSpeechTextRef.current = '';
        setInputState('');
      } catch (err: any) {
        console.error('Auto-fill error:', err);
        setErrorMsg(err.message || 'Unable to autofill. Please try again.');
        if (payload.transcript) {
          setInputState(payload.transcript);
          baseTextRef.current = payload.transcript;
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
      isUserWantsListeningRef.current = false;

      // Also stop Web Speech if it was running alongside for live preview
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      setIsListening(false);

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

  // Stop voice capture and load transcribed text into the input box for user review & editing
  const stopVoiceCapture = useCallback(async () => {
    setErrorMsg(null);

    // 1. Speech-only (desktop, no MediaRecorder): stop recognition and finalize text
    if (!isRecordingAudio && isListening) {
      isUserWantsListeningRef.current = false;
      clearTimeout(restartTimeoutRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      setIsListening(false);

      // Lock in whatever is currently in the input box
      const cleanText = cleanSpeechDuplicates((inputStateRef.current || '').trim());
      baseTextRef.current = cleanText;
      liveSpeechTextRef.current = '';
      setInputState(cleanText);
      return;
    }

    // 2. MediaRecorder path (mobile): stop recorder, stop speech, transcribe audio to text
    if (isRecordingAudio) {
      // Capture what Web Speech has typed so far as a preview (it will be replaced by server transcription)
      const livePreview = (inputStateRef.current || '').trim();

      setIsTranscribing(true);
      const audioData = await stopAudioRecording();
      if (!audioData) {
        setIsTranscribing(false);
        // Keep any live preview text that was typed
        if (livePreview) {
          baseTextRef.current = livePreview;
          setInputState(livePreview);
        }
        return;
      }

      try {
        const res = await fetch('/api/ai-autofill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'transcribe',
            audio: audioData,
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Failed to transcribe audio.');
        }

        if (data.transcript && typeof data.transcript === 'string') {
          const transcribed = data.transcript.trim();
          // Server transcription replaces the live preview with a cleaner version
          const preBase = baseTextRef.current.trim();
          const finalText = preBase ? `${preBase} ${transcribed}` : transcribed;
          baseTextRef.current = finalText;
          liveSpeechTextRef.current = '';
          setInputState(finalText);
        }
      } catch (err: any) {
        console.error('Transcription error:', err);
        setErrorMsg(err.message || 'Could not transcribe voice. You can type your details directly.');
        // Keep the live preview on error so user doesn't lose what they said
        if (livePreview) {
          baseTextRef.current = livePreview;
          setInputState(livePreview);
        }
      } finally {
        setIsTranscribing(false);
      }
    }
  }, [isRecordingAudio, isListening, stopAudioRecording]);

  // Main Submit action — autofills form from the text in the input pane
  const handleSubmit = useCallback(
    async (textToSubmit?: string) => {
      // If voice recording is still running, stop and transcribe first so the user can review
      if (isRecordingAudio || isListening) {
        await stopVoiceCapture();
        return;
      }

      const text = cleanSpeechDuplicates((textToSubmit ?? input).trim());
      if (!text) {
        setErrorMsg('Please describe your event or speak into the microphone first.');
        return;
      }

      await sendToAiEndpoint({ transcript: text });
    },
    [isRecordingAudio, isListening, input, stopVoiceCapture, sendToAiEndpoint]
  );

  // Toggle listening / voice recording
  const toggleListening = useCallback(async () => {
    setErrorMsg(null);
    setIsOpen(true);

    // 1. If currently active, STOP and load text into the input pane for review (DO NOT autofill)
    if (isListening || isRecordingAudio) {
      await stopVoiceCapture();
      return;
    }

    // 2. Start Voice Capture
    // Save current input text as the base, so new speech appends after it
    baseTextRef.current = input.trim();
    liveSpeechTextRef.current = '';
    isUserWantsListeningRef.current = true;

    const hasSpeechRecognition = !!recognitionRef.current;
    const needsMediaRecorder = isMobileRef.current || !hasSpeechRecognition;

    // Start MediaRecorder for high-quality audio capture (mobile always, desktop fallback)
    if (needsMediaRecorder) {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorMsg('Voice recording is not supported in this browser. Please type your details.');
        isUserWantsListeningRef.current = false;
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

        setRecordingSeconds(0);
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds((s) => s + 1);
        }, 1000);

        // Also start Web Speech API alongside for live typing preview on mobile
        if (hasSpeechRecognition) {
          try {
            recognitionRef.current.start();
          } catch (_) {
            // Speech recognition failed to start alongside — that's OK, audio recording continues
          }
        }
      } catch (err: any) {
        console.error('Microphone start error:', err);
        setIsRecordingAudio(false);
        setIsListening(false);
        isUserWantsListeningRef.current = false;
        setErrorMsg('Microphone access was denied. Please allow microphone permissions or type details.');
      }
    } else {
      // Desktop-only: Web Speech API for real-time live typing (no MediaRecorder needed)
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
  }, [isListening, isRecordingAudio, input, stopVoiceCapture]);

  const handleClearHistory = useCallback(() => {
    setChatHistory([]);
    setLatestFilledCount(null);
    setInputState('');
    baseTextRef.current = '';
    liveSpeechTextRef.current = '';
    setErrorMsg(null);
  }, []);

  const cancelRecording = useCallback(() => {
    clearInterval(recordingTimerRef.current);
    setRecordingSeconds(0);
    setIsRecordingAudio(false);
    setIsListening(false);
    setIsTranscribing(false);
    isUserWantsListeningRef.current = false;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (_) {}
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
    isTranscribing,
    isListening,
    isRecordingAudio,
    recordingSeconds,
    speechSupported,
    errorMsg,
    chatHistory,
    filledCount,
    latestFilledCount: filledCount > 0 ? filledCount : latestFilledCount,
    toggleListening,
    stopVoiceCapture,
    handleSubmit,
    handleClearHistory,
    cancelRecording,
  };
}

export type AiAutofillController = ReturnType<typeof useAiAutofill>;
