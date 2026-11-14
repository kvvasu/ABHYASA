import { expect, test } from '@playwright/test';

const pages = [
  { path: '/', heading: /Learn ServiceNow by doing the work/ },
  { path: '/courses', heading: /courses\. One practical path/ },
  { path: '/courses/servicenow-itsm-fundamentals', heading: /ServiceNow ITSM Fundamentals/ },
  { path: '/about', heading: /Practical teaching/ },
  { path: '/faq', heading: /Answers before you enroll/ },
  { path: '/contact', heading: /Send a clear question/ },
  { path: '/privacy', heading: /Privacy Policy/ },
  { path: '/terms', heading: /Terms and Conditions/ },
  { path: '/refund', heading: /Refund Policy/ },
];

for (const { path, heading } of pages) {
  test(`public page ${path} renders one h1 and metadata`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(heading);

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description?.length ?? 0).toBeGreaterThan(20);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain(path === '/' ? '' : path);
  });
}

test('catalog lists every sample course', async ({ page }) => {
  await page.goto('/courses');
  const cards = page.locator('main h3');
  await expect(cards).toHaveCount(5);
  await expect(page.getByText('Sample course content for review.')).toBeVisible();
});

test('catalog follows the Markdown course order', async ({ page }) => {
  await page.goto('/courses');
  await expect(page.locator('main h3')).toHaveText([
    'ServiceNow ITSM Fundamentals',
    'ServiceNow ITOM Discovery',
    'ServiceNow CMDB and IRE',
    'ServiceNow Event Management',
    'ServiceNow HRSD',
  ]);
});

test('course modules follow the Markdown order', async ({ page }) => {
  await page.goto('/courses/servicenow-itsm-fundamentals');
  await expect(page.locator('main summary')).toHaveText([
    /Getting started/,
    /Incident Management/,
    /Problem Management/,
    /Change Management/,
    /Knowledge Management/,
    /Wrap-up/,
  ]);
});

test('course detail shows curriculum and sample notices', async ({ page }) => {
  await page.goto('/courses/servicenow-itsm-fundamentals');
  await expect(page.getByText('Sample price')).toBeVisible();
  await expect(page.getByText('Sample content').first()).toBeVisible();
  await expect(page.locator('summary', { hasText: 'Incident Management' })).toBeVisible();
});

test('legal pages carry a draft notice', async ({ page }) => {
  for (const path of ['/privacy', '/terms', '/refund']) {
    await page.goto(path);
    await expect(page.getByText('Draft for review')).toBeVisible();
  }
});

test('contact form is disabled and explains why', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.getByRole('button', { name: 'Send message' })).toBeDisabled();
  await expect(
    page.getByText('Sending is disabled until the contact API is connected.'),
  ).toBeVisible();
});

test('unknown route returns the 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('That page is not here');
  const robots = await page.locator('meta[name="robots"]').getAttribute('content');
  expect(robots).toContain('noindex');
});

test('public navigation hides auth links and works on mobile', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Log in' })).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.locator('header details');
  await menu.locator('summary').click();
  await expect(menu.getByRole('link', { name: 'FAQ', exact: true })).toBeVisible();
  await expect(menu.getByRole('link', { name: 'Browse courses' })).toBeVisible();
});

test('no horizontal overflow at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/courses', '/courses/servicenow-itsm-fundamentals', '/contact']) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow, `${path} overflows horizontally`).toBe(false);
  }
});
