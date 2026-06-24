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
  title: "Your orders — FreshCart",
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
    <div className="min-h-screen bg-fresh-surface px-4 py-5">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-fresh-ink">
          Your orders
        </h1>
        <Link
          href="/"
          className="rounded-full border border-fresh-border bg-white px-3.5 py-2 text-xs font-semibold text-fresh-muted active:scale-95"
        >
          ← Back to shop
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-500">
            <Package className="h-8 w-8" />
          </div>
          <h2 className="mt-5 font-display text-xl font-extrabold tracking-tight text-fresh-ink">
            No orders yet
          </h2>
          <p className="mt-1 max-w-xs text-sm text-fresh-muted">
            When you place an order, you can track it right here.
          </p>
          <Link
            href="/"
            className="mt-6 rounded-btn bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-cta active:scale-[0.99]"
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
                className="block rounded-3xl border border-fresh-border bg-white p-4 shadow-card active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-fresh-ink">
                    {order.orderNumber}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {thumbs.map((it) => (
                    <div
                      key={it.id}
                      className="relative h-11 w-11 overflow-hidden rounded-xl bg-fresh-field"
                    >
                      <SafeImage
                        src={it.product.image}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <span className="text-xs font-medium text-fresh-faint">
                      +{order.items.length - 4}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-fresh-border pt-3">
                  <span className="text-xs text-fresh-muted">
                    {formatDate(order.createdAt)} · {itemCount}{" "}
                    {itemCount === 1 ? "item" : "items"}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-bold text-fresh-ink">
                    {formatCurrency(order.totalAmount)}
                    <ChevronRight className="h-4 w-4 text-fresh-faint" />
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
