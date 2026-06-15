"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, Loader2, ShoppingBag } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import type { CartItemWithProduct } from "@/lib/types";

export function CartView({ initialItems }: { initialItems: CartItemWithProduct[] }) {
  const router = useRouter();
  const [items, setItems] = React.useState(initialItems);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const subtotal = items.reduce(
    (sum, i) => sum + i.quantity * i.product.pricePerUnit,
    0,
  );
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  async function updateQty(item: CartItemWithProduct, nextQty: number) {
    const min = item.product.minOrderQty;
    const max = item.product.stockQty;
    const clamped = Math.min(Math.max(nextQty, min), Math.max(max, min));
    if (clamped === item.quantity) return;

    setPendingId(item.id);
    setError(null);
    try {
      const res = await fetch(`/api/cart/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: clamped }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not update quantity");
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, quantity: data.item.quantity } : i,
        ),
      );
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setPendingId(null);
    }
  }

  async function removeItem(item: CartItemWithProduct) {
    setPendingId(item.id);
    setError(null);
    try {
      const res = await fetch(`/api/cart/${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not remove item");
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setPendingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-6 w-6" />}
        title="Your cart is empty"
        description="Browse the marketplace and add fresh produce to get started."
        actionLabel="Browse products"
        actionHref="/products"
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {items.map((item) => {
          const busy = pendingId === item.id;
          const lineTotal = item.quantity * item.product.pricePerUnit;
          return (
            <Card key={item.id}>
              <CardBody className="flex gap-4">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                >
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="line-clamp-1 font-semibold text-gray-900 hover:text-brand-600"
                      >
                        {item.product.name}
                      </Link>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {formatCurrency(item.product.pricePerUnit)} /
                        {item.product.unit}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        by{" "}
                        {item.product.seller.businessName ??
                          item.product.seller.name}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item)}
                      disabled={busy}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-end justify-between pt-3">
                    <div className="inline-flex items-center rounded-lg border border-gray-300">
                      <button
                        onClick={() => updateQty(item, item.quantity - 1)}
                        disabled={
                          busy || item.quantity <= item.product.minOrderQty
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-l-lg text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="flex h-8 min-w-10 items-center justify-center px-2 text-sm font-medium tabular-nums">
                        {busy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        onClick={() => updateQty(item, item.quantity + 1)}
                        disabled={
                          busy || item.quantity >= item.product.stockQty
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-r-lg text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-base font-bold text-gray-900">
                      {formatCurrency(lineTotal)}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-20">
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Order summary</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Items ({itemCount})
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <span className="font-semibold text-gray-900">Subtotal</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <ButtonLink href="/checkout" size="lg" className="w-full">
              Proceed to checkout
            </ButtonLink>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/products")}
            >
              Continue shopping
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
