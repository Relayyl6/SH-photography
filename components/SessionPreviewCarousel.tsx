"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { PlaceholderImage } from "./PlaceholderImage";
import { getPreviewImages, GalleryPhoto } from "@/lib/gallery";

// Auto-advancing session preview slideshow.
// Fetches the full folder, displays exactly 6 images, and reshuffles 
// to a completely NEW random set of 6 every time a loop completes.
export function SessionPreviewCarousel({
  sessionSlug,
  sessionTitle,
  count = 6, 
  intervalMs = 3200,
}: {
  sessionSlug?: string;
  sessionTitle: string;
  count?: number; 
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [announce, setAnnounce] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // State to hold the CURRENT active batch of 6 random photos
  const [displayPhotos, setDisplayPhotos] = useState<GalleryPhoto[]>([]);
  const hasRandomized = useRef(false);

  // 1. Load the full pool of available photos (up to 100/all 24)
  const allPhotos = useMemo(() => {
    return sessionSlug ? getPreviewImages(sessionSlug, 100) : [];
  }, [sessionSlug]);

  // 2. The Reshuffle Engine: Shuffles the full pool and locks in a new set of 6
  const reshuffle = useCallback(() => {
    if (allPhotos.length === 0) return;
    const shuffled = [...allPhotos].sort(() => 0.5 - Math.random());
    setDisplayPhotos(shuffled.slice(0, count));
  }, [allPhotos, count]);

  // 3. Initial Page Load Shuffle (with Hydration protection)
  useEffect(() => {
    if (!hasRandomized.current && allPhotos.length > 0) {
      reshuffle();
      hasRandomized.current = true;
    }
  }, [allPhotos, reshuffle]);

  // Hydration safety: use static first 6 on server, then immediately swap to random 6 on client
  const currentPhotos = displayPhotos.length > 0 ? displayPhotos : allPhotos.slice(0, count);
  const effectiveCount = currentPhotos.length > 0 ? currentPhotos.length : 1;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const listener = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

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

  // 4. Navigation logic linked to the reshuffle engine
  const go = useCallback(
    (nextIndex: number, userInitiated = false) => {
      // If we move past the last image in the current 6, trigger a reshuffle and reset to dot 1
      if (nextIndex >= effectiveCount) {
        reshuffle();
        setIndex(0);
      } 
      // If going backward past the first image, trigger a reshuffle and jump to dot 6
      else if (nextIndex < 0) {
        reshuffle();
        setIndex(effectiveCount - 1);
      } 
      // Standard navigation
      else {
        setIndex(nextIndex);
      }
      
      if (userInitiated) setAnnounce(true);
    },
    [effectiveCount, reshuffle]
  );

  // Autoplay interval linked to the custom `go` function
  useEffect(() => {
    if (!playing || reducedMotion || !isInView) return;
    const id = setInterval(() => {
      go(index + 1);
    }, intervalMs);
    return () => clearInterval(id);
  }, [playing, reducedMotion, isInView, index, intervalMs, go]);

  const isPlaying = playing && !reducedMotion;
  const currentPhoto = currentPhotos[index];

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
        {/* Render exactly 6 dots */}
        <div className="flex gap-1.5 flex-wrap max-w-[60%] items-center">
          {Array.from({ length: effectiveCount }).map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 flex-shrink-0 ${
                i === index ? "bg-accent shadow-sm" : "bg-paper/60"
              }`}
            />
          ))}
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