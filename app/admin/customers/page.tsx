import { redirect } from "next/navigation";
import { Users, Phone, MapPin } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { Card, CardBody } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/admin");
  if (session.role !== "ADMIN") redirect("/");

  const customers = await prisma.user.findMany({
    where: { role: "BUYER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      businessName: true,
      phone: true,
      city: true,
    },
  });

  // Aggregate order count + total spent (non-cancelled) per buyer.
  const grouped = await prisma.order.groupBy({
    by: ["buyerId"],
    where: { status: { not: "CANCELLED" } },
    _count: { _all: true },
    _sum: { totalAmount: true },
  });
  const stats = new Map(
    grouped.map((g) => [
      g.buyerId,
      { orders: g._count._all, spent: g._sum.totalAmount ?? 0 },
    ]),
  );

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Users className="h-10 w-10 text-gray-300" />
        <p className="mt-3 text-sm text-gray-500">No customers yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {customers.map((c) => {
        const stat = stats.get(c.id) ?? { orders: 0, spent: 0 };
        return (
          <Card key={c.id}>
            <CardBody className="space-y-2 p-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                {c.businessName && (
                  <p className="text-xs text-gray-500">{c.businessName}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                {c.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {c.phone}
                  </span>
                )}
                {c.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {c.city}
                  </span>
                )}
              </div>
              <p className="border-t border-gray-100 pt-2 text-sm text-gray-700">
                <span className="font-medium text-gray-900">
                  {stat.orders}
                </span>{" "}
                order{stat.orders === 1 ? "" : "s"} ·{" "}
                <span className="font-medium text-gray-900">
                  {formatCurrency(stat.spent)}
                </span>{" "}
                spent
              </p>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
