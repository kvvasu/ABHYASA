import { createState, STATE_MAX_AGE_SECONDS } from '../../../src/lib/oauth';

interface Env {
  CMS_SITE_URL: string;
  GITHUB_OAUTH_CLIENT_ID: string;
  GITHUB_OAUTH_CLIENT_SECRET: string;
  OAUTH_STATE_SECRET: string;
}

const PREVIEW_DIAGNOSTIC_ORIGIN =
  'https://feature-phase-04-content-man.servicenow-learn-easy.pages.dev';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  if (url.origin === PREVIEW_DIAGNOSTIC_ORIGIN) {
    const bindings = {
      CMS_SITE_URL: env.CMS_SITE_URL,
      GITHUB_OAUTH_CLIENT_ID: env.GITHUB_OAUTH_CLIENT_ID,
      GITHUB_OAUTH_CLIENT_SECRET: env.GITHUB_OAUTH_CLIENT_SECRET,
      OAUTH_STATE_SECRET: env.OAUTH_STATE_SECRET,
    };
    console.info('oauth-runtime-diagnostic', {
      bindings: Object.fromEntries(
        Object.entries(bindings).map(([name, value]) => [
          name,
          { present: typeof value === 'string' && value.length > 0, type: typeof value },
        ]),
      ),
      cmsSiteUrlMatchesRequestOrigin: url.origin === env.CMS_SITE_URL,
    });
  }

  if (
    !env.CMS_SITE_URL ||
    url.origin !== env.CMS_SITE_URL ||
    !env.GITHUB_OAUTH_CLIENT_ID ||
    !env.OAUTH_STATE_SECRET
  ) {
    return new Response('GitHub OAuth is not configured for this host.', { status: 500 });
  }

  const state = await createState(env.OAUTH_STATE_SECRET);
  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', env.GITHUB_OAUTH_CLIENT_ID);
  authorize.searchParams.set('redirect_uri', `${url.origin}/api/auth/callback`);
  authorize.searchParams.set('scope', 'public_repo');
  authorize.searchParams.set('state', state);

  const secure = url.protocol === 'https:' ? '; Secure' : '';
  return new Response(null, {
    status: 302,
    headers: {
      location: authorize.href,
      'set-cookie': `decap_oauth_state=${state}; Path=/api/auth; HttpOnly; SameSite=Lax; Max-Age=${STATE_MAX_AGE_SECONDS}${secure}`,
      'cache-control': 'no-store',
    },
  });
};
