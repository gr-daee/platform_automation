import { Browser, BrowserContext, Page } from '@playwright/test';
import * as path from 'path';
import { getUserProfile } from './config/user-profiles.config';

export type SecondaryUserSession = {
  profileId: string;
  displayName: string;
  context: BrowserContext;
  page: Page;
};

export async function startSecondaryUserSession(browser: Browser, profileId: string): Promise<SecondaryUserSession> {
  const profile = getUserProfile(profileId);
  const storageState = path.resolve(process.cwd(), profile.storageStatePath);
  const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';

  const context = await browser.newContext({
    baseURL,
    storageState,
  });
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  return {
    profileId,
    displayName: profile.displayName,
    context,
    page,
  };
}

export async function logoutSecondaryUserSession(session: SecondaryUserSession): Promise<void> {
  const page = session.page;

  const logOutItem = page.getByRole('menuitem', { name: /log out/i }).first();
  if (!(await logOutItem.isVisible().catch(() => false))) {
    const userMenuTrigger = page.locator('[data-sidebar="menu-button"]').last();
    if (await userMenuTrigger.isVisible().catch(() => false)) {
      await userMenuTrigger.click();
    }
  }

  if (await logOutItem.isVisible().catch(() => false)) {
    await logOutItem.click();
    await page.waitForURL(/\/login/, { timeout: 15000 }).catch(() => undefined);
  } else {
    // Fallback for layouts where the dropdown is not rendered.
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
  }
}

export async function stopSecondaryUserSession(session: SecondaryUserSession | undefined): Promise<void> {
  if (!session) return;
  await session.context.close();
}
