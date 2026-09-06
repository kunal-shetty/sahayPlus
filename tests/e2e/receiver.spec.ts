import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { ReceiverDashboard } from './pages/receiver.page';

/**
 * @file receiver.spec.ts
 * @description End-to-End (E2E) test suite for Care Receiver-specific features.
 * This suite validates the simplified, elderly-friendly interface designed
 * for the care receiver, focusing on accessibility and critical health actions
 * such as medication tracking and emergency requests.
 *
 * These tests ensure that the receiver can independently communicate their
 * status and needs to their caregiver with minimal friction.
 */

test.describe('Care Receiver Feature Suite', () => {
  let loginPage: LoginPage;
  let receiverDashboard: ReceiverDashboard;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    receiverDashboard = new ReceiverDashboard(page);

    // Login as a care receiver
    await loginPage.goto();
    await loginPage.login('receiver@gmail.com');
  });

  /**
   * Test: Marking medication as taken.
   * Verifies that the receiver can easily mark their medication as taken
   * and that the UI provides immediate feedback.
   */
  test('should be able to mark medication as taken', async ({ page }) => {
    await receiverDashboard.markMedicationTaken();
    await expect(page).toHaveText('Medication marked as taken');
  });

  /**
   * Test: Undoing a medication action.
   * Verifies that the receiver can correct a mistake if they accidentally
   * mark a medication as taken.
   */
  test('should be able to undo marking medication as taken', async ({ page }) => {
    await receiverDashboard.markMedicationTaken();
    await receiverDashboard.undoMedicationTaken();
    await expect(page).toHaveText('Medication marked as pending');
  });

  /**
   * Test: Daily wellness check-in.
   * Verifies that the receiver can perform the daily "I'm fine" check-in,
   * providing peace of mind to the caregiver.
   */
  test('should be able to perform daily check-in', async ({ page }) => {
    await receiverDashboard.dailyCheckIn();
    await expect(page).toHaveText('Check-in submitted');
  });

  /**
   * Test: Requesting non-emergency help.
   * Verifies that the receiver can signal for assistance without triggering
   * a full emergency response.
   */
  test('should be able to request help', async ({ page }) => {
    await receiverDashboard.requestHelp();
    await expect(page).toHaveText('Help request sent');
  });

  /**
   * Test: Triggering emergency call.
   * Verifies that the receiver can quickly access the emergency call
   * interface for immediate assistance.
   */
  test('should be able to open emergency call interface', async ({ page }) => {
    await receiverDashboard.openEmergencyCall();
    await expect(page).toHaveURL(/.*emergency/);
  });
});
