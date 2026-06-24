"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Sprout, LayoutDashboard, LogOut, Package, LogIn, User } from "lucide-react";
import type { SessionPayload } from "@/lib/auth";

// The onboarding / sign-in experience is a full-bleed branded flow that owns the
// whole screen, so the global app header is hidden on those routes.
const HIDE_HEADER_ON = ["/login", "/register"];

export function AppHeader({ session }: { session: SessionPayload | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = session?.role === "ADMIN";

  if (HIDE_HEADER_ON.includes(pathname)) return null;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    // Full page reload: clears Next.js router cache and prevents the back-button
    // from returning to a protected page after logout.
    window.location.replace("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-brand-500 px-4 py-3 text-white">
      <Link href={isAdmin ? "/admin" : "/"} className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
          <Sprout className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-base font-extrabold tracking-tight">FreshCart</p>
          <p className="text-[10px] text-white/80">Wholesale B2B · per kg</p>
        </div>
      </Link>

      {session ? (
        <div className="flex items-center gap-1.5">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1.5 text-[11px] font-semibold"
            >
              <LayoutDashboard className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
          <Link
            href="/orders"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15"
            aria-label="My orders"
          >
            <Package className="h-4 w-4" />
          </Link>
          <Link
            href="/account"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15"
            aria-label="My account"
          >
            <User className="h-4 w-4" />
          </Link>
          <button
            onClick={logout}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold"
        >
          <LogIn className="h-4 w-4" /> Login
        </Link>
      )}
    </header>
  );
}
