"use client";

import { useRef, useState } from "react";
import { PlaceholderImage } from "./PlaceholderImage";
import { Lightbox } from "./Lightbox";
import { getGalleryImages, GalleryPhoto } from "@/lib/gallery";

export function GalleryGrid({
  sessionSlug,
  sessionTitle,
  count,
}: {
  sessionSlug?: string;
  sessionTitle: string;
  count?: number;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeTrigger = useRef<HTMLButtonElement | null>(
    null
  ) as React.MutableRefObject<HTMLButtonElement | null>;

  const photos: GalleryPhoto[] = sessionSlug ? getGalleryImages(sessionSlug) : [];
  const effectiveCount = photos.length > 0 ? photos.length : (count ?? 12);

  function openAt(i: number) {
    activeTrigger.current = triggerRefs.current[i] ?? null;
    setOpenIndex(i);
  }

  const activePhoto = openIndex !== null ? photos[openIndex] : null;

  return (
    <>
      <ul className="columns-1 gap-4 [column-fill:_balance] sm:columns-2 lg:columns-3" role="list">
        {Array.from({ length: effectiveCount }).map((_, i) => {
          const photo = photos[i];
          const hasPhoto = Boolean(photo?.src);
          // calculate ratio: if real photo has aspect, use it or staggered defaults
          const ratio = photo
            ? `${photo.width} / ${photo.height}`
            : i % 5 === 0
            ? "4 / 5"
            : i % 3 === 0
            ? "1 / 1"
            : "4 / 5";

          return (
            <li key={i} className="mb-4 break-inside-avoid">
              <button
                type="button"
                ref={(el) => {
                  triggerRefs.current[i] = el;
                }}
                onClick={() => openAt(i)}
                className="block w-full text-left group cursor-pointer"
                aria-label={`Open ${photo?.title || `${sessionTitle} photo ${i + 1}`}`}
              >
                <PlaceholderImage
                  label={photo?.title || `${sessionTitle} #${String(i + 1).padStart(2, "0")}`}
                  ratio={ratio}
                  src={photo?.src}
                  alt={photo?.alt}
                  priority={i < 4}
                  className="transition-all duration-300 hover:shadow-2xl"
                />
              </button>
            </li>
          );
        })}
      </ul>

      <Lightbox
        open={openIndex !== null}
        caption={activePhoto?.title || `${sessionTitle} ${(openIndex ?? 0) + 1}`}
        index={openIndex ?? 0}
        total={effectiveCount}
        src={activePhoto?.src}
        onClose={() => setOpenIndex(null)}
        onPrev={() => setOpenIndex((i) => (i === null ? 0 : (i - 1 + effectiveCount) % effectiveCount))}
        onNext={() => setOpenIndex((i) => (i === null ? 0 : (i + 1) % effectiveCount))}
        triggerRef={{ current: activeTrigger.current } as React.RefObject<HTMLElement>}
      />
    </>
  );
}
