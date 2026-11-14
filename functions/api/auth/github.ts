import { createState, STATE_MAX_AGE_SECONDS } from '../../../src/lib/oauth';

interface Env {
  GITHUB_OAUTH_CLIENT_ID: string;
  OAUTH_STATE_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.GITHUB_OAUTH_CLIENT_ID || !env.OAUTH_STATE_SECRET) {
    return new Response('GitHub OAuth is not configured.', { status: 500 });
  }

  const url = new URL(request.url);
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
