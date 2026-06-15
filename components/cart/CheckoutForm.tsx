"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select, Field } from "@/components/ui/Input";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import type { CartItemWithProduct, SafeUser } from "@/lib/types";

export function CheckoutForm({
  items,
  user,
}: {
  items: CartItemWithProduct[];
  user: SafeUser;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    deliveryName: user.businessName || user.name || "",
    deliveryPhone: user.phone || "",
    deliveryAddress: user.address || "",
    deliveryCity: user.city || "",
    deliveryPincode: user.pincode || "",
    paymentMethod: "COD",
    notes: "",
  });

  const subtotal = items.reduce(
    (sum, i) => sum + i.quantity * i.product.pricePerUnit,
    0,
  );
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not place order");
        setSubmitting(false);
        return;
      }
      router.push(`/orders/${data.order.id}?placed=1`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      {/* Delivery details */}
      <div className="space-y-6 lg:col-span-2">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Delivery details</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact name" htmlFor="deliveryName">
                <Input
                  id="deliveryName"
                  required
                  value={form.deliveryName}
                  onChange={(e) => update("deliveryName", e.target.value)}
                />
              </Field>
              <Field label="Phone" htmlFor="deliveryPhone">
                <Input
                  id="deliveryPhone"
                  required
                  value={form.deliveryPhone}
                  onChange={(e) => update("deliveryPhone", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Address" htmlFor="deliveryAddress">
              <Textarea
                id="deliveryAddress"
                required
                value={form.deliveryAddress}
                onChange={(e) => update("deliveryAddress", e.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City" htmlFor="deliveryCity">
                <Input
                  id="deliveryCity"
                  required
                  value={form.deliveryCity}
                  onChange={(e) => update("deliveryCity", e.target.value)}
                />
              </Field>
              <Field label="Pincode" htmlFor="deliveryPincode">
                <Input
                  id="deliveryPincode"
                  required
                  value={form.deliveryPincode}
                  onChange={(e) => update("deliveryPincode", e.target.value)}
                />
              </Field>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Payment & notes</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Field label="Payment method" htmlFor="paymentMethod">
              <Select
                id="paymentMethod"
                value={form.paymentMethod}
                onChange={(e) => update("paymentMethod", e.target.value)}
              >
                <option value="COD">Cash on delivery</option>
                <option value="CREDIT">Credit (pay later)</option>
                <option value="ONLINE">Online payment</option>
              </Select>
            </Field>
            <Field label="Order notes (optional)" htmlFor="notes">
              <Textarea
                id="notes"
                placeholder="Delivery instructions, preferred time, etc."
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </Field>
          </CardBody>
        </Card>
      </div>

      {/* Order summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-20">
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Order summary</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-gray-900">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} {item.product.unit} ×{" "}
                      {formatCurrency(item.product.pricePerUnit)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-gray-900">
                    {formatCurrency(item.quantity * item.product.pricePerUnit)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Items ({itemCount})</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Placing order…" : "Place order"}
            </Button>
          </CardBody>
        </Card>
      </div>
    </form>
  );
}
