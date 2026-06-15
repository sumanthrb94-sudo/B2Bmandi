import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=/admin");
  if (session.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="text-lg font-bold text-gray-900">Admin</h1>
      </header>

      <AdminNav />

      <main className="px-4 py-5">{children}</main>
    </div>
  );
}
