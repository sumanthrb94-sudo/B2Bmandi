"use client";

import * as React from "react";
import {
  CreditCard,
  Smartphone,
  Loader2,
  X,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

/**
 * A simulated ("mock") payment sheet — no real gateway, no real charge.
 * Calls onPaid(reference) after a short fake-processing delay.
 */
export function MockPaymentSheet({
  amount,
  onCancel,
  onPaid,
}: {
  amount: number;
  onCancel: () => void;
  onPaid: (reference: string) => void;
}) {
  const [tab, setTab] = React.useState<"card" | "upi">("card");
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [card, setCard] = React.useState({
    number: "4242 4242 4242 4242",
    name: "",
    expiry: "12/28",
    cvv: "123",
  });
  const [upi, setUpi] = React.useState("");

  function formatCardNumber(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }

  function pay() {
    setError(null);
    if (tab === "card") {
      const digits = card.number.replace(/\s/g, "");
      if (digits.length < 12) return setError("Enter a valid card number.");
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return setError("Expiry must be MM/YY.");
      if (!/^\d{3,4}$/.test(card.cvv)) return setError("Enter a valid CVV.");
    } else if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upi)) {
      return setError("Enter a valid UPI ID (e.g. name@okbank).");
    }
    setProcessing(true);
    // simulate gateway round-trip
    setTimeout(() => {
      const ref =
        "TXN" +
        Date.now().toString(36).toUpperCase() +
        Math.random().toString(36).slice(2, 6).toUpperCase();
      onPaid(ref);
    }, 1700);
  }

  return (
    <div className="fixed inset-0 z-[60] mx-auto flex max-w-[480px] flex-col bg-black/50">
      <button className="flex-1" onClick={onCancel} aria-label="Close" disabled={processing} />
      <div className="rounded-t-2xl bg-white">
        {/* header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-brand-600" />
            <span className="text-base font-bold text-gray-900">Pay securely</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              TEST MODE
            </span>
          </div>
          <button onClick={onCancel} disabled={processing} className="text-gray-400 disabled:opacity-40">
            <X className="h-5 w-5" />
          </button>
        </div>

        {processing ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
            <p className="mt-4 text-sm font-semibold text-gray-900">
              Processing {formatCurrency(amount)}…
            </p>
            <p className="mt-1 text-xs text-gray-400">Do not close this screen.</p>
          </div>
        ) : (
          <div className="p-4">
            {/* tabs */}
            <div className="mb-3 grid grid-cols-2 gap-2">
              <TabBtn active={tab === "card"} onClick={() => setTab("card")} icon={<CreditCard className="h-4 w-4" />} label="Card" />
              <TabBtn active={tab === "upi"} onClick={() => setTab("upi")} icon={<Smartphone className="h-4 w-4" />} label="UPI" />
            </div>

            {tab === "card" ? (
              <div className="space-y-2">
                <input
                  className="field"
                  inputMode="numeric"
                  placeholder="Card number"
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                />
                <input
                  className="field"
                  placeholder="Name on card"
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="field"
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                  />
                  <input
                    className="field"
                    inputMode="numeric"
                    placeholder="CVV"
                    maxLength={4}
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })}
                  />
                </div>
                <p className="text-[11px] text-gray-400">
                  Test card pre-filled — no real charge is made.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  className="field"
                  placeholder="yourname@okbank"
                  value={upi}
                  onChange={(e) => setUpi(e.target.value)}
                />
                <div className="flex gap-2 text-[11px] text-gray-400">
                  <span className="rounded-md bg-gray-100 px-2 py-1">GPay</span>
                  <span className="rounded-md bg-gray-100 px-2 py-1">PhonePe</span>
                  <span className="rounded-md bg-gray-100 px-2 py-1">Paytm</span>
                </div>
              </div>
            )}

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              onClick={pay}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white active:scale-[0.99]"
            >
              <Lock className="h-4 w-4" /> Pay {formatCurrency(amount)}
            </button>
            <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-gray-400">
              <CheckCircle2 className="h-3 w-3 text-brand-500" /> Simulated gateway · PCI-safe demo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold " +
        (active ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600")
      }
    >
      {icon} {label}
    </button>
  );
}
