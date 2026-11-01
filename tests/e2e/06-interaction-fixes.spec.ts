import { test, expect } from '@playwright/test';
import { setupMockApi, injectSession } from './helpers/mock-api';

/**
 * @file 06-interaction-fixes.spec.ts
 * @description Regression tests for navigation and help-flow fixes:
 * single caregiver home, working Messages route, role guards, and an SOS
 * that a second tap can never cancel.
 */

test.describe('Caregiver navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApi(page, 'caregiver');
    await injectSession(page, 'caregiver');
  });

  test('old /caregiver home forwards to /dashboard', async ({ page }) => {
    await page.goto('/caregiver');
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('Messages route exists and opens the thread', async ({ page }) => {
    await page.goto('/caregiver/messages');
    await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible({ timeout: 10000 });
  });

  test('caregiver cannot open the care receiver screen', async ({ page }) => {
    await page.goto('/care-receiver');
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });
});

test.describe('Care receiver help flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockApi(page, 'care_receiver');
    await injectSession(page, 'care_receiver');
  });

  test('care receiver cannot open caregiver pages', async ({ page }) => {
    await page.goto('/caregiver/analytics');
    await expect(page).toHaveURL('/care-receiver', { timeout: 10000 });
  });

  test('tapping SOS again while an alert is active does not cancel it', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/care-receiver');
    await page.waitForLoadState('networkidle');

    const notNow = page.getByRole('button', { name: 'Not right now' });
    if (await notNow.isVisible().catch(() => false)) await notNow.click();

    await page.getByRole('button', { name: 'Emergency SOS' }).click();
    await expect(page.getByText(/Emergency SOS Triggered/i)).toBeVisible();

    // Let the 10s grace countdown run out, then close the modal but keep the alert
    const keepOn = page.getByRole('button', { name: 'Close (keep alert on)' });
    await expect(keepOn).toBeVisible({ timeout: 15000 });
    await keepOn.click();

    await expect(page.getByText('Help Alert Active')).toBeVisible();

    // Second tap opens the call screen; the alert stays active
    await page.getByRole('button', { name: /Help is on the way/i }).click();
    await expect(page.getByRole('heading', { name: 'Need Help?' })).toBeVisible();
  });
});
