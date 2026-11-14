import { describe, expect, it, vi } from 'vitest';
import {
  createState,
  renderCallback,
  STATE_MAX_AGE_SECONDS,
  verifyState,
} from '../../src/lib/oauth';
import { onRequestGet as startAuth } from '../../functions/api/auth/github';
import { onRequestGet as finishAuth } from '../../functions/api/auth/callback';

const SECRET = 'test-state-secret';
const env = {
  GITHUB_OAUTH_CLIENT_ID: 'client-id',
  GITHUB_OAUTH_CLIENT_SECRET: 'client-secret',
  OAUTH_STATE_SECRET: SECRET,
};

describe('OAuth state', () => {
  it('accepts a fresh signed state', async () => {
    const state = await createState(SECRET);
    await expect(verifyState(state, SECRET)).resolves.toBe(true);
  });

  it('rejects tampering, wrong secrets, and stale states', async () => {
    const now = Date.now();
    const state = await createState(SECRET, now);

    await expect(verifyState(`${state}x`, SECRET, now)).resolves.toBe(false);
    await expect(verifyState(state, 'other-secret', now)).resolves.toBe(false);
    await expect(
      verifyState(state, SECRET, now + (STATE_MAX_AGE_SECONDS + 1) * 1000),
    ).resolves.toBe(false);
  });
});

describe('OAuth callback page', () => {
  it('escapes script content and targets the site origin', () => {
    const html = renderCallback(
      'error',
      { message: '</script><script>alert(1)</script>' },
      'https://site.test',
    );
    expect(html).not.toContain('</script><script>alert(1)');
    expect(html).toContain('https://site.test');
    expect(html).toContain('authorization:github:error');
  });
});

describe('GitHub OAuth functions', () => {
  it('redirects to GitHub with state and a scoped cookie', async () => {
    const request = new Request('https://site.test/api/auth/github');
    const response = (await startAuth({ request, env } as never)) as Response;

    expect(response.status).toBe(302);
    const location = new URL(response.headers.get('location') ?? '');
    expect(location.origin).toBe('https://github.com');
    expect(location.searchParams.get('client_id')).toBe('client-id');
    expect(location.searchParams.get('redirect_uri')).toBe('https://site.test/api/auth/callback');
    expect(location.searchParams.get('scope')).toBe('public_repo');

    const cookie = response.headers.get('set-cookie') ?? '';
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    const state = location.searchParams.get('state') ?? '';
    expect(cookie).toContain(state);
    await expect(verifyState(state, SECRET)).resolves.toBe(true);
  });

  it('rejects a callback without a matching state cookie', async () => {
    const request = new Request('https://site.test/api/auth/callback?code=abc&state=wrong');
    const response = (await finishAuth({ request, env } as never)) as Response;

    expect(response.status).toBe(400);
    expect(await response.text()).toContain('authorization:github:error');
  });

  it('exchanges a valid code for a token', async () => {
    const state = await createState(SECRET);
    const request = new Request(`https://site.test/api/auth/callback?code=abc&state=${state}`, {
      headers: { cookie: `decap_oauth_state=${state}` },
    });
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ access_token: 'gho_test_token' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const response = (await finishAuth({ request, env } as never)) as Response;
    const body = await response.text();

    vi.unstubAllGlobals();
    expect(response.status).toBe(200);
    expect(body).toContain('authorization:github:success');
    expect(body).toContain('gho_test_token');
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
  });
});
