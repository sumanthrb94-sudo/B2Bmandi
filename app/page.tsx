import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ArrowRight,
  ShoppingCart,
  PackageCheck,
  Truck,
  BadgeIndianRupee,
  ShieldCheck,
  Boxes,
  Wallet,
  Sprout,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { prisma, safeDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const STATS = [
  { value: "21+", label: "Fresh SKUs" },
  { value: "5", label: "Categories" },
  { value: "3", label: "Verified sellers" },
  { value: "Pan-India", label: "Origin network" },
];

const STEPS = [
  {
    icon: ShoppingCart,
    title: "Browse & order in bulk",
    desc: "Pick from fresh produce at transparent wholesale rates and meet the MOQ.",
  },
  {
    icon: PackageCheck,
    title: "Seller confirms & packs",
    desc: "A verified seller accepts your order and packs it fresh, the same day.",
  },
  {
    icon: Truck,
    title: "Delivered to your doorstep",
    desc: "Your bulk order arrives at your store, kitchen or warehouse on time.",
  },
];

const FEATURES = [
  {
    icon: BadgeIndianRupee,
    title: "Transparent pricing",
    desc: "Live mandi-style rates with no hidden middleman margins.",
  },
  {
    icon: ShieldCheck,
    title: "Verified sellers",
    desc: "Trade with confidence across a vetted farmer & supplier network.",
  },
  {
    icon: Boxes,
    title: "Bulk MOQ ready",
    desc: "Minimum order quantities tuned for retailers, kiranas and HoReCa.",
  },
  {
    icon: Wallet,
    title: "COD & credit",
    desc: "Flexible payment options that work for your business cash flow.",
  },
];

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    safeDb(prisma.category.findMany(), []),
    safeDb(
      prisma.product.findMany({
        where: { isActive: true },
        include: {
          category: true,
          seller: {
            select: { id: true, name: true, businessName: true, city: true },
          },
        },
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
      [],
    ),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-100">
        <div className="container-app grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3 py-1 text-xs font-medium text-brand-700">
              <Sprout className="h-3.5 w-3.5" /> Farm-direct B2B marketplace
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
              Wholesale fresh produce,{" "}
              <span className="text-brand-600">farm-direct</span> to your
              business
            </h1>
            <p className="mt-4 max-w-xl text-lg text-gray-600">
              Source fruits, vegetables, staples and dairy in bulk at honest
              prices. Order in minutes and get it delivered to your doorstep.
            </p>

            <Link
              href="/products"
              className="group mt-7 flex max-w-md items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <Search className="h-5 w-5 text-gray-400" />
              <span className="flex-1 text-sm text-gray-500">
                Search tomatoes, onions, rice, bananas…
              </span>
              <span className="hidden text-sm font-medium text-brand-600 group-hover:text-brand-700 sm:inline">
                Browse
              </span>
            </Link>

            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/products" size="lg">
                Browse products <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/register?role=seller" variant="outline" size="lg">
                Sell on B2B Mandi
              </ButtonLink>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-card-hover">
              <Image
                src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=70"
                alt="Fresh wholesale produce"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-card sm:block">
              <p className="text-xs text-gray-500">Today&apos;s mandi rate</p>
              <p className="text-sm font-semibold text-gray-900">
                Tomatoes from ₹18/kg
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-gray-200 bg-white">
        <div className="container-app grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-brand-600 sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-app py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Shop by category
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Everything your business needs, sorted fresh.
            </p>
          </div>
          <Link
            href="/products"
            className="hidden text-sm font-medium text-brand-600 hover:text-brand-700 sm:inline-flex sm:items-center sm:gap-1"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              {cat.image && (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute inset-x-3 bottom-3 font-semibold text-white">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-white">
        <div className="container-app py-14">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Featured this week
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Fresh arrivals, ready to order in bulk.
              </p>
            </div>
            <Link
              href="/products"
              className="hidden text-sm font-medium text-brand-600 hover:text-brand-700 sm:inline-flex sm:items-center sm:gap-1"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-app py-14">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
          <p className="mt-1 text-sm text-gray-500">
            From order to doorstep in three simple steps.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-card"
            >
              <span className="absolute right-5 top-5 text-4xl font-bold text-brand-100">
                {i + 1}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <step.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-1.5 text-sm text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why B2B Mandi */}
      <section className="bg-white">
        <div className="container-app py-14">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Why B2B Mandi</h2>
            <p className="mt-1 text-sm text-gray-500">
              Built for the way produce businesses actually buy.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-card"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gray-50">
        <div className="container-app py-14">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 px-8 py-12 text-center text-white sm:px-12">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Ready to source fresh, save more?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-50/90">
              Join retailers, restaurants and farmers trading on B2B Mandi every
              day. Start in minutes — no setup fees.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <ButtonLink
                href="/register"
                size="lg"
                className="bg-white text-brand-700 hover:bg-brand-50"
              >
                Create your account <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink
                href="/products"
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10"
              >
                Browse products
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
