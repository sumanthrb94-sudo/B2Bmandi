# Supabase setup for B2B Mandi

This app uses PostgreSQL via Prisma. Supabase is the recommended host.

## 1. Create a Supabase project
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
