# Decisions

Format: decision, reason, consequence. Do not change an accepted decision
without approval.

## ADR-001: Astro 7 static build with native Cloudflare Pages Functions

Status: accepted (Phase 1 correction, 2026-11-14).

Decision: Use Astro 7.4.x with `output: 'static'`. Server code lives in the native
`functions/` directory as Cloudflare Pages Functions. Do not use
`@astrojs/cloudflare`.

Reason: The required stack names Astro and Cloudflare Pages Functions. Astro's
official Cloudflare adapter v13+ removed Pages support and targets Workers only.
A static Astro build plus native Pages Functions keeps the required hosting model.
Astro 7 requires Node >= 22.23.4; the development machine has Node 24.19.0.

Consequence: API handlers use the Pages Functions signature (`onRequestGet`,
`onRequestPost`). Full-stack local preview uses `wrangler pages dev ./dist`.
`astro dev` serves static pages only. Pin versions. Use Node 22 or newer in CI.
This supersedes the Phase 0 adapter plan. The change preserves the required stack;
it does not add a service.

## ADR-002: Verify Firebase ID tokens with `jose`, not `firebase-admin`

Status: proposed.

Decision: Verify Firebase ID tokens in Pages Functions with `jose` against
Google's public certificates. Validate signature, `iss`, `aud`, `exp`, `iat`,
and `sub`.

Reason: `firebase-admin` does not run on Cloudflare Workers because it depends on
Node.js runtime modules and gRPC.

Consequence: We implement and test token verification ourselves. Cache Google
certificates in memory. Reject tokens with the wrong project audience. Never read
the UID from the request body.

## ADR-003: Use Firestore REST API from the worker

Status: proposed.

Decision: Access Firestore through the REST API. Mint an OAuth 2.0 access token
from the service account JSON with `jose` (RS256) and cache it until expiry.

Reason: The Node Firestore client does not run on Workers. REST uses HTTPS, which
Workers support.

Consequence: Write small typed helpers for `get`, `patch`, `query`, `batchGet`,
and transactions. Firestore REST transactions use `beginTransaction` and
`commit`. Add tests for each helper. Keep payloads small.

## ADR-004: Server API is the only writer of commercial and access data

Status: proposed.

Decision: Firestore Security Rules deny all client writes to `courses`,
`lessons`, `enrollments`, `orders`, `webhookEvents`, `auditLogs`, and `progress`.
Users may update only `displayName` and `photoURL` on their own document. All
other writes use the API with a service account.

Reason: The requirements forbid client-created enrollments, client payment
changes, and cross-user progress access. A single enforced write path is easier
to test than many rule exceptions.

Consequence: Some legitimate features need an API call. That is acceptable for
the MVP and keeps rules simple.

## ADR-005: Deterministic document IDs for enrollments and progress

Status: proposed.

Decision: Use `${uid}_${courseId}` for enrollments and
`${uid}_${courseId}_${lessonId}` for progress.

Reason: Repeated webhook events and repeated progress saves must not create
duplicates. A deterministic key makes the operation idempotent at the database
level.

Consequence: A student cannot hold two enrollments for the same course. That is
the intended business rule.

## ADR-006: Razorpay webhook is the only payment authority

Status: proposed.

Decision: The browser may open Checkout and poll status. It cannot activate
enrollment. Only a verified webhook can move an order to `paid` and grant access.
Instructor grants are separate, manual, and audited.

Reason: The browser is untrusted. Razorpay recommends server-side signature
verification.

Consequence: Access may lag by seconds while the webhook arrives. Show
"payment received, activating access" and poll. Provide reconciliation for
missing webhooks.

## ADR-007: Store paid YouTube IDs in Firestore only

Status: proposed.

Decision: `lessons.youtubeVideoId` lives in Firestore. Public Markdown, static
HTML, JSON, JS bundles, and source maps never contain it. The protected lesson
API returns it only after authorization.

Reason: Requirement 6.3.

Consequence: The player cannot render a paid lesson from static data. It must
call the API. Accept the extra request. Set `Cache-Control: private, no-store`.

## ADR-008: Markdown and Decap CMS for public content, Firestore for commerce

Status: proposed.

Decision: Decap edits marketing content (home copy, course descriptions, FAQ,
legal pages, instructor bio). Firestore holds commercial and private data
(price, status, lessons, video IDs, enrollments).

Reason: Decap works on Git content. Private IDs must not enter Git. Prices must be
read from a server database at checkout.

