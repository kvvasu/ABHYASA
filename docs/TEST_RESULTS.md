# Test Results

## Phase 4 — CMS config fix — 2026-11-14

Environment: Node 24.19.0, npm 11.17.0, Linux (WSL), Chromium 159 headless,
Wrangler 4.162.0.

| Check                   | Command                    | Result                                                                    |
| ----------------------- | -------------------------- | ------------------------------------------------------------------------- |
| Type and Astro check    | `npm run check`            | Pass. 0 errors, 0 warnings, 0 hints (49 files).                           |
| Unit tests              | `npm test`                 | Pass. 4 files, 19 tests.                                                  |
| Lint                    | `npm run lint`             | Pass.                                                                     |
| Format check            | `npm run format:check`     | Pass.                                                                     |
| Production build        | `npm run build`            | Pass. 15 pages.                                                           |
| Browser tests           | `npm run test:e2e`         | Pass. 29 tests in Chromium through local Cloudflare Pages preview.        |
| Live CMS config         | Chromium `/admin/`         | Pass. Decap shows "Login with GitHub"; no config error or browser errors. |
| Live GitHub OAuth login | `/admin/` on deployed site | Not run. Credentials and deployed OAuth App unavailable.                  |

Current fix verification: `npm run check`, `npm run lint`, `npm run format:check`,
`npm test`, `npm run build`, `npm run scan:public`, and `npm run test:e2e` all
pass after the configuration change. The E2E suite now includes a real browser
assertion that Decap reaches its GitHub login screen without config errors.

The unit regression test parses `public/admin/config.yml`, checks the exact
Decap 3.17.3 pin, and asserts that `media_folder` exists at the top level, points
to `public/uploads/public`, and remains outside `src/content/courses`. It also
checks the backend, editorial workflow, course collection, and absence of private
fields. The browser test verifies the served config retains the top-level media
settings. Live GitHub OAuth is not tested or claimed to work.

## Phase 4 — Initial implementation — 2026-11-14

Environment: Node 24.19.0, npm 11.17.0, Linux (WSL), Chromium 159 headless,
Wrangler 4.162.0.

| Check                       | Command                                 | Result                                                                                 |
| --------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------- |
| Type and Astro check        | `npm run check`                         | Pass. 0 errors, 0 warnings, 0 hints (48 files).                                        |
| Unit tests                  | `npm test`                              | Pass. 3 files, 12 tests.                                                               |
| Lint                        | `npm run lint`                          | Pass.                                                                                  |
| Format check                | `npm run format:check`                  | Pass.                                                                                  |
| Production build            | `npm run build`                         | Pass. 15 pages generated from Markdown collections.                                    |
| Browser tests               | `npm run test:e2e`                      | Pass. 27 tests in Chromium through `wrangler pages dev`.                               |
| Public output scan          | `npm run scan:public`                   | Pass. 33 files in `dist/`; no video IDs, R2 hosts, keys, or secret names.              |
| Secret scan (tracked files) | `git grep` token/key patterns           | Pass. No token prefixes, private key blocks, or filled secret values. See notes.       |
| OAuth redirect integration  | `wrangler pages dev` with mock bindings | Pass. 302 to GitHub with client ID, callback, `public_repo`, signed state, and cookie. |
| Live GitHub OAuth login     | `/admin/` on a deployed site            | Not run. No OAuth App or Cloudflare secrets; cannot be tested from this workspace.     |

Notes:

- Unit tests cover content privacy, sample flags, Decap config, OAuth state
  signing and expiry, tampering and wrong-secret rejection, redirect parameters,
  cookie attributes, callback script escaping, and token exchange handling.
- Browser tests cover the admin entry point, admin config serving, missing OAuth
  configuration, catalog course order, module order, and every public route.
- The OAuth integration check used fake bindings for the client ID, client secret,
  and state secret. It proves the redirect and cookie path in the Pages Functions
  runtime. It does not prove a real GitHub token exchange or Decap login.
