# SEREIN Backend

A separate Express 5 + TypeScript API with PostgreSQL, Prisma 7 and Clerk session verification. This folder belongs at `serein/backend/`, alongside the existing Next.js `src/` and `public/` folders. The ZIP contains complete backend files only.

The database seed matches the storefront's five product IDs (`01`–`05`), slugs, USD prices, image filenames, sizes and English/Persian copy. Authentication, profiles, account carts, order persistence and newsletter storage are implemented. Orders are **demo orders**: no payment is collected, and no shipment is scheduled. Newsletter requests are saved only; no email is sent.

The current frontend still uses its original local/demo state until we connect it to these endpoints. No frontend components, images or styles are included in this archive.

## Start on Ubuntu

Use Node.js 22.12+ (22.x) or Node.js 24+ and pnpm. Run the commands from your existing project:

```bash
cd backend
pnpm install --frozen-lockfile
pnpm repo:configure
cp .env.example .env
```

`repo:configure` makes one necessary configuration change: it adds `backend` to the parent Next.js `tsconfig.json` exclusion. The frontend's current `**/*.ts` include otherwise picks up backend files during its build. It preserves the other settings, saves the original file in `backend/.backups/`, and is safe to run again. No frontend UI code changes. Commit the updated root `tsconfig.json` along with the backend.

Edit `backend/.env` with your PostgreSQL connection, Clerk JWT public key, Clerk issuer and the exact frontend origin(s). The template's Clerk values are placeholders and must be replaced before starting the server.

If Docker is already installed, the included local database is optional:

```bash
docker compose up -d db
```

Its connection URL is already in `.env.example`. Alternatively, use your existing PostgreSQL server and update `DATABASE_URL`. A hosted database may require SSL options in its provider-supplied connection URL; use that URL without disabling certificate verification.

Then generate the client, apply the included migration, seed the catalog and run the API:

```bash
pnpm db:generate
pnpm db:deploy
pnpm db:seed
pnpm dev
```

The API runs at `http://localhost:4000` by default. Keep Next.js running in a separate terminal with your existing root `pnpm dev` command. Match its actual port in `FRONTEND_ORIGINS`, then restart the backend after editing `.env`.

```bash
curl http://localhost:4000/health
curl http://localhost:4000/ready
curl 'http://localhost:4000/api/v1/products?locale=fa'
```

`/health` checks the running process; `/ready` also checks the database. Product endpoints require the seed to have run.

## Clerk setup

1. Create or use the Clerk application you will connect to the frontend.
2. Copy its **JWT public key** from the Clerk Dashboard API Keys page into `CLERK_JWT_KEY`. A quoted string with `\n` line breaks works, as does a quoted multiline PEM.
3. Set `CLERK_ISSUER` to the session token's exact `iss` URL, such as `https://your-instance.clerk.accounts.dev`.
4. Set `FRONTEND_ORIGINS` to your actual frontend origins. Production uses your Vercel/custom domain; localhost entries are useful during development.

Protected endpoints accept `Authorization: Bearer <Clerk session token>`. The backend verifies the signature, expiry, issuer, permitted frontend origin and active session claims. It never accepts a user ID supplied in the request body. It needs the public key, not your Clerk secret key. Account creation and password handling stay with Clerk.

When connecting the frontend, obtain a session token from Clerk's `getToken()` and send it on each protected request. Until that integration is added, `/account`, `/cart` and `/orders` correctly return JSON `401` responses.

## API overview

All resource routes start with `/api/v1`. Full payloads, examples and integration notes are in [docs/API.md](docs/API.md). [requests.http](requests.http) contains manual examples.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | Public | Liveness |
| GET | `/ready` | Public | Database readiness |
| GET | `/api/v1/products` | Public | Bilingual catalog |
| GET | `/api/v1/products/:slug` | Public | Product by slug or ID |
| GET | `/api/v1/account` | Clerk | Current profile |
| PATCH | `/api/v1/account` | Clerk | Update local profile fields |
| GET | `/api/v1/cart` | Clerk | Current account cart |
| PUT | `/api/v1/cart/items/:productId` | Clerk | Set an absolute quantity |
| DELETE | `/api/v1/cart/items/:productId` | Clerk | Remove one product |
| DELETE | `/api/v1/cart` | Clerk | Clear the account cart |
| POST | `/api/v1/orders` | Clerk | Persist one demo checkout |
| GET | `/api/v1/orders` | Clerk | Paginated order history |
| GET | `/api/v1/orders/:orderId` | Clerk | One owned order |
| POST | `/api/v1/newsletter` | Public | Store a consenting subscriber |

