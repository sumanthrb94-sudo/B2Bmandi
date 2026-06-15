import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppHeader } from "@/components/layout/AppHeader";

export const metadata: Metadata = {
  title: "FreshKart — Wholesale B2B Fruits & Veggies",
  description:
    "Order fresh fruits and vegetables in bulk — a single-screen B2B ordering app.",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        {/* Phone-frame app shell — centers a mobile column on larger screens */}
        <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-gray-50 shadow-xl">
          <AppHeader />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
