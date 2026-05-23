import { test, expect } from '@playwright/test';

import {
  createWorkspaceViaOnboarding,
  registerUser,
  uniqueEmail,
} from './web.helpers';

test.describe('tenant isolation (Supabase RLS) @web', () => {
  test('user B does not see user A workspace in switcher', async ({ browser }) => {
    const workspaceName = `Tenant ${Date.now()}`;
    const emailA = uniqueEmail('tenant-a');
    const emailB = uniqueEmail('tenant-b');

    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    await registerUser(pageA, emailA);
    await createWorkspaceViaOnboarding(pageA, workspaceName);

    await registerUser(pageB, emailB);
    await expect(
      pageB.getByRole('heading', { name: 'Create your workspace' }),
    ).toBeVisible();

    await pageB.goto('/workspace');
    await expect(pageB).toHaveURL(/\/onboarding$/);
    await expect(pageB.getByText(workspaceName)).toHaveCount(0);

    await contextA.close();
    await contextB.close();
  });
});
