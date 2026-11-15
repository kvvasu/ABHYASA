# Deployment

Target: Cloudflare Pages with native Pages Functions. No paid plan is required
inside free limits.

## Build settings

| Setting                | Value                 |
| ---------------------- | --------------------- |
| Framework preset       | Astro                 |
| Build command          | `npm run build`       |
| Build output directory | `dist`                |
| Functions directory    | `functions` (default) |
| Node version           | 22 or newer           |

`wrangler.jsonc` sets the Pages output directory and compatibility date; it does
not configure build environment variable injection. Cloudflare Pages provides
`CF_PAGES_BRANCH` and `CF_PAGES_URL` during builds. The CMS config build script
uses these to select a Preview hostname when `CMS_SITE_URL` is unavailable; an
explicit `CMS_SITE_URL` remains authoritative.

## Local full-stack preview

```bash
npm run build
npm run preview
```

`wrangler pages dev ./dist` serves static assets from `dist` and Functions from
`functions/`. Default port is 8788.

## Content changes

Public content flows through Git; the site rebuilds from the merged commit.

1. An editor saves a draft at `/admin/`. Decap creates a branch and a pull request
   into `develop` (editorial workflow). Nothing is published yet.
2. Review the pull request. Run `npm run check`, `npm test`, `npm run build`, and
   `npm run scan:public`.
3. Merge into `develop`. A pull request into the production branch triggers the
   Pages build after the Git integration is connected.
4. Pages runs `npm run build` and deploys `dist/` with `functions/`. Content is
   static after that build.

Until the Cloudflare Pages Git integration is connected (account access is
blocked), step 4 is manual from an approved commit:

```bash
npm ci
npm run build
npm run scan:public
npm run deploy
```

Never edit content in the Cloudflare dashboard. Markdown in Git is the source of
truth. Private lesson data never enters this workflow.

## Secrets

Set production secrets in Cloudflare Pages, not in Git:

```bash
npx wrangler pages secret put FIREBASE_PRIVATE_KEY
npx wrangler pages secret put RAZORPAY_KEY_SECRET
npx wrangler pages secret put RAZORPAY_WEBHOOK_SECRET
npx wrangler pages secret put GITHUB_OAUTH_CLIENT_SECRET
npx wrangler pages secret put OAUTH_STATE_SECRET
```

Public build variables (`PUBLIC_*`) are configured as Pages environment
variables. They are visible to the browser by design.

## Deployment approval

Do not connect a production domain or activate live Razorpay keys until Phase 12
approval. Preview deployments may use test credentials only.
