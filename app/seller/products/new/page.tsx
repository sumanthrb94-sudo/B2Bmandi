import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardBody } from "@/components/ui/Card";
import { ProductForm } from "@/components/seller/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/seller");
  if (session.role === "BUYER") redirect("/");

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

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
        <h2 className="text-lg font-semibold text-gray-900">Add a product</h2>
        <p className="text-sm text-gray-500">
          List a new produce item for buyers to order.
        </p>
      </div>

      <Card>
        <CardBody>
          <ProductForm mode="create" categories={categories} />
        </CardBody>
      </Card>
    </div>
  );
}
