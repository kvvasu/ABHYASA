# Phase 04 — Content Management

Status: Awaiting approval. Live GitHub OAuth login is not verified.
Date: 2026-11-14.
Branch: `feature/phase-04-content-management`.

## CMS configuration correction (2026-11-14)

Decap CMS 3.17.3's embedded config schema requires either a top-level
`media_folder` or a top-level `media_library`. The original `config.yml` had
neither, causing the admin's "Error loading the CMS configuration" message and
three validation errors. Added `media_folder: public/uploads/public` and
`public_folder: /uploads/public`. The upload directory is deliberately outside
`src/content/courses`; it is for public marketing assets only. It does not make
paid or private files appropriate for this repository. No external media library
is configured, avoiding an Uploadcare account and preventing accidental reliance
on an unconfigured third party.

## Goal

Move public course content into Markdown content collections, validate it at
build time, and let the instructor edit it through Decap CMS backed by GitHub.
Keep private lesson data, video IDs, payment data, and enrollment data out of Git
and the static build.

## Work completed

1. Added the `courses` collection in `src/content.config.ts` using the Astro glob
   loader. The schema validates required text, the level enum, integer price,
   dates, non-empty modules and lessons, and defaults for flags and lists.
2. Moved all five sample courses from `src/data/courses.ts` to
   `src/content/courses/*.md`. Frontmatter holds structured data; the Markdown
   body holds the public overview. The old data module was removed.
3. Added `src/lib/courses.ts` for sorted reads, lesson counts, and INR
   formatting. Home, catalog, and course pages now render from the collection.
4. Course ordering uses the `order` integer, then title. Module and lesson order
   follow the frontmatter arrays, which Decap preserves.
5. Added Decap CMS at `/admin/` with the GitHub backend, editorial workflow,
   and fields for every public course value. The CDN build is pinned to 3.17.3.
6. Added self-hosted GitHub OAuth:
   - `GET /api/auth/github` creates a random HMAC-signed state, stores it in an
     `HttpOnly`, `SameSite=Lax` cookie scoped to `/api/auth` for 10 minutes, and
     redirects to GitHub.
   - `GET /api/auth/callback` checks the state against the cookie and signature,
     exchanges the code, and posts the token to the Decap opener after an exact
     origin check.
7. Added unit tests for content privacy, sample flags, Decap config, OAuth state
   tampering and expiry, redirect parameters, cookie attributes, callback
   escaping, and the token exchange.
8. Added browser tests for the admin entry point, the OAuth configuration
   response, and course and module ordering.
9. Added `src/lib/oauth.ts` helpers and `.env.example` / `.dev.vars.example`
   names for the three OAuth values.
10. Added `npm run scan:public` to scan `dist/` for YouTube references, video ID
    fields, R2 hosts, private keys, and server secret names.
11. Documented the flow, risks, and workflow in `docs/CMS.md`,
    `docs/DECISIONS.md`, and `docs/DEPLOYMENT.md`.

## GitHub OAuth App setup

| Setting                | Value                                                       |
| ---------------------- | ----------------------------------------------------------- |
| Application name       | `ServiceNow Learn Easy CMS`                                 |
| Homepage URL           | `https://servicenow-learn-easy.pages.dev`                   |
| Authorization callback | `https://servicenow-learn-easy.pages.dev/api/auth/callback` |

Required values:

- Client ID: public. Set as the plain Pages variable `GITHUB_OAUTH_CLIENT_ID`.
- Client secret: set as the Pages secret `GITHUB_OAUTH_CLIENT_SECRET`. Never
  paste it into chat, a document, or Git.
- State secret: any random 32-byte value, set as the Pages secret
  `OAUTH_STATE_SECRET`. Generate with `openssl rand -hex 32`.

The client secret is used only in the server-to-server exchange inside
`functions/api/auth/callback.ts`.

## Blocked

- GitHub OAuth App creation needs owner account access.
- Cloudflare Pages project creation and secret upload need account access.
- A live login, token exchange, and editorial pull request cannot be tested
  until those exist. Unit tests cover the logic with mock values only.

## Acceptance

| Criterion                                   | Result                                                          |
| ------------------------------------------- | --------------------------------------------------------------- |
| Astro content collections                   | Pass. `courses` collection loads five Markdown entries.         |
| Markdown course content                     | Pass. Five files with frontmatter and body.                     |
| Content validation schemas                  | Pass. `astro check` validates content with 0 errors.            |
| Decap CMS configuration                     | Pass. `/admin/` and `config.yml` served; browser test.          |
| GitHub-backed content editing               | Implemented. Live login not tested; OAuth App required.         |
| Course and module ordering                  | Pass. Browser tests assert catalog and module order.            |
| Public content publishing                   | Pass. Home, catalog, and details build from Markdown.           |
| Build and deployment after content changes  | Documented. Automated Pages build waits on account access.      |
| Private IDs and paid data excluded          | Pass. Unit content scan and `npm run scan:public`.              |
| Type check, lint, format, unit, browser     | Pass. See `docs/TEST_RESULTS.md`.                               |

## Approval required

Phase 4 needs owner approval before merge. The OAuth live check is the only open
item; complete the account setup above, then test `/admin/` on the deployed site.
