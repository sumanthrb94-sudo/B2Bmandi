import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, PackagePlus, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteProductButton } from "@/components/seller/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function SellerProductsPage() {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/seller");
  if (session.role === "BUYER") redirect("/");

  const products = await prisma.product.findMany({
    where: { sellerId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Your products</h2>
          <p className="text-sm text-gray-500">
            {products.length} {products.length === 1 ? "listing" : "listings"}
          </p>
        </div>
        <ButtonLink href="/seller/products/new">
          <Plus className="h-4 w-4" />
          Add product
        </ButtonLink>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={<PackagePlus className="h-7 w-7" />}
          title="No products yet"
          description="Add your first produce listing to start selling on B2B Mandi."
          actionLabel="Add product"
          actionHref="/seller/products/new"
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">MOQ</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">
                            {p.name}
                          </p>
                          {p.origin && (
                            <p className="truncate text-xs text-gray-500">
                              {p.origin}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.category.name}</td>
                    <td className="px-4 py-3 text-gray-900">
                      {formatCurrency(p.pricePerUnit)}
                      <span className="text-gray-400">/{p.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {p.stockQty} {p.unit}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.minOrderQty} {p.unit}
                    </td>
                    <td className="px-4 py-3">
                      {p.isActive ? (
                        <Badge className="bg-brand-100 text-brand-800">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600">
                          Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/seller/products/${p.id}/edit`}
                          className="inline-flex h-8 items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <DeleteProductButton
                          productId={p.id}
                          productName={p.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
