import { Page, expect } from '@playwright/test';
import fs from 'fs';

/**
 * @file auth.ts
 * @description Authentication helper utilities for E2E tests.
 * This module provides shared functionality for logging in users and
 * persisting their authentication state to disk. By saving the
 * storage state, subsequent tests can bypass the login flow,
 * significantly reducing test execution time.
 */

/**
 * Performs a full login or signup process and saves the resulting
 * authentication state (cookies, localStorage) to a JSON file.
 *
 * @param {Page} page - The Playwright Page instance to perform actions in.
 * @param {string} email - The email address of the user.
 * @param {string} [name] - Optional name for new user registration.
 * @param {string} [role] - Optional role ('caregiver' or 'care_receiver') for new user registration.
 * @returns {Promise<void>}
 */
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
