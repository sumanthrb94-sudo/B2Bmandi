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
    <div className="min-h-screen bg-fresh-surface">
      <header className="flex items-center gap-2 border-b border-fresh-border bg-white px-4 py-3.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="font-display text-xl font-extrabold tracking-tight text-fresh-ink">Admin</h1>
      </header>

      <AdminNav />

      <main className="px-4 py-5">{children}</main>
    </div>
  );
}
