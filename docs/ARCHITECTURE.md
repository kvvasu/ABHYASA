# Architecture

Project: ServiceNow Learn Easy
Version: 1.0
Status: Phase 0 proposal. No application code exists yet.

## 1. Goals

- Sell ServiceNow courses.
- Let the instructor manage courses without code.
- Verify payments on the server.
- Verify course access on the server.
- Keep paid YouTube IDs and PDFs out of public build output.
- Track student progress across devices.
- Keep monthly infrastructure cost at ₹0 while usage stays inside free limits.

## 2. System context

```text
Browser
  |  static pages (Astro build)
  |  Firebase Auth SDK (login, ID token)
  |  fetch /api/* with Bearer ID token
  v
Cloudflare Pages
  |-- Static assets: public pages, JS, CSS
  |-- Pages Functions: /api/*
        |-- Firebase token verification (jose, Google public keys)
        |-- Firestore REST API (service account, RS256 JWT)
        |-- Razorpay Orders API (server key)
        |-- Razorpay webhook verification (HMAC SHA256)
        |-- R2 private objects (optional PDF delivery)
        |
        +--> Google Identity Toolkit public certs
        +--> Firestore
        +--> Razorpay
        +--> GitHub (Decap OAuth, build source)
```

## 3. Runtime and compatibility findings

Checked against the npm registry on 2026-11-14.

| Component                  | Selected version           | Finding                                                                                        |
| -------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------- |
| Astro                      | 7.4.12                     | Requires Node >= 22.23.4. Development machine has Node 24.19.0. Compatible.                    |
| Cloudflare Pages Functions | Native `functions/` folder | Astro's Cloudflare adapter v13+ removed Pages support. Use static Astro plus native Functions. |
| Tailwind CSS               | 4.3.5                      | Use `@tailwindcss/vite` 4.3.5. Compatible with Astro 7 through Vite.                           |
| Cloudflare Wrangler        | 4.162.0                    | Runs `wrangler pages dev ./dist` locally.                                                      |
| Firebase JS SDK            | 13.3.0                     | Browser SDK only. Used for login and ID tokens.                                                |
| `jose`                     | 6.2.17                     | Web Crypto build. Used to verify Firebase ID tokens and to sign Google service-account JWTs.   |
| Plyr                       | 3.8.5                      | Browser library. No runtime conflict.                                                          |
| Decap CMS                  | 3.17.3                     | Peer dependencies: React 19, React DOM 19. Needs a bundling step or the CDN build.             |
| Vitest                     | 5.1.0                      | Node test runner.                                                                              |
| Playwright                 | 1.65.1                     | Browser tests.                                                                                 |

### Important incompatibility

Astro's official Cloudflare adapter no longer supports Cloudflare Pages. Version
13 and later target Workers only. The required hosting is Cloudflare Pages with
Pages Functions.

Resolution, applied in Phase 1:

1. Build Astro as a static site. Do not use `@astrojs/cloudflare`.
2. Put server code in the native `functions/` directory as Pages Functions.
3. Preview the full site with `wrangler pages dev ./dist`.
4. Keep all API paths under `/api/*`.

This preserves the required stack. It removes Astro API routes as the server
mechanism. Handlers use the Pages Functions signature (`onRequestGet`,
`onRequestPost`, and so on).

`firebase-admin` is also rejected. It needs Node.js modules and gRPC that the
Workers runtime does not provide.

Replacement, already decided:

1. Verify Firebase ID tokens with `jose` against Google's public certificates.
2. Call the Firestore REST API with an OAuth 2.0 access token. Sign the service
   account assertion with `jose` (RS256). This uses Web Crypto only.
3. Verify Razorpay webhooks with Web Crypto HMAC-SHA256.

If a later phase proves that the REST approach is insufficient, stop and request
approval before changing the architecture.

### Decap CMS OAuth

Decap CMS needs an OAuth broker for GitHub login. A static Decap install does
not include one. Use a Cloudflare Pages Function as the OAuth broker:

- `GET /api/auth/github` redirects to GitHub with a state value.
- `GET /api/auth/callback` exchanges the code for a token.
- The function returns the token to the Decap popup with `postMessage`.

This needs a GitHub OAuth App (client ID + client secret) and a signed state
cookie. No paid service is required. Phase 4 must verify this flow end to end
before the instructor relies on it.

## 4. Rendering model

- Public pages are statically generated at build time.
- Protected pages (dashboard, player, instructor) render a shell. All private
  data comes from `/api/*` after token verification.
- API routes are server-rendered Cloudflare Pages Functions.
- Public course pages contain marketing copy and lesson titles only. They never
  contain paid video IDs or paid file URLs.

## 5. Trust boundaries

