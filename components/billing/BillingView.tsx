"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Minus,
  Trash2,
  MapPin,
  Wallet,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatCurrency } from "@/lib/utils";

interface Item {
  id: string;
  productId: string;
  quantity: number;
  name: string;
  image: string;
  unit: string;
  price: number;
  minOrderQty: number;
  stockQty: number;
}

interface Profile {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

const PAYMENT_METHODS = [
  { value: "COD", label: "Cash on delivery" },
  { value: "CREDIT", label: "Business credit" },
  { value: "ONLINE", label: "Pay online" },
];

export function BillingView({
  items: initialItems,
  profile,
}: {
  items: Item[];
  profile: Profile;
}) {
  const router = useRouter();
  const [items, setItems] = React.useState(initialItems);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [placing, setPlacing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState(profile);
  const [payment, setPayment] = React.useState("COD");

  const itemTotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const deliveryFee = 0; // free wholesale delivery
  const grandTotal = itemTotal + deliveryFee;

  function set<K extends keyof Profile>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function changeQty(it: Item, nextQty: number) {
    setBusy(it.id);
    try {
      if (nextQty < it.minOrderQty) {
        await fetch(`/api/cart/${it.id}`, { method: "DELETE" });
        setItems((arr) => arr.filter((x) => x.id !== it.id));
      } else {
        const q = Math.min(nextQty, it.stockQty);
        await fetch(`/api/cart/${it.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: q }),
        });
        setItems((arr) =>
          arr.map((x) => (x.id === it.id ? { ...x, quantity: q } : x)),
        );
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function placeOrder() {
    setError(null);
    if (!form.name || !form.phone || !form.address || !form.city || !form.pincode) {
      setError("Please fill in all delivery details.");
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryName: form.name,
          deliveryPhone: form.phone,
          deliveryAddress: form.address,
          deliveryCity: form.city,
          deliveryPincode: form.pincode,
          paymentMethod: payment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not place order. Please try again.");
        setPlacing(false);
        return;
      }
      router.push(`/order-success/${data.order.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="px-6 py-24 text-center">
        <p className="text-sm text-gray-500">Your cart is now empty.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white"
        >
          Browse produce
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <h1 className="mb-3 text-lg font-bold text-gray-900">Checkout</h1>

      {/* Items */}
      <section className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          {items.length} item{items.length > 1 ? "s" : ""}
        </p>
        <div className="divide-y divide-gray-100">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-3 py-2.5">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <SafeImage src={it.image} alt={it.name} fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {it.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(it.price)}/{it.unit}
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-1 text-white">
                <button
                  onClick={() => changeQty(it, it.quantity - 1)}
                  disabled={busy === it.id}
                  className="flex h-7 w-6 items-center justify-center disabled:opacity-50"
                  aria-label="Decrease"
                >
                  {it.quantity <= it.minOrderQty ? (
                    <Trash2 className="h-3.5 w-3.5" />
                  ) : (
                    <Minus className="h-3.5 w-3.5" />
                  )}
                </button>
                <span className="min-w-4 text-center text-sm font-bold">
                  {busy === it.id ? (
                    <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" />
                  ) : (
                    it.quantity
                  )}
                </span>
                <button
                  onClick={() => changeQty(it, it.quantity + 1)}
                  disabled={busy === it.id || it.quantity >= it.stockQty}
                  className="flex h-7 w-6 items-center justify-center disabled:opacity-50"
                  aria-label="Increase"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="w-16 text-right text-sm font-bold text-gray-900">
                {formatCurrency(it.price * it.quantity)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Delivery */}
      <section className="mt-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-900">
          <MapPin className="h-4 w-4 text-brand-500" /> Delivery details
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input className="field col-span-2" placeholder="Business / contact name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          <input className="field" placeholder="Phone" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          <input className="field" placeholder="City" value={form.city} onChange={(e) => set("city", e.target.value)} />
          <input className="field col-span-2" placeholder="Full address" value={form.address} onChange={(e) => set("address", e.target.value)} />
          <input className="field" placeholder="Pincode" inputMode="numeric" value={form.pincode} onChange={(e) => set("pincode", e.target.value)} />
        </div>
      </section>

      {/* Payment */}
      <section className="mt-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-900">
          <Wallet className="h-4 w-4 text-brand-500" /> Payment method
        </p>
        <div className="flex flex-col gap-2">
          {PAYMENT_METHODS.map((m) => (
            <label
              key={m.value}
              className={
                "flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm " +
                (payment === m.value
                  ? "border-brand-500 bg-brand-50 font-semibold text-brand-700"
                  : "border-gray-200 text-gray-700")
              }
            >
              {m.label}
              <input
                type="radio"
                name="pay"
                checked={payment === m.value}
                onChange={() => setPayment(m.value)}
                className="h-4 w-4 accent-brand-500"
              />
            </label>
          ))}
        </div>
      </section>

      {/* Bill */}
      <section className="mt-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <p className="mb-2 text-sm font-bold text-gray-900">Bill details</p>
        <Row label="Item total" value={formatCurrency(itemTotal)} />
        <Row label="Delivery fee" value="FREE" valueClass="text-brand-600" />
        <div className="mt-2 flex items-center justify-between border-t border-dashed border-gray-200 pt-2">
          <span className="text-base font-bold text-gray-900">To pay</span>
          <span className="text-base font-bold text-gray-900">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </section>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
        <ShieldCheck className="h-3.5 w-3.5" /> Quality checked · easy returns on
        bad stock
      </p>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      {/* Place order — fixed above bottom nav */}
      <div className="fixed inset-x-0 bottom-[60px] z-30 mx-auto max-w-[480px] border-t border-gray-100 bg-white px-4 py-3">
        <button
          onClick={placeOrder}
          disabled={placing}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white active:scale-[0.99] disabled:opacity-60"
        >
          {placing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Placing order…
            </>
          ) : (
            <>Place order · {formatCurrency(grandTotal)}</>
          )}
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = "text-gray-900",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-0.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={"font-semibold " + valueClass}>{value}</span>
    </div>
  );
}
