import { prisma, safeDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { MobileCatalogue } from "@/components/catalogue/MobileCatalogue";
import type { ProductWithRelations } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();

  const [categories, products, cartItems] = await Promise.all([
    safeDb(prisma.category.findMany({ orderBy: { name: "asc" } }), []),
    safeDb(
      prisma.product.findMany({
        where: { isActive: true, stockQty: { gt: 0 } },
        include: {
          category: true,
          seller: {
            select: { id: true, name: true, businessName: true, city: true },
          },
        },
        orderBy: { name: "asc" },
      }),
      [],
    ),
    session
      ? safeDb(
          prisma.cartItem.findMany({
            where: { userId: session.userId },
            select: { id: true, productId: true, quantity: true },
          }),
          [],
        )
      : Promise.resolve([]),
  ]);

  return (
    <MobileCatalogue
      products={products as ProductWithRelations[]}
      categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
      initialCart={cartItems}
      isLoggedIn={!!session}
    />
  );
}
