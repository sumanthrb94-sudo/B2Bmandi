import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BillingView } from "@/components/billing/BillingView";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/billing");

  const [items, user] = await Promise.all([
    prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: { product: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findUnique({ where: { id: session.userId } }),
  ]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-500">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-gray-900">
          Your cart is empty
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Add some fresh produce to get started.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white"
        >
          Browse produce
        </Link>
      </div>
    );
  }

  return (
    <BillingView
      items={items.map((it) => ({
        id: it.id,
        productId: it.productId,
        quantity: it.quantity,
        name: it.product.name,
        image: it.product.image,
        unit: it.product.unit,
        price: it.product.pricePerUnit,
        minOrderQty: it.product.minOrderQty,
        stockQty: it.product.stockQty,
      }))}
      profile={{
        name: user?.businessName || user?.name || "",
        phone: user?.phone || "",
        address: user?.address || "",
        city: user?.city || "",
        pincode: user?.pincode || "",
      }}
    />
  );
}
