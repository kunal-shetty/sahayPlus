import { test, expect } from '@playwright/test';
import { setupMockApi, injectSession } from './helpers/mock-api';
import {
  humanClick,
  humanType,
  humanDoubleTap,
  humanScroll,
  auditVisualLayout,
  monitorBrowserErrors,
} from './helpers/human-actions';

/**
 * @file 05-human-exploratory.spec.ts
 * @description Human-Like Exploratory QA Test Suite for Sahay+.
 *
 * Simulates real human behaviors across all core modules:
 * - Observing page layout, contrast, and headings before clicking
 * - Realistic mouse hover, hesitation pauses, and keystroke-cadence typing
 * - Senior persona: tremors (double-taps), presbyopia, accidental clicks, SOS false alarm abort
 * - Caregiver persona: schedule management, empty input resilience, Chemist 1-tap WhatsApp refills
 * - Adversarial & edge cases: mid-flow page refresh, browser back navigation, mobile viewport audits
 */

test.describe('Human-Like Exploratory QA Testing: Senior Persona', () => {
  test('Exploratory 1: Senior observes onboarding, tests role switching resilience', async ({ page }) => {
    const errorMonitor = monitorBrowserErrors(page);
    await setupMockApi(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Human observes the initial landing / role selection screen
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Visual layout audit: verify no horizontal scroll overflow
    const layout = await auditVisualLayout(page);
    expect(layout.hasHorizontalOverflow).toBeFalsy();

    // Human scrolls down to read the full page
    await humanScroll(page, 200);

    // If on landing page, click Get Started to reach role selection
    const getStartedBtn = page.getByRole('link', { name: /Get Started|Start/i }).or(
      page.getByRole('button', { name: /Get Started|Start/i })
    ).first();

    if (await getStartedBtn.isVisible().catch(() => false)) {
      await humanClick(getStartedBtn);
      await page.waitForLoadState('networkidle');
    }

    // Check Role Cards visibility
    const receiverCard = page.getByRole('button', { name: /Care Receiver|managing my own care/i }).or(
      page.getByText(/Care Receiver/i)
    ).first();

    if (await receiverCard.isVisible().catch(() => false)) {
      // Human reads both options and selects Care Receiver
      await humanClick(receiverCard);
      await page.waitForTimeout(600);
    }

    errorMonitor.stop();
    if (errorMonitor.errors.length > 0) {
      console.log('CAPTURED_EXPLORATORY_2_ERRORS:', errorMonitor.errors);
    }
    expect(errorMonitor.errors.length).toBe(0);
  });

  test('Exploratory 2: Senior home screen, tremors double-tap on intake & reassurance feedback', async ({ page }) => {
    const errorMonitor = monitorBrowserErrors(page);
    await setupMockApi(page, 'care_receiver');
    await injectSession(page, 'care_receiver');

    // Test on senior mobile viewport (390 x 844 - iPhone / Galaxy size)
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/care-receiver');
    await page.waitForLoadState('networkidle');

    // Visual audit: verify clean mobile fit without horizontal scrollbars
    const mobileLayout = await auditVisualLayout(page);
    expect(mobileLayout.hasHorizontalOverflow).toBeFalsy();

    // Dismiss any initial alarm modal if open, to inspect the home screen
    const alarmDismiss = page.getByRole('button', { name: /Not right now|Dismiss|Close|Later/i }).first();
    if (await alarmDismiss.isVisible().catch(() => false)) {
      await humanClick(alarmDismiss);
    }

    // 1. Morning Wellness Card 1-tap interaction
    const doingOkayBtn = page.getByRole('button', { name: /Doing Okay|Managing alright/i }).first();
    if (await doingOkayBtn.isVisible().catch(() => false)) {
      await humanClick(doingOkayBtn);
      // Verify confirmation feedback appears
      await expect(page.getByText(/can see how you are feeling|Shared/i).first()).toBeVisible({ timeout: 4000 });
    }

    // 2. Medicine Intake with Tremors (Accidental Double-Tap)
    const tookItBtn = page.getByRole('button', { name: /I took it/i }).first();
    if (await tookItBtn.isVisible().catch(() => false)) {
      // Simulate rapid double-tap
      await humanDoubleTap(tookItBtn);
      await page.waitForTimeout(500);

      // Verify immediate comforting reassurance screen appears
      await expect(page.getByRole('heading', { name: /Noted\. Take care\.|You are all caught up/i }).first()).toBeVisible({ timeout: 6000 });
    }

    errorMonitor.stop();
    if (errorMonitor.errors.length > 0) {
      console.log('CAPTURED_EXPLORATORY_2_ERRORS:', errorMonitor.errors);
    }
    expect(errorMonitor.errors.length).toBe(0);
  });

  test('Exploratory 3: Emergency SOS two-stage grace countdown & false alarm abort', async ({ page }) => {
    const errorMonitor = monitorBrowserErrors(page);
    await setupMockApi(page, 'care_receiver');
    await injectSession(page, 'care_receiver');

    await page.goto('/care-receiver');
    await page.waitForLoadState('networkidle');

    // Dismiss initial alarm if present
    const alarmDismiss = page.getByRole('button', { name: /Not right now|Dismiss|Close|Later/i }).first();
    if (await alarmDismiss.isVisible().catch(() => false)) {
      await humanClick(alarmDismiss);
    }

    // Senior locates the red SOS button
    const sosBtn = page.getByRole('button', { name: /Emergency SOS|SOS/i }).first();
    await expect(sosBtn).toBeVisible();

    // Human hovers and clicks the SOS button
    await humanClick(sosBtn);

    // Verify STAGE 1: 10-second grace window modal activates
    await expect(page.getByText(/Emergency SOS Triggered/i)).toBeVisible({ timeout: 4000 });
    await expect(page.getByText(/Sending Emergency Alert In/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Cancel \(False Alarm\)/i })).toBeVisible();

    // Human waits 2 seconds, observing the 48pt countdown
    await page.waitForTimeout(2000);

    // Senior realizes it was an accidental touch and clicks "Cancel (False Alarm)"
    const cancelSosBtn = page.getByRole('button', { name: /Cancel \(False Alarm\)/i });
    await humanClick(cancelSosBtn);

    // Verify modal closes cleanly and the peace of the main screen is restored
    await expect(page.getByText(/Emergency SOS Triggered/i)).not.toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/Emergency SOS/i).first()).toBeVisible();

    errorMonitor.stop();
    if (errorMonitor.errors.length > 0) {
      console.log('CAPTURED_EXPLORATORY_2_ERRORS:', errorMonitor.errors);
    }
    expect(errorMonitor.errors.length).toBe(0);
  });
});

