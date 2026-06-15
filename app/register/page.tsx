import type { Metadata } from "next";
import Link from "next/link";
import { Sprout, TrendingUp, ShieldCheck, Truck, Wallet } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create your account — B2B Mandi",
};

const VALUE_PROPS = [
  {
    icon: TrendingUp,
    title: "Transparent wholesale pricing",
    desc: "Live mandi-style rates with no hidden middleman margins.",
  },
  {
    icon: ShieldCheck,
    title: "Verified sellers & buyers",
    desc: "Trade with confidence across a vetted produce network.",
  },
  {
    icon: Truck,
    title: "Doorstep bulk delivery",
    desc: "From farm to your business — packed fresh and on time.",
  },
  {
    icon: Wallet,
    title: "COD & credit options",
    desc: "Flexible payments that work for your cash flow.",
  },
];

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  const defaultRole = searchParams.role === "seller" ? "SELLER" : "BUYER";

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Marketing panel (desktop) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-white">
            <Sprout className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">
            B2B Mandi
          </span>
        </Link>

        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Join India&apos;s farm-direct wholesale marketplace
          </h2>
          <p className="mt-3 text-brand-50/90">
            Whether you run a kirana store, restaurant, or a farm — B2B Mandi
            connects you to fresh produce at honest bulk prices.
          </p>

          <ul className="mt-8 space-y-5">
            {VALUE_PROPS.map((p) => (
              <li key={p.title} className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <p.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-brand-50/80">{p.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-brand-50/70">
          Trusted by retailers, restaurants and farmers across India.
        </p>
      </aside>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-8">
        <div className="w-full max-w-lg">
          <div className="mb-6 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
                <Sprout className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                B2B<span className="text-brand-600">Mandi</span>
              </span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            It only takes a minute to get started.
          </p>

          <div className="mt-6">
            <RegisterForm defaultRole={defaultRole} />
          </div>
        </div>
      </div>
    </div>
  );
}
