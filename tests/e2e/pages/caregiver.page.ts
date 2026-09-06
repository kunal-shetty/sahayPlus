import { Page, Locator, expect } from '@playwright/test';

/**
 * @file caregiver.page.ts
 * @description Page Object Model (POM) for the Caregiver Dashboard.
 * This class encapsulates the selectors and interaction methods for the
 * caregiver's home screen and its various sub-views (Activity, Care, Messages).
 * It provides a structured way for E2E tests to perform common tasks such as
 * adding medications, navigating tabs, and accessing care tools.
 */

export class CaregiverDashboard {
  readonly page: Page;
  readonly addMedButton: Locator;
  readonly homeTab: Locator;
  readonly activityTab: Locator;
  readonly careTab: Locator;
  readonly messagesTab: Locator;
  readonly medItems: Locator;
  readonly wellnessOverviewButton: Locator;
  readonly timelineButton: Locator;
  readonly notesButton: Locator;
  readonly emergencyContactsButton: Locator;

  /**
   * Initializes the CaregiverDashboard with the provided Playwright Page instance.
   * @param {Page} page - The Playwright Page object.
   */
  constructor(page: Page) {
    this.page = page;
    this.addMedButton = page.locator('button:has-text("Add medication")');
    this.homeTab = page.locator('nav >> text=Home'); // Adjust based on CaregiverBottomNav
    this.activityTab = page.locator('nav >> text=Activity');
    this.careTab = page.locator('nav >> text=Care');
    this.messagesTab = page.locator('nav >> text=Messages');
    this.medItems = page.locator('button:has-text("medication")'); // Generic, will refine
    this.wellnessOverviewButton = page.locator('button:has-text("Wellness Log")');
    this.timelineButton = page.locator('button:has-text("Care Timeline")');
    this.notesButton = page.locator('button:has-text("Contextual Notes")');
    this.emergencyContactsButton = page.locator('button:has-text("Emergency Contacts")');
  }

  /**
   * Navigates to a specific tab in the bottom navigation bar.
   * @param {'home' | 'activity' | 'care' | 'messages'} tab - The target tab to activate.
   * @returns {Promise<void>}
   */
  async navigateToTab(tab: 'home' | 'activity' | 'care' | 'messages') {
    switch (tab) {
      case 'home': await this.homeTab.click(); break;
      case 'activity': await this.activityTab.click(); break;
      case 'care': await this.careTab.click(); break;
      case 'messages': await this.messagesTab.click(); break;
    }
  }

  /**
   * Clicks the "Add medication" button to open the medication entry form.
   * @returns {Promise<void>}
   */
  async addMedication() {
    await this.addMedButton.click();
  }

  /**
   * Navigates to the Activity tab and opens the Wellness Overview.
   * @returns {Promise<void>}
   */
  async openWellness() {
    await this.navigateToTab('activity');
    await this.wellnessOverviewButton.click();
  }

  /**
   * Navigates to the Activity tab and opens the Care Timeline.
   * @returns {Promise<void>}
   */
  async openTimeline() {
    await this.navigateToTab('activity');
    await this.timelineButton.click();
  }

  /**
   * Navigates to the Care tab and opens the Contextual Notes interface.
   * @returns {Promise<void>}
   */
  async openNotes() {
    await this.navigateToTab('care');
    await this.notesButton.click();
  }

  /**
   * Navigates to the Care tab and opens the Emergency Contacts management screen.
   * @returns {Promise<void>}
   */
  async openEmergencyContacts() {
    await this.navigateToTab('care');
    await this.emergencyContactsButton.click();
  }
}
