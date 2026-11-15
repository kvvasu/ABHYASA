# Content Management

Public course content is Markdown in `src/content/courses/`. Astro validates it
with the schema in `src/content.config.ts`. Decap CMS edits the same files at
`/admin/`.

## GitHub authentication on Cloudflare Pages

Selected method: **self-hosted GitHub OAuth through Cloudflare Pages Functions**
(ADR-009). No Netlify Identity, no Git Gateway, no third-party OAuth broker.

This is the smallest option that works on Cloudflare Pages: two Functions, one
GitHub OAuth App, no paid service. Decap's own GitHub backend accepts a custom
`auth_endpoint`, which is this Function. External brokers (DecapBridge) and
Netlify Identity were rejected because they add a third-party or extra-platform
dependency for the same result.

### CMS media configuration

Decap CMS 3.17.3 validates `config.yml` against an embedded JSON schema. The
schema requires either a top-level `media_folder` or `media_library`; omitting
both causes `/admin/` to report "Error loading the CMS configuration" with
`media_folder` / `media_library` required-property errors.

This CMS uses the built-in media folder, not a third-party library:

```yaml
media_folder: public/uploads/public
public_folder: /uploads/public
```

This path serves public marketing assets only. It is outside the Markdown course
collection. Never upload paid files, private video IDs, student data, or secrets.
No media upload workflow is enabled for course fields; the folder exists to
satisfy Decap's schema and to make any future public assets explicit. A future
change to paid/private media requires a separate access-controlled design.

Decap's GitHub backend needs a server to hold the client secret. Cloudflare Pages
Functions provide that server on the same origin as the site:

| Route                | Function                         | Purpose                                            |
| -------------------- | -------------------------------- | -------------------------------------------------- |
| `/api/auth/github`   | `functions/api/auth/github.ts`   | Set a signed state cookie, redirect to GitHub.     |
| `/api/auth/callback` | `functions/api/auth/callback.ts` | Verify state, exchange the code, answer the popup. |

Flow:

1. Decap opens `/api/auth/github` in a popup.
2. The function creates a random state with an HMAC signature and a 10 minute
   issue time. It stores the value in an `HttpOnly`, `SameSite=Lax` cookie with
   `Path=/api/auth`, then redirects to GitHub.
3. GitHub returns to `/api/auth/callback?code=...&state=...`.
4. The function checks the state against the cookie and the signature, exchanges
   the code for an access token, and returns an HTML page.
5. That page posts `authorization:github:success:{token,provider}` to the opener
   only after a message comes from the opener window at the exact site origin.
   Decap then calls the GitHub API directly with the user's token.

No client secret or token is stored in the static build.

## GitHub OAuth App configuration

Create an OAuth App at <https://github.com/settings/developers>:

| Setting          | Value                                     |
| ---------------- | ----------------------------------------- |
| Application name | `ServiceNow Learn Easy CMS`               |
| Homepage URL     | `https://servicenow-learn-easy.pages.dev` |

Register the exact callback URL for each environment:

```text
Production: https://servicenow-learn-easy.pages.dev/api/auth/callback
Preview:    https://feature-phase-04-content-man.servicenow-learn-easy.pages.dev/api/auth/callback
```

GitHub documents up to 10 callback URLs per OAuth App. Add both to one app if
its settings allow it; otherwise use a separate preview OAuth App. Do not enable
wildcard matching. The auth-start Function uses the request host to construct
`redirect_uri`, and the callback exchange sends that exact URI; each must match
a registered callback.

| Setting                | Preview value                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| Application name       | `ServiceNow Learn Easy CMS Preview`                                                      |
| Homepage URL           | `https://feature-phase-04-content-man.servicenow-learn-easy.pages.dev`                   |
| Authorization callback | `https://feature-phase-04-content-man.servicenow-learn-easy.pages.dev/api/auth/callback` |

Use that app's client ID and secret only in the Cloudflare Preview environment.
GitHub's expiring user-authorization tokens require refresh-token handling, which
this broker does not implement. If the OAuth App enables token expiration, editors
will need to reauthorize after expiry; disable expiration if that option is
available and persistent CMS sessions are required.

In Cloudflare, open **Workers & Pages → servicenow-learn-easy → Settings →
Variables and Secrets**. Set the four values below for the **Preview** environment
only; do not change Production settings or the production branch:

| Variable                     | Type   | Preview value                                                          |
| ---------------------------- | ------ | ---------------------------------------------------------------------- |
| `CMS_SITE_URL`               | Plain  | `https://feature-phase-04-content-man.servicenow-learn-easy.pages.dev` |
| `GITHUB_OAUTH_CLIENT_ID`     | Plain  | Existing App ID (or separate Preview App ID)                           |
| `GITHUB_OAUTH_CLIENT_SECRET` | Secret | Existing App secret (or separate Preview App secret)                   |
| `OAUTH_STATE_SECRET`         | Secret | New random value of at least 32 bytes                                  |

Set Preview variables so they are available during the build and to Pages
Functions. The build substitutes `CMS_SITE_URL` into generated
`dist/admin/config.yml` as `base_url` and `site_domain`; auth functions reject
requests whose host differs from the **runtime** `CMS_SITE_URL` binding. Configure
its same value in both Preview build and runtime settings. Without the build value,
checked-in config defaults to production. Cloudflare requires a new deployment for changed build
variables to take effect; trigger a Preview deployment from the feature branch.
Production settings and deployment remain unchanged.
`OAUTH_STATE_SECRET` can be generated with `openssl rand -hex 32`; never paste or
commit its value. Rotating it invalidates in-progress logins only.

