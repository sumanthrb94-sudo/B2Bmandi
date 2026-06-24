"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SafeImage } from "@/components/ui/SafeImage";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

export function ProductAdminRow({
  id,
  name,
  image,
  category,
  pricePerUnit,
  minOrderQty,
  stockQty,
  isActive,
}: {
  id: string;
  name: string;
  image: string;
  category: string;
  pricePerUnit: number;
  minOrderQty: number;
  stockQty: number;
  isActive: boolean;
}) {
  const router = useRouter();
  const [price, setPrice] = React.useState(String(pricePerUnit));
  const [stock, setStock] = React.useState(String(stockQty));
  const [active, setActive] = React.useState(isActive);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const dirty =
    Number(price) !== pricePerUnit ||
    Number(stock) !== stockQty ||
    active !== isActive;

  async function save() {
    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError("Enter a valid price.");
      return;
    }
    if (Number.isNaN(stockNum) || stockNum < 0) {
      setError("Enter a valid stock.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pricePerUnit: priceNum,
          stockQty: stockNum,
          isActive: active,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not save product.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-3xl border border-fresh-border bg-white p-3 shadow-card">
      <div className="flex gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-fresh-field">
          <SafeImage
            src={image}
            alt={name}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-fresh-ink">{name}</p>
          <p className="text-xs text-fresh-muted">{category}</p>
          <p className="mt-0.5 text-xs text-fresh-faint">
            {formatCurrency(pricePerUnit)}/kg · MOQ {minOrderQty} kg
          </p>
        </div>
        <Badge
          className={
            active
              ? "bg-brand-100 text-brand-800"
              : "bg-gray-100 text-gray-600"
          }
        >
          {active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-fresh-muted">
            Price /kg (₹)
          </span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input-base"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-fresh-muted">
            Stock (kg)
          </span>
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="input-base"
          />
        </label>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <label className="inline-flex items-center gap-2 text-sm text-fresh-muted">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-300"
          />
          Active
        </label>
        <Button
          size="sm"
          disabled={pending || !dirty}
          onClick={save}
        >
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
