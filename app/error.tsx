"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this is where you'd report to your error tracker.
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-gray-900">
        Something went wrong
      </h2>
      <p className="mt-1 max-w-xs text-sm text-gray-500">
        We hit a snag loading this page. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-6 flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white active:scale-95"
      >
        <RotateCcw className="h-4 w-4" /> Try again
      </button>
    </div>
  );
}
