import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardBody } from "@/components/ui/Card";
import { ProductForm } from "@/components/seller/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/seller");
  if (session.role === "BUYER") redirect("/");

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product || product.sellerId !== session.userId) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-5">
      <Link
        href="/seller/products"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <div>
        <h2 className="text-lg font-semibold text-gray-900">Edit product</h2>
        <p className="text-sm text-gray-500">{product.name}</p>
      </div>

      <Card>
        <CardBody>
          <ProductForm
            mode="edit"
            productId={product.id}
            categories={categories}
            initialValues={{
              name: product.name,
              description: product.description,
              image: product.image,
              categoryId: product.categoryId,
              unit: product.unit,
              pricePerUnit: String(product.pricePerUnit),
              minOrderQty: String(product.minOrderQty),
              stockQty: String(product.stockQty),
              origin: product.origin ?? "",
              isActive: product.isActive,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
