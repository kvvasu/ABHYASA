import { expect, test } from '@playwright/test';

test('admin entry point is served and noindex', async ({ request }) => {
  const response = await request.get('/admin/');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('noindex');
  expect(html).toContain('decap-cms@3.17.3');
});

test('Decap loads the configuration and shows login without configuration errors', async ({
  page,
}) => {
  await page.goto('/admin/');
  await expect(page.getByRole('button', { name: /login with github/i })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText(/error loading the cms configuration/i)).toHaveCount(0);
});

test('admin config uses the self-hosted OAuth broker', async ({ request }) => {
  const response = await request.get('/admin/config.yml');
  expect(response.status()).toBe(200);
  const config = await response.text();
  expect(config).toContain('base_url: http://127.0.0.1:4321');
  expect(config).toContain('site_domain: http://127.0.0.1:4321');
  expect(config).toContain('auth_endpoint: /api/auth/github');
  expect(config).toMatch(/base_url: https?:\/\/.+/);
  expect(config).toMatch(/site_domain: https?:\/\/.+/);
  expect(config).toContain('folder: src/content/courses');
  expect(config).toContain('publish_mode: editorial_workflow');
});

test('admin config satisfies the top-level media requirement', async ({ request }) => {
  const response = await request.get('/admin/config.yml');
  expect(response.status()).toBe(200);
  const config = await response.text();
  // Decap 3.17.3 fails with "config must have required property 'media_folder'"
  // unless media_folder or media_library is set at the top level.
  expect(config).toMatch(/^media_folder: public\/uploads\/public$/m);
  expect(config).toMatch(/^public_folder: \/uploads\/public$/m);
  expect(config).not.toMatch(/^\s+media_folder:/m);
  expect(config).not.toMatch(/^\s+media_library:/m);
});

test('oauth start fails closed without matching host configuration', async ({ request }) => {
  const response = await request.get('/api/auth/github', { maxRedirects: 0 });
  expect(response.status()).toBe(500);
  expect(await response.text()).toBe('GitHub OAuth is not configured for this host.');
});
