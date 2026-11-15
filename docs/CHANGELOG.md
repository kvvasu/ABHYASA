# Changelog

## Phase 4 OAuth preview fix — 2026-11-15

- Added build-time `CMS_SITE_URL` substitution so preview CMS config points at
  the same-host OAuth Functions; local browser tests use `127.0.0.1` consistently.
- Send the exact callback URI during token exchange and verify callback messages
  come from the opener at the expected origin.
- Documented feature preview URLs, Preview settings, OAuth callback alternatives,
  and pending live login/draft-to-PR checks.

## Phase 4 CMS configuration fix — 2026-11-14

- Added the required top-level Decap `media_folder` and `public_folder` settings
  for public marketing assets only; private course files remain out of public Git.
- Added unit and browser regression checks for the media settings, CMS backend,
  editorial workflow, collection, and exact Decap 3.17.3 pin.
- Documented the missing schema requirements and safe upload boundary in
  `docs/CMS.md` and `docs/phases/PHASE_04.md`.

## Phase 4 — 2026-11-14

- Added the `courses` Astro content collection with a validation schema for
  required fields, enums, non-empty modules and lessons, and integer prices.
- Moved the five sample courses from `src/data/courses.ts` to
  `src/content/courses/*.md` with frontmatter and a Markdown overview body.
- Added `src/lib/courses.ts` for sorted course reads, lesson counts, and price
  formatting.
- Added Decap CMS at `/admin/` with editorial workflow and course fields.
- Added self-hosted GitHub OAuth in `/api/auth/github` and
  `/api/auth/callback` with a signed, expiring state cookie.
- Added unit tests for content privacy, the Decap config, OAuth state, cookie
  attributes, callback rendering, and token exchange.
- Added browser tests for the admin entry point, OAuth configuration handling,
  course ordering, and module ordering.
- Added `npm run scan:public` to fail if private lesson data or secrets reach
  `dist/`.
- Documented the OAuth flow, setup URLs, security risks, and content workflow.
- Pinned the Decap CDN build to 3.17.3.

## Phase 3 — 2026-11-14

- Added public layout, footer, and shared public navigation.
- Added Home, Course Catalog, five Course Details pages, About, FAQ, Contact,
  Privacy, Terms, Refund, and 404 pages.
- Added sample course data and clearly marked sample content notices.
- Added a disabled contact form that states delivery is not connected.
- Added draft notices to all legal pages.
- Added Open Graph, Twitter card, theme color, and canonical metadata.
- Hid login and register links on public pages until Phase 5.
- Added browser tests for every public route, metadata, mobile navigation, and
  horizontal overflow.

## Phase 2 — 2026-11-14

- Added full Captions Light color, typography, spacing, radius, and shadow tokens.
- Added responsive display sizes with `clamp()`.
- Added Libre Baskerville 700 for headings.
- Added Button, Card, Badge, Nav, Section, Input, Textarea, Select, Accordion,
  LoadingState, and ErrorState components.
- Added `/design` component preview.
- Added keyboard, mobile navigation, and component browser tests.
- Documented contrast checks and component rules.

## Phase 1 — 2026-11-14

- Added Astro 7 static project with TypeScript.
- Added Tailwind CSS v4 through `@tailwindcss/vite`.
- Added Captions Light color tokens and Libre Baskerville + Inter fonts.
- Added base layout with skip link and page metadata.
- Added `GET /api/health` as a native Cloudflare Pages Function.
- Added Vitest unit test and Playwright browser tests.
- Added ESLint, Prettier, EditorConfig, and `.env.example`.
- Added Cloudflare Pages configuration.
- Corrected architecture: Astro adapter does not support Pages; use native
  `functions/` directory.

## Phase 0 — 2026-11-14

- Added architecture, roadmap, database schema, API reference, and decisions.
- Documented runtime compatibility and account dependencies.
