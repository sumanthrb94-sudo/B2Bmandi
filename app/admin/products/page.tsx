import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ProductAdminRow } from "@/components/admin/ProductAdminRow";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/admin");
  if (session.role !== "ADMIN") redirect("/");

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="h-10 w-10 text-gray-300" />
        <p className="mt-3 text-sm text-gray-500">No products yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((p) => (
        <ProductAdminRow
          key={p.id}
          id={p.id}
          name={p.name}
          image={p.image}
          category={p.category.name}
          pricePerUnit={p.pricePerUnit}
          minOrderQty={p.minOrderQty}
          stockQty={p.stockQty}
          isActive={p.isActive}
        />
      ))}
    </div>
  );
}
