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
   only when the opener origin matches the site origin. Decap then calls the
   GitHub API directly with the user's token.

No client secret or token is stored in the static build.

## GitHub OAuth App configuration

Create one OAuth App at <https://github.com/settings/developers>:

| Setting                | Value                                                       |
| ---------------------- | ----------------------------------------------------------- |
| Application name       | `ServiceNow Learn Easy CMS`                                 |
| Homepage URL           | `https://servicenow-learn-easy.pages.dev`                   |
| Authorization callback | `https://servicenow-learn-easy.pages.dev/api/auth/callback` |

Then set these variables on the Cloudflare Pages project:

| Variable                     | Type   | Environments |
| ---------------------------- | ------ | ------------ |
| `GITHUB_OAUTH_CLIENT_ID`     | Plain  | Production   |
| `GITHUB_OAUTH_CLIENT_SECRET` | Secret | Production   |
| `OAUTH_STATE_SECRET`         | Secret | Production   |

`OAUTH_STATE_SECRET` is any random value of 32 bytes or more. Generate one with
`openssl rand -hex 32`. Rotating it invalidates in-progress logins only.

CLI equivalent:

```bash
npx wrangler pages secret put GITHUB_OAUTH_CLIENT_SECRET
npx wrangler pages secret put OAUTH_STATE_SECRET
```

For local Pages Functions, copy `.dev.vars.example` to `.dev.vars` and fill the
three values. Wrangler reads `.dev.vars` during `npm run preview`.

### Constraints

- GitHub OAuth Apps allow one callback URL. Logins therefore work only on the
  configured host. Cloudflare preview deployments with generated hostnames
  cannot complete the popup flow unless a separate OAuth App is created for them.
- Moving to a custom domain requires updating the callback URL, `base_url`, and
  `site_domain` in `public/admin/config.yml`.
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
| Preview host cannot log in           | One callback URL per OAuth App; use a second App for previews if needed. |
| Token in browser storage             | Accepted for Decap; add a Content Security Policy in a later phase.      |

Do not add analytics, widgets, or other third-party scripts to `/admin/`. Pinning
the Decap CDN version limits supply-chain drift; the pin is the version recorded
in `docs/ARCHITECTURE.md`.

### Verification status

The flow is implemented and unit tested: state signing and expiry, tampering
rejection, redirect parameters, cookie attributes, invalid callback rejection,
and token exchange. A live login was not completed because this workspace has no
GitHub OAuth App credentials or Cloudflare account access. Complete the account
steps above and test `/admin/` on the deployed site before relying on the CMS.

The live check must confirm: the popup opens GitHub, the callback returns to the
site, Decap shows the signed-in account, a saved draft creates a pull request, and
`develop` is unchanged until that pull request is merged.

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

1. Open `/admin/` on the production site and sign in with GitHub.
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
