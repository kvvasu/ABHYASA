# Decisions

Format: decision, reason, consequence. Do not change an accepted decision
without approval.

## ADR-001: Astro 7 with Cloudflare Pages adapter

Status: proposed (Phase 0).

Decision: Use Astro 7.4.x with `@astrojs/cloudflare` 14.4.x. Public pages are
static. API routes and protected shells are server-rendered.

Reason: The required stack names Astro and Cloudflare Pages. The adapter versions
are compatible: adapter peer requires Astro ^7.4.0. Astro 7 requires Node >=
22.23.4; the development machine has Node 24.19.0.

Consequence: Pin versions in `package.json`. Use Node 22 or newer in CI.

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

Status: proposed.

Decision: Implement GitHub OAuth in `/api/auth/github` and
`/api/auth/callback` with a signed state cookie.

Reason: A static Decap build has no OAuth broker. Third-party brokers add a
dependency and a trust boundary.

Consequence: Create a GitHub OAuth App. Store client secret in Cloudflare. Test
the popup flow in Phase 4. If Cloudflare cannot complete the flow, stop and
request approval for an alternative.

## ADR-010: YouTube Unlisted with Plyr, no DRM claim

Status: proposed.

Decision: Use YouTube Unlisted for paid video and Plyr for playback. State the
limitation clearly in documentation and terms.

Reason: Required stack. Unlisted is access control by obscurity, not DRM.

Consequence: Authorized users can share links. Do not promise copy protection.
Do not log video IDs.

## ADR-011: Private PDFs deferred until approved

Status: proposed.

Decision: Do not add R2 in Phase 1. Add it in Phase 10 only if paid PDFs are
required. If added, use private R2 objects and authenticated delivery. Never use
public bucket URLs.

Reason: Cost control and YAGNI. R2 free tier is sufficient, but it adds a binding,
signed URL logic, and tests.

Consequence: Lesson resources in the MVP are external links or public files.
Paid files are a separate approved scope.

## ADR-012: Currency stored as integer paise

Status: proposed.

Decision: Store INR amounts as integer paise. Format for display in the UI.

Reason: Floating point currency is unsafe. Razorpay accepts integer minor units.

Consequence: Admin forms accept rupees and convert at the boundary. Validate
minimum and maximum amounts on the server.

## ADR-013: Design tokens from Captions Light, font fallbacks allowed

Status: proposed.

Decision: Use the supplied color tokens exactly. Use Exposure and DenimINK if
licensed files are supplied by the owner; otherwise use Libre Baskerville or
Georgia for headings and Inter or Arial for body text.

Reason: License compliance.

Consequence: Phase 2 checks contrast for both font sets. Do not download
commercial fonts.

## ADR-014: No paid service in the MVP

Status: proposed.

Decision: Use only free tiers: Cloudflare Pages/Functions/R2, Firebase Auth and
Firestore free tier, GitHub, Razorpay pay-per-transaction.

Reason: Target cost is ₹0 per month inside free limits.

Consequence: Monitor usage. If a free limit is at risk, report before enabling a
paid plan.
