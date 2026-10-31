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
    await expect(page.getByText('Amlodipine').or(page.getByText('Metformin'))).toBeVisible();

    // If Metformin with uploaded photo is active, confirm pill image renders
    const metforminText = page.getByText('Metformin');
    if (await metforminText.isVisible().catch(() => false)) {
      await expect(page.locator('img[alt="Metformin"]')).toBeVisible();
    }
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
});