- `gitleaks` and `trufflehog` are not installed. The secret scan used `git grep`
  patterns for GitHub, Google, Razorpay, and Stripe token prefixes, private key
  blocks, and long secret assignments. Install `gitleaks` in CI for entropy
  scanning.
- No test was skipped.

## Phase 3 — 2026-11-14

Environment: Node 24.19.0, npm 11.17.0, Linux (WSL), Chromium 159 headless.

| Check                | Command                              | Result                                      |
| -------------------- | ------------------------------------ | ------------------------------------------- |
| Type and Astro check | `npm run check`                      | Pass. 0 errors, 0 warnings (39 files).      |
| Unit test            | `npm test`                           | Pass. 1 file, 1 test.                       |
| Lint                 | `npm run lint`                       | Pass.                                       |
| Format check         | `npm run format:check`               | Pass.                                       |
| Production build     | `npm run build`                      | Pass. Static output for all public routes.  |
| Browser tests        | `npm run test:e2e`                   | Pass. 22 tests in Chromium.                 |
| Visual review        | Screenshots at 1440×1000 and 390×844 | Checked. Home, catalog, detail, contact.    |
| Mobile overflow      | Playwright at 390×844                | Pass on Home, catalog, detail, and contact. |

Notes:

- Browser tests cover all public routes, one `h1` per page, description and
  canonical metadata, sample notices, draft legal notices, the disabled contact
  form, the 404 page, public navigation auth hiding, mobile navigation, and
  horizontal overflow.
- The final full suite was run after the last source change.
- The preview server was reused for the final browser run.

## Phase 2 — 2026-11-14

Environment: Node 24.19.0, npm 11.17.0, Linux (WSL), Chromium 159 headless.

| Check                | Command                             | Result                                      |
| -------------------- | ----------------------------------- | ------------------------------------------- |
| Type and Astro check | `npm run check`                     | Pass. 0 errors, 0 warnings.                 |
| Unit test            | `npm test`                          | Pass. 1 file, 1 test.                       |
| Lint                 | `npm run lint`                      | Pass.                                       |
| Format check         | `npm run format:check`              | Pass.                                       |
| Production build     | `npm run build`                     | Pass.                                       |
| Browser tests        | `npm run test:e2e`                  | Pass. 6 tests in Chromium.                  |
| Visual review        | Screenshots at 1440×900 and 390×844 | Checked. Desktop and mobile layouts render. |
| Keyboard review      | Skip link, mobile menu, accordion   | Pass.                                       |

Notes:

- Browser tests cover the design preview, skip link focus, accordion keyboard
  operation, mobile navigation, home page, and health endpoint.
- Focused tests were run first; the final full run is recorded after the last
  change.

## Phase 1 — 2026-11-14

Environment: Node 24.19.0, npm 11.17.0, Linux (WSL), Chromium 159 headless.

| Check                | Command                                 | Result                                               |
| -------------------- | --------------------------------------- | ---------------------------------------------------- |
| Type and Astro check | `npm run check`                         | Pass. 0 errors, 0 warnings, 0 hints (12 files).      |
| Unit test            | `npm test`                              | Pass. 1 file, 1 test.                                |
| Lint                 | `npm run lint`                          | Pass. No findings.                                   |
| Format check         | `npm run format:check`                  | Pass.                                                |
| Production build     | `npm run build`                         | Pass. `dist/index.html` and assets generated.        |
| Browser tests        | `npm run test:e2e`                      | Pass. 2 tests in Chromium.                           |
| Health endpoint      | `curl http://127.0.0.1:4321/api/health` | Pass. HTTP 200, `{"status":"ok","version":"0.1.0"}`. |

Notes:

- Playwright builds the site and starts `wrangler pages dev` before the browser
  tests. This tests the Pages Functions runtime, not only Astro dev.
- Astro dev does not serve Pages Functions. Use `npm run preview` for `/api/*`.
