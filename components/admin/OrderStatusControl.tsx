"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const FLOW = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"] as const;

const LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function OrderStatusControl({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const idx = FLOW.indexOf(status as (typeof FLOW)[number]);
  const next = idx >= 0 && idx < FLOW.length - 1 ? FLOW[idx + 1] : null;
  const terminal = status === "DELIVERED" || status === "CANCELLED";

  async function update(newStatus: string) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not update order.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  if (terminal) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {next && (
          <Button
            size="sm"
            disabled={pending}
            onClick={() => update(next)}
          >
            Next: {LABELS[next]}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        <Button
          size="sm"
          variant="danger"
          disabled={pending}
          onClick={() => update("CANCELLED")}
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
