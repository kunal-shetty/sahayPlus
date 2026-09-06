import { Page, Locator, expect } from '@playwright/test';

/**
 * @file receiver.page.ts
 * @description Page Object Model (POM) for the Care Receiver Dashboard.
 * This class encapsulates the selectors and interaction methods for the
 * elderly-friendly receiver interface. It provides a simple API for testing
 * critical actions such as marking medications as taken, performing daily
 * check-ins, and requesting emergency help.
 */

export class ReceiverDashboard {
  readonly page: Page;
  readonly tookItButton: Locator;
  readonly fineTodayButton: Locator;
  readonly howIFeelButton: Locator;
  readonly needHelpButton: Locator;
  readonly callHelpButton: Locator;
  readonly settingsButton: Locator;
  readonly undoButton: Locator;

  /**
   * Initializes the ReceiverDashboard with the provided Playwright Page instance.
   * @param {Page} page - The Playwright Page object.
   */
  constructor(page: Page) {
    this.page = page;
    this.tookItButton = page.locator('button:has-text("I took it")');
    this.fineTodayButton = page.locator('button:has-text("I\'m fine today")');
    this.howIFeelButton = page.locator('button:has-text("How I feel")');
    this.needHelpButton = page.locator('button:has-text("I need help")');
    this.callHelpButton = page.locator('button:has-text("Call help")');
    this.settingsButton = page.locator('button[aria-label="Settings"]');
    this.undoButton = page.locator('button:has-text("Undo this")');
  }

  /**
   * Marks the current medication as taken.
   * @returns {Promise<void>}
   */
  async markMedicationTaken() {
    await this.tookItButton.click();
  }

  /**
   * Reverses the action of marking a medication as taken.
   * @returns {Promise<void>}
   */
  async undoMedicationTaken() {
    await this.undoButton.click();
  }

  /**
   * Performs the "I'm fine today" daily check-in.
   * @returns {Promise<void>}
   */
  async dailyCheckIn() {
    await this.fineTodayButton.click();
  }

  /**
   * Opens the wellness/emotion tracking interface.
   * @returns {Promise<void>}
   */
  async openWellness() {
    await this.howIFeelButton.click();
  }

  /**
   * Triggers a non-emergency "I need help" request to the caregiver.
   * @returns {Promise<void>}
   */
  async requestHelp() {
    await this.needHelpButton.click();
  }

  /**
   * Opens the emergency calling interface.
   * @returns {Promise<void>}
   */
  async openEmergencyCall() {
    await this.callHelpButton.click();
  }

  /**
   * Opens the settings panel for the care receiver.
   * @returns {Promise<void>}
   */
  async openSettings() {
    await this.settingsButton.click();
  }
}
