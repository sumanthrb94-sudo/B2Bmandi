"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

interface AddToCartPanelProps {
  productId: string;
  slug: string;
  pricePerUnit: number;
  unit: string;
  minOrderQty: number;
  stockQty: number;
  isLoggedIn: boolean;
}

export function AddToCartPanel({
  productId,
  slug,
  pricePerUnit,
  unit,
  minOrderQty,
  stockQty,
  isLoggedIn,
}: AddToCartPanelProps) {
  const router = useRouter();
  const outOfStock = stockQty <= 0;
  const step = Math.max(minOrderQty, 1);
  const initialQty = Math.min(Math.max(minOrderQty, 1), Math.max(stockQty, 0));

  const [qty, setQty] = React.useState(initialQty);
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = React.useState<string | null>(null);

  const clamp = (n: number) => {
    if (Number.isNaN(n)) return minOrderQty;
    return Math.min(Math.max(n, minOrderQty), stockQty);
  };

  const dec = () => setQty((q) => clamp(q - step));
  const inc = () => setQty((q) => clamp(q + step));

  const lineTotal = qty * pricePerUnit;

  const onAdd = async () => {
    if (outOfStock) return;
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/products/${slug}`);
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: qty }),
      });
      if (res.status === 401) {
        router.push(`/login?callbackUrl=/products/${slug}`);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Could not add to cart. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="space-y-4">
      {!outOfStock && (
        <div>
          <p className="mb-1.5 text-sm font-medium text-gray-700">Quantity</p>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-lg border border-gray-300">
              <button
                type="button"
                onClick={dec}
                disabled={qty <= minOrderQty}
                aria-label="Decrease quantity"
                className="flex h-10 w-10 items-center justify-center rounded-l-lg text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                value={qty}
                min={minOrderQty}
                max={stockQty}
                step={step}
                onChange={(e) => setQty(clamp(Number(e.target.value)))}
                aria-label="Quantity"
                className="h-10 w-16 border-x border-gray-300 text-center text-sm font-medium focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={inc}
                disabled={qty >= stockQty}
                aria-label="Increase quantity"
                className="flex h-10 w-10 items-center justify-center rounded-r-lg text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="text-sm text-gray-500">{unit}</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Min order {minOrderQty} {unit} · {stockQty} {unit} available
          </p>
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
        <span className="text-sm text-gray-600">Line total</span>
        <span className="text-xl font-bold text-gray-900">
          {formatCurrency(outOfStock ? 0 : lineTotal)}
        </span>
      </div>

      <Button
        type="button"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={outOfStock || status === "loading"}
        onClick={onAdd}
      >
        {outOfStock ? (
          "Out of stock"
        ) : status === "loading" ? (
          "Adding…"
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" /> Add to cart
          </>
        )}
      </Button>

      {status === "success" && (
        <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-brand-700">
            <Check className="h-4 w-4" /> Added to cart
          </span>
          <Link
            href="/cart"
            className="font-semibold text-brand-700 underline-offset-2 hover:underline"
          >
            View cart
          </Link>
        </div>
      )}

      {status === "error" && error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
