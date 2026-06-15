import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import type { CartItemWithProduct, SafeUser } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout — B2B Mandi",
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/checkout");

  const items: CartItemWithProduct[] = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: {
          category: true,
          seller: {
            select: { id: true, name: true, businessName: true, city: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (items.length === 0) redirect("/cart");

  const { password: _omit, ...safeUser } = user;

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">
        Checkout
      </h1>
      <CheckoutForm items={items} user={safeUser as SafeUser} />
    </div>
  );
}
