"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

// Accessible lightbox (ACCESSIBILITY.md §3): focus trapped while open, ESC
// closes, ←/→ navigate, focus returns to the triggering thumbnail,
// role=dialog + aria-modal + labelled by the current image caption.
export function Lightbox({
  open,
  caption,
  index,
  total,
  src,
  onClose,
  onPrev,
  onNext,
  triggerRef,
}: {
  open: boolean;
  caption: string;
  index: number;
  total: number;
  src?: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  triggerRef: React.RefObject<HTMLElement>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const hasPhoto = Boolean(src && src.trim().length > 0);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      triggerRef.current?.focus();
    };
  }, [open, onClose, onPrev, onNext, triggerRef]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-6 backdrop-blur-md"
      style={{ touchAction: "pan-y" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lightbox-caption"
        className="relative w-full max-w-5xl flex flex-col items-center"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="self-end mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-paper/15 text-paper hover:bg-paper/30 transition-colors cursor-pointer"
        >
          ✕
        </button>

        <div
          className="relative flex aspect-[4/5] sm:aspect-[3/2] w-full max-h-[75vh] items-center justify-center rounded-2xl bg-gradient-to-br from-[#24201b] via-[#1a1714] to-[#100e0c] border border-white/15 overflow-hidden shadow-2xl"
          role="img"
          aria-label={caption}
        >
          {/* Real Photo */}
          {hasPhoto && src && (
            <Image
              src={src}
              alt={caption}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          )}

          {/* Subtle photographic corner crop marks ("corner edge line stuff") */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/70 pointer-events-none z-20 drop-shadow-md" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/70 pointer-events-none z-20 drop-shadow-md" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/70 pointer-events-none z-20 drop-shadow-md" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/70 pointer-events-none z-20 drop-shadow-md" />

          {/* Top SH Archive Badge */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-accent text-[11px] font-semibold uppercase tracking-widest shadow-md">
              <svg className="w-3.5 h-3.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              SH Photography Archive
            </span>
          </div>

          {/* Placeholder center graphic when no photo exists */}
          {!hasPhoto && (
            <div className="relative z-10 flex flex-col items-center text-center max-w-md p-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent text-xs font-semibold uppercase tracking-widest mb-3">
                SH Photography Archive
              </span>
              <h3 className="font-display text-2xl md:text-3xl text-paper font-medium">{caption}</h3>
              <p className="mt-2 text-xs md:text-sm text-paper/60 uppercase tracking-wider">
                Manchester, United Kingdom · Available to travel
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex w-full items-center justify-between text-paper px-2">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous image"
            className="rounded-full border border-paper/30 px-5 py-2 text-sm font-medium hover:bg-paper/15 transition-colors cursor-pointer"
          >
            ‹ Previous
          </button>
          <p id="lightbox-caption" className="text-xs sm:text-sm text-paper/80 font-medium">
            {caption} — {index + 1} of {total}
          </p>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next image"
            className="rounded-full border border-paper/30 px-5 py-2 text-sm font-medium hover:bg-paper/15 transition-colors cursor-pointer"
          >
            Next ›
          </button>
        </div>
      </div>
    </div>
  );
}
