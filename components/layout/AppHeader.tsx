"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sprout, LayoutDashboard, LogOut, Package, LogIn } from "lucide-react";
import type { SessionPayload } from "@/lib/auth";

export function AppHeader({ session }: { session: SessionPayload | null }) {
  const router = useRouter();
  const isAdmin = session?.role === "ADMIN";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-brand-500 px-4 py-3 text-white">
      <Link href={isAdmin ? "/admin" : "/"} className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
          <Sprout className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="text-base font-bold tracking-tight">FreshKart</p>
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
