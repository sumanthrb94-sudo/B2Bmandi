import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Package, MapPin, Truck } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) notFound();

  const order = await prisma.order.findFirst({
    where: { id: params.id, buyerId: session.userId },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="min-h-screen bg-fresh-surface px-4 py-7">
      {/* Success hero */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-50">
          <CheckCircle2 className="h-14 w-14 text-brand-500" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-fresh-ink">
          Order placed!
        </h1>
        <p className="mt-1 text-sm text-fresh-muted">
          Thanks — your order is confirmed and being prepared.
        </p>
        <span className="mt-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-fresh-muted ring-1 ring-fresh-border">
          {order.orderNumber}
        </span>
      </div>

      {/* ETA strip */}
      <div className="mt-6 flex items-center gap-3 rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 p-4 text-white">
        <Truck className="h-6 w-6" />
        <div>
          <p className="text-sm font-bold">Arriving in 1–2 days</p>
          <p className="text-xs text-white/85">
            We&apos;ll notify you when it&apos;s out for delivery.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 rounded-3xl border border-fresh-border bg-white p-4 shadow-card">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-fresh-ink">
          <Package className="h-4 w-4 text-brand-500" /> Order summary
        </p>
        <div className="space-y-1.5">
          {order.items.map((it) => (
            <div key={it.id} className="flex justify-between text-sm">
              <span className="text-fresh-muted">
                {it.productName}{" "}
                <span className="text-fresh-faint">
                  × {it.quantity} {it.unit}
                </span>
              </span>
              <span className="font-medium text-fresh-ink">
                {formatCurrency(it.lineTotal)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-dashed border-fresh-border pt-3">
          <span className="font-bold text-fresh-ink">Total paid</span>
          <span className="font-bold text-fresh-ink">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
        <p className="mt-1 text-xs text-fresh-faint">
          Payment: {order.paymentMethod === "COD" ? "Cash on delivery" : order.paymentMethod}
        </p>
      </div>

      {/* Delivery address */}
      <div className="mt-4 rounded-3xl border border-fresh-border bg-white p-4 shadow-card">
        <p className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-fresh-ink">
          <MapPin className="h-4 w-4 text-brand-500" /> Delivering to
        </p>
        <p className="text-sm text-fresh-ink">{order.deliveryName}</p>
        <p className="text-sm text-fresh-muted">
          {order.deliveryAddress}, {order.deliveryCity} — {order.deliveryPincode}
        </p>
        <p className="text-sm text-fresh-muted">{order.deliveryPhone}</p>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3">
        <Link
          href={`/orders/${order.id}`}
          className="rounded-btn bg-brand-600 py-4 text-center text-[15px] font-bold text-white shadow-cta active:scale-[0.99]"
        >
          Track order
        </Link>
        <Link
          href="/"
          className="rounded-btn border border-fresh-border bg-white py-3.5 text-center text-sm font-bold text-fresh-muted active:scale-[0.99]"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
