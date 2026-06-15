"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Loader2,
  MapPin,
  X,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { MockPaymentSheet } from "@/components/order/MockPaymentSheet";
import { formatCurrency } from "@/lib/utils";

export interface UProduct {
  id: string;
  name: string;
  image: string;
  unit: string;
  pricePerUnit: number;
  minOrderQty: number;
  stockQty: number;
  origin: string | null;
  categoryName: string;
  categorySlug: string;
}

const PAYMENTS = [
  { value: "COD", label: "Cash on delivery" },
  { value: "CREDIT", label: "Business credit" },
  { value: "ONLINE", label: "Pay online" },
];

const emptyForm = {
  deliveryName: "",
  deliveryPhone: "",
  deliveryAddress: "",
  deliveryCity: "",
  deliveryPincode: "",
};

export function UnifiedOrderScreen({
  products,
  categories,
}: {
  products: UProduct[];
  categories: { name: string; slug: string }[];
}) {
  const router = useRouter();
  const [cart, setCart] = React.useState<Record<string, number>>({});
  const [query, setQuery] = React.useState("");
  const [activeCat, setActiveCat] = React.useState("all");
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [form, setForm] = React.useState(emptyForm);
  const [payment, setPayment] = React.useState("COD");
  const [placing, setPlacing] = React.useState(false);
  const [showPay, setShowPay] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [placed, setPlaced] = React.useState<{
    orderNumber: string;
    totalAmount: number;
  } | null>(null);

  const byId = React.useMemo(() => {
    const m: Record<string, UProduct> = {};
    for (const p of products) m[p.id] = p;
    return m;
  }, [products]);

  const visible = products.filter((p) => {
    const okCat = activeCat === "all" || p.categorySlug === activeCat;
    const okQ =
      !query.trim() || p.name.toLowerCase().includes(query.trim().toLowerCase());
    return okCat && okQ;
  });

  const entries = Object.entries(cart).filter(([, q]) => q > 0);
  const itemCount = entries.length;
  const subtotal = entries.reduce(
    (s, [id, q]) => s + (byId[id]?.pricePerUnit ?? 0) * q,
    0,
  );

  function add(p: UProduct) {
    setCart((c) => ({ ...c, [p.id]: p.minOrderQty }));
  }
  function inc(p: UProduct) {
    setCart((c) => ({
      ...c,
      [p.id]: Math.min((c[p.id] ?? 0) + p.minOrderQty, p.stockQty),
    }));
  }
  function dec(p: UProduct) {
    setCart((c) => {
      const next = (c[p.id] ?? 0) - p.minOrderQty;
      const copy = { ...c };
      if (next < p.minOrderQty) delete copy[p.id];
      else copy[p.id] = next;
      return copy;
    });
  }

  function set<K extends keyof typeof emptyForm>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onPlaceClick() {
    setError(null);
    if (Object.values(form).some((v) => !v.trim())) {
      setError("Please fill in all delivery details.");
      return;
    }
    // online payments go through the mock gateway first
    if (payment === "ONLINE") {
      setShowPay(true);
      return;
    }
    void doPlace();
  }

  async function doPlace(paymentRef?: string) {
    setShowPay(false);
    setPlacing(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: entries.map(([productId, quantity]) => ({ productId, quantity })),
          ...form,
          paymentMethod: payment,
          notes: paymentRef ? `Paid online · ${paymentRef}` : undefined,
        }),
      });
      if (res.status === 401) {
        router.push("/login?callbackUrl=/");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not place order.");
        setPlacing(false);
        return;
      }
      setPlaced(data.order);
      setCart({});
      setSheetOpen(false);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  function reset() {
    setPlaced(null);
    setForm(emptyForm);
    setError(null);
  }

  return (
    <div className="pb-28">
      {/* Search + chips */}
      <div className="sticky top-0 z-20 border-b border-gray-100 bg-white px-4 pb-2 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search produce…"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
          <Chip label="All" active={activeCat === "all"} onClick={() => setActiveCat("all")} />
          {categories.map((c) => (
            <Chip
              key={c.slug}
              label={c.name}
              active={activeCat === c.slug}
              onClick={() => setActiveCat(c.slug)}
            />
          ))}
        </div>
      </div>

      {/* Banner */}
      <div className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 p-4 text-white">
        <p className="text-sm font-bold">Wholesale fruits &amp; veggies 🥦</p>
        <p className="mt-0.5 text-xs text-white/85">
          Prices per kg · order in bulk · pay COD, credit or online.
        </p>
      </div>

      {/* Single-column product list */}
      {visible.length === 0 ? (
        <p className="px-4 py-16 text-center text-sm text-gray-500">
          No items found.
        </p>
      ) : (
        <div className="space-y-3 px-4 py-3">
          {visible.map((p) => {
            const qty = cart[p.id] ?? 0;
            return (
              <div
                key={p.id}
                className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  <SafeImage src={p.image} alt={p.name} fill sizes="96px" className="object-cover" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="text-sm font-bold leading-tight text-gray-900">
                    {p.name}
                  </h3>
                  {p.origin && (
                    <p className="mt-0.5 flex items-center gap-0.5 text-[11px] text-gray-400">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{p.origin}</span>
                    </p>
                  )}
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="text-lg font-extrabold text-gray-900">
                      {formatCurrency(p.pricePerUnit)}
                    </span>
                    <span className="text-xs font-medium text-gray-400">/ kg</span>
                  </div>
                  <span className="mt-1 w-fit rounded-md bg-brand-50 px-1.5 py-0.5 text-[11px] font-semibold text-brand-700">
                    Min order {p.minOrderQty} kg
                  </span>
                </div>

                <div className="flex flex-col items-end justify-between">
                  {qty > 0 ? (
                    <>
                      <div className="flex items-center gap-1 rounded-lg bg-brand-500 px-1 text-white">
                        <button onClick={() => dec(p)} className="flex h-8 w-7 items-center justify-center" aria-label="Decrease">
                          {qty <= p.minOrderQty ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                        </button>
                        <span className="min-w-12 text-center text-sm font-bold">{qty} kg</span>
                        <button onClick={() => inc(p)} disabled={qty + p.minOrderQty > p.stockQty} className="flex h-8 w-7 items-center justify-center disabled:opacity-50" aria-label="Increase">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="mt-1 text-xs font-bold text-gray-900">
                        {formatCurrency(p.pricePerUnit * qty)}
                      </span>
                    </>
                  ) : (
                    <button
                      onClick={() => add(p)}
                      className="flex h-9 items-center gap-1 rounded-lg border border-brand-500 bg-brand-50 px-4 text-sm font-bold text-brand-700 active:scale-95"
                    >
                      <Plus className="h-4 w-4" /> ADD
                    </button>
                  )}
                  <span className="mt-1 text-[10px] text-gray-300">
                    +{p.minOrderQty} kg / tap
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky cart bar */}
      {itemCount > 0 && !sheetOpen && (
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] p-3">
          <button
            onClick={() => setSheetOpen(true)}
            className="flex w-full items-center justify-between rounded-xl bg-brand-600 px-4 py-3.5 text-white shadow-lg active:scale-[0.99]"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <ShoppingCart className="h-4 w-4" />
              {itemCount} item{itemCount > 1 ? "s" : ""} · {formatCurrency(subtotal)}
            </span>
            <span className="text-sm font-bold">Review &amp; Order →</span>
          </button>
        </div>
      )}

      {/* Cart / checkout sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-40 mx-auto flex max-w-[480px] flex-col bg-black/40">
          <button className="flex-1" onClick={() => setSheetOpen(false)} aria-label="Close" />
          <div className="max-h-[88vh] overflow-y-auto rounded-t-2xl bg-gray-50">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
              <p className="text-base font-bold text-gray-900">Your order</p>
              <button onClick={() => setSheetOpen(false)} className="text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 p-4">
              {/* Items */}
              <section className="rounded-2xl border border-gray-100 bg-white p-3">
                <div className="divide-y divide-gray-100">
                  {entries.map(([id, q]) => {
                    const p = byId[id];
                    if (!p) return null;
                    return (
                      <div key={id} className="flex items-center gap-3 py-2.5">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <SafeImage src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-500">{formatCurrency(p.pricePerUnit)}/{p.unit}</p>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-1 text-white">
                          <button onClick={() => dec(p)} className="flex h-7 w-6 items-center justify-center">
                            {q <= p.minOrderQty ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                          </button>
                          <span className="min-w-12 text-center text-sm font-bold">{q} kg</span>
                          <button onClick={() => inc(p)} disabled={q + p.minOrderQty > p.stockQty} className="flex h-7 w-6 items-center justify-center disabled:opacity-50">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="w-16 text-right text-sm font-bold text-gray-900">
                          {formatCurrency(p.pricePerUnit * q)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Delivery */}
              <section className="rounded-2xl border border-gray-100 bg-white p-3">
                <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-900">
                  <MapPin className="h-4 w-4 text-brand-500" /> Delivery details
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input className="field col-span-2" placeholder="Business / shop name" value={form.deliveryName} onChange={(e) => set("deliveryName", e.target.value)} />
                  <input className="field" placeholder="Phone" inputMode="tel" value={form.deliveryPhone} onChange={(e) => set("deliveryPhone", e.target.value)} />
                  <input className="field" placeholder="City" value={form.deliveryCity} onChange={(e) => set("deliveryCity", e.target.value)} />
                  <input className="field col-span-2" placeholder="Full address" value={form.deliveryAddress} onChange={(e) => set("deliveryAddress", e.target.value)} />
                  <input className="field" placeholder="Pincode" inputMode="numeric" value={form.deliveryPincode} onChange={(e) => set("deliveryPincode", e.target.value)} />
                </div>
              </section>

              {/* Payment */}
              <section className="rounded-2xl border border-gray-100 bg-white p-3">
                <p className="mb-2 text-sm font-bold text-gray-900">Payment</p>
                <div className="flex flex-col gap-2">
                  {PAYMENTS.map((m) => (
                    <label key={m.value} className={"flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm " + (payment === m.value ? "border-brand-500 bg-brand-50 font-semibold text-brand-700" : "border-gray-200 text-gray-700")}>
                      {m.label}
                      <input type="radio" name="pay" checked={payment === m.value} onChange={() => setPayment(m.value)} className="h-4 w-4 accent-brand-500" />
                    </label>
                  ))}
                </div>
              </section>

              {/* Bill */}
              <section className="rounded-2xl border border-gray-100 bg-white p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Item total</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className="font-semibold text-brand-600">FREE</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-dashed border-gray-200 pt-2">
                  <span className="text-base font-bold text-gray-900">To pay</span>
                  <span className="text-base font-bold text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
              </section>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Quality checked · easy returns on bad stock
              </p>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600">{error}</p>
              )}

              <button
                onClick={onPlaceClick}
                disabled={placing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white active:scale-[0.99] disabled:opacity-60"
              >
                {placing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Placing order…</>
                ) : payment === "ONLINE" ? (
                  <>Pay {formatCurrency(subtotal)}</>
                ) : (
                  <>Place B2B order · {formatCurrency(subtotal)}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mock payment gateway */}
      {showPay && (
        <MockPaymentSheet
          amount={subtotal}
          onCancel={() => setShowPay(false)}
          onPaid={(ref) => doPlace(ref)}
        />
      )}

      {/* Success overlay */}
      {placed && (
        <div className="fixed inset-0 z-50 mx-auto flex max-w-[480px] flex-col items-center justify-center bg-white px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
            <CheckCircle2 className="h-12 w-12 text-brand-500" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">Order placed!</h2>
          <p className="mt-1 text-sm text-gray-500">Your B2B order is confirmed.</p>
          <span className="mt-3 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            {placed.orderNumber}
          </span>
          <p className="mt-2 text-sm font-semibold text-gray-900">
            Total {formatCurrency(placed.totalAmount)}
          </p>
          <span
            className={
              "mt-2 rounded-full px-3 py-1 text-xs font-semibold " +
              (payment === "ONLINE"
                ? "bg-brand-50 text-brand-700"
                : "bg-amber-50 text-amber-700")
            }
          >
            {payment === "ONLINE"
              ? "✓ Paid online"
              : payment === "CREDIT"
                ? "Business credit"
                : "Cash on delivery"}
          </span>
          <button
            onClick={reset}
            className="mt-7 w-full max-w-xs rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white active:scale-[0.99]"
          >
            Place another order
          </button>
        </div>
      )}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors " +
        (active ? "bg-brand-500 text-white" : "border border-gray-200 bg-white text-gray-600")
      }
    >
      {label}
    </button>
  );
}
