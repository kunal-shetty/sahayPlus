import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { CaregiverDashboard } from './pages/caregiver.page';

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

  test('should be able to add a new medication', async ({ page }) => {
    await dashboard.addMedication();
    await page.fill('input[placeholder="Medication name"]', 'Test Med');
    await page.fill('input[placeholder="Dosage"]', '5mg');
    await page.click('button:has-text("Save")');

    await expect(page).toHaveText('Test Med');
  });

  test('should be able to record a care note', async ({ page }) => {
    await dashboard.openNotes();
    await page.fill('textarea', 'Patient is feeling better today');
    await page.click('button:has-text("Save Note")');

    await expect(page).toHaveText('Patient is feeling better today');
  });

  test('should be able to manage emergency contacts', async ({ page }) => {
    await dashboard.openEmergencyContacts();
    await page.click('button:has-text("Add Contact")');
    await page.fill('input[placeholder="Name"]', 'Emergency Contact 1');
    await page.fill('input[placeholder="Phone"]', '1234567890');
    await page.click('button:has-text("Save")');

    await expect(page).toHaveText('Emergency Contact 1');
  });

  test('should be able to view wellness overview', async ({ page }) => {
    await dashboard.openWellness();
    await expect(page).toHaveURL(/.*wellness/);
  });
});
