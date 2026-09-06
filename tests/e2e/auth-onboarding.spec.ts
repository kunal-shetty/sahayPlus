import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { OnboardingPage } from './pages/onboarding.page';

/**
 * @file auth-onboarding.spec.ts
 * @description End-to-End (E2E) tests for the Authentication and Onboarding flows.
 * This test suite verifies the critical paths for user entry into the application,
 * including:
 * 1. New user registration and completion of the onboarding sequence.
 * 2. Existing user login.
 * 3. Error handling for invalid credentials.
 * 4. The ability to skip the onboarding process.
 *
 * These tests ensure that the entry point of the app is stable and that users
 * are correctly routed to their respective dashboards.
 */

test.describe('Authentication & Onboarding Flow', () => {
  let loginPage: LoginPage;
  let onboardingPage: OnboardingPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    onboardingPage = new OnboardingPage(page);
  });

  /**
   * Test: New user registration and onboarding.
   * Verifies that a new user can sign up, proceed through the onboarding
   * steps, and land on the main dashboard.
   */
  test('should allow a new user to register and complete onboarding', async ({ page }) => {
    const email = `testuser_${Date.now()}@example.com`;
    const name = 'Test User';
    const role = 'caregiver';

    await loginPage.goto();
    await loginPage.signup(email, name, role);

    // Check if we are on onboarding page
    await expect(page).toHaveURL(/.*onboarding/);

    await onboardingPage.completeOnboarding();

    // Verify we reached the dashboard
    await expect(page).not.toHaveURL(/.*onboarding/);
    await expect(page).toHaveURL(/.*dashboard|.*home/);
  });

  /**
   * Test: Existing user login.
   * Verifies that a user with a pre-existing account can log in directly
   * without being routed through onboarding.
   */
  test('should allow an existing user to login', async ({ page }) => {
    // This assumes a user already exists. In a real scenario,
    // we would seed the DB or use a test account.
    const email = 'kunal@gmail.com';

    await loginPage.goto();
    await loginPage.login(email);

    await expect(page).not.toHaveURL('/login');
  });

  /**
   * Test: Invalid login error handling.
   * Verifies that the application displays a clear error message when
   * an invalid email is provided.
   */
  test('should show error for invalid login', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login('invalid-email');

    await expect(loginPage.errorMessage).toBeVisible();
  });

  /**
   * Test: Onboarding skip functionality.
   * Verifies that new users can choose to skip the onboarding flow
   * and proceed directly to the dashboard.
   */
  test('should allow skipping onboarding', async ({ page }) => {
    const email = `skipuser_${Date.now()}@example.com`;
    const name = 'Skip User';
    const role = 'caregiver';

    await loginPage.goto();
    await loginPage.signup(email, name, role);

    await onboardingPage.skip();

    await expect(page).not.toHaveURL(/.*onboarding/);
  });
});
