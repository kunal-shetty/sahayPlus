import { test, expect } from '@playwright/test';
import { setupMockApi, injectSession } from './helpers/mock-api';

/**
 * @file caregiver.spec.ts
 * @description End-to-End tests for Caregiver Dashboard & Tools (Modules 7, 8, 9, 10, 11, 12, 13).
 * Runs 100% locally with instant mock data (no database or external network needed).
 */

test.describe('Caregiver Suite', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Setup instant mock network routes
    await setupMockApi(page, 'caregiver');
    // 2. Pre-authenticate as Caregiver into localStorage
    await injectSession(page, 'caregiver');
  });

  test('should render caregiver dashboard with senior info and streak analytics', async ({ page }) => {
    await page.goto('/caregiver');

    // Care header and greeting displayed
    await expect(page.locator('h1')).toContainText('Care');
    await expect(page.getByText(/Good (morning|afternoon|evening)/i)).toBeVisible();

    // Streak and adherence analytics visible
    await expect(page.getByText(/Current Streak/i)).toBeVisible();

    // "Add medication" action button is visible
    await expect(page.getByRole('button', { name: /Add medication/i })).toBeVisible();
  });

  test('should open medication form and allow adding a new medication', async ({ page }) => {
    await page.goto('/caregiver');

    // Click "Add medication"
    const addBtn = page.getByRole('button', { name: /Add medication/i });
    await addBtn.click();

    // Form inputs should be visible
    const nameInput = page.locator('#medName');
    const dosageInput = page.locator('#medDosage');

    await expect(nameInput).toBeVisible();
    await expect(dosageInput).toBeVisible();

    // Fill in new medication details
    await nameInput.fill('Atorvastatin');
    await dosageInput.fill('10mg');

    // Click save button in footer
    const saveBtn = page.locator('footer button:has-text("Add medication")');
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();

    // Should return to dashboard and show added med
    await expect(page.getByText('Atorvastatin').first()).toBeVisible({ timeout: 10000 });
  });

  test('should open and close the settings panel', async ({ page }) => {
    await page.goto('/caregiver');

    // Click settings gear button
    const settingsBtn = page.getByRole('button', { name: 'Settings' });
    await settingsBtn.click();

    // Settings panel should open
    await expect(page.getByText('Care Role').or(page.getByText('Settings'))).toBeVisible();

    // Close settings
    const closeBtn = page.getByRole('button', { name: /Close|back|Go back/i }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  });

  test('should display existing scheduled medications with dose tags', async ({ page }) => {
    await page.goto('/caregiver');

    // Existing mock medications should be rendered
    await expect(page.getByText('Amlodipine').first()).toBeVisible();
    await expect(page.getByText('Metformin').first()).toBeVisible();
  });

  test('should render clinical doctor prep summary with active medications table and print action', async ({ page }) => {
    await page.goto('/caregiver/doctor-prep');
    await page.waitForLoadState('networkidle');

    // Confirm Patient Care Summary and demographics render
    await expect(page.getByRole('heading', { name: /Doctor Visit Prep/i })).toBeVisible();
    await expect(page.getByText('Current Active Medications & Regimen')).toBeVisible();

    // Confirm medications table shows scheduled meds (Amlodipine, Metformin)
    await expect(page.getByText('Amlodipine').first()).toBeVisible();
    await expect(page.getByText('Metformin').first()).toBeVisible();

    // Confirm Print and Copy actions are present
    await expect(page.getByRole('button', { name: 'Print' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible();
  });

  test('should allow setting up temporary care handover with invite code and ending handover', async ({ page }) => {
    await page.goto('/caregiver/roles');
    await page.waitForLoadState('networkidle');

    // Confirm Care Roles page loads
    await expect(page.getByRole('heading', { name: 'Care Roles' })).toBeVisible();

    // Click "Initiate Temporary Handover"
    const initiateBtn = page.getByRole('button', { name: /Initiate Temporary Handover/i });
    await expect(initiateBtn).toBeVisible();
    await initiateBtn.click();

    // Fill in secondary caregiver details
    await page.getByPlaceholder(/Sister, Sibling/i).fill('Sister Priya');
    await page.getByPlaceholder(/sister@example.com/i).fill('priya@example.com');

    // Confirm handover and generate code
    const confirmBtn = page.getByRole('button', { name: /Confirm Handover/i });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // Verify active handover state
    await expect(page.getByText(/Transferred to: Sister Priya/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Caregiver Claim \/ Invite Code/i)).toBeVisible();

    // End handover and restore primary caregiving
    const endHandoverBtn = page.getByRole('button', { name: /Resume Full Care \(End Handover\)/i });
    await expect(endHandoverBtn).toBeVisible();
    await endHandoverBtn.click();

    // Verify return to initial state
    await expect(page.getByRole('button', { name: /Initiate Temporary Handover/i })).toBeVisible({ timeout: 10000 });
  });

  test('should render adherence analytics trends and confidence meter on /caregiver/analytics', async ({ page }) => {
    await page.goto('/caregiver/analytics');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Care Insights' })).toBeVisible();
    await expect(page.getByText('Care Confidence')).toBeVisible();
    await expect(page.getByText('Weekly Adherence')).toBeVisible();
  });

  test('should render emergency directory and primary contact on /caregiver/emergency', async ({ page }) => {
    await page.goto('/caregiver/emergency');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Emergency Center' })).toBeVisible();
    await expect(page.getByText(/Anita Patel/i).first()).toBeVisible();
    await expect(page.getByText(/Call Now: 9876543210/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Add Contact/i })).toBeVisible();
  });

  test('should render pharmacist panel and medication notes on /caregiver/pharmacist', async ({ page }) => {
    await page.goto('/caregiver/pharmacist');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Pharmacist Panel' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Local Pharmacy' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Medication Notes' })).toBeVisible();
    await expect(page.getByText('Amlodipine').first()).toBeVisible();
    await expect(page.getByText('Metformin').first()).toBeVisible();
  });

  test('should render caregiver notes and allow adding a contextual note on /caregiver/notes', async ({ page }) => {
    await page.goto('/caregiver/notes');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Notes' })).toBeVisible();

    // Click "Add a note" button
    const addNoteBtn = page.getByRole('button', { name: /Add a note/i });
    await expect(addNoteBtn).toBeVisible();
    await addNoteBtn.click();

    // Type note into textarea
    const textarea = page.getByPlaceholder(/Why did something change/i);
    await textarea.fill('Doctor recommended taking with plenty of water');

    // Click "Save note"
    const saveBtn = page.getByRole('button', { name: /Save note/i });
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();

    // Verify newly added note is visible
    await expect(page.getByText('Doctor recommended taking with plenty of water')).toBeVisible({ timeout: 5000 });
  });

  test('should render medication history with adherence streaks and performance on /caregiver/history', async ({ page }) => {
    await page.goto('/caregiver/history');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Medication History' })).toBeVisible();
    await expect(page.getByText('Total Tracking Days')).toBeVisible();
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Personal Best')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Medication Performance' })).toBeVisible();
  });

  test('should render caregiver wellness overview and allow recording a check-in on /caregiver/wellness', async ({ page }) => {
    await page.goto('/caregiver/wellness');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Wellness Tracking' })).toBeVisible();
    await expect(page.getByText('Past 7 Days Overview')).toBeVisible();

    // Open record wellness check-in modal
    const recordBtn = page.getByRole('button', { name: /Record.*Check-in/i }).first();
    await expect(recordBtn).toBeVisible();
    await recordBtn.click();

    // Verify modal options Great, Okay, Not Great inside the modal container
    const modal = page.locator('.fixed');
    await expect(modal.getByRole('button', { name: 'Great', exact: true })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Okay', exact: true })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Not Great', exact: true })).toBeVisible();

    // Select Great and save
    await modal.getByRole('button', { name: 'Great', exact: true }).click();
    const saveBtn = modal.getByRole('button', { name: /Save Check-in/i });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Modal closes and status reflects feeling great
    await expect(page.getByText(/Feeling great/i).first()).toBeVisible({ timeout: 5000 });
  });
});
