"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { PlaceholderImage } from "./PlaceholderImage";
import { getPreviewImages, GalleryPhoto } from "@/lib/gallery";

// Auto-advancing session preview slideshow. 
// Dynamically fetches ALL photos, randomly shuffles them, and selects exactly 'count' (6) to display.
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

  // State to store our randomly selected 6 photos
  const [displayPhotos, setDisplayPhotos] = useState<GalleryPhoto[]>([]);
  const hasRandomized = useRef(false);

  // 1. Fetch ALL photos from the folder (passing 100 ensures we get the full pool of 24)
  const allPhotos = useMemo(() => {
    return sessionSlug ? getPreviewImages(sessionSlug, 100) : [];
  }, [sessionSlug]);

  // 2. Randomly shuffle and select exactly 'count' (6) photos on client mount.
  // This MUST be inside a useEffect to prevent Next.js Hydration errors!
  useEffect(() => {
    if (!hasRandomized.current && allPhotos.length > 0) {
      // Shuffle the full array of 24 photos
      const shuffled = [...allPhotos].sort(() => 0.5 - Math.random());
      // Slice it to keep only the 6 we need
      setDisplayPhotos(shuffled.slice(0, count));
      hasRandomized.current = true; // Ensure it only randomizes once per page load
    }
  }, [allPhotos, count]);

  // 3. During the initial split-second server render, fall back to the first 6 photos 
  // so the UI doesn't look broken or flash blank before the randomizer kicks in.
  const currentPhotos = displayPhotos.length > 0 ? displayPhotos : allPhotos.slice(0, count);
  const effectiveCount = currentPhotos.length > 0 ? currentPhotos.length : 1;

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
  
  // Safely grab the current photo from our pool of 6
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
        {/* Pagination Dots - Will map exactly to the 6 effectiveCount items */}
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