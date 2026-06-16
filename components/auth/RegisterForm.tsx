"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";

// `defaultRole` is accepted for backwards-compat with existing callers but is
// ignored — registration always creates a BUYER (sellers are managed by Admin).
export function RegisterForm({ defaultRole: _defaultRole }: { defaultRole?: string } = {}) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [businessName, setBusinessName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [city, setCity] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          businessName,
          email,
          phone,
          city,
          password,
          role: "BUYER",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to create account");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name">
          <Input
            id="name"
            required
            autoComplete="name"
            placeholder="Ramesh Kumar"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Business name" htmlFor="businessName">
          <Input
            id="businessName"
            autoComplete="organization"
            placeholder="Sharma Kirana Store"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </Field>
      </div>

      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@business.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Phone" htmlFor="phone">
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>
        <Field label="City" htmlFor="city">
          <Input
            id="city"
            autoComplete="address-level2"
            placeholder="Bengaluru"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </Field>
      </div>

      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={6}
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
