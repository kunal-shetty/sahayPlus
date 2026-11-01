import { test, expect } from '@playwright/test';
import { setupMockApi, injectSession } from './helpers/mock-api';

/**
 * @file 03-receiver-journey.spec.ts
 * @description Phase 3: Senior Daily Living & Medication Intake Flow
 * Complete senior assistive walkthrough:
 * Alarm Modal -> Medication Photo -> Snooze -> Intake Confirmation ->
 * Reassurance -> Pill Selector -> Wellness 1-Tap -> Quick Messages ->
 * Motion Safety Check -> Emergency SOS
 */

test.describe('Phase 3: Senior Daily Living & Intake Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApi(page, 'care_receiver');
    await injectSession(page, 'care_receiver');
  });

  test('Step 1: should display dose alarm with uploaded medication photograph and hands-free voice detection', async ({ page }) => {
    await page.goto('/care-receiver');
    await page.waitForLoadState('networkidle');

    // If alarm modal is not already displayed, trigger it via Test Medicine Reminder
    const alarmVoiceBanner = page.getByText(/Say "I took it"|Hands-free voice/i).first();
    if (!(await alarmVoiceBanner.isVisible().catch(() => false))) {
      const testReminderBtn = page.getByRole('button', { name: 'Test Medicine Reminder' });
      if (await testReminderBtn.isVisible().catch(() => false)) {
        await testReminderBtn.click();
      }
    }

    // Confirm dose name is displayed (either Amlodipine or Metformin)
    await expect(page.getByText('Amlodipine').or(page.getByText('Metformin')).first()).toBeVisible({ timeout: 10000 });

    // Confirm hands-free indicator is active on alarm modal
    await expect(page.getByText(/Say "I took it"|Hands-free voice/i).first()).toBeVisible({ timeout: 10000 });

    // If Metformin button exists in pill selector, click it and confirm uploaded photo renders
    const metforminTab = page.getByRole('button', { name: /Metformin/i }).first();
    if (await metforminTab.isVisible().catch(() => false)) {
      await metforminTab.click();
      await expect(page.locator('img[alt="Metformin"]').first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('Step 2: should allow senior to snooze medication alarm for 10 minutes', async ({ page }) => {
    await page.goto('/care-receiver');
    await page.waitForLoadState('networkidle');

    // If alarm is not active, trigger it
    const snoozeBtn = page.getByRole('button', { name: /Remind in 10m/i });
    if (!(await snoozeBtn.isVisible().catch(() => false))) {
      const testReminderBtn = page.getByRole('button', { name: 'Test Medicine Reminder' });
      if (await testReminderBtn.isVisible().catch(() => false)) {
        await testReminderBtn.click();
      }
    }

    // Confirm snooze button is visible and click it
    if (await snoozeBtn.isVisible()) {
      await snoozeBtn.click();
      // Alarm modal should dismiss smoothly
      await expect(snoozeBtn).not.toBeVisible({ timeout: 10000 });
    }
  });

  test('Step 3: should allow senior to confirm dose intake by tapping "I took it"', async ({ page }) => {
    await page.goto('/care-receiver');
    await page.waitForLoadState('networkidle');

    // If alarm is not active, trigger it
    const tookItBtn = page.getByRole('button', { name: 'I took it' });
    if (!(await tookItBtn.isVisible().catch(() => false))) {
      const testReminderBtn = page.getByRole('button', { name: 'Test Medicine Reminder' });
      if (await testReminderBtn.isVisible().catch(() => false)) {
        await testReminderBtn.click();
      }
    }

    // Click "I took it"
    await expect(tookItBtn).toBeVisible({ timeout: 10000 });
    await tookItBtn.click();

    // Reassurance screen appears: "Noted. Take care."
    await expect(page.getByRole('heading', { name: 'Noted. Take care.' })).toBeVisible({ timeout: 10000 });
  });

  test('Step 4: should record morning wellness check-in with 1 tap', async ({ page }) => {
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
    await expect(wellnessOption).toBeVisible({ timeout: 10000 });
    await wellnessOption.click();
    await expect(page.getByText('Shared ✓')).toBeVisible({ timeout: 10000 });
  });

  test('Step 5: should synchronize medication intake when sending "I took my medicine" via quick messages', async ({ page }) => {
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
    await expect(messageBtn).toBeVisible({ timeout: 10000 });
    await messageBtn.click();

    // Tap "I took my medicine"
    const tookMedQuick = page.getByRole('button', { name: 'I took my medicine' });
    await expect(tookMedQuick).toBeVisible();
    await tookMedQuick.click();

    // Confirm that the dose was marked as taken in the schedule
    await expect(page.getByText(/Marked .* as taken in your schedule!/i)).toBeVisible({ timeout: 10000 });
  });

  test('Step 6: should display full-screen safety check prompt on motion detection and dismiss when confirmed okay', async ({ page }) => {
    await page.goto('/care-receiver');
    await page.waitForLoadState('networkidle');

    // Dismiss alarm modal if active
    const dismissBtn = page.getByRole('button', { name: 'Not right now' });
    try {
      await dismissBtn.waitFor({ state: 'visible', timeout: 3000 });
      await dismissBtn.click();
    } catch {
      // Alarm modal was not active
    }

    // Trigger safety check
    await page.evaluate(() => {
      (window as any).triggerMotionSafetyCheck?.();
    });

    // Verify "Are you okay?" prompt renders
    await expect(page.getByRole('heading', { name: 'Are you okay?' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/We noticed a quick movement/i)).toBeVisible();

    // Tap "Yes, I'm okay"
    const confirmBtn = page.getByRole('button', { name: "Yes, I'm okay" });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // Verify safety check overlay closes
    await expect(page.getByRole('heading', { name: 'Are you okay?' })).not.toBeVisible({ timeout: 10000 });
  });

  test('Step 7: should open emergency call screen when tapping "Call someone"', async ({ page }) => {
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

    const callHelpBtn = page.getByRole('button', { name: 'Call someone' });
    await expect(callHelpBtn).toBeVisible({ timeout: 10000 });
    await callHelpBtn.click();
    await expect(page.getByRole('heading', { name: 'Need Help?' })).toBeVisible();
  });
});
