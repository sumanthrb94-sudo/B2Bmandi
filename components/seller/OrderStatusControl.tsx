"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Forward-only flow + the action label that advances FROM the current status.
const NEXT: Record<string, { status: string; label: string } | null> = {
  PENDING: { status: "CONFIRMED", label: "Confirm order" },
  CONFIRMED: { status: "PACKED", label: "Mark packed" },
  PACKED: { status: "SHIPPED", label: "Mark shipped" },
  SHIPPED: { status: "DELIVERED", label: "Mark delivered" },
  DELIVERED: null,
  CANCELLED: null,
};

export function OrderStatusControl({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const next = NEXT[status];

  if (!next) {
    return (
      <p className="text-xs font-medium text-gray-400">
        {status === "CANCELLED"
          ? "Order cancelled"
          : "Order completed — delivered"}
      </p>
    );
  }

  async function advance() {
    if (!next) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/seller/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next.status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Unable to update order");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button type="button" size="sm" onClick={advance} disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Updating…" : next.label}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
