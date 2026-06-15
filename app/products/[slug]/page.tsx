import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, Store } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { ProductCard } from "@/components/product/ProductCard";
import { AddToCartPanel } from "@/components/product/AddToCartPanel";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [product, session] = await Promise.all([
    prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        seller: {
          select: { id: true, name: true, businessName: true, city: true },
        },
      },
    }),
    getSession(),
  ]);

  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      seller: {
        select: { id: true, name: true, businessName: true, city: true },
      },
    },
  });

  const outOfStock = product.stockQty <= 0;
  const lowStock = !outOfStock && product.stockQty <= product.minOrderQty * 2;
  const sellerName = product.seller.businessName ?? product.seller.name;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1 text-sm text-gray-500"
      >
        <Link href="/" className="hover:text-gray-700">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/products" className="hover:text-gray-700">
          Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-gray-700"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-700">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {/* Details */}
        <div>
          <Badge className="bg-brand-50 text-brand-700">
            {product.category.name}
          </Badge>
          <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            {product.origin && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {product.origin}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Store className="h-4 w-4" /> {sellerName}
              {product.seller.city ? `, ${product.seller.city}` : ""}
            </span>
          </div>

          {/* Price block */}
          <div className="mt-5 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">
              {formatCurrency(product.pricePerUnit)}
            </span>
            <span className="text-base text-gray-500">/{product.unit}</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {outOfStock ? (
              <Badge className="bg-red-100 text-red-700">Out of stock</Badge>
            ) : lowStock ? (
              <Badge className="bg-accent-100 text-accent-700">Low stock</Badge>
            ) : (
              <Badge className="bg-brand-100 text-brand-800">In stock</Badge>
            )}
            <Badge className="bg-gray-100 text-gray-600">
              MOQ {product.minOrderQty} {product.unit}
            </Badge>
            {!outOfStock && (
              <Badge className="bg-gray-100 text-gray-600">
                {product.stockQty} {product.unit} available
              </Badge>
            )}
          </div>

          {/* Add to cart */}
          <Card className="mt-6">
            <CardBody>
              <AddToCartPanel
                productId={product.id}
                slug={product.slug}
                pricePerUnit={product.pricePerUnit}
                unit={product.unit}
                minOrderQty={product.minOrderQty}
                stockQty={product.stockQty}
                isLoggedIn={Boolean(session)}
              />
            </CardBody>
          </Card>

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-900">Description</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* More from this category */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            More from {product.category.name}
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
