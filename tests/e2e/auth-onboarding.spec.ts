import { test, expect } from '@playwright/test';
import { setupMockApi, injectSession } from './helpers/mock-api';

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

  test('should display senior care code on /care-code page for care receiver', async ({ page }) => {
    await injectSession(page, 'care_receiver');
    await page.goto('/care-code');
    await expect(page.getByRole('heading', { name: 'Your Care Code' })).toBeVisible();
    await expect(page.getByText('SAHAY9')).toBeVisible();
    await expect(page.getByRole('button', { name: /Copy Code/i })).toBeVisible();
  });

  test('should allow caregiver to enter 6-character care code and link', async ({ page }) => {
    await setupMockApi(page, 'caregiver');
    await injectSession(page, 'caregiver');
    await page.goto('/care-code');
    await expect(page.getByRole('heading', { name: 'Link to Care Receiver' })).toBeVisible();

    const input = page.getByPlaceholder('Enter 6-char code');
    await input.fill('SAHAY9');

    const linkBtn = page.getByRole('button', { name: 'Link' });
    await expect(linkBtn).toBeEnabled();
    await linkBtn.click();

    await expect(page).toHaveURL('/caregiver', { timeout: 10000 });
  });

  test('should step through onboarding intro wizard and proceed to login', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.getByText('Welcome to Sahay+')).toBeVisible();

    // Step 1: Welcome -> Step 2
    const continueBtn = page.getByRole('button', { name: /Continue/i });
    await expect(continueBtn).toBeVisible();
    await continueBtn.click();

    // Step 2: Features -> Step 3
    await expect(continueBtn).toBeVisible();
    await continueBtn.click();

    // Step 3: Goals -> Step 4
    await expect(continueBtn).toBeVisible();
    await continueBtn.click();

    // Step 4: Ready -> Click "Get Started" to navigate to login
    const getStartedBtn = page.getByRole('button', { name: /Get Started/i });
    await expect(getStartedBtn).toBeVisible();
    await getStartedBtn.click();

    await expect(page).toHaveURL('/login', { timeout: 10000 });
  });
});
