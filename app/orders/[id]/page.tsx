import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, MapPin, CreditCard } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { CancelOrderButton } from "@/components/cart/CancelOrderButton";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order details — B2B Mandi",
};

const TIMELINE = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"] as const;

const PAYMENT_LABELS: Record<string, string> = {
  COD: "Cash on delivery",
  CREDIT: "Credit (pay later)",
  ONLINE: "Online payment",
};

export default async function OrderDetailPage({
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
  const cancellable = order.status === "PENDING" || order.status === "CONFIRMED";
  const currentStep =
    order.status === "CANCELLED" ? -1 : TIMELINE.indexOf(order.status as never);

  return (
    <div className="container-app py-8">
      {placed && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Order placed successfully! We&apos;ll notify the sellers right away.
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        {cancellable && <CancelOrderButton orderId={order.id} />}
      </div>

      {/* Timeline */}
      {order.status !== "CANCELLED" && (
        <Card className="mb-6">
          <CardBody>
            <ol className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-0">
              {TIMELINE.map((step, idx) => {
                const done = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <li
                    key={step}
                    className="flex flex-1 items-center gap-3 sm:flex-col sm:gap-2 sm:text-center"
                  >
                    <span
                      className={[
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        done
                          ? "bg-brand-500 text-white"
                          : "bg-gray-100 text-gray-400",
                      ].join(" ")}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={[
                        "text-xs font-medium",
                        isCurrent
                          ? "text-brand-700"
                          : done
                            ? "text-gray-700"
                            : "text-gray-400",
                      ].join(" ")}
                    >
                      {step.charAt(0) + step.slice(1).toLowerCase()}
                    </span>
                  </li>
                );
              })}
            </ol>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Items</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={item.product.image}
                      alt={item.productName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">
                      {item.productName}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {formatCurrency(item.unitPrice)} / {item.unit} ×{" "}
                      {item.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-gray-900">
                    {formatCurrency(item.lineTotal)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between border-t border-gray-100 pt-4">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Delivery + payment */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                <MapPin className="h-4 w-4 text-gray-400" />
                Delivery
              </h2>
            </CardHeader>
            <CardBody className="space-y-1 text-sm text-gray-600">
              <p className="font-medium text-gray-900">{order.deliveryName}</p>
              <p>{order.deliveryPhone}</p>
              <p>{order.deliveryAddress}</p>
              <p>
                {order.deliveryCity} - {order.deliveryPincode}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                <CreditCard className="h-4 w-4 text-gray-400" />
                Payment
              </h2>
            </CardHeader>
            <CardBody className="text-sm text-gray-600">
              {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
            </CardBody>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-gray-900">Notes</h2>
              </CardHeader>
              <CardBody className="text-sm text-gray-600">
                {order.notes}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