| Boundary                  | Rule                                                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Browser -> API            | The browser is untrusted. Send the Firebase ID token in the `Authorization: Bearer` header.                                   |
| API -> Firebase           | Verify signature, issuer, audience, expiry, and subject. Read the UID from the verified token only.                           |
| API -> Firestore          | Use a service account with least privilege. Never expose service credentials to the browser.                                  |
| API -> Razorpay           | Read the amount from Firestore. Ignore browser-supplied price. Activate access only after a signed webhook event is verified. |
| Razorpay -> webhook       | Verify HMAC signature over the raw request body. Reject invalid signatures. Process each event ID once.                       |
| Public build -> paid data | Paid YouTube IDs, paid R2 keys, and paid file URLs never enter Git, static HTML, JSON, JS bundles, or source maps.            |
| Firestore client SDK      | Deny client writes to commercial and access-control collections. Writes go through the API.                                   |

## 6. Data flow: purchase

```text
1. Student logs in with Firebase.
2. Student selects a course.
3. Browser calls POST /api/checkout/create with the course ID and ID token.
4. Function verifies the token. UID comes from the token.
5. Function reads the course price and status from Firestore.
6. Function creates an internal order (status=created) with a server timestamp.
7. Function creates a Razorpay order with the server key.
8. Function stores the Razorpay order ID and returns the checkout parameters.
9. Browser opens Razorpay Checkout.
10. Razorpay sends a signed webhook to /api/webhooks/razorpay.
11. Function verifies the signature, event ID, order, amount, currency, and payment state.
12. Function updates the order to paid and grants the enrollment in one batch.
13. Browser polls GET /api/payments/:orderId/status. It does not grant access.
```

## 7. Data flow: protected lesson

```text
1. Browser calls GET /api/lessons/:lessonId with the ID token.
2. Function verifies the token and gets the UID.
3. Function reads the lesson and checks:
   - lesson exists
   - lesson course matches the request
   - lesson status is published
   - course status is published
4. If the lesson is not a free preview, function reads the enrollment.
5. Function requires enrollment.status = active.
6. Function returns the YouTube ID and permitted resources.
7. Response uses `Cache-Control: private, no-store`.
```

Every check runs on the server. Hidden buttons and client route guards are not
security controls.

## 8. Private video limitation

YouTube Unlisted is not DRM. An authorized student can copy the video URL and
share it. The architecture prevents public exposure. It does not prevent sharing
by an authorized user, screen recording, or download. Do not claim otherwise.

## 9. Environments

| Environment | Cloudflare project       | Firebase project   | Razorpay                       |
| ----------- | ------------------------ | ------------------ | ------------------------------ |
| Local       | `wrangler pages dev`     | dev project        | test mode                      |
| Preview     | Pages preview deployment | dev project        | test mode                      |
| Production  | Pages production         | production project | live mode, only after approval |

## 10. Secrets

| Name                          | Where                                              | Public? |
| ----------------------------- | -------------------------------------------------- | ------- |
| `FIREBASE_PROJECT_ID`         | Pages env                                          | No      |
| `FIREBASE_CLIENT_EMAIL`       | Pages env                                          | No      |
| `FIREBASE_PRIVATE_KEY`        | Pages secret                                       | No      |
| `RAZORPAY_KEY_ID`             | Pages env (also sent to browser, public by design) | Yes     |
| `RAZORPAY_KEY_SECRET`         | Pages secret                                       | No      |
| `RAZORPAY_WEBHOOK_SECRET`     | Pages secret                                       | No      |
| `GITHUB_OAUTH_CLIENT_ID`      | Pages env                                          | Yes     |
| `GITHUB_OAUTH_CLIENT_SECRET`  | Pages secret                                       | No      |
| `OAUTH_STATE_SECRET`          | Pages secret                                       | No      |
| `PUBLIC_FIREBASE_API_KEY`     | Build env (public by design)                       | Yes     |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | Build env                                          | Yes     |
| `PUBLIC_FIREBASE_PROJECT_ID`  | Build env                                          | Yes     |
| `PUBLIC_RAZORPAY_KEY_ID`      | Build env                                          | Yes     |
| `R2_*` binding                | Pages binding (when enabled)                       | No      |

`.env` files are ignored. `.env.example` contains names only, never values.

## 11. Known risks

1. Free-tier limits. Firestore reads can grow with progress polling. Use one
   read per lesson load and batch progress updates.
2. Delayed or missing webhooks. Provide a reconciliation procedure and a manual
   instructor grant with audit logging.
3. Decap OAuth misconfiguration. Test before Phase 4 acceptance.
4. Price drift between build-time public pages and Firestore. Firestore is
   authoritative. Checkout always reads Firestore and displays the final amount
   in Razorpay Checkout.
5. Astro 7 is new. Pin dependency versions and run the build in CI after each
   phase.
6. YouTube ID leakage through logs. Do not log response bodies containing
   private IDs.
7. Shared authorized links. Accepted limitation of YouTube Unlisted.

## 12. Account dependencies

Required before integration phases:

- GitHub repository (exists: `kvvasu/ABHYASA`, public, empty).
- Cloudflare account with Pages and R2 access.
- Firebase project with Authentication (Email/Password, Google) and Firestore.
- Razorpay account with test keys and webhook secret.
- GitHub OAuth App for Decap CMS.
- Domain name (optional for Phase 1, required for launch).

No paid plan must be activated without approval.
