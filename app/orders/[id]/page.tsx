import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  MapPin,
  Wallet,
  ClipboardCheck,
  Package,
  Truck,
  PackageCheck,
  XCircle,
  Phone,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { SafeImage } from "@/components/ui/SafeImage";
import { CancelOrderButton } from "@/components/cart/CancelOrderButton";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track order — FreshCart",
};

const STAGES = [
  { key: "PENDING", label: "Order placed", icon: ClipboardCheck, note: "We’ve received your order." },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2, note: "Seller accepted your order." },
  { key: "PACKED", label: "Packed & ready", icon: Package, note: "Your produce is packed fresh." },
  { key: "SHIPPED", label: "Out for delivery", icon: Truck, note: "On the way to you." },
  { key: "DELIVERED", label: "Delivered", icon: PackageCheck, note: "Order delivered. Enjoy!" },
] as const;

const PAYMENT_LABELS: Record<string, string> = {
  COD: "Cash on delivery",
  CREDIT: "Credit (pay later)",
  ONLINE: "Online payment",
};

export default async function OrderTrackPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { placed?: string };
}) {
  const session = await getSession();
  if (!session) notFound();

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: { product: { select: { id: true, slug: true, image: true } } },
      },
    },
  });
  if (!order || order.buyerId !== session.userId) notFound();

  const placed = searchParams.placed === "1";
  const cancelled = order.status === "CANCELLED";
  const cancellable = order.status === "PENDING" || order.status === "CONFIRMED";
  const currentStep = cancelled
    ? -1
    : STAGES.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-fresh-surface px-4 py-5">
      {placed && (
        <div className="mb-3 flex items-center gap-2 rounded-2xl bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Order placed successfully!
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-xl font-extrabold tracking-tight text-fresh-ink">
            {order.orderNumber}
          </p>
          <p className="mt-0.5 text-xs text-fresh-faint">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Tracking */}
      <section className="mt-4 rounded-3xl border border-fresh-border bg-white p-4 shadow-card">
        {cancelled ? (
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
              <XCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-fresh-ink">
                Order cancelled
              </p>
              <p className="text-xs text-fresh-muted">
                This order was cancelled and stock was released.
              </p>
            </div>
          </div>
        ) : (
          <ol className="relative">
            {STAGES.map((stage, idx) => {
              const done = idx < currentStep;
              const current = idx === currentStep;
              const Icon = stage.icon;
              const isLast = idx === STAGES.length - 1;
              return (
                <li key={stage.key} className="flex gap-3 pb-5 last:pb-0">
                  {/* dot + connector */}
                  <div className="relative flex flex-col items-center">
                    <span
                      className={[
                        "z-10 flex h-9 w-9 items-center justify-center rounded-full ring-4 ring-white",
                        done || current
                          ? "bg-brand-500 text-white"
                          : "bg-fresh-field text-fresh-faint",
                        current ? "shadow-[0_0_0_4px_rgba(18,158,71,0.18)]" : "",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {!isLast && (
                      <span
                        className={[
                          "absolute top-9 h-[calc(100%-0.5rem)] w-0.5",
                          done ? "bg-brand-400" : "bg-fresh-border",
                        ].join(" ")}
                      />
                    )}
                  </div>
                  {/* label */}
                  <div className="pt-1">
                    <p
                      className={[
                        "text-sm font-semibold",
                        current
                          ? "text-brand-700"
                          : done
                            ? "text-fresh-ink"
                            : "text-fresh-faint",
                      ].join(" ")}
                    >
                      {stage.label}
                    </p>
                    <p className="text-xs text-fresh-faint">
                      {current
                        ? stage.note
                        : done
                          ? "Completed"
                          : "Pending"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Items */}
      <section className="mt-3 rounded-3xl border border-fresh-border bg-white p-3 shadow-card">
        <p className="mb-2 text-sm font-bold text-fresh-ink">
          Items ({order.items.length})
        </p>
        <div className="divide-y divide-fresh-border">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2.5">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-fresh-field">
                <SafeImage
                  src={item.product.image}
                  alt={item.productName}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-fresh-ink">
                  {item.productName}
                </p>
                <p className="text-xs text-fresh-muted">
                  {formatCurrency(item.unitPrice)}/{item.unit} × {item.quantity}
                </p>
              </div>
              <span className="text-sm font-bold text-fresh-ink">
                {formatCurrency(item.lineTotal)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between border-t border-dashed border-fresh-border pt-2">
          <span className="font-bold text-fresh-ink">Total</span>
          <span className="font-bold text-fresh-ink">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
      </section>

      {/* Delivery */}
      <section className="mt-3 rounded-3xl border border-fresh-border bg-white p-3 shadow-card">
        <p className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-fresh-ink">
          <MapPin className="h-4 w-4 text-brand-500" /> Delivery address
        </p>
        <p className="text-sm text-fresh-ink">{order.deliveryName}</p>
        <p className="text-sm text-fresh-muted">
          {order.deliveryAddress}, {order.deliveryCity} — {order.deliveryPincode}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-sm text-fresh-muted">
          <Phone className="h-3 w-3" /> {order.deliveryPhone}
        </p>
      </section>

      {/* Payment */}
      <section className="mt-3 flex items-center justify-between rounded-3xl border border-fresh-border bg-white p-3 shadow-card">
        <span className="flex items-center gap-1.5 text-sm font-bold text-fresh-ink">
          <Wallet className="h-4 w-4 text-brand-500" /> Payment
        </span>
        <span className="text-sm text-fresh-muted">
          {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
        </span>
      </section>

      {order.notes && (
        <section className="mt-3 rounded-3xl border border-fresh-border bg-white p-3 shadow-card">
          <p className="text-sm font-bold text-fresh-ink">Notes</p>
          <p className="mt-1 text-sm text-fresh-muted">{order.notes}</p>
        </section>
      )}

      {cancellable && (
        <div className="mt-4">
          <CancelOrderButton orderId={order.id} />
        </div>
      )}
    </div>
  );
}
