import { test, expect } from '@playwright/test';

test.describe('Cookie consent (GDPR-style banner)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.evaluate(() => localStorage.removeItem('oequ-cookie-consent'));
    await page.reload();
  });

  test('shows banner with reject, accept, and manage preferences', async ({
    page,
  }) => {
    const banner = page.getByRole('region', { name: 'Cookie consent' });
    await expect(banner).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Reject all', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Accept all', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Manage preferences', exact: true }),
    ).toBeVisible();
  });

  test('reject all dismisses banner and stores opt-out', async ({ page }) => {
    await page.getByRole('button', { name: 'Reject all', exact: true }).click();
    await expect(
      page.getByRole('region', { name: 'Cookie consent' }),
    ).toHaveCount(0);

    const stored = await page.evaluate(() =>
      localStorage.getItem('oequ-cookie-consent'),
    );
    expect(stored).toContain('"analytics":false');
    expect(stored).toContain('"marketing":false');
  });

  test('manage preferences opens dialog with optional categories off by default', async ({
    page,
  }) => {
    await page
      .getByRole('button', { name: 'Manage preferences', exact: true })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Cookie preferences' }),
    ).toBeVisible();
    await expect(page.locator('#cookie-analytics')).not.toBeChecked();
    await expect(page.locator('#cookie-marketing')).not.toBeChecked();
    await expect(page.locator('#cookie-necessary')).toBeChecked();
    await expect(page.locator('#cookie-necessary')).toBeDisabled();
  });
});
