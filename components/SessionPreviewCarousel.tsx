"use client";

import { useEffect, useRef, useState } from "react";
import { PlaceholderImage } from "./PlaceholderImage";
import { getPreviewImages, GalleryPhoto } from "@/lib/gallery";

// Auto-advancing session preview slideshow (A5, FR-04). Rules enforced here:
// visible pause/play control, autoplay disabled under prefers-reduced-motion,
// pause on hover/focus-within, prev/next with accessible names
// (ACCESSIBILITY.md §2).
export function SessionPreviewCarousel({
  sessionSlug,
  sessionTitle,
  count,
  intervalMs = 3200,
}: {
  sessionSlug?: string;
  sessionTitle: string;
  count: number;
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [announce, setAnnounce] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const previewPhotos: GalleryPhoto[] = sessionSlug ? getPreviewImages(sessionSlug, count) : [];
  const effectiveCount = previewPhotos.length > 0 ? previewPhotos.length : count;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const listener = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % effectiveCount);
    }, intervalMs);
    return () => clearInterval(id);
  }, [playing, reducedMotion, effectiveCount, intervalMs]);

  function go(next: number, userInitiated = false) {
    setIndex(((next % effectiveCount) + effectiveCount) % effectiveCount);
    if (userInitiated) setAnnounce(true);
  }

  const isPlaying = playing && !reducedMotion;
  const currentPhoto = previewPhotos[index];

  return (
    <div
      ref={containerRef}
      className="group relative"
      onMouseEnter={() => setPlaying(false)}
      onMouseLeave={() => setPlaying(true)}
      onFocus={() => setPlaying(false)}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) setPlaying(true);
      }}
    >
      <PlaceholderImage
        label={`${sessionTitle} preview ${index + 1} of ${effectiveCount}`}
        ratio="4 / 5"
        className="transition-opacity duration-300"
        src={currentPhoto?.src}
        alt={currentPhoto?.alt}
      />

      <div
        aria-live={announce ? "polite" : "off"}
        className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-20"
      >
        <div className="flex gap-1.5">
          {Array.from({ length: effectiveCount }).map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${i === index ? "bg-accent shadow-sm" : "bg-paper/60"}`}
            />
          ))}
        </div>

        <div className="pointer-events-auto flex gap-1">
          <button
            type="button"
            onClick={() => go(index - 1, true)}
            aria-label={`Previous ${sessionTitle} photo`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/70 text-paper hover:bg-ink transition-colors"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={isPlaying ? `Pause ${sessionTitle} slideshow` : `Play ${sessionTitle} slideshow`}
            aria-pressed={!isPlaying}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/70 text-paper hover:bg-ink transition-colors"
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>
          <button
            type="button"
            onClick={() => go(index + 1, true)}
            aria-label={`Next ${sessionTitle} photo`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/70 text-paper hover:bg-ink transition-colors"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
