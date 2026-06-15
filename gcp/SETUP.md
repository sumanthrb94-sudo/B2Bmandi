# GCP Cloud SQL setup for B2B Mandi (app on Vercel)

The app uses PostgreSQL via Prisma. This guide uses **Cloud SQL for PostgreSQL**
as the database while the Next.js app stays on Vercel.

> 💡 Heads-up: Cloud SQL has **no free tier** — the smallest instance
> (`db-f1-micro`, shared core) runs roughly **$8–10/month**. (Neon/Supabase have
> free tiers if cost matters later.)

## 1. Project & API
- Create the project (e.g. **`b2b-mandi`**).
- Enable the **Cloud SQL Admin API**
  (APIs & Services → Enable APIs → "Cloud SQL Admin API").

## 2. Create the Cloud SQL instance
SQL → **Create instance → PostgreSQL**:
- **Database version:** PostgreSQL 16
- **Edition:** Enterprise → **Sandbox / smallest** (`db-f1-micro`) to keep cost low
- **Region:** pick one near your Vercel region (e.g. `us-east1`)
- **Instance ID:** `b2bmandi`
- Set the **postgres password** (save it)
- **Connections → Public IP: ENABLED**

## 3. Database & user
- **Databases → Create database:** `b2bmandi`
- (Optional) **Users → Add user account:** e.g. `app` with a password — or just use
  the built-in `postgres` user.

## 4. Allow Vercel to connect
Vercel serverless functions don't have fixed egress IPs, so:
- **Connections → Networking → Authorized networks → Add network:**
  `0.0.0.0/0` (name it "vercel").
- Keep **SSL** on; Prisma will connect with `sslmode=require`.

> 🔒 `0.0.0.0/0` exposes the instance's public IP to the internet (still
> password + SSL protected). Fine for a demo; tighten later with the Cloud SQL
> Auth Proxy or a fixed-IP egress if needed.

## 5. Connection string
Grab the instance's **Public IP** (SQL → instance → Overview).

```
postgresql://USER:PASSWORD@PUBLIC_IP:5432/b2bmandi?sslmode=require
```

Because Cloud SQL has no built-in pooler, use the **same** string for both
`DATABASE_URL` and `DIRECT_URL`, and add a small connection limit for serverless:

```
DATABASE_URL="postgresql://USER:PASSWORD@PUBLIC_IP:5432/b2bmandi?sslmode=require&connection_limit=3"
DIRECT_URL="postgresql://USER:PASSWORD@PUBLIC_IP:5432/b2bmandi?sslmode=require"
```

## 6. Create tables + seed
```bash
DATABASE_URL="<direct-url>" DIRECT_URL="<direct-url>" npx prisma db push
DATABASE_URL="<direct-url>" DIRECT_URL="<direct-url>" npm run db:seed
```
…or seed via the deployed endpoint once `SEED_SECRET` is set:
`curl -X POST "https://<app>.vercel.app/api/seed?secret=<SEED_SECRET>"`

## 7. Vercel env vars → redeploy
Set `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `SEED_SECRET` in
Vercel → Settings → Environment Variables, then redeploy.
Log in with `buyer@kirana.com` / `password123`.
