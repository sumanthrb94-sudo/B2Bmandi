import type { Prisma } from "@prisma/client";
import { PackageSearch } from "lucide-react";
import { prisma, safeDb } from "@/lib/db";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CatalogFilters,
  type CategoryOption,
} from "@/components/product/CatalogFilters";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  category?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
}

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const q = first(searchParams.q).trim();
  const category = first(searchParams.category).trim();
  const sort = first(searchParams.sort).trim() || "newest";
  const minPrice = first(searchParams.minPrice).trim();
  const maxPrice = first(searchParams.maxPrice).trim();

  const where: Prisma.ProductWhereInput = { isActive: true };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category) {
    where.category = { is: { slug: category } };
  }
  const min = minPrice !== "" ? Number(minPrice) : undefined;
  const max = maxPrice !== "" ? Number(maxPrice) : undefined;
  if (
    (min !== undefined && !Number.isNaN(min)) ||
    (max !== undefined && !Number.isNaN(max))
  ) {
    where.pricePerUnit = {};
    if (min !== undefined && !Number.isNaN(min)) where.pricePerUnit.gte = min;
    if (max !== undefined && !Number.isNaN(max)) where.pricePerUnit.lte = max;
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc"
      ? { pricePerUnit: "asc" }
      : sort === "price_desc"
        ? { pricePerUnit: "desc" }
        : { createdAt: "desc" };

  const [products, categoriesRaw] = await Promise.all([
    safeDb(
      prisma.product.findMany({
        where,
        orderBy,
        include: {
          category: true,
          seller: {
            select: { id: true, name: true, businessName: true, city: true },
          },
        },
      }),
      [],
    ),
    safeDb(
      prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: { select: { products: { where: { isActive: true } } } },
        },
      }),
      [],
    ),
  ]);

  const categories: CategoryOption[] = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    count: c._count.products,
  }));

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {activeCategory ? activeCategory.name : "All Produce"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {products.length} {products.length === 1 ? "result" : "results"}
          {q && (
            <>
              {" "}
              for <span className="font-medium text-gray-700">"{q}"</span>
            </>
          )}
        </p>
      </header>

      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
        {/* Sidebar / mobile filter bar */}
        <aside className="mb-6 lg:mb-0">
          <CatalogFilters
            categories={categories}
            q={q}
            category={category}
            sort={sort}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </aside>

        {/* Results grid */}
        <section>
          {products.length === 0 ? (
            <EmptyState
              icon={<PackageSearch className="h-7 w-7" />}
              title="No products found"
              description="Try adjusting your search or filters to find what you need."
              actionLabel="Clear filters"
              actionHref="/products"
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
