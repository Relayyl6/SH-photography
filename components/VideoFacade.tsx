"use client";

import { useState } from "react";

// Lazy YouTube facade (FR-07, Phase 5): shows a thumbnail + play button,
// loads the youtube-nocookie.com iframe only on click, so no third-party
// request happens before interaction and the visitor never leaves the site.
// Hides itself entirely when no video ID is set (AGENTS.md §5 rule — prefer
// hiding over shipping a broken embed).
export function VideoFacade({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (!videoId) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-ink">
      {playing ? (
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group flex h-full w-full items-center justify-center"
          aria-label={`Play video: ${title}`}
        >
          <img
            src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-paper transition-transform group-hover:scale-105">
            ▶
          </span>
        </button>
      )}
    </div>
  );
}
