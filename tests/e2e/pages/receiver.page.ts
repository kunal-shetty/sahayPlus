import { Page, Locator, expect } from '@playwright/test';

export class ReceiverDashboard {
  readonly page: Page;
  readonly tookItButton: Locator;
  readonly fineTodayButton: Locator;
  readonly howIFeelButton: Locator;
  readonly needHelpButton: Locator;
  readonly callHelpButton: Locator;
  readonly settingsButton: Locator;
  readonly undoButton: Locator;

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

  async markMedicationTaken() {
    await this.tookItButton.click();
  }

  async undoMedicationTaken() {
    await this.undoButton.click();
  }

  async dailyCheckIn() {
    await this.fineTodayButton.click();
  }

  async openWellness() {
    await this.howIFeelButton.click();
  }

  async requestHelp() {
    await this.needHelpButton.click();
  }

  async openEmergencyCall() {
    await this.callHelpButton.click();
  }

  async openSettings() {
    await this.settingsButton.click();
  }
}
