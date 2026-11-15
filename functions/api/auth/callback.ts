import { renderCallback, verifyState } from '../../../src/lib/oauth';

interface Env {
  CMS_SITE_URL: string;
  GITHUB_OAUTH_CLIENT_ID: string;
  GITHUB_OAUTH_CLIENT_SECRET: string;
  OAUTH_STATE_SECRET: string;
}

const html = { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' };

function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return undefined;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookie = readCookie(request.headers.get('cookie'), 'decap_oauth_state');
  const clearCookie = `decap_oauth_state=; Path=/api/auth; HttpOnly; SameSite=Lax; Max-Age=0${url.protocol === 'https:' ? '; Secure' : ''}`;

  if (
    !env.CMS_SITE_URL ||
    origin !== env.CMS_SITE_URL ||
    !env.GITHUB_OAUTH_CLIENT_ID ||
    !env.GITHUB_OAUTH_CLIENT_SECRET ||
    !env.OAUTH_STATE_SECRET
  ) {
    return new Response('GitHub OAuth is not configured for this host.', { status: 500 });
  }

  if (
    !code ||
    !state ||
    !cookie ||
    state !== cookie ||
    !(await verifyState(state, env.OAUTH_STATE_SECRET))
  ) {
    return new Response(
      renderCallback('error', { message: 'Invalid or expired OAuth state.' }, origin),
      { status: 400, headers: { ...html, 'set-cookie': clearCookie } },
    );
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent': 'servicenow-learn-easy-decap-oauth',
      },
      body: new URLSearchParams({
        client_id: env.GITHUB_OAUTH_CLIENT_ID,
        client_secret: env.GITHUB_OAUTH_CLIENT_SECRET,
        code,
        redirect_uri: `${origin}/api/auth/callback`,
      }),
    });

    const result = (await tokenResponse.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenResponse.ok || !result.access_token) {
      return new Response(
        renderCallback(
          'error',
          { message: result.error_description ?? result.error ?? 'Token exchange failed.' },
          origin,
        ),
        { status: 401, headers: { ...html, 'set-cookie': clearCookie } },
      );
    }

    return new Response(
      renderCallback('success', { token: result.access_token, provider: 'github' }, origin),
      { status: 200, headers: { ...html, 'set-cookie': clearCookie } },
    );
  } catch {
    return new Response(
      renderCallback('error', { message: 'GitHub token exchange failed.' }, origin),
      { status: 502, headers: { ...html, 'set-cookie': clearCookie } },
    );
  }
};
