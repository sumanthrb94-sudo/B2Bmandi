"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sprout,
  ShoppingCart,
  Menu,
  X,
  Package,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Search,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import type { SessionPayload } from "@/lib/auth";

export function Navbar({
  session,
  cartCount,
}: {
  session: SessionPayload | null;
  cartCount: number;
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    setMobileOpen(false);
  }

  const isSeller = session?.role === "SELLER" || session?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container-app flex h-16 items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
            <Sprout className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-gray-900">
            B2B<span className="text-brand-600">Mandi</span>
          </span>
        </Link>

        {/* Search (desktop) */}
        <form
          onSubmit={onSearch}
          className="relative hidden flex-1 md:block"
          role="search"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tomatoes, onions, rice…"
            className="input-base pl-9"
            aria-label="Search products"
          />
        </form>

        {/* Desktop actions */}
        <nav className="hidden items-center gap-1 md:flex">
          <ButtonLink href="/products" variant="ghost" size="sm">
            Browse
          </ButtonLink>

          {isSeller && (
            <ButtonLink href="/seller" variant="ghost" size="sm">
              <LayoutDashboard className="h-4 w-4" /> Seller Hub
            </ButtonLink>
          )}

          <Link
            href="/cart"
            className="relative ml-1 flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {session ? (
            <div className="relative ml-1">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex h-10 items-center gap-2 rounded-lg px-2 hover:bg-gray-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {session.name.charAt(0).toUpperCase()}
                </span>
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-card-hover">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {session.name}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {session.email}
                      </p>
                    </div>
                    <MenuLink href="/account" onClick={() => setMenuOpen(false)}>
                      <UserIcon className="h-4 w-4" /> My Account
                    </MenuLink>
                    <MenuLink href="/orders" onClick={() => setMenuOpen(false)}>
                      <Package className="h-4 w-4" /> My Orders
                    </MenuLink>
                    {isSeller && (
                      <MenuLink
                        href="/seller"
                        onClick={() => setMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" /> Seller Hub
                      </MenuLink>
                    )}
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                Log in
              </ButtonLink>
              <ButtonLink href="/register" size="sm">
                Get started
              </ButtonLink>
            </>
          )}
        </nav>

        {/* Mobile toggles */}
        <div className="flex items-center gap-1 md:hidden">
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
          <form onSubmit={onSearch} className="relative mb-3" role="search">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="input-base pl-9"
            />
          </form>
          <div className="flex flex-col gap-1">
            <ButtonLink href="/products" variant="ghost" className="justify-start">
              Browse products
            </ButtonLink>
            {session ? (
              <>
                <ButtonLink
                  href="/orders"
                  variant="ghost"
                  className="justify-start"
                >
                  My orders
                </ButtonLink>
                <ButtonLink
                  href="/account"
                  variant="ghost"
                  className="justify-start"
                >
                  My account
                </ButtonLink>
                {isSeller && (
                  <ButtonLink
                    href="/seller"
                    variant="ghost"
                    className="justify-start"
                  >
                    Seller hub
                  </ButtonLink>
                )}
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="justify-start text-red-600"
                >
                  Log out
                </Button>
              </>
            ) : (
              <div className="mt-2 flex gap-2">
                <ButtonLink href="/login" variant="outline" className="flex-1">
                  Log in
                </ButtonLink>
                <ButtonLink href="/register" className="flex-1">
                  Get started
                </ButtonLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
    >
      {children}
    </Link>
  );
}
