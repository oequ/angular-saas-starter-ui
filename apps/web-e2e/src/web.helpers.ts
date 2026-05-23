import { expect, type Page } from '@playwright/test';

export const WEB_ACTIVATION_HEADING = 'Welcome to your demo workspace';

/** Dismiss cookie banner when present (blocks clicks on onboarding). */
export async function dismissCookieConsentIfVisible(page: Page): Promise<void> {
  const accept = page.getByRole('button', { name: 'Accept all' });
  if (await accept.isVisible().catch(() => false)) {
    await accept.click();
  }
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export async function registerUser(
  page: Page,
  email: string,
  password = 'password123',
): Promise<void> {
  await page.goto('/auth/register');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password').fill(password);
  await page.locator('#register-accept-terms').click();
  await page.locator('#register-accept-privacy').click();
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
}

export async function signInUser(
  page: Page,
  email: string,
  password = 'password123',
): Promise<void> {
  await page.goto('/auth/login');
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

export async function signOutViaMenu(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'User menu' }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/auth\/login$/);
}

export async function createWorkspaceViaOnboarding(
  page: Page,
  workspaceName: string,
): Promise<string> {
  await dismissCookieConsentIfVisible(page);
  await expect(
    page.getByRole('heading', { name: 'Create your workspace' }),
  ).toBeVisible();
  await page.getByLabel('Workspace name').fill(workspaceName);
  await page.getByRole('button', { name: 'Create workspace' }).click();
  await expect(page.getByRole('button', { name: 'Switch workspace' })).toContainText(
    workspaceName,
    { timeout: 30_000 },
  );
  await expect(
    page.getByRole('heading', { name: WEB_ACTIVATION_HEADING }),
  ).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('button', { name: 'Simulate sends' })).toBeVisible();
  return workspaceName;
}

/** Mock activation: simulate sends, land on Metrics. */
export async function completeActivationViaOnboarding(page: Page): Promise<void> {
  await dismissCookieConsentIfVisible(page);
  await page.getByRole('button', { name: 'Simulate sends' }).click();
  await expect(
    page.getByRole('heading', { name: 'Simulate send history' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Run simulation' }).click();
  await expect(page).toHaveURL(/\/workspace\/metrics$/);
}

export async function openWorkspaceSwitcher(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Switch workspace' }).click();
}

export async function waitForMembersPageLoaded(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: 'Members' })).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
}
