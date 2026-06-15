import { redirect } from "next/navigation";
import { prisma, safeDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  UnifiedOrderScreen,
  type UProduct,
} from "@/components/order/UnifiedOrderScreen";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "ADMIN") redirect("/admin");

  const [categories, products] = await Promise.all([
    safeDb(prisma.category.findMany({ orderBy: { name: "asc" } }), []),
    safeDb(
      prisma.product.findMany({
        where: { isActive: true, stockQty: { gt: 0 } },
        include: { category: { select: { name: true, slug: true } } },
        orderBy: { name: "asc" },
      }),
      [],
    ),
  ]);

  const uProducts: UProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    image: p.image,
    unit: p.unit,
    pricePerUnit: p.pricePerUnit,
    minOrderQty: p.minOrderQty,
    stockQty: p.stockQty,
    origin: p.origin,
    categoryName: p.category.name,
    categorySlug: p.category.slug,
  }));

  return (
    <UnifiedOrderScreen
      products={uProducts}
      categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
    />
  );
}
