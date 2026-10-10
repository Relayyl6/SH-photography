"use client";

import { useRef, useState } from "react";
import { PlaceholderImage } from "./PlaceholderImage";
import { Lightbox } from "./Lightbox";

export function GalleryGrid({ sessionTitle, count }: { sessionTitle: string; count: number }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeTrigger = useRef<HTMLButtonElement | null>(
    null
  ) as React.MutableRefObject<HTMLButtonElement | null>;

  function openAt(i: number) {
    activeTrigger.current = triggerRefs.current[i] ?? null;
    setOpenIndex(i);
  }

  return (
    <>
      <ul className="columns-2 gap-4 [column-fill:_balance] md:columns-3" role="list">
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className="mb-4 break-inside-avoid">
            <button
              type="button"
              ref={(el) => {
                triggerRefs.current[i] = el;
              }}
              onClick={() => openAt(i)}
              className="block w-full text-left"
              aria-label={`Open ${sessionTitle} photo ${i + 1} of ${count}`}
            >
              <PlaceholderImage
                label={`${sessionTitle} ${i + 1}`}
                ratio={i % 5 === 0 ? "4 / 5" : i % 3 === 0 ? "1 / 1" : "4 / 5"}
                className="transition-opacity hover:opacity-90"
              />
            </button>
          </li>
        ))}
      </ul>

      <Lightbox
        open={openIndex !== null}
        caption={`${sessionTitle} ${(openIndex ?? 0) + 1}`}
        index={openIndex ?? 0}
        total={count}
        onClose={() => setOpenIndex(null)}
        onPrev={() => setOpenIndex((i) => (i === null ? 0 : (i - 1 + count) % count))}
        onNext={() => setOpenIndex((i) => (i === null ? 0 : (i + 1) % count))}
        triggerRef={{ current: activeTrigger.current } as React.RefObject<HTMLElement>}
      />
    </>
  );
}
