# ServiceNow Learn Easy

Learning Management System (LMS) for ServiceNow training courses.

Status: Phase 3 (Public Website). Public pages are sample content for review.
Authentication, payment, and paid video access are not implemented.

## Stack

- Astro 7 + TypeScript
- Tailwind CSS v4
- Cloudflare Pages + native Pages Functions (`functions/`)
- Firebase Authentication
- Cloud Firestore (REST API from Functions)
- Razorpay Orders, Checkout, Webhooks
- YouTube Unlisted + Plyr
- Decap CMS (Markdown content)
- Vitest + Playwright

## Documentation

Start with [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md), then
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/ROADMAP.md](docs/ROADMAP.md),
and [docs/DECISIONS.md](docs/DECISIONS.md).

## Local development

```bash
npm install
npm run dev          # Astro pages only, port 4321
npm run build        # type check and static build
npm run preview      # full site with Pages Functions, port 8788
```

Use `npm run preview` when testing `/api/*`. `astro dev` does not run Pages
Functions.

## Tests

```bash
npm test             # Vitest unit tests
npm run test:e2e     # Playwright against a built site with Functions
npm run lint
npm run format:check
```

## Environment

Copy `.env.example` to `.env` for local values. Never commit real secrets.
Cloudflare secrets are set with `npx wrangler pages secret put <NAME>`.

## Repository

https://github.com/kvvasu/ABHYASA

## Design preview

Run `npm run preview` and open `/design`. The page is `noindex` and is for review
only.
