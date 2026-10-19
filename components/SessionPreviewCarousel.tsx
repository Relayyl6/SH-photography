"use client";

import { useEffect, useRef, useState } from "react";
import { PlaceholderImage } from "./PlaceholderImage";
import { getPreviewImages, GalleryPhoto } from "@/lib/gallery";

// Auto-advancing session preview slideshow. 
// Dynamically scales to any array length, safely falls back for missing images,
// and accepts the 'count' prop to satisfy TypeScript.
export function SessionPreviewCarousel({
  sessionSlug,
  sessionTitle,
  count = 24, // Accept the count prop passed from page.tsx
  intervalMs = 3200,
}: {
  sessionSlug?: string;
  sessionTitle: string;
  count?: number; // Fixes the TypeScript build error
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [announce, setAnnounce] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch up to the requested count. If fewer exist in the folder, 
  // it gracefully returns only what is actually available.
  const previewPhotos: GalleryPhoto[] = sessionSlug ? getPreviewImages(sessionSlug, count) : [];
  
  // Dynamically set the length based on what ACTUALLY exists to prevent empty slides
  const effectiveCount = previewPhotos.length > 0 ? previewPhotos.length : 1;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const listener = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  // Only run carousel interval when visible in viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsInView(entry.isIntersecting);
        }
      },
      { rootMargin: "100px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion || !isInView) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % effectiveCount);
    }, intervalMs);
    return () => clearInterval(id);
  }, [playing, reducedMotion, isInView, effectiveCount, intervalMs]);

  function go(next: number, userInitiated = false) {
    setIndex(((next % effectiveCount) + effectiveCount) % effectiveCount);
    if (userInitiated) setAnnounce(true);
  }

  const isPlaying = playing && !reducedMotion;
  
  // Safely grab the current photo
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
        label={currentPhoto ? `${sessionTitle} photo ${index + 1} of ${effectiveCount}` : `${sessionTitle} Image Coming Soon`}
        ratio="4 / 5"
        className="transition-opacity duration-300"
        src={currentPhoto?.src || undefined}
        alt={currentPhoto?.alt || "Image currently unavailable"}
      />

      <div
        aria-live={announce ? "polite" : "off"}
        className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-20"
      >
        {/* Pagination Dots - Uses flex-wrap so if you have 24+ images, 
            the dots wrap cleanly instead of breaking off the screen */}
        <div className="flex gap-1.5 flex-wrap max-w-[60%] items-center">
          {Array.from({ length: Math.min(effectiveCount, 6) }).map((_, i) => {
            // This maps your current picture index to one of the 6 dots
            const activeDot = index % 6; 
            return (
              <span
                key={i}
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 flex-shrink-0 ${
                  i === activeDot ? "bg-accent shadow-sm" : "bg-paper/60"
                }`}
              />
            );
          })}
        </div>

        <div className="pointer-events-auto flex gap-1 flex-shrink-0">
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