"use client";

import React, { useEffect } from "react";

export default function RootGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const msg = (error?.message || "").toLowerCase();
    if (
      error?.name === "ChunkLoadError" ||
      msg.includes("loading chunk") ||
      msg.includes("failed to fetch dynamically imported module")
    ) {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#faf9f5] flex items-center justify-center p-4 font-sans text-[#1c1b1a]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#e8e6df] shadow-xl text-center space-y-4">
          <h2 className="text-xl font-bold text-[#1c1b1a]">Application Error</h2>
          <p className="text-xs text-[#7a766f]">
            The application encountered an unexpected issue. Please reload the page to continue.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-full bg-[#1c1b1a] text-white text-xs font-semibold hover:bg-black transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                if (typeof window !== "undefined") window.location.reload();
              }}
              className="px-5 py-2.5 rounded-full bg-[#f5f4ef] text-[#1c1b1a] text-xs font-semibold hover:bg-[#eae8df] transition-colors border border-[#e6e4dc]"
            >
              Reload Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
