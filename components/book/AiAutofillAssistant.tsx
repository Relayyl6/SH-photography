'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Mic,
  MicOff,
  Send,
  Loader2,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { BookingFormData } from './schema';

interface AiAutofillAssistantProps {
  currentFormData: Partial<BookingFormData>;
  onApplyFields: (fields: Partial<BookingFormData>) => void;
  onJumpToReview?: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  filledSummary?: string[];
  missingFields?: string[];
}

const EXAMPLE_PROMPTS = [
  "Full-day documentary wedding in Manchester on November 14th with 100 guests. Digital gallery + album, budget £2,000–£2,500. Name: Maya, email: maya@example.com, WhatsApp: 07700900123.",
  "Individual studio portrait and beauty session in Manchester next month. Editorial style, 2 hours, color photos. Budget £500–£1,000.",
  "Evening 30th birthday event in Salford for 50 people with candid photos and fast turnaround. Budget under £1,000.",
];

export function AiAutofillAssistant({
  currentFormData,
  onApplyFields,
  onJumpToReview,
}: AiAutofillAssistantProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [latestFilledCount, setLatestFilledCount] = useState<number | null>(null);

  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const toggleListening = () => {
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
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setIsListening(false);
      }
    }
  };

  const handleSubmit = async (textToSubmit?: string) => {
    const text = (textToSubmit ?? input).trim();
    if (!text) {
      setErrorMsg('Please describe your event or speak into the microphone first.');
      return;
    }

    // Stop listening if mic was on
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

      // Apply the parsed fields to the React Hook Form
      if (data.fields && typeof data.fields === 'object') {
        const fieldCount = Object.keys(data.fields).filter(
          (k) => data.fields[k] !== null && data.fields[k] !== undefined && data.fields[k] !== ''
        ).length;

        onApplyFields(data.fields);
        setLatestFilledCount(fieldCount);
      }

      // Update conversation history
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
      setInput(userMessage); // restore input so user doesn't lose text
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setChatHistory([]);
    setLatestFilledCount(null);
    setInput('');
    setErrorMsg(null);
  };

  return (
    <section
      aria-label="AI Smart Booking Assistant"
      className="mb-10 w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-accent/30 bg-gradient-to-br from-sand/80 via-paper to-sand/40 p-4 sm:p-6 shadow-md backdrop-blur-md transition-all duration-300"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-sm ring-2 ring-accent/20">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base sm:text-lg md:text-xl font-semibold text-ink">
                Smart Auto-Fill Assistant
              </h2>
              <span className="hidden sm:inline-block rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/25">
                Voice &amp; AI
              </span>
            </div>
            <p className="text-xs text-ink/70">
              Speak or describe your entire event — AI fills out almost every entry for you.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {latestFilledCount !== null && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>{latestFilledCount} fields filled</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink/70 hover:border-ink hover:text-ink hover:bg-sand/60 transition-colors"
            aria-label={isOpen ? 'Minimize AI Assistant' : 'Expand AI Assistant'}
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 pt-4 border-t border-ink/10"
          >
            {/* Interactive Chat History for Iterative Follow-up */}
            {chatHistory.length > 0 && (
              <div className="mb-4 max-h-72 overflow-y-auto space-y-3 pr-1">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col gap-1.5 rounded-2xl p-3 sm:p-4 text-xs sm:text-sm ${
                      msg.role === 'user'
                        ? 'bg-ink text-paper ml-4 sm:ml-8 self-end'
                        : 'bg-white/90 border border-line/70 text-ink mr-4 sm:mr-8 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider opacity-70">
                      <span>{msg.role === 'user' ? 'You' : 'SH Assistant'}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                    {/* Populated items pill list */}
                    {msg.filledSummary && msg.filledSummary.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-ink/10">
                        <p className="text-[10px] uppercase font-semibold text-accent mb-1.5">
                          ✓ Auto-Filled Into Form:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.filledSummary.map((item, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-sand px-2 py-0.5 text-[11px] font-medium text-ink/80 border border-line"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing items pill list */}
                    {msg.missingFields && msg.missingFields.length > 0 && (
                      <div className="mt-2 text-[11px] text-ink/60 flex items-center gap-1.5">
                        <HelpCircle className="h-3 w-3 text-accent shrink-0" />
                        <span>Still needed: {msg.missingFields.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Main Textarea & Audio Input Container */}
            <div className="relative rounded-2xl border border-ink/20 bg-white/90 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15 transition-all shadow-inner">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                disabled={isLoading}
                rows={3}
                placeholder={
                  isListening
                    ? 'Listening... Speak now, your words will appear here in real time.'
                    : 'Describe your event (date, venue, style, deliverables, guest count, budget, contact info) or click the mic to speak...'
                }
                className="w-full resize-none bg-transparent p-3.5 sm:p-4 text-xs sm:text-sm text-ink placeholder:text-ink/40 focus:outline-none disabled:opacity-50"
              />

              {/* Bottom Action Toolbar inside the box */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3 border-t border-ink/10 bg-sand/30 rounded-b-2xl">
                {/* Voice Input Button */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={isLoading || !speechSupported}
                    title={
                      !speechSupported
                        ? 'Speech recognition not supported in this browser'
                        : isListening
                        ? 'Stop listening'
                        : 'Click to speak'
                    }
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      isListening
                        ? 'bg-red-600 text-white animate-pulse shadow-md ring-2 ring-red-400'
                        : 'bg-paper hover:bg-sand text-ink border border-ink/20 shadow-sm'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="h-3.5 w-3.5" />
                        <span>Listening... (Click to stop)</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-3.5 w-3.5 text-accent" />
                        <span>Speak details</span>
                      </>
                    )}
                  </button>

                  {speechSupported && !isListening && (
                    <span className="hidden md:inline text-[11px] text-ink/50">
                      Supports voice dictation
                    </span>
                  )}
                </div>

                {/* Submit & Quick Actions */}
                <div className="flex items-center gap-2">
                  {chatHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      disabled={isLoading}
                      className="text-[11px] text-ink/50 hover:text-ink hover:underline px-2 py-1"
                    >
                      Reset AI
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isLoading || (!input.trim() && !isListening)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-accent/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Auto-filling...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Auto-Fill Form</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
                <span>⚠️</span> {errorMsg}
              </p>
            )}

            {/* Example prompt pills (shown initially when empty) */}
            {chatHistory.length === 0 && !input && (
              <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] text-ink/50 font-medium">Examples to try:</span>
                {EXAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInput(prompt);
                      textareaRef.current?.focus();
                    }}
                    className="rounded-full bg-white/70 hover:bg-white border border-line/60 px-2.5 py-1 text-[11px] text-ink/80 hover:text-accent hover:border-accent/40 transition-colors text-left truncate max-w-[280px] sm:max-w-[340px]"
                  >
                    &ldquo;{prompt}&rdquo;
                  </button>
                ))}
              </div>
            )}

            {/* Quick jump to review when fields are filled */}
            {latestFilledCount !== null && latestFilledCount > 0 && onJumpToReview && (
              <div className="mt-3.5 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <span className="text-emerald-950 font-medium">
                  🎉 Fields populated! You can review or tweak any step manually below.
                </span>
                <button
                  type="button"
                  onClick={onJumpToReview}
                  className="inline-flex items-center gap-1 font-semibold text-accent hover:underline shrink-0"
                >
                  <span>Review full quote</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
