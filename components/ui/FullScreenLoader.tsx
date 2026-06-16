import { Spinner } from "./Spinner";
import { cn } from "@/lib/utils";

/**
 * Centered loading ring. Use `overlay` to cover the whole app frame (e.g. the
 * post-login redirect); otherwise it fills the content area as a route fallback.
 */
export function FullScreenLoader({
  label = "Loading…",
  overlay = false,
}: {
  label?: string;
  overlay?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        overlay
          ? "fixed inset-0 z-[100] mx-auto max-w-[480px] bg-white/90 backdrop-blur-sm"
          : "min-h-[70vh]",
      )}
    >
      <Spinner className="h-12 w-12" />
      <p className="text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
}
