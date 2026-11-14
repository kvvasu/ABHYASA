# Phase 03 — Public Website

Status: Awaiting approval.
Date: 2026-11-14.
Branch: `feature/phase-03-public-pages`.

## Goal

Build the public marketing site with sample course content, legal drafts, and
accessible responsive layouts. No authentication, payment, or paid video access.

## Work completed

1. Added `PublicLayout` with the shared navigation and footer.
2. Added a public footer with learn, support, and legal links.
3. Added the Home page with a sample learning path, featured courses, approach,
   steps, FAQ preview, and closing call to action.
4. Added the Course Catalog with all five sample courses.
5. Added static Course Details pages generated from `src/data/courses.ts`,
   including outcomes, audience, curriculum, and sample price.
6. Added About, FAQ, and Contact pages. The contact form is visibly disabled
   until a delivery API exists.
7. Added Privacy, Terms, and Refund pages using a shared legal layout. Each page
   carries a draft notice. The refund policy is intentionally not final.
8. Added a 404 page with `noindex`.
9. Added Open Graph, Twitter card, theme color, and canonical metadata.
10. Hid login and register links on public pages until Phase 5. The `/design`
    page keeps them through the `showAuth` prop.
11. Added browser tests for every public route, metadata, sample notices, the
    disabled contact form, mobile navigation, and horizontal overflow.

## Content rules

- Every course is marked sample content. Titles, lessons, prices, and durations
  are placeholders.
- No reviews, completion counts, credentials, or instructor biography are
  published. The About page states that the biography is pending verification.
- No affiliation with or endorsement by ServiceNow is claimed.
- The refund policy is a draft. Payment is not active in this phase.

## Files created

- `src/layouts/PublicLayout.astro`
- `src/layouts/LegalLayout.astro`
- `src/components/ui/Footer.astro`
- `src/components/CourseCard.astro`
- `src/data/courses.ts`
- `src/pages/courses/index.astro`
- `src/pages/courses/[slug].astro`
- `src/pages/about.astro`
- `src/pages/faq.astro`
- `src/pages/contact.astro`
- `src/pages/privacy.astro`
- `src/pages/terms.astro`
- `src/pages/refund.astro`
- `src/pages/404.astro`
- `tests/e2e/public.spec.ts`
- `docs/phases/PHASE_03.md`

## Changed files

- `src/pages/index.astro`
- `src/components/ui/Nav.astro`
- `src/layouts/BaseLayout.astro`
- `src/pages/design.astro`
- `astro.config.mjs`
- `.env.example`
- `tests/e2e/home.spec.ts`

## Acceptance

| Criterion | Result |
|---|---|
| Home, catalog, course details, about, FAQ, contact, and legal pages exist | Pass. |
| Responsive at desktop and mobile widths | Pass. Screenshots at 1440×1000 and 390×844; no horizontal overflow test. |
| Accessible structure | Pass. One `h1` per page, skip link, labelled controls, draft notices, focus styles. |
| Sample content clearly marked | Pass. Course cards, detail pages, catalog, home, and footer. |
| No Firebase auth, Razorpay, or paid video access | Pass. None added. |
| Metadata and canonical links | Pass. Browser test checks description and canonical. |
| Production build and tests | Pass. See `docs/TEST_RESULTS.md`. |

## Known limitations

- Sample course data lives in `src/data/courses.ts`. It is not CMS content yet.
- The contact form has no delivery endpoint. The submit button is disabled.
- Legal text requires legal review. Refund terms are not final.
- Cloudflare Pages deployment is not tested because account access is not
  available.
- Images are not used in this phase. There are no course thumbnails or
  instructor photos.
