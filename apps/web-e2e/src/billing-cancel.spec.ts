import { test, expect } from '@playwright/test';

import {
  bootstrapOwnerWithActiveWorkspace,
  goToBillingPage,
  upgradeWorkspaceToPlan,
} from './web.helpers';

test.describe('billing cancel subscription @web', () => {
  test('mock cancel shows cancels at period end on billing page', async ({
    page,
  }) => {
    await bootstrapOwnerWithActiveWorkspace(page, `Cancel Co ${Date.now()}`);
    await goToBillingPage(page);
    await upgradeWorkspaceToPlan(page, 'Pro');

    await page.getByRole('button', { name: 'Cancel subscription' }).click();
    await page.getByRole('button', { name: 'Cancel at period end' }).click();

    await expect(
      page.getByText('Cancels at the end of the current billing period.'),
    ).toBeVisible();
  });
});
