import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSession } from "@/lib/auth";
import { prisma, safeDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "B2B Mandi — Wholesale Fresh Produce Marketplace",
  description:
    "B2B Mandi connects farmers, wholesalers and suppliers with retailers, kirana stores and restaurants for bulk fresh fruits, vegetables and staples.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // lightweight cart count for the navbar badge
  let cartCount = 0;
  if (session) {
    cartCount = await safeDb(
      prisma.cartItem.count({ where: { userId: session.userId } }),
      0,
    );
  }

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Navbar session={session} cartCount={cartCount} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