Consequence: Course marketing copy and course records are linked by
`courseId`/`slug`. A build check must fail if a published Firestore course has no
Markdown entry, or if a Markdown course has no published Firestore record.
Instructor lesson edits require a redeploy only for public marketing, not for
access control.

## ADR-009: Host Decap OAuth in a Cloudflare Function

Status: accepted (Phase 4 implementation, 2026-11-14). Live login pending account
setup.

Decision: Implement GitHub OAuth in `/api/auth/github` and
`/api/auth/callback` with a signed state cookie. Use a standard GitHub OAuth App
and Decap's `github` backend with `auth_endpoint` pointed at the same-origin
Function.

Reason: A static Decap build has no OAuth broker. The Function is small, runs on
the existing free Cloudflare Pages plan, keeps the client secret on the same
origin, and adds no third-party trust boundary or paid service. Alternatives were
rejected:

- DecapBridge: an external broker. Adds an availability and privacy dependency.
- Netlify Identity + Git Gateway: requires a Netlify account and moves auth off
  Cloudflare Pages.
- A separate OAuth worker project: more deployment surface for two short handlers.
- Calling GitHub from the browser: impossible without exposing the client secret.

Consequence: Create a GitHub OAuth App and store its credentials in Cloudflare
Secrets. Test the popup flow before Phase 4 acceptance. If Cloudflare cannot
complete the flow, stop and request approval for an alternative.

Security risks and mitigations:

- Client secret exposure. It lives only in a Pages secret and is used only in the
  server-to-server token exchange. It is never in Git or the static build.
- Token handling. The access token is posted to the Decap opener after an exact
  origin check and is then stored by Decap in browser storage. Any same-origin
  script injection could read it. Keep third-party scripts out of `/admin/`, pin
  the Decap CDN version, and add a Content Security Policy in a later phase.
- Scope. `public_repo` allows writes to any public repository the signed-in user
  can push to. Only repository collaborators with push access should use the CMS.
- CSRF and replay. The state value is random, HMAC-signed, bound to an `HttpOnly`,
  `SameSite=Lax` cookie scoped to `/api/auth`, and expires after 10 minutes.
- Single callback URL. GitHub OAuth Apps allow one callback, so preview hostnames
  cannot complete login without a second OAuth App.
- No PKCE. Decap's popup flow uses a confidential client; the secret and the
  state check carry the protection.
- Logging. Functions do not log tokens, codes, or environment values.

## ADR-010: YouTube Unlisted with Plyr, no DRM claim

Status: proposed.

Decision: Use YouTube Unlisted for paid video and Plyr for playback. State the
limitation clearly in documentation and terms.

Reason: Required stack. Unlisted is access control by obscurity, not DRM.

Consequence: Authorized users can share links. Do not promise copy protection.
Do not log video IDs.

## ADR-011: Private PDFs deferred

Status: accepted (owner, 2026-11-14).

Decision: Do not add R2 in the MVP. Paid PDFs are out of scope. Lesson resources
are external links or public files only.

Reason: Cost control and YAGNI. Owner confirmed that paid PDFs are deferred.

Consequence: No R2 binding, signed URL logic, or private file tests in the MVP.
Add R2 only after a new approval. Never use public bucket URLs for paid files.

## ADR-012: Currency stored as integer paise

Status: proposed.

Decision: Store INR amounts as integer paise. Format for display in the UI.

Reason: Floating point currency is unsafe. Razorpay accepts integer minor units.

Consequence: Admin forms accept rupees and convert at the boundary. Validate
minimum and maximum amounts on the server.

## ADR-013: Design tokens from Captions Light with free font substitutes

Status: accepted (owner, 2026-11-14).

Decision: Use the supplied color tokens exactly. Licensed Exposure and DenimINK
files are not available. Use free, open-licensed substitutes:

- Headings: Libre Baskerville (SIL Open Font License), self-hosted with Fontsource.
- Body: Inter (SIL Open Font License), self-hosted with Fontsource.

Reason: The owner asked for the closest free match. Both fonts are free for
commercial use and need no external font CDN. Libre Baskerville has the editorial
serif character of Exposure. Inter is a neutral, highly legible sans for DenimINK.

Consequence: Self-host through `@fontsource` packages. Do not download or
distribute commercial font files. Phase 2 checks WCAG AA contrast with these
fonts.

## ADR-014: No paid service in the MVP

Status: proposed.

Decision: Use only free tiers: Cloudflare Pages/Functions/R2, Firebase Auth and
Firestore free tier, GitHub, Razorpay pay-per-transaction.

Reason: Target cost is ₹0 per month inside free limits.

Consequence: Monitor usage. If a free limit is at risk, report before enabling a
paid plan.
