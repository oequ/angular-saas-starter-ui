import { test, expect } from '@playwright/test';

import {
  completeActivationViaOnboarding,
  createWorkspaceViaOnboarding,
  goToEmailsPage,
  registerUser,
  uniqueEmail,
} from './web.helpers';

test.describe('Emails tenant isolation @web', () => {
  test('user B does not see user A workspace on emails route', async ({
    browser,
  }) => {
    const workspaceName = `Emails ${Date.now()}`;
    const emailA = uniqueEmail('emails-a');
    const emailB = uniqueEmail('emails-b');

    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    await registerUser(pageA, emailA);
    await createWorkspaceViaOnboarding(pageA, workspaceName);
    await completeActivationViaOnboarding(pageA);

    await goToEmailsPage(pageA);

    await registerUser(pageB, emailB);
    await createWorkspaceViaOnboarding(pageB, `Other ${Date.now()}`);

    await goToEmailsPage(pageB);
    await expect(pageB.getByText(workspaceName)).toHaveCount(0);

    await contextA.close();
    await contextB.close();
  });
});
