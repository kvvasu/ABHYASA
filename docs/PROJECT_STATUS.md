# Project Status

Current Phase: Phase 4 — Content Management implemented, OAuth preview fix in progress.
Current Branch: `feature/phase-04-content-management`
Last Commit: run `git log -1` on this branch for the current hash.
Last Updated: 2026-11-15

## Completed

- Phase 0, Phase 1, and Phase 2 approved. PR #2 and PR #3 merged into `develop`.
- Phase 3 approved. PR #4 merged into `develop` (`cceeb99`).
- Full Captions Light color, typography, spacing, radius, and shadow tokens.
- Responsive display sizes with `clamp()`.
- Libre Baskerville 400/700 and Inter variable fonts, self-hosted.
- Button, Card, Badge, Nav, Section, Input, Textarea, Select, Accordion, LoadingState, and ErrorState components.
- `/design` component preview with foundations, components, and states.
- Public layout with shared navigation and footer.
- Home, Course Catalog, five Course Details pages, About, FAQ, Contact, Privacy, Terms, Refund, and 404.
- Open Graph, Twitter card, theme color, and canonical metadata.
- Public navigation hides login and register until Phase 5.
- Browser tests for public routes, metadata, sample notices, disabled contact form, mobile navigation, and overflow.

### Completed in Phase 4 (awaiting approval)

- Fixed Decap CMS 3.17.3 configuration validation and added a build-time
  `CMS_SITE_URL` override so preview `/admin/` targets the same preview's OAuth
  functions. Tightened callback origin/source checks and matched token exchange's
  `redirect_uri`. Preview login/draft verification remains pending account setup.
- `courses` Astro content collection with a validation schema for required text,
  enums, integer prices, dates, and non-empty modules and lessons.
- Five Markdown courses in `src/content/courses/` with frontmatter and a public
  overview body. `src/data/courses.ts` was removed.
- Home, catalog, and course details render from the collection through
  `src/lib/courses.ts`.
- Course order (`order`, then title) and module and lesson order are defined and
  covered by browser tests.
- Decap CMS at `/admin/` with the GitHub backend, editorial workflow, and course
  fields. The CDN build is pinned to 3.17.3.
- Self-hosted GitHub OAuth in `functions/api/auth/github.ts` and
  `functions/api/auth/callback.ts` with a signed, expiring state cookie.
- Unit and browser tests for content privacy, Decap config, OAuth logic, ordering,
  and the admin entry point.
- `npm run scan:public` scans `dist/` for private lesson data and secrets.
- OAuth method, setup URLs, security risks, and the content workflow are
  documented in `docs/CMS.md`, `docs/DECISIONS.md` (ADR-009), and
  `docs/DEPLOYMENT.md`.

## In Progress

- Phase 4 OAuth preview testing. Feature preview is deployed, but OAuth app
  callback settings and Cloudflare Preview variables are not configured.

## Blocked

- Owner must configure GitHub OAuth callback URL(s) and Cloudflare Pages Preview
  variables/secrets before full login and draft-to-PR testing.
- Phase 5 needs a Firebase project and web app configuration.
- Phase 6 needs a Firebase service account.
- Phase 7 needs Razorpay test keys and a webhook secret.

## Test Status

- Unit tests: Pass. 4 files, 21 tests.
- Astro and type check: Pass. 0 errors, 0 warnings (50 files).
- Browser tests: Pass. 29 Playwright tests (Chromium) through `wrangler pages dev`.
- Build: Pass. 15 pages generated from Markdown collections.
- Lint and format: Pass.
- Public output scan: Pass. 34 files in `dist/`, no private lesson data or secrets.
- Secret scan: Pass. `git grep` patterns; `gitleaks` is not installed.
- Deployed preview OAuth login and draft PR: Pending account configuration; do not claim verified.
- Visual review: Desktop 1440×1000 and mobile 390×844 checked in Phase 3.

## Known Issues

- Captions Light reference file was not available. Tokens and component rules are implemented; visual approval is required.
- Licensed Exposure and DenimINK fonts are not available. Libre Baskerville and Inter are approved substitutes.
- Ash Copy is restricted to disabled text and Prism Cyan to accents because their contrast is below AA for body text.
- `astro dev` does not serve Pages Functions. Use `npm run preview` for `/api/*`.
- No new Cloudflare deployment was triggered from this workspace; account deployment controls are unavailable.
- A live Decap login is unverified. Feature preview handlers are deployed, but Preview secrets and a matching OAuth callback configuration are still required.
- Paid video IDs are not implemented and never belong in Markdown. Course content is sample data; legal pages are drafts and the refund policy is not final.
- The contact form has no delivery endpoint; the submit button is disabled.

## Next Action

- Owner: register the production and feature-preview OAuth callback URL(s), set
  the Cloudflare Preview variables/secrets listed in `docs/CMS.md`, then ask for
  full login and draft-to-PR verification. Do not change production branch or merge.

## Approval Required

- No for Phase 3. Approved and merged.
- Phase 4 requires approval before merge.
