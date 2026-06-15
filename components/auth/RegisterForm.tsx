"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag, Sprout } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type Role = "BUYER" | "SELLER";

export function RegisterForm({ defaultRole = "BUYER" }: { defaultRole?: Role }) {
  const router = useRouter();
  const [role, setRole] = React.useState<Role>(defaultRole);
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
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to create account");
        return;
      }
      router.push(role === "SELLER" ? "/seller" : "/");
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

      {/* Role toggle */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-gray-700">
          I want to…
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <RoleOption
            active={role === "BUYER"}
            onClick={() => setRole("BUYER")}
            icon={<ShoppingBag className="h-5 w-5" />}
            title="Buy wholesale"
            subtitle="I want to buy wholesale"
          />
          <RoleOption
            active={role === "SELLER"}
            onClick={() => setRole("SELLER")}
            icon={<Sprout className="h-5 w-5" />}
            title="Sell produce"
            subtitle="I want to sell produce"
          />
        </div>
      </fieldset>

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
        <Field
          label={role === "SELLER" ? "Business / farm name" : "Business name"}
          htmlFor="businessName"
        >
          <Input
            id="businessName"
            autoComplete="organization"
            placeholder={
              role === "SELLER" ? "Green Farms" : "Sharma Kirana Store"
            }
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

function RoleOption({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-colors",
        active
          ? "border-brand-500 bg-brand-50"
          : "border-gray-200 bg-white hover:border-gray-300",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          active ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-500",
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-semibold text-gray-900">{title}</span>
      <span className="text-xs text-gray-500">{subtitle}</span>
    </button>
  );
}
