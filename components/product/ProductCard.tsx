import Link from "next/link";
import { MapPin } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import type { ProductWithRelations } from "@/lib/types";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const lowStock = product.stockQty <= product.minOrderQty * 2;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <SafeImage
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2">
          <Badge className="bg-white/90 text-gray-700 shadow-sm">
            {product.category.name}
          </Badge>
        </span>
        {product.stockQty <= 0 ? (
          <span className="absolute right-2 top-2">
            <Badge className="bg-red-600 text-white">Out of stock</Badge>
          </span>
        ) : lowStock ? (
          <span className="absolute right-2 top-2">
            <Badge className="bg-accent-500 text-white">Low stock</Badge>
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-semibold text-gray-900">
          {product.name}
        </h3>
        {product.origin && (
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" /> {product.origin}
          </p>
        )}
        <p className="mt-1 line-clamp-1 text-xs text-gray-400">
          by {product.seller.businessName ?? product.seller.name}
        </p>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(product.pricePerUnit)}
            </span>
            <span className="text-sm text-gray-500">/{product.unit}</span>
          </div>
          <span className="text-xs text-gray-500">
            MOQ {product.minOrderQty} {product.unit}
          </span>
        </div>
      </div>
    </Link>
  );
}
