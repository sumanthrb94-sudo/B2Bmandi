import { redirect } from "next/navigation";
import { Phone, MapPin, Inbox } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { OrderStatusControl } from "@/components/seller/OrderStatusControl";

export const dynamic = "force-dynamic";

export default async function SellerOrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/seller");
  if (session.role === "BUYER") redirect("/");

  const sellerId = session.userId;

  const orders = await prisma.order.findMany({
    where: { items: { some: { sellerId } } },
    orderBy: { createdAt: "desc" },
    include: {
      items: { where: { sellerId } },
      buyer: {
        select: { id: true, name: true, businessName: true, phone: true },
      },
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Incoming orders</h2>
        <p className="text-sm text-gray-500">
          {orders.length} {orders.length === 1 ? "order" : "orders"} containing
          your products
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-7 w-7" />}
          title="No incoming orders yet"
          description="When buyers order your products, their orders will show up here."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const subtotal = order.items.reduce(
              (sum, it) => sum + it.lineTotal,
              0,
            );
            return (
              <Card key={order.id}>
                <CardHeader className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {order.orderNumber}
                      </p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <OrderStatusControl
                    orderId={order.id}
                    status={order.status}
                  />
                </CardHeader>
                <CardBody className="space-y-4">
                  {/* Buyer + delivery */}
                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.buyer.businessName ?? order.buyer.name}
                      </p>
                      {order.buyer.phone && (
                        <p className="mt-0.5 flex items-center gap-1.5 text-gray-500">
                          <Phone className="h-3.5 w-3.5" />
                          {order.buyer.phone}
                        </p>
                      )}
                    </div>
                    <p className="flex items-center gap-1.5 text-gray-500 sm:justify-end">
                      <MapPin className="h-3.5 w-3.5" />
                      {order.deliveryCity}
                    </p>
                  </div>

                  {/* Seller's line items */}
                  <div className="rounded-lg border border-gray-100">
                    <ul className="divide-y divide-gray-100">
                      {order.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">
                              {item.productName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.quantity} {item.unit} ×{" "}
                              {formatCurrency(item.unitPrice)}
                            </p>
                          </div>
                          <span className="shrink-0 font-medium text-gray-900">
                            {formatCurrency(item.lineTotal)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5">
                      <span className="text-sm font-medium text-gray-600">
                        Your subtotal
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
