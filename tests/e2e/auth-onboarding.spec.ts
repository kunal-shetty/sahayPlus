import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { OnboardingPage } from './pages/onboarding.page';

test.describe('Authentication & Onboarding Flow', () => {
  let loginPage: LoginPage;
  let onboardingPage: OnboardingPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    onboardingPage = new OnboardingPage(page);
  });

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

  test('should allow an existing user to login', async ({ page }) => {
    // This assumes a user already exists. In a real scenario,
    // we would seed the DB or use a test account.
    const email = 'kunal@gmail.com';

    await loginPage.goto();
    await loginPage.login(email);

    await expect(page).not.toHaveURL('/login');
  });

  test('should show error for invalid login', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login('invalid-email');

    await expect(loginPage.errorMessage).toBeVisible();
  });

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
