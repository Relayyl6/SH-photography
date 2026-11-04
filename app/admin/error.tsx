"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Check if error is due to stale deployment chunks on Vercel
    const msg = (error?.message || "").toLowerCase();
    const isChunkLoadError =
      error?.name === "ChunkLoadError" ||
      msg.includes("loading chunk") ||
      msg.includes("failed to fetch dynamically imported module") ||
      msg.includes("failed to load chunk") ||
      msg.includes("chunkloaderror");

    if (isChunkLoadError && typeof window !== "undefined") {
      console.warn("Detected stale deployment chunk. Automatically reloading page...");
      window.location.reload();
    } else {
      console.error("[Admin Boundary] Uncaught error:", error);
    }
  }, [error]);

  const handleHardReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e6df] shadow-lg text-center space-y-5 animate-in fade-in duration-300">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1c1b1a]">Something went wrong</h2>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1.5 leading-relaxed">
            An unexpected client error occurred while rendering this admin section. This typically happens after a new deployment update.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#e8491c] text-white text-xs font-semibold hover:bg-[#d03d12] transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <button
            onClick={handleHardReload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#f5f4ef] text-[#1c1b1a] text-xs font-semibold hover:bg-[#eae8df] transition-colors border border-[#e6e4dc]"
          >
            <span>Reload Page</span>
          </button>
        </div>

        <div className="pt-2 border-t border-[#f0eee8] flex items-center justify-center gap-4 text-xs">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-[#8a867f] hover:text-[#1c1b1a] font-medium transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Overview</span>
          </Link>
          <span className="text-[#d8d5cd]">&bull;</span>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[#8a867f] hover:text-[#1c1b1a] font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </Link>
        </div>

        {process.env.NODE_ENV !== "production" && error?.message && (
          <details className="text-left bg-[#f8f7f4] p-3 rounded-xl border border-[#e8e6df] text-[11px] text-[#7a766f]">
            <summary className="font-semibold cursor-pointer text-[#1c1b1a]">Error Details</summary>
            <p className="mt-2 font-mono whitespace-pre-wrap break-all">{error.message}</p>
            {error.digest && <p className="mt-1 font-mono text-[10px] text-[#9d9990]">Digest: {error.digest}</p>}
          </details>
        )}
      </div>
    </div>
  );
}
