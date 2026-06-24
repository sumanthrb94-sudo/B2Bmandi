import Link from "next/link";
import { redirect } from "next/navigation";
import {
  IndianRupee,
  ClipboardList,
  Package,
  Users,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatCurrency, formatDate, ORDER_STATUS_META } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge, OrderStatusBadge } from "@/components/ui/Badge";
import { StatCard } from "@/components/admin/StatCard";

export const dynamic = "force-dynamic";

const STATUS_ORDER = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default async function AdminOverviewPage() {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/admin");
  if (session.role !== "ADMIN") redirect("/");

  const [
    revenueAgg,
    totalOrders,
    statusGroups,
    totalProducts,
    activeProducts,
    products,
    totalCustomers,
    recentOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { totalAmount: true },
    }),
    prisma.order.count(),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.findMany({ select: { stockQty: true, minOrderQty: true } }),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        buyer: { select: { name: true, businessName: true } },
      },
    }),
  ]);

  const revenue = revenueAgg._sum.totalAmount ?? 0;
  const lowStock = products.filter(
    (p) => p.stockQty <= p.minOrderQty * 2,
  ).length;

  const statusCounts = new Map(
    statusGroups.map((g) => [g.status, g._count._all]),
  );

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Revenue"
          value={formatCurrency(revenue)}
          hint="Non-cancelled"
          icon={<IndianRupee className="h-5 w-5" />}
          accent="accent"
        />
        <StatCard
          label="Orders"
          value={totalOrders}
          icon={<ClipboardList className="h-5 w-5" />}
          accent="brand"
        />
        <StatCard
          label="Products"
          value={totalProducts}
          hint={`${activeProducts} active`}
          icon={<Package className="h-5 w-5" />}
          accent="brand"
        />
        <StatCard
          label="Customers"
          value={totalCustomers}
          icon={<Users className="h-5 w-5" />}
          accent="accent"
        />
        <StatCard
          label="Low stock"
          value={lowStock}
          icon={
            lowStock > 0 ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )
          }
          accent={lowStock > 0 ? "red" : "gray"}
        />
      </div>

      {/* Orders by status */}
      <Card>
        <CardHeader>
          <h2 className="font-display text-base font-extrabold tracking-tight text-fresh-ink">
            Orders by status
          </h2>
        </CardHeader>
        <CardBody className="flex flex-wrap gap-2 p-4">
          {STATUS_ORDER.map((status) => {
            const meta = ORDER_STATUS_META[status];
            return (
              <Badge key={status} className={meta.classes}>
                {meta.label}: {statusCounts.get(status as never) ?? 0}
              </Badge>
            );
          })}
        </CardBody>
      </Card>

      {/* Recent orders */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="font-display text-base font-extrabold tracking-tight text-fresh-ink">
            Recent orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View all
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-fresh-muted">
              No orders yet.
            </p>
          ) : (
            <ul className="divide-y divide-fresh-border">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href="/admin/orders"
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-fresh-field"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-fresh-ink">
                        {order.orderNumber}
                      </p>
                      <p className="truncate text-xs text-fresh-muted">
                        {order.buyer.businessName ?? order.buyer.name} ·{" "}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-semibold text-fresh-ink">
                        {formatCurrency(order.totalAmount)}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
