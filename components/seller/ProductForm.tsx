"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select, Field } from "@/components/ui/Input";
import { UNITS } from "@/lib/types";

interface Category {
  id: string;
  name: string;
}

export interface ProductFormValues {
  name: string;
  description: string;
  image: string;
  categoryId: string;
  unit: string;
  pricePerUnit: string;
  minOrderQty: string;
  stockQty: string;
  origin: string;
  isActive: boolean;
}

const EMPTY: ProductFormValues = {
  name: "",
  description: "",
  image: "",
  categoryId: "",
  unit: "kg",
  pricePerUnit: "",
  minOrderQty: "1",
  stockQty: "0",
  origin: "",
  isActive: true,
};

export function ProductForm({
  mode,
  categories,
  productId,
  initialValues,
}: {
  mode: "create" | "edit";
  categories: Category[];
  productId?: string;
  initialValues?: Partial<ProductFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = React.useState<ProductFormValues>({
    ...EMPTY,
    categoryId: categories[0]?.id ?? "",
    ...initialValues,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  function set<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (values.name.trim().length < 2) next.name = "Name is required";
    if (!values.description.trim()) next.description = "Description is required";
    if (!values.categoryId) next.categoryId = "Pick a category";
    if (!values.unit) next.unit = "Pick a unit";
    if (!(Number(values.pricePerUnit) > 0))
      next.pricePerUnit = "Price must be greater than 0";
    if (!(Number.isInteger(Number(values.minOrderQty)) && Number(values.minOrderQty) >= 1))
      next.minOrderQty = "Min order quantity must be at least 1";
    if (!(Number.isInteger(Number(values.stockQty)) && Number(values.stockQty) >= 0))
      next.stockQty = "Stock cannot be negative";
    if (values.image.trim()) {
      try {
        new URL(values.image.trim());
      } catch {
        next.image = "Image must be a valid URL";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setLoading(true);

    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      image: values.image.trim(),
      categoryId: values.categoryId,
      unit: values.unit,
      pricePerUnit: Number(values.pricePerUnit),
      minOrderQty: Number(values.minOrderQty),
      stockQty: Number(values.stockQty),
      origin: values.origin.trim(),
      isActive: values.isActive,
    };

    try {
      const res = await fetch(
        mode === "create"
          ? "/api/seller/products"
          : `/api/seller/products/${productId}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Unable to save product");
        return;
      }
      router.push("/seller/products");
      router.refresh();
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <Field label="Product name" htmlFor="name" error={errors.name}>
        <Input
          id="name"
          required
          placeholder="e.g. Nashik Red Onions"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </Field>

      <Field
        label="Description"
        htmlFor="description"
        error={errors.description}
      >
        <Textarea
          id="description"
          required
          placeholder="Describe quality, grade, packaging…"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category" htmlFor="categoryId" error={errors.categoryId}>
          <Select
            id="categoryId"
            value={values.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Unit" htmlFor="unit" error={errors.unit}>
          <Select
            id="unit"
            value={values.unit}
            onChange={(e) => set("unit", e.target.value)}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          label="Price per unit (₹)"
          htmlFor="pricePerUnit"
          error={errors.pricePerUnit}
        >
          <Input
            id="pricePerUnit"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={values.pricePerUnit}
            onChange={(e) => set("pricePerUnit", e.target.value)}
          />
        </Field>

        <Field
          label="Min order qty"
          htmlFor="minOrderQty"
          error={errors.minOrderQty}
        >
          <Input
            id="minOrderQty"
            type="number"
            min="1"
            step="1"
            value={values.minOrderQty}
            onChange={(e) => set("minOrderQty", e.target.value)}
          />
        </Field>

        <Field label="Stock qty" htmlFor="stockQty" error={errors.stockQty}>
          <Input
            id="stockQty"
            type="number"
            min="0"
            step="1"
            value={values.stockQty}
            onChange={(e) => set("stockQty", e.target.value)}
          />
        </Field>
      </div>

      <Field
        label="Origin (optional)"
        htmlFor="origin"
        error={errors.origin}
      >
        <Input
          id="origin"
          placeholder="e.g. Nashik, Maharashtra"
          value={values.origin}
          onChange={(e) => set("origin", e.target.value)}
        />
      </Field>

      <Field label="Image URL (optional)" htmlFor="image" error={errors.image}>
        <Input
          id="image"
          placeholder="https://images.unsplash.com/…"
          value={values.image}
          onChange={(e) => set("image", e.target.value)}
        />
      </Field>

      {values.image.trim() && !errors.image && (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <div className="relative h-44 w-full bg-gray-50">
            {/* Use unoptimized to allow arbitrary preview URLs in the form */}
            {isValidUrl(values.image.trim()) ? (
              <Image
                src={values.image.trim()}
                alt="Preview"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <ImageOff className="h-6 w-6" />
              </div>
            )}
          </div>
        </div>
      )}

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-300"
          checked={values.isActive}
          onChange={(e) => set("isActive", e.target.checked)}
        />
        <span className="text-sm text-gray-700">
          Active (visible to buyers)
        </span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading
            ? "Saving…"
            : mode === "create"
              ? "Create product"
              : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/seller/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
