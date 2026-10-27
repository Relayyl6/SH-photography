'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Mic,
  MicOff,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { AiAutofillController } from './useAiAutofill';

interface AiAutofillAssistantProps {
  controller: AiAutofillController;
  layout?: 'default' | 'sidebar';
  onJumpToReview?: () => void;
  className?: string;
}

const EXAMPLE_PROMPTS = [
  "Full-day documentary wedding in Manchester on November 14th with 100 guests. Digital gallery + album, budget £2,000–£2,500. Name: Maya, email: maya@example.com, WhatsApp: 07700900123.",
  "Individual studio portrait and beauty session in Manchester next month. Editorial style, 2 hours, color photos. Budget £500–£1,000.",
  "Evening 30th birthday event in Salford for 50 people with candid photos and fast turnaround. Budget under £1,000.",
];

export function AiAutofillAssistant({
  controller,
  layout = 'default',
  onJumpToReview,
  className = '',
}: AiAutofillAssistantProps) {
  const {
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
  } = controller;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSidebar = layout === 'sidebar';

  return (
    <section
      aria-label="AI Smart Booking Assistant"
      className={`w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-accent/30 bg-gradient-to-br from-sand/80 via-paper to-sand/40 p-4 ${
        isSidebar ? 'p-4 sm:p-5' : 'sm:p-6'
      } shadow-md backdrop-blur-md transition-all duration-300 ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-sm ring-2 ring-accent/20">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-display text-sm sm:text-base font-semibold text-ink leading-tight">
                Smart Auto-Fill
              </h2>
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent border border-accent/25">
                Voice &amp; AI
              </span>
            </div>
            <p className="text-[11px] text-ink/70 leading-snug">
              {isSidebar ? 'Speak or type event details to fill form' : 'Speak or describe your entire event — AI fills out almost every entry for you.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {latestFilledCount !== null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>{latestFilledCount} filled</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-ink/15 text-ink/70 hover:border-ink hover:text-ink hover:bg-sand/60 transition-colors"
            aria-label={isOpen ? 'Minimize AI Assistant' : 'Expand AI Assistant'}
          >
            {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
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
            className="mt-3.5 pt-3.5 border-t border-ink/10"
          >
            {/* Interactive Chat History */}
            {chatHistory.length > 0 && (
              <div className="mb-3 max-h-60 overflow-y-auto space-y-2.5 pr-1">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col gap-1 rounded-xl p-2.5 sm:p-3 text-xs ${
                      msg.role === 'user'
                        ? 'bg-ink text-paper ml-4 self-end'
                        : 'bg-white/90 border border-line/70 text-ink mr-2 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] uppercase font-bold tracking-wider opacity-70">
                      <span>{msg.role === 'user' ? 'You' : 'SH Assistant'}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                    {msg.filledSummary && msg.filledSummary.length > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-ink/10">
                        <p className="text-[9px] uppercase font-semibold text-accent mb-1">
                          ✓ Auto-Filled:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {msg.filledSummary.map((item, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-medium text-ink/80 border border-line"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.missingFields && msg.missingFields.length > 0 && (
                      <div className="mt-1 text-[10px] text-ink/60 flex items-center gap-1">
                        <HelpCircle className="h-3 w-3 text-accent shrink-0" />
                        <span>Still needed: {msg.missingFields.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Main Textarea & Audio Input Container */}
            <div className="relative rounded-xl border border-ink/20 bg-white/90 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15 transition-all shadow-inner">
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
                rows={isSidebar ? 2 : 3}
                placeholder={
                  isListening
                    ? 'Listening... Speak now, your words appear here in real time.'
                    : 'Describe your event (date, venue, style, guest count, budget) or click the mic to speak...'
                }
                className="w-full resize-none bg-transparent p-3 text-xs sm:text-sm text-ink placeholder:text-ink/40 focus:outline-none disabled:opacity-50"
              />

              {/* Bottom Action Toolbar inside the box */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-t border-ink/10 bg-sand/30 rounded-b-xl">
                {/* Voice Input Button */}
                <div className="flex items-center gap-1.5">
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
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                      isListening
                        ? 'bg-red-600 text-white animate-pulse shadow-md ring-2 ring-red-400'
                        : 'bg-paper hover:bg-sand text-ink border border-ink/20 shadow-sm'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="h-3 w-3" />
                        <span>Listening...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-3 w-3 text-accent" />
                        <span>Speak</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Submit & Reset Actions */}
                <div className="flex items-center gap-1.5">
                  {chatHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      disabled={isLoading}
                      className="text-[10px] text-ink/50 hover:text-ink hover:underline px-1.5 py-0.5"
                    >
                      Reset
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isLoading || (!input.trim() && !isListening)}
                    className="inline-flex items-center justify-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-accent/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Filling...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        <span>Auto-Fill</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <p className="mt-2 text-[11px] text-red-600 font-medium flex items-center gap-1">
                <span>⚠️</span> {errorMsg}
              </p>
            )}

            {/* Example prompt pills (shown initially when empty) */}
            {chatHistory.length === 0 && !input && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1 text-xs">
                <span className="text-[10px] text-ink/50 font-medium w-full">Quick examples:</span>
                {EXAMPLE_PROMPTS.slice(0, isSidebar ? 2 : 3).map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInput(prompt);
                      textareaRef.current?.focus();
                    }}
                    className="rounded-full bg-white/70 hover:bg-white border border-line/60 px-2 py-0.5 text-[10px] text-ink/80 hover:text-accent hover:border-accent/40 transition-colors text-left truncate max-w-full"
                  >
                    &ldquo;{prompt}&rdquo;
                  </button>
                ))}
              </div>
            )}

            {/* Quick jump to review when fields are filled */}
            {latestFilledCount !== null && latestFilledCount > 0 && onJumpToReview && (
              <div className="mt-2.5 flex items-center justify-between gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <span className="text-emerald-950 font-medium text-[11px]">
                  🎉 Fields populated!
                </span>
                <button
                  type="button"
                  onClick={onJumpToReview}
                  className="inline-flex items-center gap-1 font-semibold text-accent hover:underline text-[11px] shrink-0"
                >
                  <span>Review quote</span>
                  <ArrowRight className="h-2.5 w-2.5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
