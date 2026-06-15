import Link from "next/link";
import { Sprout, MapPin, ChevronDown } from "lucide-react";
import type { SessionPayload } from "@/lib/auth";

export function AppHeader({ session }: { session: SessionPayload | null }) {
  return (
    <header className="sticky top-0 z-30 bg-brand-500 px-4 pb-3 pt-3 text-white">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <Sprout className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">FreshKart</span>
        </Link>

        {session ? (
          <Link
            href="/account"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold"
            aria-label="Account"
          >
            {session.name.charAt(0).toUpperCase()}
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold"
          >
            Log in
          </Link>
        )}
      </div>

      <button className="mt-2 flex items-center gap-1 text-xs text-white/90">
        <MapPin className="h-3.5 w-3.5" />
        <span className="font-medium">
          Deliver to{" "}
          {session?.name ? `${session.name.split(" ")[0]}` : "your business"}
        </span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
    </header>
  );
}
