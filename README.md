# 🌱 B2B Mandi

A **B2B wholesale fresh-produce marketplace** in the style of Ninjacart — connecting
sellers (farmers, co-ops, wholesalers) with buyers (retailers, kirana stores,
restaurants & HoReCa) for **bulk ordering** of fruits, vegetables, staples and
dairy, farm-direct and minus the middlemen.

Built end-to-end with **Next.js 14 (App Router) · TypeScript · Tailwind CSS ·
Prisma · PostgreSQL**.

---

## ✨ Features

### Marketplace (buyers)
- **Landing page** — hero, category grid, featured products, "how it works".
- **Catalog** — search, category filter, price range, sort, responsive product grid.
- **Product detail** — origin, seller, MOQ (minimum order qty), live stock status,
  quantity stepper with bulk-pricing line total, add-to-cart.
- **Cart** — live quantity updates (clamped to MOQ & stock), remove, running subtotal.
- **Checkout** — delivery details pre-filled from profile, payment method
  (COD / Credit / Online — mock), order notes.
- **Orders** — order history, detailed order view with a status timeline, cancel
  (while pending/confirmed, which restores stock).
- **Account** — editable business profile (GSTIN, address, etc.).

### Seller Hub
- **Dashboard** — stat cards (active products, stock value, incoming orders,
  revenue, low-stock), recent orders, low-stock alerts.
- **Product management** — create / edit / delete products (soft-deactivate when a
  product already has orders).
- **Incoming orders** — see only your line items per order, with buyer & delivery
  info, and **advance the fulfilment status**
  (Confirm → Packed → Shipped → Delivered).

### Platform
- **Role-based auth** (BUYER / SELLER / ADMIN) — JWT session in an httpOnly cookie,
  bcrypt-hashed passwords.
- **Ownership & authorization** enforced on every mutation (a seller can only touch
  their own products and orders containing their items).
- **Transactional order placement** — re-validates stock, snapshots prices,
  decrements inventory and clears the cart atomically.

---

## 🏗️ Architecture

```
app/
  page.tsx                 Landing / marketplace home
  login, register          Auth pages
  products/                Catalog + product detail
  cart, checkout           Cart & checkout
  orders/                  Buyer order history + detail
  account/                 Profile
  seller/                  Seller hub (dashboard, products, orders)
  api/
    auth/                  register · login · logout · me
    products, categories   Public catalog reads
    cart, orders, account  Buyer mutations (transactional order creation)
    seller/                Seller product CRUD + order-status updates
components/
  ui/                      Design system (Button, Input, Card, Badge, …)
  layout/                  Navbar, Footer
  product/ cart/ seller/   Feature components
  auth/ home/
lib/
  db.ts                    Prisma client singleton
  auth.ts                  Sessions (jose JWT), password hashing, guards
  utils.ts                 Currency/date formatting, slugs, order numbers
  types.ts                 Shared types
prisma/
  schema.prisma            Data model
  seed.ts                  Demo categories, sellers, buyers & products
```

**Data model:** `User` (role) · `Category` · `Product` · `CartItem` ·
`Order` · `OrderItem` (price/seller snapshot per line).

> This project was built end-to-end by orchestrating **multiple parallel agents** —
> a shared foundation (schema, design system, auth/db libs) followed by four
> feature verticals (auth+landing, catalog, cart/checkout/orders, seller hub)
> built concurrently against a common contract.

---

## 🚀 Getting started

### Prerequisites
- Node.js 20+
- PostgreSQL 14+

### 1. Install
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and set your connection string:
```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/b2bmandi?schema=public"
AUTH_SECRET="a-long-random-string"
```

### 3. Set up the database
```bash
npx prisma db push   # create tables
npm run db:seed      # load demo data
```
On a fresh Linux box with PostgreSQL installed you can use the helper:
```bash
bash scripts/setup-db.sh
```

### 4. Run
```bash
npm run dev          # http://localhost:3000
```

---

## ▲ Deploy to Vercel

This app is Vercel-ready. You need a **hosted PostgreSQL** (Vercel Postgres,
Supabase, or Neon — all have free tiers).

1. **Push this repo to GitHub** and import it in Vercel (it auto-detects Next.js;
   the build command `prisma generate && next build` is already configured).

2. **Create a Postgres database** and grab two connection strings:
   - a **pooled** URL (for serverless runtime), and
   - a **direct** URL (for migrations).

   > With Supabase: Project → Settings → Database. Pooled = port **6543** with
   > `?pgbouncer=true`; direct = port **5432**. With Vercel Postgres / Neon, use
   > the provided `POSTGRES_PRISMA_URL` (pooled) and `POSTGRES_URL_NON_POOLING`
   > (direct).

3. **Set environment variables** in Vercel → Project → Settings → Environment
   Variables:

   | Variable       | Value                                            |
   |----------------|--------------------------------------------------|
   | `DATABASE_URL` | pooled connection string                         |
   | `DIRECT_URL`   | direct connection string                         |
   | `AUTH_SECRET`  | a long random string (`openssl rand -base64 32`) |
   | `SEED_SECRET`  | any secret — enables the one-time seed endpoint  |

4. **Deploy.** Then create the tables and seed demo data:
   ```bash
   # create tables (run locally with prod DIRECT_URL, or via Vercel CLI)
   DATABASE_URL="<direct-url>" DIRECT_URL="<direct-url>" npx prisma db push

   # seed demo data via the guarded endpoint (uses SEED_SECRET)
   curl -X POST "https://<your-app>.vercel.app/api/seed?secret=<SEED_SECRET>"
   ```
   The seed endpoint returns 404 unless `SEED_SECRET` is set, so it's safe to
   leave in. Remove the `SEED_SECRET` env var afterwards to disable it.

---

## 🔐 Demo accounts

All passwords are `password123`.

| Role   | Email                     | What to try                            |
|--------|---------------------------|----------------------------------------|
| Buyer  | `buyer@kirana.com`        | Browse → add to cart → checkout → track |
| Seller | `ramesh@greenfarms.com`   | Seller Hub → manage products → fulfil orders |
| Admin  | `admin@b2bmandi.com`      | Full access                            |

The login page has one-click "fill" buttons for each demo account.

---

## 📜 Scripts

| Command            | Description                              |
|--------------------|------------------------------------------|
| `npm run dev`      | Start dev server                         |
| `npm run build`    | Production build (runs `prisma generate`)|
| `npm run start`    | Start production server                  |
| `npm run db:push`  | Sync schema to the database              |
| `npm run db:seed`  | Seed demo data                           |
| `npm run db:reset` | Reset schema + reseed                    |

---

## 🧰 Tech stack

Next.js 14 · React 18 · TypeScript · Tailwind CSS · Prisma 5 · PostgreSQL ·
jose (JWT) · bcryptjs · zod · lucide-react
