# Project Status

Current Phase: Phase 3 approved. Phase 4 — Content Management in progress.
Current Branch: `develop`
Last Commit: see `git log -1` on `develop`
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
- Sample course data in `src/data/courses.ts`.
- Open Graph, Twitter card, theme color, and canonical metadata.
- Public navigation hides login and register until Phase 5.
- Browser tests for public routes, metadata, sample notices, disabled contact form, mobile navigation, and overflow.

## In Progress

- Phase 4 — Content Management: content collections, Markdown courses, Decap CMS,
  and the selected GitHub OAuth method.

## Blocked

- Cloudflare Pages project creation and deployment need account access.
- Phase 4 needs a GitHub OAuth App.
- Phase 5 needs a Firebase project and web app configuration.
- Phase 6 needs a Firebase service account.
- Phase 7 needs Razorpay test keys and a webhook secret.

## Test Status

- Unit tests: Pass. 1 file, 1 test.
- Integration tests: Pass for health endpoint through `wrangler pages dev`.
- Browser tests: Pass. 22 Playwright tests (Chromium).
- Build: Pass. `astro check` reports 0 errors.
- Lint and format: Pass.
- Visual review: Desktop 1440×1000 and mobile 390×844 checked.

## Known Issues

- Captions Light reference file was not available. Tokens and component rules are implemented; visual approval is required.
- Licensed Exposure and DenimINK fonts are not available. Libre Baskerville and Inter are approved substitutes.
- Ash Copy is restricted to disabled text and Prism Cyan to accents because their contrast is below AA for body text.
- `astro dev` does not serve Pages Functions. Use `npm run preview` for `/api/*`.
- Cloudflare Pages deployment is not tested because account access is not available.
- Course content is sample data, not CMS content. Legal pages are drafts and the refund policy is not final.
- The contact form has no delivery endpoint; the submit button is disabled.

## Next Action

- Complete Phase 4 and open a pull request for approval.

## Approval Required

- No for Phase 3. Approved and merged.
- Phase 4 requires approval before merge.
