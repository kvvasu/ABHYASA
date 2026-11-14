import { expect, test } from '@playwright/test';

test('design system preview renders foundations and components', async ({ page }) => {
  await page.goto('/design');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'editorial learning interface',
  );
  await expect(page.getByRole('heading', { name: 'Color', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Buttons', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Primary action' })).toBeVisible();
  await expect(page.getByRole('alert').first()).toBeVisible();
});

test('keyboard focus starts at the skip link and reaches actions', async ({ page }) => {
  await page.goto('/design');
  await page.keyboard.press('Tab');

  const skipLink = page.getByRole('link', { name: 'Skip to content' });
  await expect(skipLink).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('accordion opens with the keyboard', async ({ page }) => {
  await page.goto('/design');
  const summary = page.locator('summary', { hasText: 'Are the videos live or recorded?' });
  await summary.focus();
  await page.keyboard.press('Enter');

  await expect(page.getByText('Recorded lessons with optional study notes.')).toBeVisible();
});

test('mobile navigation opens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/design');

  const menu = page.locator('header details');
  await menu.locator('summary').click();
  await expect(menu.getByRole('link', { name: 'Courses', exact: true })).toBeVisible();
});
