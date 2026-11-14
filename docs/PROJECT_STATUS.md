# Project Status

Current Phase: Phase 4 — Content Management implemented, awaiting approval.
Current Branch: `feature/phase-04-content-management`
Last Commit: `f042827` (Phase 4 WIP) plus the Phase 4 completion commit; run
`git log -1` on this branch for the current hash.
Last Updated: 2026-11-14

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

- Fixed Decap CMS 3.17.3 configuration validation: added the required top-level
  `media_folder` / `public_folder` for public marketing assets and regression
  tests. Live `/admin/` browser test reaches the GitHub login screen without
  config errors; GitHub OAuth itself remains unverified.
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

- Phase 4 review and approval. The code is complete; a live GitHub OAuth login
  has not been verified because the OAuth App and Cloudflare secrets do not exist.

## Blocked

- GitHub OAuth App creation and Cloudflare secret upload need account access.
- Cloudflare Pages project creation and deployment need account access.
- Phase 5 needs a Firebase project and web app configuration.
- Phase 6 needs a Firebase service account.
- Phase 7 needs Razorpay test keys and a webhook secret.

## Test Status

- Unit tests: Pass. 4 files, 19 tests.
- Astro and type check: Pass. 0 errors, 0 warnings (49 files).
- Browser tests: Pass. 29 Playwright tests (Chromium) through `wrangler pages dev`.
- Build: Pass. 15 pages generated from Markdown collections.
- Lint and format: Pass.
- Public output scan: Pass. 33 files in `dist/`, no private lesson data or secrets.
- Secret scan: Pass. `git grep` patterns; `gitleaks` is not installed.
- Live OAuth login: Not tested. Mock-binding integration check passes.
- Visual review: Desktop 1440×1000 and mobile 390×844 checked in Phase 3.

## Known Issues

- Captions Light reference file was not available. Tokens and component rules are implemented; visual approval is required.
- Licensed Exposure and DenimINK fonts are not available. Libre Baskerville and Inter are approved substitutes.
- Ash Copy is restricted to disabled text and Prism Cyan to accents because their contrast is below AA for body text.
- `astro dev` does not serve Pages Functions. Use `npm run preview` for `/api/*`.
- Cloudflare Pages deployment is not tested because account access is not available.
- A live Decap login is unverified. GitHub OAuth Apps allow one callback URL, so preview deployments need a second OAuth App.
- Paid video IDs are not implemented and never belong in Markdown. Course content is sample data; legal pages are drafts and the refund policy is not final.
- The contact form has no delivery endpoint; the submit button is disabled.

## Next Action

- Owner: create the GitHub OAuth App, upload the three Cloudflare secrets, deploy,
  and confirm the `/admin/` login and editorial pull request.
- Then complete Phase 4 approval and merge the pull request.

## Approval Required

- No for Phase 3. Approved and merged.
- Phase 4 requires approval before merge.
