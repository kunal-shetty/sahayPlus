import { Page, Locator, expect } from '@playwright/test';

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

  async navigateToTab(tab: 'home' | 'activity' | 'care' | 'messages') {
    switch (tab) {
      case 'home': await this.homeTab.click(); break;
      case 'activity': await this.activityTab.click(); break;
      case 'care': await this.careTab.click(); break;
      case 'messages': await this.messagesTab.click(); break;
    }
  }

  async addMedication() {
    await this.addMedButton.click();
  }

  async openWellness() {
    await this.navigateToTab('activity');
    await this.wellnessOverviewButton.click();
  }

  async openTimeline() {
    await this.navigateToTab('activity');
    await this.timelineButton.click();
  }

  async openNotes() {
    await this.navigateToTab('care');
    await this.notesButton.click();
  }

  async openEmergencyContacts() {
    await this.navigateToTab('care');
    await this.emergencyContactsButton.click();
  }
}
