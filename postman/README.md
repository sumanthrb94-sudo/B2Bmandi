# FreshKart API Test Suite (Postman / Newman)

End-to-end API tests for the FreshKart (B2B Mandi) Next.js app.

## Files

- `FreshKart.postman_collection.json` — Postman Collection v2.1.0 with folders for Health, Catalog, Auth, Customer order flow, Authorization, Admin flow, and Cleanup.
- `FreshKart.postman_environment.json` — Postman environment with `baseUrl=http://localhost:3000`.

## How the suite works

The whole flow shares **one cookie jar** (Newman/Postman keep cookies across requests),
and auth is a JWT in the `b2b_session` httpOnly cookie. So the most recent login is the
active session. The requests are ordered deliberately:

1. **Health** / **Catalog** — public, no auth.
2. **Auth** — bad-credential login (401), then log in as the customer `buyer@kirana.com`.
3. **Customer order flow** — runs while the customer session is active (empty-items 400, valid order, list, fetch).
4. **Authorization** — still the customer; PATCH on an admin product must return 403.
5. **Admin flow** — log in as `admin@b2bmandi.com` (this replaces the active session), then confirm an order, update a product price, and assert an invalid status returns 400.
6. **Cleanup** — log out, then assert `GET /api/auth/me` returns 401.

Run the collection **in order** (Newman does this by default). Do not reorder folders.

Collection variables (`productId`, `slug`, `orderProductId`, `orderQty`, `orderId`) are
populated at runtime by the Catalog and order requests, so no manual setup is needed.

## Run with Newman (CLI)

Start the app first (it needs a seeded database):

```bash
npm run build && npm start
# in another shell, seed the DB if not already seeded:
# npm run db:seed
```

Then run the suite:

```bash
# via the npm script (uses the bundled environment file)
npm run test:api

# or directly with newman
npx newman run postman/FreshKart.postman_collection.json \
  -e postman/FreshKart.postman_environment.json
```

### CI / custom base URL

```bash
BASE_URL=http://localhost:3000 npm run test:api:ci
```

This passes `baseUrl` via `--env-var` and uses the `cli` reporter only.

## Import into the Postman app

1. Open Postman → **Import** → select `FreshKart.postman_collection.json`.
2. Import → select `FreshKart.postman_environment.json`.
3. In the top-right environment selector, choose **FreshKart Local** (or edit `baseUrl`
   to point at your live URL, e.g. a deployed preview).
4. Use **Collection Runner** (Run → run the whole collection in order) so the shared
   cookie jar and runtime variables flow correctly between requests.

## Demo accounts (password `password123`)

- Customer: `buyer@kirana.com` (BUYER)
- Admin: `admin@b2bmandi.com` (ADMIN)
