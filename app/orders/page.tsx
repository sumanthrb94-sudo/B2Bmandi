import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your orders — FreshKart",
};

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/orders");

  const orders = await prisma.order.findMany({
    where: { buyerId: session.userId },
    include: {
      items: {
        select: {
          id: true,
          quantity: true,
          product: { select: { image: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Your orders</h1>
        <Link
          href="/"
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600"
        >
          ← Back to shop
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-500">
            <Package className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-base font-bold text-gray-900">
            No orders yet
          </h2>
          <p className="mt-1 max-w-xs text-sm text-gray-500">
            When you place an order, you can track it right here.
          </p>
          <Link
            href="/"
            className="mt-5 rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white"
          >
            Browse produce
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
            const thumbs = order.items.slice(0, 4);
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-2xl border border-gray-100 bg-white p-3 shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">
                    {order.orderNumber}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  {thumbs.map((it) => (
                    <div
                      key={it.id}
                      className="relative h-10 w-10 overflow-hidden rounded-lg bg-gray-100"
                    >
                      <SafeImage
                        src={it.product.image}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <span className="text-xs font-medium text-gray-400">
                      +{order.items.length - 4}
                    </span>
                  )}
                </div>

                <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 pt-2.5">
                  <span className="text-xs text-gray-500">
                    {formatDate(order.createdAt)} · {itemCount}{" "}
                    {itemCount === 1 ? "item" : "items"}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-bold text-gray-900">
                    {formatCurrency(order.totalAmount)}
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
