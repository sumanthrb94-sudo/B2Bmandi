import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { getSession } from "@/lib/auth";
import { prisma, safeDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "FreshKart — Fruits & Veggies, Wholesale",
  description:
    "Order fresh fruits and vegetables in bulk, delivered to your business.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FreshKart",
  },
};

export const viewport: Viewport = {
  themeColor: "#16bd5f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  let cartCount = 0;
  if (session) {
    cartCount = await safeDb(
      prisma.cartItem.count({ where: { userId: session.userId } }),
      0,
    );
  }

  return (
    <html lang="en">
      <body className="bg-gray-100">
        {/* Phone-frame app shell — centers a mobile column on larger screens */}
        <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-gray-50 shadow-xl sm:min-h-[100dvh]">
          <AppHeader session={session} />
          <main className="flex-1 pb-24">{children}</main>
          <BottomNav session={session} cartCount={cartCount} />
        </div>
      </body>
    </html>
  );
}
