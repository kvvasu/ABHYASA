# ServiceNow Learn Easy

Learning Management System (LMS) for ServiceNow training courses.

Status: Phase 4 (Content Management), awaiting approval. Course pages are generated
from Markdown content collections and edited through Decap CMS. GitHub OAuth is
implemented and unit tested; a live login has not been verified because the OAuth
App and Cloudflare secrets are not set up. Authentication, payment, and paid video
access are not implemented.

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
[docs/DECISIONS.md](docs/DECISIONS.md), and [docs/CMS.md](docs/CMS.md).

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