For local Pages Functions, copy `.dev.vars.example` to `.dev.vars` and fill the
three OAuth values. Its `CMS_SITE_URL` defaults to `http://127.0.0.1:8788`, the
default `npm run preview` URL. The E2E server uses port `4321`; for real login
there, set `CMS_SITE_URL=http://127.0.0.1:4321` in both the build environment and
`.dev.vars`, and register that exact callback URL in the OAuth App.

### Constraints

- GitHub documents up to 10 callbacks per OAuth App. Register exact hosts only;
  never use wildcard callbacks.
- Moving to a custom domain requires updating the OAuth callback URL and
  `CMS_SITE_URL` for that deployment; the build sets `base_url` and `site_domain`.
- The OAuth scope is `public_repo`, enough for this public repository. A private
  repository needs the broader `repo` scope in `functions/api/auth/github.ts`.
- Only GitHub users with push access can publish. Decap's editorial workflow
  opens a pull request; it never commits to `develop` directly.

### Security risks

Full analysis is in ADR-009. Summary:

| Risk                                 | Mitigation                                                               |
| ------------------------------------ | ------------------------------------------------------------------------ |
| Client secret leaks                  | Store only as a Cloudflare secret; use it only in the server exchange.   |
| Access token read by injected script | Post only to the exact site origin; no third-party scripts on `/admin/`. |
| Broad scope (`public_repo`)          | Restrict CMS use to repository collaborators with push access.           |
| Login CSRF or replayed callback      | Signed 10-minute state bound to an `HttpOnly`, `SameSite=Lax` cookie.    |
| Preview host cannot log in           | Register that exact host's callback URL; no wildcard callback.           |
| Token in browser storage             | Accepted for Decap; add a Content Security Policy in a later phase.      |
| Expiring GitHub access token         | Disable expiration until refresh-token rotation is implemented.          |

Do not add analytics, widgets, or other third-party scripts to `/admin/`. Pinning
the Decap CDN version limits supply-chain drift; the pin is the version recorded
in `docs/ARCHITECTURE.md`.

### Verification status

The flow is implemented and unit tested: state signing and expiry, tampering
rejection, redirect parameters, cookie attributes, invalid callback rejection,
and token exchange. A live login was not completed because this workspace has no
GitHub OAuth App credentials or Cloudflare account access. Complete the account
steps above and test `/admin/` on the deployed site before relying on the CMS.

Current feature preview: <https://feature-phase-04-content-man.servicenow-learn-easy.pages.dev>.
It serves the Phase 4 handlers, but currently returns 500 because Preview OAuth
variables are not configured. Production `develop` still returns its custom 404
at `/api/auth/github`. This is expected until the feature branch is deployed with
its Functions and the CMS's build-time origin points at that same preview.

After configuring the OAuth callbacks and Cloudflare Preview variables above,
test the preview end-to-end: the popup opens GitHub, callback returns to the
preview, Decap shows the signed-in account, saving a draft creates a PR targeting
`develop`, and the `develop` ref remains unchanged. Do not treat the presence of
an editorial workflow setting alone as verification that the OAuth user's token
can create PRs.

## Public and private content

| Data                                         | Location                        |
| -------------------------------------------- | ------------------------------- |
| Course titles, summaries, outlines, outcomes | Git Markdown, editable in Decap |
| Sample prices shown on public pages          | Git Markdown                    |
| Real checkout price, payment status          | Firestore, later phase          |
| YouTube video IDs and paid resource keys     | Server-side store, later phase  |
| Enrollments, progress, student data          | Firestore, later phase          |

Rules:

- Never put video IDs, paid file URLs, service credentials, or student data in
  `src/content/`, `public/`, or the Decap config.
- Checkout must read the real price from the server. The Markdown price is display
  copy only.
- A unit test scans course Markdown for YouTube URLs, `videoId`, R2 hosts, and
  credential names. It fails the suite if private data appears.

## Course and module ordering

- Courses: the `order` integer in frontmatter is authoritative. The catalog and
  every course list sort ascending by `order`, then by title as a tie-breaker.
  Set `order` in Decap's number field; do not rely on file names.
- Modules: the order of the `modules` array in frontmatter is authoritative. The
  course page numbers modules in that order.
- Lessons: the order of each module's `lessons` array is authoritative.

Decap's list widget keeps array order on save. Reorder modules or lessons by
dragging list items, then confirm the generated YAML before publishing.

## Editing workflow

1. Open `/admin/` on the production site and sign in with GitHub. During preview
   validation, use the feature-preview URL listed above instead.
2. Edit a course.
3. Save. With `publish_mode: editorial_workflow`, Decap creates a branch and a
   pull request into `develop`.
4. Review the PR, run tests, and merge. Cloudflare Pages rebuilds the site.

Decap's GitHub backend requires push access to the repository. The site owner
should stay the only collaborator until an editor role is defined.

## Local content editing

Decap can run against a local Git checkout with `decap-server`:

```bash
npx decap-server
npm run dev
```

Set `local_backend: true` in `public/admin/config.yml` while testing locally, then
remove it before committing. Do not commit `.dev.vars`.
