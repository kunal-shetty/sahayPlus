import { test, expect } from '@playwright/test';
import { setupMockApi, injectSession } from './helpers/mock-api';

/**
 * @file 01-entry-pairing.spec.ts
 * @description Phase 1: Entry & Account Setup Flow
 * 1. Explore Landing & multi-step Onboarding intro wizard
 * 2. Authenticate at /login
 * 3. Link Senior and Caregiver using Care Code at /care-code
 */

test.describe('Phase 1: Entry & Care Pairing Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApi(page, 'caregiver');
  });

  test('Step 1: should render landing page and allow starting onboarding', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Confirm landing screen branding
    await expect(page.getByText('Sahay+').first()).toBeVisible();

    // Verify navigation options to Onboarding or Login
    const startLink = page.getByRole('link', { name: /Get Started|Start|Onboarding/i }).or(page.getByRole('button', { name: /Get Started|Start/i })).first();
    if (await startLink.isVisible()) {
      await startLink.click();
      await expect(page).toHaveURL(/\/(onboarding|login)/, { timeout: 10000 });
    }
  });

  test('Step 2: should step through intro wizard and proceed to login', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');

    // Card 1: Welcome
    await expect(page.getByText('Welcome to Sahay+')).toBeVisible();
    const continueBtn = page.getByRole('button', { name: /Continue/i });
    await expect(continueBtn).toBeVisible();
    await continueBtn.click();

    // Card 2: Features
    await expect(continueBtn).toBeVisible();
    await continueBtn.click();

    // Card 3: Goals
    await expect(continueBtn).toBeVisible();
    await continueBtn.click();

    // Card 4: Ready -> Click "Get Started" to navigate to login
    const getStartedBtn = page.getByRole('button', { name: /Get Started/i });
    await expect(getStartedBtn).toBeVisible();
    await getStartedBtn.click();

    await expect(page).toHaveURL('/login', { timeout: 10000 });
  });

  test('Step 3: should enforce validation and allow caregiver to sign in', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Heading & email input
    await expect(page.getByRole('heading', { name: /Welcome to Sahay\+|Sign In/i })).toBeVisible();
    const emailInput = page.getByPlaceholder(/Enter your email/i);
    await expect(emailInput).toBeVisible();

    // Continue button must be disabled when empty
    const continueBtn = page.getByRole('button', { name: /Continue/i });
    await expect(continueBtn).toBeDisabled();

    // Fill valid caregiver email
    await emailInput.fill('anita@sahay.app');
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // Navigates to onboarding, dashboard or pairing
    await expect(page).toHaveURL(/\/(onboarding|caregiver|care-code|dashboard)/, { timeout: 10000 });
  });

  test('Step 4: should display senior care code on /care-code for care receiver', async ({ page }) => {
    await injectSession(page, 'care_receiver');
    await page.goto('/care-code');
    await page.waitForLoadState('networkidle');

    // Confirm heading and senior care code display
    await expect(page.getByRole('heading', { name: 'Care Code' })).toBeVisible();
    await expect(page.getByText(/Your Care Code/i)).toBeVisible();
  });

  test('Step 5: should allow caregiver to link with senior using 6-character care code', async ({ page }) => {
    await injectSession(page, 'caregiver');
    await page.goto('/care-code');
    await page.waitForLoadState('networkidle');

    // Caregiver sees link input
    await expect(page.getByRole('heading', { name: 'Link to Care Receiver' })).toBeVisible();
    const codeInput = page.getByPlaceholder(/Enter 6-char code/i);
    await expect(codeInput).toBeVisible();

    // Fill 6-character care code
    await codeInput.fill('T9TSXM');
    const linkButton = page.getByRole('button', { name: 'Link' });
    await expect(linkButton).toBeEnabled();
    await linkButton.click();

    // Successfully redirects to caregiver dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });
});
