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

`wrangler.jsonc` sets the Pages output directory and compatibility date.

## Local full-stack preview

```bash
npm run build
npm run preview
```

`wrangler pages dev ./dist` serves static assets from `dist` and Functions from
`functions/`. Default port is 8788.

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
