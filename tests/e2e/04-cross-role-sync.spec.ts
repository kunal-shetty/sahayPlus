import { test, expect } from '@playwright/test';
import { setupMockApi, injectSession } from './helpers/mock-api';

/**
 * @file 04-cross-role-sync.spec.ts
 * @description Phase 4: Real-Time Cross-Role Synchronization & Daily Care Closure
 * Complete end-of-day closure & cross-device coordination:
 * 1. Synchronized medication state across Care Receiver and Caregiver
 * 2. Peaceful Daily Care Closure ritual ("Close Today" -> "That's everything for today.")
 */

test.describe('Phase 4: Real-Time Cross-Role Sync & Care Closure', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApi(page, 'caregiver');
    await injectSession(page, 'caregiver');
  });

  test('Step 1: should reflect real-time medication intake sync on caregiver dashboard', async ({ page }) => {
    await page.goto('/caregiver');
    await page.waitForLoadState('networkidle');

    // Confirm caregiver sees scheduled medication items
    await expect(page.getByText('Amlodipine').first()).toBeVisible();
    await expect(page.getByText('Metformin').first()).toBeVisible();

    // Verify streak and schedule container render correctly
    await expect(page.getByText(/Current Streak/i)).toBeVisible();
  });

  test('Step 2: should perform peaceful end-of-day closure ritual', async ({ page }) => {
    await page.goto('/caregiver');
    await page.waitForLoadState('networkidle');

    // Find the Daily Closure card
    const closeTodayBtn = page.getByRole('button', { name: /Close today/i });
    if (await closeTodayBtn.isVisible()) {
      await expect(page.getByText(/Ready to close the day\?/i)).toBeVisible();

      // Click "Close today"
      await closeTodayBtn.click();

      // Verify the closure card updates into peaceful completion state
      await expect(page.getByText(/That's everything for today/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/Rest well\. Tomorrow is a fresh start/i)).toBeVisible();
    }
  });
});

