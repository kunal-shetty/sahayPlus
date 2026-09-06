import { Page, Locator, expect } from '@playwright/test';

/**
 * @file login.page.ts
 * @description Page Object Model (POM) for the Authentication screens.
 * This class handles the complex login/signup flow, including email entry
 * and the subsequent details step for new users. It provides high-level
 * methods to perform both standard logins and new account registrations.
 */

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly continueButton: Locator;
  readonly nameInput: Locator;
  readonly caregiverRoleButton: Locator;
  readonly receiverRoleButton: Locator;
  readonly getStartedButton: Locator;
  readonly errorMessage: Locator;

  /**
   * Initializes the LoginPage with the provided Playwright Page instance.
   * @param {Page} page - The Playwright Page object.
   */
  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.continueButton = page.locator('button:has-text("Continue")');
    this.nameInput = page.locator('input[type="text"]');
    this.caregiverRoleButton = page.locator('button:has-text("Caregiver")');
    this.receiverRoleButton = page.locator('button:has-text("Care Receiver")');
    this.getStartedButton = page.locator('button:has-text("Get Started")');
    this.errorMessage = page.locator('p.text-destructive');
  }

  /**
   * Navigates the browser to the login page.
   * @returns {Promise<void>}
   */
  async goto() {
    await this.page.goto('/login');
  }

  /**
   * Performs the first step of the login process by entering an email.
   * @param {string} email - The user's email address.
   * @returns {Promise<void>}
   */
  async login(email: string) {
    await this.emailInput.fill(email);
    await this.continueButton.click();
  }

  /**
   * Performs a full signup flow for a new user.
   * This includes entering the email, providing a name, and selecting a role.
   *
   * @param {string} email - The user's email address.
   * @param {string} name - The user's full name.
   * @param {'caregiver' | 'care_receiver'} role - The role to assign to the new user.
   * @returns {Promise<void>}
   */
  async signup(email: string, name: string, role: 'caregiver' | 'care_receiver') {
    await this.login(email);

    // Wait for the details step to appear if it's a new user
    await this.page.waitForSelector('input[type="text"]', { timeout: 5000 }).catch(() => {});

    if (await this.nameInput.isVisible()) {
      await this.nameInput.fill(name);
      if (role === 'caregiver') {
        await this.caregiverRoleButton.click();
      } else {
        await this.receiverRoleButton.click();
      }
      await this.getStartedButton.click();
    }
  }
}
