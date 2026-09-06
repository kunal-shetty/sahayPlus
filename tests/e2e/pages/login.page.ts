import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly continueButton: Locator;
  readonly nameInput: Locator;
  readonly caregiverRoleButton: Locator;
  readonly receiverRoleButton: Locator;
  readonly getStartedButton: Locator;
  readonly errorMessage: Locator;

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

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string) {
    await this.emailInput.fill(email);
    await this.continueButton.click();
  }

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
