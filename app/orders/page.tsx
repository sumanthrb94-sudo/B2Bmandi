import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardBody } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Orders — B2B Mandi",
};

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/orders");

  const orders = await prisma.order.findMany({
    where: { buyerId: session.userId },
    include: { items: { select: { id: true, quantity: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">
        Your Orders
      </h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="No orders yet"
          description="When you place an order, it will show up here so you can track it."
          actionLabel="Browse products"
          actionHref="/products"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
            return (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="transition-colors hover:border-brand-300">
                  <CardBody className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {order.orderNumber}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(order.createdAt)} · {itemCount}{" "}
                        {itemCount === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </span>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
