"use client";

import { useEffect, useRef } from "react";

// Accessible lightbox (ACCESSIBILITY.md §3): focus trapped while open, ESC
// closes, ←/→ navigate, focus returns to the triggering thumbnail,
// role=dialog + aria-modal + labelled by the current image caption.
export function Lightbox({
  open,
  caption,
  index,
  total,
  onClose,
  onPrev,
  onNext,
  triggerRef,
}: {
  open: boolean;
  caption: string;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  triggerRef: React.RefObject<HTMLElement>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/92 p-4"
      style={{ touchAction: "pan-y" }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lightbox-caption"
        className="relative w-full max-w-4xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-paper/10 text-paper hover:bg-paper/20"
        >
          ✕
        </button>

        <div
          className="placeholder-media flex aspect-[4/5] items-center justify-center rounded-lg bg-sand md:aspect-[3/2]"
          role="img"
          aria-label={`Placeholder image — ${caption}`}
        >
          <span className="rounded-full bg-ink/80 px-4 py-1.5 text-sm text-paper">{caption}</span>
        </div>

        <div className="mt-4 flex items-center justify-between text-paper">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous image"
            className="rounded-full border border-paper/30 px-4 py-2 text-sm hover:bg-paper/10"
          >
            ‹ Previous
          </button>
          <p id="lightbox-caption" className="text-sm text-paper/80">
            {caption} — {index + 1} of {total}
          </p>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next image"
            className="rounded-full border border-paper/30 px-4 py-2 text-sm hover:bg-paper/10"
          >
            Next ›
          </button>
        </div>
      </div>
    </div>
  );
}
