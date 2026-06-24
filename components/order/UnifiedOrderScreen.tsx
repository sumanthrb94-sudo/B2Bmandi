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
  Package,
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

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (err: unknown) => void) => void;
    };
  }
}

/** Inject the Razorpay checkout script once and resolve when it's ready. */
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

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
    if (payment === "ONLINE") {
      void startOnlinePayment();
      return;
    }
    void doPlace();
  }

  const orderItems = () =>
    entries.map(([productId, quantity]) => ({ productId, quantity }));

  /**
   * Online payment entry point. Asks the server to start a payment: if Razorpay
   * is configured we open its checkout and verify server-side; otherwise we fall
   * back to the existing mock gateway sheet + /api/order.
   */
  async function startOnlinePayment() {
    setPlacing(true);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems(),
          ...form,
          paymentMethod: "ONLINE",
        }),
      });
      if (res.status === 401) {
        router.push("/login?callbackUrl=/");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not start payment.");
        setPlacing(false);
        return;
      }

      // No real gateway configured → use the existing mock flow.
      if (!data.configured) {
        setPlacing(false);
        setShowPay(true);
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        setError("Could not load the payment gateway. Please try again.");
        setPlacing(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.razorpayOrderId,
        amount: data.amount,
        currency: data.currency,
        name: data.name,
        description: data.description,
        prefill: data.prefill,
        handler: async (resp: RazorpayResponse) => {
          await verifyOnlinePayment(resp);
        },
        modal: {
          ondismiss: () => {
            // User closed checkout — re-enable the button.
            setPlacing(false);
            setError("Payment was cancelled.");
          },
        },
      });
      rzp.on("payment.failed", () => {
        setPlacing(false);
        setError("Payment failed. Please try again.");
      });
      rzp.open();
    } catch {
      setError("Something went wrong. Please try again.");
      setPlacing(false);
    }
  }

  /** Confirm a Razorpay payment server-side and show the success overlay. */
  async function verifyOnlinePayment(resp: RazorpayResponse) {
    try {
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: resp.razorpay_order_id,
          razorpay_payment_id: resp.razorpay_payment_id,
          razorpay_signature: resp.razorpay_signature,
          items: orderItems(),
          ...form,
        }),
      });
      if (res.status === 401) {
        router.push("/login?callbackUrl=/");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not confirm payment.");
        setPlacing(false);
        return;
      }
      setPlaced(data.order);
      setCart({});
      setSheetOpen(false);
    } catch {
      setError("Something went wrong confirming your payment.");
    } finally {
      setPlacing(false);
    }
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
    <div className="min-h-screen bg-fresh-surface pb-28">
      {/* Greeting + search + chips */}
      <div className="sticky top-0 z-20 bg-fresh-surface px-4 pb-3 pt-4">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-fresh-ink">
          Fresh today
        </h1>
        <p className="mb-3 mt-0.5 text-sm text-fresh-muted">
          Wholesale rates · delivered by 6 AM
        </p>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fresh-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search produce…"
            className="w-full rounded-2xl border border-fresh-border bg-white py-3 pl-10 pr-3 text-sm font-medium text-fresh-ink placeholder:text-fresh-faint focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
          />
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
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
      <div className="mx-4 mt-1 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 p-5 text-white">
        <p className="font-display text-lg font-extrabold tracking-tight">
          Wholesale fruits &amp; veggies 🥦
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-white/85">
          Live B2B rates · order in bulk · pay COD, credit or online.
        </p>
      </div>

      {/* Single-column product list */}
      {visible.length === 0 ? (
        <p className="px-4 py-16 text-center text-sm text-fresh-muted">
          No items found.
        </p>
      ) : (
        <div className="space-y-3 px-4 py-4">
          {visible.map((p) => {
            const qty = cart[p.id] ?? 0;
            return (
              <div
                key={p.id}
                className="flex gap-3 rounded-3xl border border-fresh-border bg-white p-3 shadow-card"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-fresh-field">
                  <SafeImage src={p.image} alt={p.name} fill sizes="96px" className="object-cover" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="text-[15px] font-bold leading-tight text-fresh-ink">
                    {p.name}
                  </h3>
                  {p.origin && (
                    <p className="mt-0.5 flex items-center gap-0.5 text-[11px] text-fresh-faint">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{p.origin}</span>
                    </p>
                  )}
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="font-display text-xl font-extrabold text-fresh-ink">
                      {formatCurrency(p.pricePerUnit)}
                    </span>
                    <span className="text-xs font-medium text-fresh-faint">/ {p.unit}</span>
                  </div>
                  <span className="mt-1.5 w-fit rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                    Min order {p.minOrderQty} {p.unit}
                  </span>
                </div>

                <div className="flex flex-col items-end justify-between">
                  {qty > 0 ? (
                    <>
                      <div className="flex items-center gap-1 rounded-full bg-brand-500 px-1 text-white shadow-sm">
                        <button onClick={() => dec(p)} className="flex h-9 w-8 items-center justify-center" aria-label="Decrease">
                          {qty <= p.minOrderQty ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                        </button>
                        <span className="min-w-12 text-center text-sm font-bold">{qty} {p.unit}</span>
                        <button onClick={() => inc(p)} disabled={qty + p.minOrderQty > p.stockQty} className="flex h-9 w-8 items-center justify-center disabled:opacity-50" aria-label="Increase">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="mt-1.5 text-xs font-bold text-fresh-ink">
                        {formatCurrency(p.pricePerUnit * qty)}
                      </span>
                    </>
                  ) : (
                    <button
                      onClick={() => add(p)}
                      className="flex h-10 items-center gap-1 rounded-full border-[1.5px] border-brand-500 bg-brand-50 px-5 text-sm font-bold text-brand-700 active:scale-95"
                    >
                      <Plus className="h-4 w-4" /> ADD
                    </button>
                  )}
                  <span className="mt-1 text-[10px] text-fresh-faint">
                    +{p.minOrderQty} {p.unit} / tap
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
            className="flex w-full items-center justify-between rounded-btn bg-brand-600 px-5 py-4 text-white shadow-cta active:scale-[0.99]"
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
          <div className="max-h-[88vh] overflow-y-auto rounded-t-3xl bg-fresh-surface">
            <div className="sticky top-0 flex items-center justify-between border-b border-fresh-border bg-white px-4 py-3.5">
              <p className="font-display text-lg font-extrabold tracking-tight text-fresh-ink">Your order</p>
              <button onClick={() => setSheetOpen(false)} className="text-fresh-faint">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 p-4">
              {/* Items */}
              <section className="rounded-3xl border border-fresh-border bg-white p-3">
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
                          <span className="min-w-12 text-center text-sm font-bold">{q} {p.unit}</span>
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
              <section className="rounded-3xl border border-fresh-border bg-white p-3">
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
              <section className="rounded-3xl border border-fresh-border bg-white p-3">
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
              <section className="rounded-3xl border border-fresh-border bg-white p-3">
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
                className="flex w-full items-center justify-center gap-2 rounded-btn bg-brand-600 py-4 text-[15px] font-bold text-white shadow-cta active:scale-[0.99] disabled:opacity-60"
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
        <div className="fixed inset-0 z-50 mx-auto flex max-w-[480px] flex-col items-center justify-center bg-fresh-surface px-6 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-50">
            <CheckCircle2 className="h-14 w-14 text-brand-500" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-fresh-ink">Order placed!</h2>
          <p className="mt-1 text-sm text-fresh-muted">Your B2B order is confirmed.</p>
          <span className="mt-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-fresh-muted ring-1 ring-fresh-border">
            {placed.orderNumber}
          </span>
          <p className="mt-2 text-sm font-semibold text-fresh-ink">
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
          <div className="mt-7 flex w-full max-w-xs flex-col gap-3">
            <button
              onClick={reset}
              className="w-full rounded-btn bg-brand-600 py-4 text-[15px] font-bold text-white shadow-cta active:scale-[0.99]"
            >
              Place another order
            </button>
            <button
              onClick={() => router.push("/orders")}
              className="flex w-full items-center justify-center gap-2 rounded-btn border border-fresh-border bg-white py-3.5 text-sm font-semibold text-fresh-muted active:scale-[0.99]"
            >
              <Package className="h-4 w-4" /> View my orders
            </button>
          </div>
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
        "whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition-colors " +
        (active
          ? "bg-brand-500 text-white shadow-sm"
          : "border border-fresh-border bg-white text-fresh-muted")
      }
    >
      {label}
    </button>
  );
}
