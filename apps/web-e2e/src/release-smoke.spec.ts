import { test, expect } from '@playwright/test';

import {
  bootstrapOwnerWithActiveWorkspace,
  completeActivationViaOnboarding,
  createWorkspaceViaOnboarding,
  registerUser,
  signInUser,
  signOutViaMenu,
  uniqueEmail,
  waitForMembersPageLoaded,
} from './web.helpers';

/**
 * Pre-release smoke for apps/web (Supabase auth + org, mock for the rest).
 * Requires local Supabase: npm run db:start && npm run db:reset
 */
test.describe('release smoke @web', () => {
  test('register → create workspace → complete activation → metrics', async ({
    page,
  }) => {
    const email = uniqueEmail('release-onboard');
    await registerUser(page, email);
    await createWorkspaceViaOnboarding(page, `Release Co ${Date.now()}`);
    await completeActivationViaOnboarding(page);
    await expect(page.getByRole('heading', { name: 'Metrics' })).toBeVisible();
  });

  test('sign out and sign in again', async ({ page }) => {
    const email = uniqueEmail('release-auth');
    const password = 'password123';
    const workspaceName = `Auth Co ${Date.now()}`;

    await registerUser(page, email, password);
    await createWorkspaceViaOnboarding(page, workspaceName);
    await signOutViaMenu(page);

    await signInUser(page, email, password);
    await expect(page).toHaveURL(/\/onboarding$/);
    await expect(
      page.getByRole('heading', { name: 'Welcome to your demo workspace' }),
    ).toBeVisible();
  });

  test('unauthenticated user is redirected to login from workspace', async ({
    page,
  }) => {
    await page.goto('/workspace');
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(
      page.getByRole('heading', { name: 'Sign in', level: 1 }),
    ).toBeVisible();
  });

  test('deep link to workspace emails after full reload', async ({ page }) => {
    await bootstrapOwnerWithActiveWorkspace(
      page,
      `DeepLink Co ${Date.now()}`,
      uniqueEmail('release-deeplink'),
    );

    await page.goto('/workspace/emails');
    await expect(page).toHaveURL(/\/workspace\/emails$/);
    await expect(
      page.getByRole('heading', { name: 'Emails', level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Welcome to your demo workspace' }),
    ).not.toBeVisible();
  });

  test('settings members page loads after activation', async ({ page }) => {
    const email = uniqueEmail('release-members');
    await registerUser(page, email);
    await createWorkspaceViaOnboarding(page, `Members Co ${Date.now()}`);
    await completeActivationViaOnboarding(page);
    await expect(page).toHaveURL(/\/workspace\/metrics$/);

    await page.getByRole('link', { name: 'Members' }).click();
    await expect(page).toHaveURL(/\/workspace\/settings\/members$/);
    await waitForMembersPageLoaded(page);
  });
});
