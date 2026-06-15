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
    <div className="px-4 py-6">
      {/* Success hero */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
          <CheckCircle2 className="h-12 w-12 text-brand-500" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-gray-900">Order placed!</h1>
        <p className="mt-1 text-sm text-gray-500">
          Thanks — your order is confirmed and being prepared.
        </p>
        <span className="mt-3 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
          {order.orderNumber}
        </span>
      </div>

      {/* ETA strip */}
      <div className="mt-5 flex items-center gap-3 rounded-2xl bg-brand-500 p-4 text-white">
        <Truck className="h-6 w-6" />
        <div>
          <p className="text-sm font-semibold">Arriving in 1–2 days</p>
          <p className="text-xs text-white/85">
            We&apos;ll notify you when it&apos;s out for delivery.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-gray-900">
          <Package className="h-4 w-4 text-brand-500" /> Order summary
        </p>
        <div className="space-y-1.5">
          {order.items.map((it) => (
            <div key={it.id} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {it.productName}{" "}
                <span className="text-gray-400">
                  × {it.quantity} {it.unit}
                </span>
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(it.lineTotal)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-dashed border-gray-200 pt-3">
          <span className="font-bold text-gray-900">Total paid</span>
          <span className="font-bold text-gray-900">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Payment: {order.paymentMethod === "COD" ? "Cash on delivery" : order.paymentMethod}
        </p>
      </div>

      {/* Delivery address */}
      <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-gray-900">
          <MapPin className="h-4 w-4 text-brand-500" /> Delivering to
        </p>
        <p className="text-sm text-gray-700">{order.deliveryName}</p>
        <p className="text-sm text-gray-500">
          {order.deliveryAddress}, {order.deliveryCity} — {order.deliveryPincode}
        </p>
        <p className="text-sm text-gray-500">{order.deliveryPhone}</p>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-col gap-2">
        <Link
          href={`/orders/${order.id}`}
          className="rounded-xl bg-brand-600 py-3.5 text-center text-sm font-bold text-white active:scale-[0.99]"
        >
          Track order
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-gray-200 bg-white py-3.5 text-center text-sm font-bold text-gray-700 active:scale-[0.99]"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
