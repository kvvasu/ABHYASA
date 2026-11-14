# Changelog

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
