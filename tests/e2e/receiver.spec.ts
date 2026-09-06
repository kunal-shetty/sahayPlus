import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { ReceiverDashboard } from './pages/receiver.page';

test.describe('Care Receiver Feature Suite', () => {
  let loginPage: LoginPage;
  let dashboard: ReceiverDashboard;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboard = new ReceiverDashboard(page);

    // Login as a receiver
    await loginPage.goto();
    await loginPage.login('harsh@gmail.com');
  });

  test('should be able to mark medication as taken and then undo it', async ({ page }) => {
    await dashboard.markMedicationTaken();
    await expect(dashboard.undoButton).toBeVisible();
    await dashboard.undoMedicationTaken();
    await expect(dashboard.undoButton).not.toBeVisible();
  });

  test('should be able to perform a daily check-in', async ({ page }) => {
    await dashboard.dailyCheckIn();
    await expect(page).not.toHaveText('I\'m fine today');
  });

  test('should be able to trigger an emergency call', async ({ page }) => {
    await dashboard.openEmergencyCall();
    await expect(page).toHaveURL(/.*emergency/);
  });

  test('should be able to request help', async ({ page }) => {
    await dashboard.requestHelp();
    await expect(page).toHaveText('Notified!');
  });

  test('should be able to open wellness check-in', async ({ page }) => {
    await dashboard.openWellness();
    await expect(page).toHaveURL(/.*wellness/);
  });
});
