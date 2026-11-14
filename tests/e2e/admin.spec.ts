import { expect, test } from '@playwright/test';

test('admin entry point is served and noindex', async ({ request }) => {
  const response = await request.get('/admin/');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('noindex');
  expect(html).toContain('decap-cms');
});

test('admin config uses the self-hosted OAuth broker', async ({ request }) => {
  const response = await request.get('/admin/config.yml');
  expect(response.status()).toBe(200);
  const config = await response.text();
  expect(config).toContain('auth_endpoint: /api/auth/github');
  expect(config).toContain('folder: src/content/courses');
  expect(config).toContain('publish_mode: editorial_workflow');
});

test('oauth start reports missing configuration instead of leaking details', async ({ request }) => {
  const response = await request.get('/api/auth/github', { maxRedirects: 0 });
  expect([302, 500]).toContain(response.status());
  if (response.status() === 500) {
    expect(await response.text()).toBe('GitHub OAuth is not configured.');
  }
});
