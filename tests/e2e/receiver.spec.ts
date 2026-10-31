import { test, expect } from '@playwright/test';
import { setupMockApi, injectSession } from './helpers/mock-api';

/**
 * @file receiver.spec.ts
 * @description End-to-End tests for Care Receiver interface (Modules 2, 3, 4, 5, 6, 14).
 * Runs 100% locally with instant mock data (no database or external network needed).
 */

test.describe('Care Receiver Suite', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Setup instant mock network routes
    await setupMockApi(page, 'care_receiver');
    // 2. Pre-authenticate as Care Receiver into localStorage
    await injectSession(page, 'care_receiver');
  });

  test('should display active dose alarm modal or senior home card with medication photo', async ({ page }) => {
    await page.goto('/care-receiver');

    // Either the full-screen alarm modal is active or the senior home screen
    const tookItButton = page.getByRole('button', { name: 'I took it' });
    await expect(tookItButton).toBeVisible();

    // Confirm dose name is displayed (either Amlodipine or Metformin)
    await expect(page.getByText('Amlodipine').or(page.getByText('Metformin')).first()).toBeVisible();

    // If Metformin button exists in pill selector, click it and confirm uploaded photo renders
    const metforminTab = page.getByRole('button', { name: /Metformin/i }).first();
    if (await metforminTab.isVisible().catch(() => false)) {
      await metforminTab.click();
      await expect(page.locator('img[alt="Metformin"]').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show hands-free voice detection on active alarm modal', async ({ page }) => {
    await page.goto('/care-receiver');
    await page.waitForLoadState('networkidle');

    // If alarm modal is not already displayed, trigger it via Test Medicine Reminder
    const alarmVoiceBanner = page.getByText(/Say "I took it"|Hands-free voice/i).first();
    if (!(await alarmVoiceBanner.isVisible().catch(() => false))) {
      await page.getByRole('button', { name: 'Test Medicine Reminder' }).click();
    }

    // Confirm hands-free indicator is active on alarm modal
    await expect(page.getByText(/Say "I took it"|Hands-free voice/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /hands-free voice/i }).first()).toBeVisible();
  });

  test('should allow senior to confirm dose intake by tapping "I took it"', async ({ page }) => {
    await page.goto('/care-receiver');

    // Click "I took it"
    const tookItBtn = page.getByRole('button', { name: 'I took it' });
    await expect(tookItBtn).toBeVisible();
    await tookItBtn.click();

    // Reassurance screen appears: "Noted. Take care."
    await expect(page.getByRole('heading', { name: 'Noted. Take care.' })).toBeVisible({ timeout: 5000 });
  });

  test('should record morning wellness check-in with 1 tap', async ({ page }) => {
    await page.goto('/care-receiver');
    await page.waitForLoadState('networkidle');

    // If alarm modal is up, dismiss it first to see home screen cards
    const dismissBtn = page.getByRole('button', { name: 'Not right now' });
    try {
      await dismissBtn.waitFor({ state: 'visible', timeout: 3000 });
      await dismissBtn.click();
    } catch {
      // Alarm modal wasn't active
    }

    // The Morning Wellness Card has options: Feeling Great, Doing Okay, Not Great
    const wellnessOption = page.locator('button:has-text("Doing Okay"), button:has-text("Feeling Great")').first();
    await expect(wellnessOption).toBeVisible({ timeout: 5000 });
    await wellnessOption.click();
    await expect(page.getByText('Shared ✓')).toBeVisible({ timeout: 4000 });
  });

  test('should open emergency call screen when tapping "Call help"', async ({ page }) => {
    await page.goto('/care-receiver');
    await page.waitForLoadState('networkidle');

    // If alarm is up, dismiss to reach main screen
    const dismissBtn = page.getByRole('button', { name: 'Not right now' });
    try {
      await dismissBtn.waitFor({ state: 'visible', timeout: 3000 });
      await dismissBtn.click();
    } catch {
      // Alarm modal wasn't active
    }

    const callHelpBtn = page.getByRole('button', { name: 'Call help' });
    await expect(callHelpBtn).toBeVisible({ timeout: 5000 });
    await callHelpBtn.click();
    await expect(page.getByRole('heading', { name: 'Need Help?' })).toBeVisible();
  });

  test('should synchronize medication intake when sending "I took my medicine" via quick messages', async ({ page }) => {
    await page.goto('/care-receiver');
    await page.waitForLoadState('networkidle');

    // If alarm is up, dismiss to reach main screen
    const dismissBtn = page.getByRole('button', { name: 'Not right now' });
    try {
      await dismissBtn.waitFor({ state: 'visible', timeout: 3000 });
      await dismissBtn.click();
    } catch {
      // Alarm modal wasn't active
    }

    // Open Quick Messages via header button
    const messageBtn = page.getByRole('button', { name: 'Send Message' });
    await expect(messageBtn).toBeVisible({ timeout: 5000 });
    await messageBtn.click();

    // Tap "I took my medicine"
    const tookMedQuick = page.getByRole('button', { name: 'I took my medicine' });
    await expect(tookMedQuick).toBeVisible();
    await tookMedQuick.click();

    // Confirm that the dose was marked as taken in the schedule
    await expect(page.getByText(/Marked .* as taken in your schedule!/i)).toBeVisible({ timeout: 5000 });
  });
});

