import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { CaregiverDashboard } from './pages/caregiver.page';

/**
 * @file caregiver.spec.ts
 * @description End-to-End (E2E) test suite for Caregiver-specific features.
 * This suite validates the core functionality of the Caregiver experience,
 * including medication management, care note recording, emergency contact
 * maintenance, and wellness monitoring.
 *
 * These tests ensure that the caregiver can effectively manage the care
 * receiver's health and stay informed about their status.
 */

test.describe('Caregiver Feature Suite', () => {
  let loginPage: LoginPage;
  let dashboard: CaregiverDashboard;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboard = new CaregiverDashboard(page);

    // Login as a caregiver
    await loginPage.goto();
    await loginPage.login('kunal@gmail.com');
  });

  /**
   * Test: Adding a new medication.
   * Verifies that a caregiver can successfully add a new medication to the
   * receiver's schedule and that it appears in the UI.
   */
  test('should be able to add a new medication', async ({ page }) => {
    await dashboard.addMedication();
    await page.fill('input[placeholder="Medication name"]', 'Test Med');
    await page.fill('input[placeholder="Dosage"]', '5mg');
    await page.click('button:has-text("Save")');

    await expect(page).toHaveText('Test Med');
  });

  /**
   * Test: Recording a care note.
   * Verifies that caregivers can add contextual notes about the care
   * receiver's condition, which is critical for handover and doctor visits.
   */
  test('should be able to record a care note', async ({ page }) => {
    await dashboard.openNotes();
    await page.fill('textarea', 'Patient is feeling better today');
    await page.click('button:has-text("Save Note")');

    await expect(page).toHaveText('Patient is feeling better today');
  });

  /**
   * Test: Emergency contact management.
   * Verifies that caregivers can maintain a list of critical contacts
   * for the care receiver.
   */
  test('should be able to manage emergency contacts', async ({ page }) => {
    await dashboard.openEmergencyContacts();
    await page.click('button:has-text("Add Contact")');
    await page.fill('input[placeholder="Name"]', 'Emergency Contact 1');
    await page.fill('input[placeholder="Phone"]', '1234567890');
    await page.click('button:has-text("Save")');

    await expect(page).toHaveText('Emergency Contact 1');
  });

  /**
   * Test: Wellness overview access.
   * Verifies that the caregiver can navigate to and view the wellness
   * overview for the care receiver.
   */
  test('should be able to view wellness overview', async ({ page }) => {
    await dashboard.openWellness();
    await expect(page).toHaveURL(/.*wellness/);
  });
});
