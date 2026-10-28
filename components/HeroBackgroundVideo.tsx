"use client";

import { useEffect, useRef } from "react";

export function HeroBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Explicitly guarantee muted attributes & properties for mobile WebKit / iOS autoplay policy
    video.muted = true;
    video.defaultMuted = true;
    
    // Attempt play in case mobile browser deferred initial autoplay
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy or low power mode prevented playback, fallback poster remains visible
      });
    }
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/hero-bg.jpg"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover opacity-[0.22] md:opacity-[0.25] pointer-events-none select-none z-0 transform-gpu"
    >
      <source src="/photographer-bg.mp4" type="video/mp4" />
    </video>
  );
}
