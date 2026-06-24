# Supabase setup for B2B Mandi

This app uses PostgreSQL via Prisma. Supabase is the recommended host.

## ✅ This project is already provisioned — `mandi-db`

The live app is wired to the Supabase project **`mandi-db`**
(ref `fvwfodmxmesimnknpujg`, region `ap-northeast-1`). The schema and demo data
are already created and seeded. To run the app against it, set these env vars
(local `.env` and/or Vercel), replacing `[YOUR-DB-PASSWORD]` with the project's
database password (URL-encode special characters):

```
DATABASE_URL="postgresql://postgres.fvwfodmxmesimnknpujg:[YOUR-DB-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.fvwfodmxmesimnknpujg:[YOUR-DB-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
AUTH_SECRET="<long-random-string>"
```

Demo logins (all use `password123`): `customer@freshkart.in` (buyer),
`admin@freshkart.in` (admin). The DB password is a project secret — grab it from
Supabase dashboard → **Connect** (or **Settings → Database**); it is not stored
in this repo.

---

## ⚡ Fastest path (no CLI, no local DB access needed)

Use this when you can't connect to the DB directly (e.g. a restricted network).
Everything happens in the browser + Vercel.

1. **Create the tables** — Supabase dashboard → **SQL Editor** → New query →
   paste the entire contents of [`schema.sql`](./schema.sql) → **Run**.
2. **Get the pooler connection strings** — dashboard top bar → **Connect**:
   - **Transaction pooler** (port `6543`) → use as `DATABASE_URL`
   - **Session pooler** (port `5432`) → use as `DIRECT_URL`
   - In both, replace `[YOUR-PASSWORD]` with your DB password **URL-encoded**
     (e.g. an `@` in the password becomes `%40`).
3. **Set Vercel env vars** (Settings → Environment Variables): `DATABASE_URL`,
   `DIRECT_URL`, `AUTH_SECRET`, `SEED_SECRET` → **redeploy**.
4. **Seed demo data** (runs on Vercel, which can reach Supabase):
   ```
   curl -X POST "https://<your-app>.vercel.app/api/seed?secret=<SEED_SECRET>"
   ```
5. Log in at the live URL with `buyer@kirana.com` / `password123`.

> ⚠️ Why the **pooler** and not `db.<ref>.supabase.co:5432`? The direct host is
> IPv6-only; Vercel's serverless functions connect over IPv4, so you must use the
> IPv4-compatible Supavisor pooler endpoints above.

---

## Alternative: provision from a machine with DB access
- Go to <https://supabase.com/dashboard> → **New project**.
- Pick a name (e.g. `b2bmandi`), a strong **database password** (save it), and a region.

## 2. Get the two connection strings
Project → **Settings → Database → Connection string**:

| Env var        | Supabase string                                            | Port |
|----------------|------------------------------------------------------------|------|
| `DATABASE_URL` | **Transaction pooler** + append `?pgbouncer=true`          | 6543 |
| `DIRECT_URL`   | **Direct connection**                                      | 5432 |

Example:
```
DATABASE_URL="postgresql://postgres.xxxx:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres"
```

## 3. Create the tables
Two options:

**A. Prisma (recommended)** — from a checkout of this repo:
```bash
DATABASE_URL="<direct-url>" DIRECT_URL="<direct-url>" npx prisma db push
```

**B. SQL editor** — paste `supabase/schema.sql` into Supabase → **SQL Editor** → Run.

## 4. Seed demo data
After the app is deployed with `SEED_SECRET` set:
```bash
curl -X POST "https://<your-app>.vercel.app/api/seed?secret=<SEED_SECRET>"
```
Or locally with the Supabase URLs in `.env`: `npm run db:seed`.

## 5. Vercel environment variables
Project → **Settings → Environment Variables** (all environments):

| Variable       | Value                                   |
|----------------|-----------------------------------------|
| `DATABASE_URL` | pooled string (port 6543, pgbouncer)    |
| `DIRECT_URL`   | direct string (port 5432)               |
| `AUTH_SECRET`  | long random string                      |
| `SEED_SECRET`  | random string (enables `/api/seed`)     |

Then **redeploy**. Log in with `buyer@kirana.com` / `password123`.
