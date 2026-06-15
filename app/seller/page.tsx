import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Package,
  IndianRupee,
  ClipboardList,
  AlertTriangle,
  Boxes,
  Plus,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { StatCard } from "@/components/seller/StatCard";

export const dynamic = "force-dynamic";

export default async function SellerOverviewPage() {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/seller");
  if (session.role === "BUYER") redirect("/");

  const sellerId = session.userId;

  const [
    activeProducts,
    products,
    recentOrders,
    revenueAgg,
  ] = await Promise.all([
    prisma.product.count({ where: { sellerId, isActive: true } }),
    prisma.product.findMany({
      where: { sellerId },
      orderBy: { stockQty: "asc" },
    }),
    prisma.order.findMany({
      where: { items: { some: { sellerId } } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        items: { where: { sellerId } },
        buyer: {
          select: { id: true, name: true, businessName: true, phone: true },
        },
      },
    }),
    prisma.orderItem.aggregate({
      where: { sellerId, order: { status: { not: "CANCELLED" } } },
      _sum: { lineTotal: true },
    }),
  ]);

  const incomingOrdersCount = await prisma.order.count({
    where: { items: { some: { sellerId } } },
  });

  const stockValue = products.reduce(
    (sum, p) => sum + p.pricePerUnit * p.stockQty,
    0,
  );
  const revenue = revenueAgg._sum.lineTotal ?? 0;
  const lowStock = products.filter((p) => p.stockQty <= p.minOrderQty * 2);

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Active products"
          value={activeProducts}
          icon={<Package className="h-5 w-5" />}
          accent="brand"
        />
        <StatCard
          label="Stock value"
          value={formatCurrency(stockValue)}
          icon={<Boxes className="h-5 w-5" />}
          accent="accent"
        />
        <StatCard
          label="Incoming orders"
          value={incomingOrdersCount}
          icon={<ClipboardList className="h-5 w-5" />}
          accent="brand"
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(revenue)}
          hint="Non-cancelled orders"
          icon={<IndianRupee className="h-5 w-5" />}
          accent="accent"
        />
        <StatCard
          label="Low stock"
          value={lowStock.length}
          icon={<AlertTriangle className="h-5 w-5" />}
          accent={lowStock.length > 0 ? "red" : "gray"}
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/seller/products/new">
          <Plus className="h-4 w-4" />
          Add product
        </ButtonLink>
        <ButtonLink href="/seller/products" variant="outline">
          Manage products
        </ButtonLink>
        <ButtonLink href="/seller/orders" variant="outline">
          View orders
        </ButtonLink>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent incoming orders */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              Recent incoming orders
            </h2>
            <Link
              href="/seller/orders"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {recentOrders.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-500">
                No incoming orders yet.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentOrders.map((order) => {
                  const subtotal = order.items.reduce(
                    (sum, it) => sum + it.lineTotal,
                    0,
                  );
                  return (
                    <li key={order.id}>
                      <Link
                        href="/seller/orders"
                        className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {order.buyer.businessName ?? order.buyer.name} ·{" "}
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(subtotal)}
                          </span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Low stock */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Low stock</h2>
            <Link
              href="/seller/products"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Manage <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {lowStock.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-500">
                All products are well stocked.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {lowStock.slice(0, 6).map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/seller/products/${p.id}/edit`}
                      className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          MOQ {p.minOrderQty} {p.unit}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-red-600">
                        {p.stockQty} {p.unit} left
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
