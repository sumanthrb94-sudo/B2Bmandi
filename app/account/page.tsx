import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Package, Store } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { AccountForm } from "@/components/cart/AccountForm";
import type { SafeUser } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Account — B2B Mandi",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/account");

  const { password: _omit, ...safeUser } = user;
  const isSeller = user.role === "SELLER" || user.role === "ADMIN";

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">
        Your Account
      </h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Profile</h2>
              <Badge className="bg-brand-100 text-brand-800">
                {user.role}
              </Badge>
            </CardHeader>
            <CardBody>
              <AccountForm user={safeUser as SafeUser} />
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Quick links</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <ButtonLink
                href="/orders"
                variant="outline"
                className="w-full justify-start"
              >
                <Package className="h-4 w-4" />
                Your orders
              </ButtonLink>
              {isSeller && (
                <ButtonLink
                  href="/seller"
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Store className="h-4 w-4" />
                  Seller dashboard
                </ButtonLink>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
