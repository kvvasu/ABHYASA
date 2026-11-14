# Test Results

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
