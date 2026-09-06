import { Page, Locator } from '@playwright/test';

/**
 * @file onboarding.page.ts
 * @description Page Object Model (POM) for the Onboarding flow.
 * This class encapsulates the selectors and interactions for the multi-step
 * onboarding sequence, providing a clean API for end-to-end tests to
 * navigate the introduction screens.
 */

export class OnboardingPage {
  readonly page: Page;
  readonly skipButton: Locator;
  readonly backButton: Locator;
  readonly nextButton: Locator;

  /**
   * Initializes the OnboardingPage with the provided Playwright Page instance.
   * @param {Page} page - The Playwright Page object.
   */
  constructor(page: Page) {
    this.page = page;
    this.skipButton = page.locator('button:has-text("Skip")');
    this.backButton = page.locator('button:has-text("Back")');
    this.nextButton = page.locator('button:has-text("Continue"), button:has-text("Get Started")');
  }

  /**
   * Clicks the "Skip" button to bypass the onboarding flow.
   * @returns {Promise<void>}
   */
  async skip() {
    await this.skipButton.click();
  }

  /**
   * Clicks the "Continue" or "Get Started" button to advance to the next step.
   * @returns {Promise<void>}
   */
  async next() {
    await this.nextButton.click();
  }

  /**
   * Clicks the "Back" button to return to the previous onboarding step.
   * @returns {Promise<void>}
   */
  async back() {
    await this.backButton.click();
  }

  /**
   * Navigates through the entire onboarding flow by clicking "Next"
   * for all steps.
   * @returns {Promise<void>}
   */
  async completeOnboarding() {
    // The flow has 4 steps.
    for (let i = 0; i < 4; i++) {
      await this.nextButton.click();
    }
  }
}
