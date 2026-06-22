"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";

const DEMO_ACCOUNTS = [
  { label: "Customer", email: "customer@freshkart.in", password: "password123", description: "Kirana buyer — browse & order" },
  { label: "Admin", email: "admin@freshkart.in", password: "password123", description: "Dashboard, orders & inventory" },
] as const;

/**
 * Only allow same-origin relative paths as a redirect target. Anything that
 * could navigate off-site (absolute URLs, protocol-relative `//host`, schemes,
 * backslashes) is rejected and falls back to `/`.
 */
function sanitizeCallbackUrl(url?: string): string {
  if (!url) return "/";
  // must start with a single slash, not `//`, and contain no scheme/colon/backslash
  if (!/^\/(?!\/)/.test(url) || url.includes(":") || url.includes("\\")) {
    return "/";
  }
  return url;
}

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [redirecting, setRedirecting] = React.useState(false);
  const [destLabel, setDestLabel] = React.useState("Loading…");

  async function doLogin(loginEmail: string, loginPassword: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to log in");
        setLoading(false);
        return;
      }
      // admins land on the dashboard; everyone else on the shop (or callback)
      const isAdmin = data.user?.role === "ADMIN";
      const safeCallback = sanitizeCallbackUrl(callbackUrl);
      const dest = isAdmin ? "/admin" : safeCallback;
      setDestLabel(isAdmin ? "Loading dashboard…" : "Loading your shop…");
      setRedirecting(true);
      router.push(dest);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await doLogin(email, password);
  }

  async function loginAsDemo(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    await doLogin(demoEmail, demoPassword);
  }

  return (
    <div className="space-y-6">
      {redirecting && <FullScreenLoader overlay label={destLabel} />}

      {/* Demo quick-access — always shown so the demo loop is self-contained */}
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
        <div className="mb-3 flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-brand-600" />
          <p className="text-xs font-bold uppercase tracking-wide text-brand-700">
            Demo — one-tap login
          </p>
        </div>
        <div className="space-y-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              disabled={loading}
              onClick={() => loginAsDemo(acc.email, acc.password)}
              className="flex w-full items-center justify-between rounded-lg border border-brand-100 bg-white px-3 py-2.5 text-left shadow-sm transition-colors hover:border-brand-400 active:scale-[0.99] disabled:opacity-50"
            >
              <span>
                <span className="block text-sm font-semibold text-gray-900">
                  {acc.label}
                </span>
                <span className="text-xs text-gray-500">{acc.description}</span>
              </span>
              <span className="ml-3 shrink-0 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-bold text-white">
                Login →
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex items-center">
        <div className="flex-1 border-t border-gray-200" />
        <span className="mx-3 text-xs text-gray-400">or enter manually</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

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
