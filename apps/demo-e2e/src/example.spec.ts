import { test, expect } from '@playwright/test';

test('redirects to workspace general settings', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/workspace\/settings\/general/);
  await expect(
    page.getByRole('heading', { name: 'Workspace settings' }),
  ).toBeVisible();
});
