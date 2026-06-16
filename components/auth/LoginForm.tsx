"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";

const DEMO_ACCOUNTS = [
  { label: "Customer", email: "buyer@kirana.com" },
  { label: "Admin", email: "admin@b2bmandi.com" },
] as const;

const DEMO_PASSWORD = "password123";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [redirecting, setRedirecting] = React.useState(false);
  const [destLabel, setDestLabel] = React.useState("Loading…");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to log in");
        setLoading(false);
        return;
      }
      // admins land on the dashboard; everyone else on the shop (or callback)
      const isAdmin = data.user?.role === "ADMIN";
      const dest = isAdmin ? "/admin" : callbackUrl || "/";
      // keep a loading ring on screen until the destination finishes loading
      setDestLabel(isAdmin ? "Loading dashboard…" : "Loading your shop…");
      setRedirecting(true);
      router.push(dest);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  function fill(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError(null);
  }

  return (
    <div className="space-y-6">
      {redirecting && <FullScreenLoader overlay label={destLabel} />}

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <div className="rounded-lg border border-brand-100 bg-brand-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          Demo accounts
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Password for all:{" "}
          <span className="font-mono font-medium text-gray-700">
            {DEMO_PASSWORD}
          </span>
        </p>
        <div className="mt-3 space-y-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <div
              key={acc.email}
              className="flex items-center justify-between gap-2 rounded-md bg-white px-3 py-2 text-sm shadow-sm"
            >
              <span className="min-w-0">
                <span className="font-medium text-gray-900">{acc.label}</span>{" "}
                <span className="truncate text-gray-500">{acc.email}</span>
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fill(acc.email)}
              >
                Fill
              </Button>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-gray-600">
        New to FreshKart?{" "}
        <Link
          href="/register"
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
