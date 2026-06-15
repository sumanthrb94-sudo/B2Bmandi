import { redirect } from "next/navigation";
import { ClipboardList, MapPin } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardBody } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/admin");
  if (session.role !== "ADMIN") redirect("/");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { name: true, businessName: true, phone: true } },
      items: true,
    },
  });

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ClipboardList className="h-10 w-10 text-gray-300" />
        <p className="mt-3 text-sm text-gray-500">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const itemCount = order.items.reduce((s, it) => s + it.quantity, 0);
        return (
          <Card key={order.id}>
            <CardBody className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {order.orderNumber}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {order.buyer.businessName ?? order.buyer.name}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {order.deliveryCity}
                </span>
                <span>{formatDate(order.createdAt)}</span>
                <span>
                  {order.items.length} item
                  {order.items.length === 1 ? "" : "s"} · {itemCount} kg
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(order.totalAmount)}
                </span>
                <OrderStatusControl
                  orderId={order.id}
                  status={order.status}
                />
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
