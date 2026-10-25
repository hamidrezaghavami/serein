# SEREIN — Skincare Storefront Demo

A responsive skincare storefront portfolio built with Next.js, React, TypeScript, and Tailwind CSS. It uses fictional products and locally stored frontend state; there is no backend, real payment processing, or account system.

## Project structure

```text
serein/
├── public/
│   └── images/
│       ├── landing/             # Homepage and product imagery
│       └── us/                  # About Us page imagery
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Shared document layout and storefront shell
│   │   ├── page.tsx             # Homepage
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
│   │   └── product-card.tsx     # Product card and image hover behavior
│   └── data/
│       └── products.ts          # Fictional product catalog and image mapping
├── package.json
├── pnpm-lock.yaml               # Created when dependencies are installed with pnpm
├── tsconfig.json
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
