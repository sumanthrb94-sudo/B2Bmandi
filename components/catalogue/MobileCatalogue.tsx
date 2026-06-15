"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Minus, ShoppingBag, Loader2, MapPin } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatCurrency } from "@/lib/utils";
import type { ProductWithRelations } from "@/lib/types";

type CartEntry = { itemId: string; qty: number };
type CartMap = Record<string, CartEntry>;

export function MobileCatalogue({
  products,
  categories,
  initialCart,
  isLoggedIn,
}: {
  products: ProductWithRelations[];
  categories: { name: string; slug: string }[];
  initialCart: { id: string; productId: string; quantity: number }[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [activeCat, setActiveCat] = React.useState<string>("all");
  const [busy, setBusy] = React.useState<string | null>(null);
  const [cart, setCart] = React.useState<CartMap>(() => {
    const map: CartMap = {};
    for (const it of initialCart)
      map[it.productId] = { itemId: it.id, qty: it.quantity };
    return map;
  });

  const productById = React.useMemo(() => {
    const m: Record<string, ProductWithRelations> = {};
    for (const p of products) m[p.id] = p;
    return m;
  }, [products]);

  const visible = products.filter((p) => {
    const matchCat = activeCat === "all" || p.category.slug === activeCat;
    const matchQuery =
      !query.trim() ||
      p.name.toLowerCase().includes(query.trim().toLowerCase());
    return matchCat && matchQuery;
  });

  const { itemCount, subtotal } = React.useMemo(() => {
    let count = 0;
    let total = 0;
    for (const [pid, entry] of Object.entries(cart)) {
      const p = productById[pid];
      if (!p) continue;
      count += 1;
      total += entry.qty * p.pricePerUnit;
    }
    return { itemCount: count, subtotal: total };
  }, [cart, productById]);

  async function refreshCart() {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const map: CartMap = {};
      for (const it of data.items ?? [])
        map[it.productId] = { itemId: it.id, qty: it.quantity };
      setCart(map);
    } catch {
      /* keep optimistic state */
    }
    router.refresh(); // sync bottom-nav badge
  }

  function requireLogin() {
    router.push("/login?callbackUrl=/");
  }

  async function add(p: ProductWithRelations) {
    if (!isLoggedIn) return requireLogin();
    setBusy(p.id);
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: p.id, quantity: p.minOrderQty }),
      });
      await refreshCart();
    } finally {
      setBusy(null);
    }
  }

  async function changeQty(p: ProductWithRelations, nextQty: number) {
    const entry = cart[p.id];
    if (!entry) return;
    setBusy(p.id);
    try {
      if (nextQty < p.minOrderQty) {
        await fetch(`/api/cart/${entry.itemId}`, { method: "DELETE" });
      } else {
        await fetch(`/api/cart/${entry.itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: Math.min(nextQty, p.stockQty) }),
        });
      }
      await refreshCart();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="pb-2">
      {/* Search */}
      <div className="sticky top-[76px] z-20 bg-gray-50 px-4 pb-2 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for tomatoes, mango…"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2">
        <Chip
          label="All"
          active={activeCat === "all"}
          onClick={() => setActiveCat("all")}
        />
        {categories.map((c) => (
          <Chip
            key={c.slug}
            label={c.name}
            active={activeCat === c.slug}
            onClick={() => setActiveCat(c.slug)}
          />
        ))}
      </div>

      {/* Hero strip */}
      <div className="mx-4 mb-2 mt-1 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 p-4 text-white">
        <p className="text-sm font-semibold">Fresh from the farm 🌿</p>
        <p className="mt-0.5 text-xs text-white/85">
          Wholesale rates · same-day dispatch · pay on delivery
        </p>
      </div>

      {/* Product grid */}
      {visible.length === 0 ? (
        <p className="px-4 py-16 text-center text-sm text-gray-500">
          No items match “{query}”.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pb-4">
          {visible.map((p) => {
            const entry = cart[p.id];
            const isBusy = busy === p.id;
            return (
              <div
                key={p.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="relative aspect-square bg-gray-100">
                  <SafeImage
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="50vw"
                    className="object-cover"
                  />
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                    {p.unit}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-2.5">
                  <h3 className="line-clamp-2 text-[13px] font-semibold leading-tight text-gray-900">
                    {p.name}
                  </h3>
                  {p.origin && (
                    <p className="mt-0.5 flex items-center gap-0.5 text-[10px] text-gray-400">
                      <MapPin className="h-2.5 w-2.5" />
                      <span className="truncate">{p.origin}</span>
                    </p>
                  )}
                  <div className="mt-auto flex items-end justify-between pt-2">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(p.pricePerUnit)}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        MOQ {p.minOrderQty}
                      </p>
                    </div>

                    {entry ? (
                      <div className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-1 text-white">
                        <button
                          onClick={() => changeQty(p, entry.qty - 1)}
                          disabled={isBusy}
                          className="flex h-7 w-6 items-center justify-center disabled:opacity-50"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-4 text-center text-sm font-bold">
                          {isBusy ? (
                            <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" />
                          ) : (
                            entry.qty
                          )}
                        </span>
                        <button
                          onClick={() => changeQty(p, entry.qty + 1)}
                          disabled={isBusy || entry.qty >= p.stockQty}
                          className="flex h-7 w-6 items-center justify-center disabled:opacity-50"
                          aria-label="Increase"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => add(p)}
                        disabled={isBusy}
                        className="flex h-8 items-center gap-1 rounded-lg border border-brand-500 bg-brand-50 px-3 text-xs font-bold text-brand-700 active:scale-95 disabled:opacity-50"
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5" /> ADD
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky cart bar */}
      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-[60px] z-30 mx-auto max-w-[480px] px-3">
          <Link
            href="/billing"
            className="flex items-center justify-between rounded-xl bg-brand-600 px-4 py-3 text-white shadow-lg active:scale-[0.99]"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <ShoppingBag className="h-4 w-4" />
              {itemCount} item{itemCount > 1 ? "s" : ""} ·{" "}
              {formatCurrency(subtotal)}
            </span>
            <span className="text-sm font-bold">View cart →</span>
          </Link>
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors " +
        (active
          ? "bg-brand-500 text-white"
          : "border border-gray-200 bg-white text-gray-600")
      }
    >
      {label}
    </button>
  );
}
