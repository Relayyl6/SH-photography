"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function GlobalAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const msg = (error?.message || "").toLowerCase();
    const isChunkLoadError =
      error?.name === "ChunkLoadError" ||
      msg.includes("loading chunk") ||
      msg.includes("failed to fetch dynamically imported module") ||
      msg.includes("failed to load chunk") ||
      msg.includes("chunkloaderror");

    if (isChunkLoadError && typeof window !== "undefined") {
      console.warn("Stale bundle chunk detected. Auto-reloading...");
      window.location.reload();
    } else {
      console.error("[App Error Boundary]:", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center p-4 font-sans text-[#1c1b1a]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#e8e6df] shadow-xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 text-[#e8491c] flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#e8491c]">SH Photography</span>
          <h2 className="text-2xl font-serif font-bold text-[#1c1b1a] mt-1">We hit a slight hitch</h2>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-2 leading-relaxed">
            A temporary connection issue occurred while loading this page. Please refresh or return to the gallery home.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#1c1b1a] text-white text-xs font-semibold hover:bg-black transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#f5f4ef] text-[#1c1b1a] text-xs font-semibold hover:bg-[#eae8df] transition-colors border border-[#e6e4dc]"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
