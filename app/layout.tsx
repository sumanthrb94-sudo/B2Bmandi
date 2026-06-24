import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/layout/AppHeader";
import { getSession } from "@/lib/auth";

// Self-hosted (next/font serves from our own origin, so the app's strict CSP
// needs no external font/style allowances).
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FreshKart — Wholesale B2B Fruits & Veggies",
  description:
    "Order fresh fruits and vegetables in bulk, priced per kg — a B2B ordering app.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FreshKart",
  },
};

export const viewport: Viewport = {
  themeColor: "#129E47",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en" className={`${jakarta.variable} ${bricolage.variable}`}>
      <body className="bg-gray-100">
        {/* Phone-frame app shell — centers a mobile column on larger screens */}
        <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-fresh-surface shadow-xl">
          <AppHeader session={session} />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
