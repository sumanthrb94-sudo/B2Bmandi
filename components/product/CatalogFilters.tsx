"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface CatalogFiltersProps {
  categories: CategoryOption[];
  q: string;
  category: string;
  sort: string;
  minPrice: string;
  maxPrice: string;
}

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function CatalogFilters({
  categories,
  q,
  category,
  sort,
  minPrice,
  maxPrice,
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState(q);
  const [min, setMin] = React.useState(minPrice);
  const [max, setMax] = React.useState(maxPrice);

  React.useEffect(() => setSearchTerm(q), [q]);
  React.useEffect(() => setMin(minPrice), [minPrice]);
  React.useEffect(() => setMax(maxPrice), [maxPrice]);

  const buildQuery = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      const str = params.toString();
      return str ? `${pathname}?${str}` : pathname;
    },
    [pathname, searchParams],
  );

  const push = React.useCallback(
    (updates: Record<string, string | null>) => {
      router.push(buildQuery(updates));
    },
    [router, buildQuery],
  );

  const hasFilters = Boolean(q || category || minPrice || maxPrice);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    push({ q: searchTerm.trim() || null });
  };

  const onPriceApply = () => {
    push({ minPrice: min || null, maxPrice: max || null });
  };

  return (
    <div>
      {/* Search bar (full width above grid on all sizes) */}
      <form onSubmit={onSearchSubmit} className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search produce…"
            className="pl-9"
            aria-label="Search products"
          />
        </div>
        <Button type="submit" variant="primary">
          Search
        </Button>
        <Button
          type="button"
          variant="outline"
          className="lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </form>

      {/* Filters panel — sidebar on desktop, collapsible on mobile */}
      <div className={cn("space-y-6", !open && "hidden lg:block")}>
        {/* Sort */}
        <div>
          <Label htmlFor="sort">Sort by</Label>
          <Select
            id="sort"
            value={sort}
            onChange={(e) => push({ sort: e.target.value })}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Categories */}
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-900">Categories</p>
          <ul className="space-y-1">
            <li>
              <Link
                href={buildQuery({ category: null })}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  !category
                    ? "bg-brand-50 font-medium text-brand-700"
                    : "text-gray-700 hover:bg-gray-100",
                )}
              >
                All categories
              </Link>
            </li>
            {categories.map((c) => {
              const active = c.slug === category;
              return (
                <li key={c.id}>
                  <Link
                    href={buildQuery({ category: active ? null : c.slug })}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-brand-50 font-medium text-brand-700"
                        : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    <span>{c.name}</span>
                    <span className="text-xs text-gray-400">{c.count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Price range */}
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-900">
            Price range (₹)
          </p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              placeholder="Min"
              aria-label="Minimum price"
            />
            <span className="text-gray-400">–</span>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              placeholder="Max"
              aria-label="Maximum price"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={onPriceApply}
          >
            Apply
          </Button>
        </div>

        {hasFilters && (
          <Link
            href={pathname}
            className="inline-flex items-center gap-1 text-sm font-medium text-accent-600 hover:text-accent-700"
          >
            <X className="h-4 w-4" /> Clear all filters
          </Link>
        )}
      </div>
    </div>
  );
}
