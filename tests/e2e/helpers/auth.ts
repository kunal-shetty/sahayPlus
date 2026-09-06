import { Page, expect } from '@playwright/test';
import fs from 'fs';

export async function loginAndSaveState(page: Page, email: string, name?: string, role?: string) {
  await page.goto('/login');

  await page.fill('input[type="email"]', email);
  await page.click('button:has-text("Continue")');

  if (name && role) {
    // Wait for details step
    await page.waitForSelector('input[type="text"]', { timeout: 5000 }).catch(() => {});

    if (await page.locator('input[type="text"]').isVisible()) {
      await page.fill('input[type="text"]', name);
      await page.click(`text=${role}`);
      await page.click('button:has-text("Get Started")');
    }
  }

  // Verify login success
  await expect(page).not.toHaveURL('/login');

  // Save state to a file
  await page.context().storageState({ path: 'auth/user.json' });
}
