import { test, expect } from '@playwright/test';

import {
  bootstrapOwnerWithActiveWorkspace,
  expectWorkspaceInSwitcher,
  goToMembersPage,
  inviteMemberByEmail,
  registerUser,
  uniqueEmail,
  waitForMembersPageLoaded,
} from './web.helpers';

test.describe('invite flow @web', () => {
  test('pending invite is claimed after sign-up and owner sees active member', async ({
    browser,
  }) => {
    const workspaceName = `Invite Co ${Date.now()}`;
    const emailInvitee = uniqueEmail('invite-invitee');

    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    await bootstrapOwnerWithActiveWorkspace(pageA, workspaceName);
    await goToMembersPage(pageA);
    await inviteMemberByEmail(pageA, emailInvitee);

    const inviteeRow = pageA.locator('tbody tr').filter({ hasText: emailInvitee });
    await expect(inviteeRow).toBeVisible();
    await expect(inviteeRow.getByText('invited', { exact: true })).toBeVisible();

    await registerUser(pageB, emailInvitee);
    await expect(
      pageB.getByRole('heading', { name: 'Create your workspace' }),
    ).toHaveCount(0);
    await expectWorkspaceInSwitcher(pageB, workspaceName);

    await pageA.getByRole('link', { name: 'Metrics' }).click();
    await expect(pageA).toHaveURL(/\/workspace\/metrics$/);
    await goToMembersPage(pageA);
    await expect(pageA.locator('tbody').getByText(emailInvitee)).toHaveCount(0);
    await expect(
      pageA.locator('tbody').getByText('active', { exact: true }),
    ).toHaveCount(2);

    await contextA.close();
    await contextB.close();
  });
});
