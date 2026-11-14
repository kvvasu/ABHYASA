# Phase 00 — Discovery and Architecture

Status: Approved (2026-11-14).
Date: 2026-11-14.

## Goal

Confirm the implementation plan before writing application code.

## Findings

### Repository

- `kvvasu/ABHYASA` exists, visibility PUBLIC, created 2026-11-14.
- Git repository is empty. No branches, commits, or pull requests.
- No local copy existed. Cloned to `~/projects/abhyasa`.
- No unrelated work to preserve.

### Stack compatibility

| Item | Result |
|---|---|
| Astro 7.4.12 | Requires Node >= 22.23.4. Local Node 24.19.0. OK. |
| @astrojs/cloudflare 14.4.8 | Peer: astro ^7.4.0, wrangler ^4.125.0. OK. |
| Tailwind CSS 4.3.5 | Use `@tailwindcss/vite`. OK. |
| Firebase JS SDK 13.3.0 | Browser only. OK. |
| `jose` 6.2.17 | Web Crypto. OK for token verification and JWT signing. |
| `firebase-admin` 14.5.1 | Not compatible with Cloudflare Workers. Rejected. |
| Decap CMS 3.17.3 | Requires React 19 peers and an OAuth broker. Workable with a bundling step and a Pages Function. |
| Plyr 3.8.5 | Browser only. OK. |
| Vitest 5.1.0 / Playwright 1.65.1 | OK on Node 24. |

### Architecture summary

- Static public pages on Cloudflare Pages.
- Protected pages call Pages Functions.
- Firebase ID tokens verified with Google public keys via `jose`.
- Firestore accessed through REST with a service-account OAuth token.
- Razorpay webhook is the only payment authority.
- Paid video IDs stay in Firestore.
- Decap CMS for public Markdown; Firestore for commerce and private data.
- Private PDFs deferred until approved.

### Security boundaries

1. Browser must send a Firebase ID token. UID comes from the verified token.
2. Every paid lesson request checks course, lesson, publication, and active
   enrollment.
3. Firestore rules deny client writes to commercial and access collections.
4. Webhook signatures use HMAC-SHA256 over the raw body.
5. Duplicate events are idempotent by event ID and deterministic enrollment IDs.

### Risks

1. Firestore free-tier reads if progress polling is too frequent.
2. Delayed webhooks need reconciliation.
3. Decap OAuth must be tested in the real hosting environment.
4. YouTube Unlisted does not prevent sharing by authorized users.
5. Price display at build time can be stale. Checkout reads Firestore.
6. Missing design reference and font files.

## Deliverables

- [x] `docs/ARCHITECTURE.md`
- [x] `docs/ROADMAP.md`
- [x] `docs/DATABASE_SCHEMA.md`
- [x] `docs/API_REFERENCE.md`
- [x] `docs/DECISIONS.md`
- [x] `docs/PROJECT_STATUS.md`
- [x] `docs/phases/PHASE_00.md`
- [x] `README.md`
- [x] `.gitignore`

## Required accounts and decisions

| Item | Needed by | Status |
|---|---|---|
| Firebase project | Phase 5 | Not provided |
| Firebase web app config | Phase 5 | Not provided |
| Firebase service account | Phase 6 | Not provided |
| Cloudflare account and Pages project | Phase 1 (local config only), Phase 12 (deploy) | Not provided |
| Razorpay test key ID and secret | Phase 7 | Not provided |
| Razorpay webhook secret | Phase 7 | Not provided |
| GitHub OAuth App for Decap | Phase 4 | Not provided |
| Domain name | Phase 12 | Optional |
| Licensed Exposure and DenimINK fonts | Phase 2 | Not available. Free substitutes approved: Libre Baskerville + Inter. |
| Decision: paid PDFs in MVP? | Phase 10 | Deferred. R2 out of MVP scope. |
| Decision: public repository with private video IDs in Firestore only? | Phase 6 | Architecture assumes yes |

## Acceptance review

- Architecture documented. Yes.
- Risks documented. Yes.
- Account requirements known. Yes.
- Major compatibility issue resolved. Yes. `firebase-admin` replaced by `jose`.
- No application code written. Yes.

## Next phase

Phase 1 — Project Foundation, only after approval.
