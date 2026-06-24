import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { AccountForm } from "@/components/cart/AccountForm";
import type { SafeUser } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Account — FreshCart",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/account");

  const { password: _omit, ...safeUser } = user;

  return (
    <div className="min-h-screen bg-fresh-surface px-5 py-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-fresh-ink">
          Your account
        </h1>
        <Badge className="bg-brand-100 text-brand-800">{user.role}</Badge>
      </div>

      <div className="rounded-3xl border border-fresh-border bg-white p-4 shadow-card">
        <h2 className="mb-4 text-sm font-bold text-fresh-ink">Profile details</h2>
        <AccountForm user={safeUser as SafeUser} />
      </div>

      <div className="mt-5">
        <ButtonLink
          href="/orders"
          variant="outline"
          className="w-full justify-center"
        >
          <Package className="h-4 w-4" />
          Your orders
        </ButtonLink>
      </div>
    </div>
  );
}
