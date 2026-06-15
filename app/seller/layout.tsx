import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SellerNav } from "@/components/seller/SellerNav";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/seller");
  if (session.role === "BUYER") redirect("/");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Seller Hub
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your produce listings and incoming orders.
        </p>
      </header>

      <SellerNav />

      <div className="mt-6">{children}</div>
    </div>
  );
}
