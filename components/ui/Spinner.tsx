import { cn } from "@/lib/utils";

/** Animated circular loading ring. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600",
        className,
      )}
    />
  );
}
