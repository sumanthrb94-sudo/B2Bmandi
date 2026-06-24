import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppHeader } from "@/components/layout/AppHeader";
import { getSession } from "@/lib/auth";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
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
