import type { Metadata } from "next";
import { LogIn } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { EmptyState } from "@/components/ui/EmptyState";
import { CartView } from "@/components/cart/CartView";
import type { CartItemWithProduct } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Cart — B2B Mandi",
};

export default async function CartPage() {
  const session = await getSession();

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">
        Your Cart
      </h1>

      {!session ? (
        <EmptyState
          icon={<LogIn className="h-6 w-6" />}
          title="Sign in to view your cart"
          description="Log in to add wholesale produce to your cart and place orders."
          actionLabel="Log in"
          actionHref="/login?callbackUrl=/cart"
        />
      ) : (
        <CartView initialItems={await loadCart(session.userId)} />
      )}
    </div>
  );
}

async function loadCart(userId: string): Promise<CartItemWithProduct[]> {
  return prisma.cartItem.findMany({
    where: { userId },
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
}
