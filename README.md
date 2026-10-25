# SEREIN — Skincare Storefront Demo

A responsive skincare storefront portfolio built with Next.js, React, TypeScript, and Tailwind CSS. It uses fictional products and locally stored frontend state; there is no backend, real payment processing, or account system.

## Project structure

```text
FRONTEND
serein/
├── public/
│   └── images/
│       ├── landing/             # Homepage and product imagery
│       └── us/                  # About Us page imagery
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Shared document layout and storefront shell
│   │   ├── page.tsx             # Homepage
│   │   ├── not-found.tsx        # Bilingual missing-page screen
│   │   ├── globals.css          # Global styles and responsive design
│   │   ├── us/
│   │   │   └── page.tsx         # About Us page (/us)
│   │   ├── shop/
│   │   │   └── page.tsx         # Product collection (/shop)
│   │   └── products/
│   │       └── [slug]/
│   │           └── page.tsx     # Product detail pages (/products/:slug)
│   ├── components/
│   │   ├── storefront.tsx       # Shared header, footer, bag, and demo checkout
│   │   ├── product-card.tsx     # Product card and image hover behavior
│   │   ├── language-provider.tsx # EN/FA translations and preference
│   │   ├── bubble-cursor.tsx    # Custom desktop cursor
│   │   └── motion-effects.tsx   # Accessible scroll reveals
│   ├── lib/messages.ts         # English and Persian interface copy
│   └── data/
│       └── products.ts          # Fictional product catalog and image mapping
├── package.json
├── pnpm-lock.yaml               # Created when dependencies are installed with pnpm
├── tsconfig.json
└── README.md
```
```text
BACKEND
serein/
├── public/
├── src/                         # Existing Next.js frontend
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database models
│   │   ├── seed.ts              # Initial product catalog
│   │   └── migrations/          # Generated database migrations
│   ├── src/
│   │   ├── app.ts               # Express app and middleware
│   │   ├── server.ts            # Starts the API server
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   └── database.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts          # Clerk authentication
│   │   │   ├── error-handler.ts
│   │   │   ├── not-found.ts
│   │   │   └── validate.ts
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── health.routes.ts
│   │   │   ├── products.routes.ts
│   │   │   ├── account.routes.ts
│   │   │   ├── cart.routes.ts
│   │   │   ├── orders.routes.ts
│   │   │   └── newsletter.routes.ts
│   │   ├── controllers/
│   │   │   ├── products.controller.ts
│   │   │   ├── account.controller.ts
│   │   │   ├── cart.controller.ts
│   │   │   ├── orders.controller.ts
│   │   │   └── newsletter.controller.ts
│   │   ├── services/
│   │   │   ├── products.service.ts
│   │   │   ├── account.service.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── orders.service.ts
│   │   │   └── newsletter.service.ts
│   │   ├── schemas/             # Request validation
│   │   │   ├── account.schema.ts
│   │   │   ├── cart.schema.ts
│   │   │   ├── orders.schema.ts
│   │   │   └── newsletter.schema.ts
│   │   └── utils/
│   │       └── app-error.ts
│   ├── tests/
│   │   ├── auth.test.ts
│   │   ├── cart.test.ts
│   │   └── orders.test.ts
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── tsconfig.json
│   └── README.md
├── .gitignore
├── package.json                 # Existing frontend dependencies
├── pnpm-lock.yaml
└── README.md
```

## Requirements

- Node.js 20.9 or newer
- pnpm

## Install pnpm on Ubuntu

Use pnpm's official standalone installer:

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

Open a new terminal, then confirm it is available:

```bash
pnpm --version
```

## Install and run the project

From the project directory:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

To create and run a production build:

```bash
pnpm build
pnpm start
```

If the downloaded project contains `package-lock.json` but no `pnpm-lock.yaml`, migrate the dependency lockfile once with:

```bash
pnpm import
pnpm install
```

After the import, use `pnpm-lock.yaml` for dependency installs.

## Demo behavior

- The homepage, About Us, shop, and product detail pages are responsive.
- Product images switch to their texture image on hover or keyboard focus. Product details show both images for touch devices.
- The shopping bag persists in the current browser using `localStorage`.
- Checkout is simulated with fictional prefilled details. No payment is collected and no order is sent to a server.
- The newsletter interaction displays a local demo message; it does not submit or store the email address.

All products and claims are fictional portfolio content.


## Frontend checks

```bash
pnpm typecheck
pnpm build
```

Before backend integration, preview both languages on desktop and mobile. Check product links, whole-number quantities, bag persistence after refresh, demo checkout, the mobile menu (including Escape), and an unknown URL. Motion follows the operating system's reduced-motion setting. To test with the alternative production bundler, use `pnpm build --webpack`.

The storefront is ready for backend integration. Authentication/account screens, API loading and error states, real order storage, newsletter submission, and payment integration remain part of the next phase.