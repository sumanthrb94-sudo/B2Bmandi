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
