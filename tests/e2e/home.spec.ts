import { expect, test } from '@playwright/test';

test('home page renders the foundation', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/ServiceNow Learn Easy/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('ServiceNow training');
  await expect(page.getByRole('link', { name: 'Health check' })).toBeVisible();
});

test('health endpoint returns ok', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: 'ok', version: '0.1.0' });
});