test.describe('Human-Like Exploratory QA Testing: Caregiver Persona', () => {
  test('Exploratory 4: Medication form input resilience & neighborhood chemist refills', async ({ page }) => {
    const errorMonitor = monitorBrowserErrors(page);
    await setupMockApi(page, 'caregiver');
    await injectSession(page, 'caregiver');

    // 1. Navigate to caregiver dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Human scrolls down to inspect existing regimen
    await humanScroll(page, 150);

    // Open Medication Form on dashboard
    const openAddMedBtn = page.getByRole('button', { name: /Add medication/i }).first();
    await humanClick(openAddMedBtn);

    // Adversarial Check: Submit button inside form is disabled when required inputs are empty
    const submitBtn = page.getByRole('button', { name: 'Add medication' }).last();
    await expect(submitBtn).toBeDisabled();

    // Human enters realistic medication details with keystroke cadence
    const nameInput = page.getByPlaceholder(/e\.g\., Aspirin|Medication name/i).first();
    await humanType(nameInput, 'Atorvastatin', { delayMs: 70, makeTypo: true });

    const doseInput = page.getByPlaceholder(/e\.g\., 1 tablet|Dosage/i).first();
    await humanType(doseInput, '20mg', { delayMs: 65 });

    // Select Meal Timing: "Before Meal"
    const beforeMealOption = page.getByRole('button', { name: /Before Meal/i }).first();
    if (await beforeMealOption.isVisible().catch(() => false)) {
      await humanClick(beforeMealOption);
    }

    // Now submit button is enabled!
    await expect(submitBtn).toBeEnabled();
    await humanClick(submitBtn);
    await page.waitForTimeout(600);

    // 2. Navigate to Pharmacist Panel (Module 12)
    await page.goto('/caregiver/pharmacist');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Pharmacist Panel' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Local Pharmacy' })).toBeVisible();

    // Verify 1-Tap Direct WhatsApp Refill Section
    await expect(page.getByText(/Chemist Direct Refill/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /1-Tap WhatsApp Refill/i })).toBeVisible();

    // Human clicks "Copy Text" button to copy pre-formatted WhatsApp refill message
    const copyBtn = page.getByRole('button', { name: /Copy Text/i });
    await humanClick(copyBtn);
    await expect(page.getByText(/Copied!/i)).toBeVisible({ timeout: 3000 });

    errorMonitor.stop();
    if (errorMonitor.errors.length > 0) {
      console.log('CAPTURED_EXPLORATORY_2_ERRORS:', errorMonitor.errors);
    }
    expect(errorMonitor.errors.length).toBe(0);
  });

  test('Exploratory 5: Habit pattern insights delay bands & temporary care handover', async ({ page }) => {
    const errorMonitor = monitorBrowserErrors(page);
    await setupMockApi(page, 'caregiver');
    await injectSession(page, 'caregiver');

    // 1. Navigate to Analytics (Module 8)
    await page.goto('/caregiver/analytics');
    await page.waitForLoadState('networkidle');

    // Observe Time-of-Day Consistency Performance Bands
    await expect(page.getByText(/Habit Pattern Insights & Delay Analytics/i)).toBeVisible();
    await expect(page.getByText(/Morning Routine/i).first()).toBeVisible();
    await expect(page.getByText(/Afternoon Routine/i).first()).toBeVisible();
    await expect(page.getByText(/Evening Routine/i).first()).toBeVisible();

    // Observe Proactive Schedule Recommendations
    await expect(page.getByRole('heading', { name: /Proactive Schedule Recommendations/i })).toBeVisible();
    await expect(page.getByText(/Generated from rolling 7-day intake timestamps/i)).toBeVisible();

    // 2. Navigate to Temporary Care Handover (Module 11)
    await page.goto('/caregiver/roles');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Care Roles' })).toBeVisible();

    // Click "Initiate Temporary Handover" to open form
    const initiateBtn = page.getByRole('button', { name: /Initiate Temporary Handover/i });
    await humanClick(initiateBtn);

    // Enter secondary caregiver details with human typing
    const nameInput = page.getByPlaceholder(/Sister, Sibling/i).first();
    await humanType(nameInput, 'Sister Priya', { delayMs: 60 });

    const emailInput = page.getByPlaceholder(/sister@example\.com/i).first();
    await humanType(emailInput, 'priya.sister@gmail.com', { delayMs: 65, makeTypo: true });

    // Confirm Handover and generate claim code
    const confirmBtn = page.getByRole('button', { name: /Confirm Handover/i });
    await humanClick(confirmBtn);
    await page.waitForTimeout(600);

    // Verify Active Handover state with claim/invite code
    await expect(page.getByText(/Transferred to: Sister Priya/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Caregiver Claim \/ Invite Code/i)).toBeVisible();

    // Human clicks "Resume Full Care (End Handover)" to restore primary caregiver authority
    const endHandoverBtn = page.getByRole('button', { name: /Resume Full Care \(End Handover\)/i });
    await humanClick(endHandoverBtn);
    await page.waitForTimeout(600);

    // Verify return to initial state with Initiate button visible
    await expect(page.getByRole('button', { name: /Initiate Temporary Handover/i })).toBeVisible({ timeout: 10000 });

    errorMonitor.stop();
    if (errorMonitor.errors.length > 0) {
      console.log('CAPTURED_EXPLORATORY_2_ERRORS:', errorMonitor.errors);
    }
    expect(errorMonitor.errors.length).toBe(0);
  });

  test('Exploratory 6: Mid-flow page refresh & browser back-navigation resilience', async ({ page }) => {
    const errorMonitor = monitorBrowserErrors(page);
    await setupMockApi(page, 'caregiver');
    await injectSession(page, 'caregiver');

    // Navigate to Contextual Notes
    await page.goto('/caregiver/notes');
    await page.waitForLoadState('networkidle');

    // Expand Note Creator
    const addNoteBtn = page.getByRole('button', { name: /Add a note/i });
    await humanClick(addNoteBtn);

    // Human writes a contextual note
    const noteInput = page.getByPlaceholder(/Why did something change/i).first();
    await humanType(noteInput, 'Slight joint stiffness reported this morning.', { delayMs: 60 });

    const saveBtn = page.getByRole('button', { name: /Save note/i });
    await humanClick(saveBtn);
    await page.waitForTimeout(400);

    // Verify note rendered
    await expect(page.getByText('Slight joint stiffness reported this morning.').first()).toBeVisible();

    // Adversarial Check: Page Refresh Mid-Session
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify session and note persist across refresh without session drop
    await expect(page.getByText('Slight joint stiffness reported this morning.').first()).toBeVisible();

    // Adversarial Check: Browser Back Button Navigation
    await page.goto('/caregiver/doctor-prep');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /Doctor Visit Prep/i })).toBeVisible();

    // Click browser Back
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Confirms back navigation returns to Notes seamlessly
    await expect(page.getByRole('heading', { name: /Notes/i }).first()).toBeVisible();

    errorMonitor.stop();
    if (errorMonitor.errors.length > 0) {
      console.log('CAPTURED_EXPLORATORY_2_ERRORS:', errorMonitor.errors);
    }
    expect(errorMonitor.errors.length).toBe(0);
  });
});
