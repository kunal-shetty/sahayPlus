import { Page, Locator } from '@playwright/test';

export class OnboardingPage {
  readonly page: Page;
  readonly skipButton: Locator;
  readonly backButton: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.skipButton = page.locator('button:has-text("Skip")');
    this.backButton = page.locator('button:has-text("Back")');
    this.nextButton = page.locator('button:has-text("Continue"), button:has-text("Get Started")');
  }

  async skip() {
    await this.skipButton.click();
  }

  async next() {
    await this.nextButton.click();
  }

  async back() {
    await this.backButton.click();
  }

  async completeOnboarding() {
    // The flow has 4 steps.
    for (let i = 0; i < 4; i++) {
      await this.nextButton.click();
    }
  }
}