Money is stored and calculated as integer **USD cents**. Product responses also include `price` in dollars to match the existing frontend. Never calculate the order total from browser-supplied prices. The server snapshots prices and names when creating an order.

Carts allow whole-number quantities from 1–20. Cart updates and checkout lock the account's cart within a database transaction. Checkout deducts stock atomically, saves order items and clears the cart together. Repeating an order request with the same UUID `Idempotency-Key` returns the original order instead of charging/decrementing again. Different checkout attempts need different keys.

## Tests and production build

```bash
pnpm db:validate
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

Tests need no external PostgreSQL server or real Clerk credentials. They use an embedded PostgreSQL-compatible PGlite database, apply the actual migration SQL, and verify real RSA-signed session tokens through the Clerk SDK. They cover validation, account isolation, route contracts, bilingual products, cart behavior, checkout totals, duplicate/concurrent requests, stock rollback and consent. The test adapter is a development dependency; the running API uses the official Prisma PostgreSQL adapter.

Apply migrations to your actual PostgreSQL instance with `pnpm db:deploy` before deployment; isolated tests do not contact your hosted database or live Clerk instance. Prisma's generated client and `dist/` are generated locally by the commands above rather than included in the source ZIP.

## Deploy the backend to Render

The included `render.yaml` is for the same repository, with **Root Directory `backend`**. Choose `backend/render.yaml` as the Blueprint path. It declares the web service only; it does not provision a database. Provide the environment values in the dashboard.

For a manually created Node web service, use:

- Root Directory: `backend`
- Build: `pnpm install --frozen-lockfile --prod=false && pnpm build`
- Start: `pnpm db:deploy && pnpm db:seed && pnpm start`
- Health check: `/ready`
- `NODE_ENV=production`, `TRUST_PROXY_HOPS=1`
- Supply `DATABASE_URL`, `CLERK_JWT_KEY`, `CLERK_ISSUER`, `FRONTEND_ORIGINS` and, if required by your pooler, `DIRECT_URL`.

Render supplies `PORT`; the API listens on `0.0.0.0`. Migrations and catalog seed run before the process starts. Seeding updates catalog copy and baseline prices but preserves stock and active flags. If a pooler requires a direct migration connection, `DIRECT_URL` is used by Prisma CLI while runtime uses `DATABASE_URL`.

Configure the frontend's API base URL when we connect it. Its root TypeScript exclusion from `repo:configure` is required for the independent Vercel frontend build.

Rate limits use an in-process store, suitable for this single-instance portfolio API. If you later add multiple API instances, use a shared rate-limit store. Authentication is bearer-only; cross-origin cookies are unnecessary.

## Demo inventory maintenance

The seed creates 100 demo units per formula and never automatically restocks them. If repeated demos deplete inventory, run this manually against your demo database:

```bash
pnpm db:restock
```

This resets those five stock counts to 100 and keeps order history. There is no public/admin inventory mutation endpoint.

## Source structure

```text
backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   ├── restock.ts
│   └── migrations/
│       ├── migration_lock.toml
│       └── 20261025000000_init/migration.sql
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/{env,database}.ts
│   ├── data/catalog.ts
│   ├── middleware/{auth,validate,error-handler,not-found}.ts
│   ├── routes/{index,health.routes,products.routes,account.routes,cart.routes,orders.routes,newsletter.routes}.ts
│   ├── controllers/{products,account,cart,orders,newsletter}.controller.ts
│   ├── services/{products,account,cart,orders,newsletter}.service.ts
│   ├── schemas/{common,account,cart,orders,newsletter}.schema.ts
│   └── utils/{app-error,request,cart-transaction}.ts
├── tests/
│   ├── helpers/{auth,database,http}.ts
│   └── {auth,cart,orders,api,configure-repo}.test.ts
├── scripts/configure-repo.mjs
├── docs/API.md
├── requests.http
├── .env.example
├── .gitignore
├── compose.yaml
├── render.yaml
├── prisma.config.ts
├── vitest.config.ts
├── tsconfig.json
├── tsconfig.check.json
├── package.json
├── pnpm-lock.yaml
└── README.md
```

## Reference documentation

- [Clerk session-token verification](https://clerk.com/docs/reference/backend/verify-token)
- [Prisma 7 PostgreSQL adapter](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql)
- [Express 5 error handling](https://expressjs.com/en/5x/guide/error-handling/)
- [Render Blueprint reference](https://render.com/docs/blueprint-spec)
