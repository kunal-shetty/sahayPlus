import { test, expect } from '@playwright/test';
import { setupMockApi } from './helpers/mock-api';

/**
 * @file auth-onboarding.spec.ts
 * @description End-to-End tests for Authentication & Role routing with Mocked Data.
 */

test.describe('Authentication & Entry Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApi(page, 'care_receiver');
  });

  test('should render the login page with email input and continue button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Continue")')).toBeVisible();
  });

  test('should allow entering email and logging in successfully', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'senior@sahay.app');

    const continueBtn = page.locator('button:has-text("Continue")');
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // Navigates away from login page to root home router
    await expect(page).not.toHaveURL('/login', { timeout: 10000 });
  });

  test('should keep continue button disabled when email input is empty', async ({ page }) => {
    await page.goto('/login');
    const continueBtn = page.locator('button:has-text("Continue")');
    await expect(continueBtn).toBeDisabled();
  });
});
