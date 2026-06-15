"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, ClipboardList, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionPayload } from "@/lib/auth";

const tabs = [
  { href: "/", label: "Shop", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/billing",
    label: "Cart",
    icon: ShoppingBag,
    match: (p: string) => p.startsWith("/billing"),
    badge: true,
  },
  {
    href: "/orders",
    label: "Orders",
    icon: ClipboardList,
    match: (p: string) => p.startsWith("/orders") || p.startsWith("/order-success"),
  },
  {
    href: "/account",
    label: "Account",
    icon: User,
    match: (p: string) => p.startsWith("/account"),
  },
];

export function BottomNav({
  session,
  cartCount,
}: {
  session: SessionPayload | null;
  cartCount: number;
}) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-brand-600" : "text-gray-400",
              )}
            >
              <span className="relative">
                <Icon
                  className={cn("h-5 w-5", active && "fill-brand-50")}
                  strokeWidth={active ? 2.4 : 2}
                />
                {tab.badge && session && cartCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
