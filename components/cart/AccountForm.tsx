"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import type { SafeUser } from "@/lib/types";

export function AccountForm({ user }: { user: SafeUser }) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  const [form, setForm] = React.useState({
    name: user.name ?? "",
    businessName: user.businessName ?? "",
    phone: user.phone ?? "",
    city: user.city ?? "",
    address: user.address ?? "",
    pincode: user.pincode ?? "",
    gstin: user.gstin ?? "",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save changes");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 rounded-2xl border border-brand-200 bg-brand-50 px-3.5 py-3 text-sm text-brand-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Profile updated.
        </div>
      )}

      <Field label="Email (read-only)" htmlFor="email">
        <Input id="email" value={user.email} readOnly disabled />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name">
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>
        <Field label="Business name" htmlFor="businessName">
          <Input
            id="businessName"
            value={form.businessName}
            onChange={(e) => update("businessName", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" htmlFor="phone">
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </Field>
        <Field label="GSTIN" htmlFor="gstin">
          <Input
            id="gstin"
            value={form.gstin}
            onChange={(e) => update("gstin", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Address" htmlFor="address">
        <Input
          id="address"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" htmlFor="city">
          <Input
            id="city"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
          />
        </Field>
        <Field label="Pincode" htmlFor="pincode">
          <Input
            id="pincode"
            value={form.pincode}
            onChange={(e) => update("pincode", e.target.value)}
          />
        </Field>
      </div>

      <Button type="submit" disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
