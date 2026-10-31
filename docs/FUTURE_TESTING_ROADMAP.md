# Sahay+ Future Automated Testing Roadmap

This document outlines the secondary test suites and test cases planned for Sahay+. 

The **core daily spine of Sahay+ (21 tests)** is already 100% implemented and passing via `npm run test:all`. The test suites detailed below cover secondary workflows and edge cases to be automated in future phases.

---

## 1. Current Test Coverage Status (Baseline: 21 / 21 Passing ✅)

| Layer | Runner | Tests | Execution Speed | Features Tested |
| :--- | :--- | :---: | :---: | :--- |
| **Unit / Logic** | Vitest | 10 | ~400ms | Phonetic voice recognition, brand synonyms, Hindi speech, overdue delay math. |
| **E2E Browser** | Playwright | 11 | ~35s | Login auth, caregiver dashboard, med addition, pill alarm modal, 1-tap intake, morning wellness, emergency SOS. |

---

## 2. Planned Test Suites (To Be Implemented Later)

### Module 1: Care Code Pairing & Account Linking
* **Target File:** `tests/e2e/pairing.spec.ts`
* **Related App Files:** [`app/onboarding/page.tsx`](file:///c:/Users/Harsh/Desktop/sdac/t/app/onboarding/page.tsx), [`app/api/care-relationships/link/route.ts`](file:///c:/Users/Harsh/Desktop/sdac/t/app/api/care-relationships/link/route.ts)
* **Objective:** Test first-time linking between an unlinked senior and caregiver using the 6-character claim code.
* **Test Cases to Implement:**
  1. Senior enters valid 6-character code (e.g. `SAHAY9`) $\rightarrow$ verifies caregiver name ("Anita Patel") is previewed.
  2. Submitting valid code creates the care relationship and redirects to the senior home screen.
  3. Submitting an invalid or expired code displays an inline error: *"Care code not found or expired"*.
  4. Caregiver generates a new care code from their settings drawer $\rightarrow$ verifies code is 6 alphanumeric uppercase characters.

---

### Module 8: Detailed Adherence Analytics & Trends
* **Target File:** `tests/e2e/adherence-analytics.spec.ts`
* **Related App Files:** [`components/caregiver/adherence-stats.tsx`](file:///c:/Users/Harsh/Desktop/sdac/t/components/caregiver/adherence-stats.tsx), [`app/caregiver/page.tsx`](file:///c:/Users/Harsh/Desktop/sdac/t/app/caregiver/page.tsx)
* **Objective:** Verify visual rendering and historical calculations of senior medication compliance.
* **Test Cases to Implement:**
  1. Caregiver dashboard renders 7-day adherence bar chart with correct daily percentages.
  2. When 100% of medications are taken on time, adherence indicator displays 100% and a green checkmark.
  3. When doses are missed, adherence percentage decreases accordingly and highlights the specific missed day.
  4. Streak badge correctly increments when consecutive days have 100% completion.

---

### Module 10: Missed Dose Escalation Protocol
* **Target File:** `tests/e2e/escalation.spec.ts`
* **Related App Files:** [`lib/escalation.ts`](file:///c:/Users/Harsh/Desktop/sdac/t/lib/escalation.ts), [`app/api/escalation/route.ts`](file:///c:/Users/Harsh/Desktop/sdac/t/app/api/escalation/route.ts), [`components/care-receiver/intake-alarm-modal.tsx`](file:///c:/Users/Harsh/Desktop/sdac/t/components/care-receiver/intake-alarm-modal.tsx)
* **Objective:** Verify escalation behavior when a senior does not take or acknowledge a scheduled dose.
* **Test Cases to Implement:**
  1. **Level 1 (0–15 mins)**: Pill alarm modal displays gentle chime and visual pill prompt.
  2. **Level 2 (15–30 mins)**: Escalates to urgent alert state with second reminder banner on senior screen.
  3. **Level 3 (30+ mins)**: Fires caregiver notification (simulated webhook/SMS payload) alerting family member that dose is critically late.
  4. Caregiver dashboard displays an urgent alert badge on the senior card.

---

### Module 11: Care Handover & Secondary Caregiver Delegation
* **Target File:** `tests/e2e/handover.spec.ts`
* **Related App Files:** [`app/caregiver/roles/page.tsx`](file:///c:/Users/Harsh/Desktop/sdac/t/app/caregiver/roles/page.tsx), [`app/api/handover/start/route.ts`](file:///c:/Users/Harsh/Desktop/sdac/t/app/api/handover/start/route.ts), [`app/api/handover/end/route.ts`](file:///c:/Users/Harsh/Desktop/sdac/t/app/api/handover/end/route.ts)
* **Objective:** Test temporary transfer of care responsibilities to a secondary helper (babysitter, sibling, nurse).
* **Test Cases to Implement:**
  1. Primary caregiver opens Handover form, enters secondary helper name ("Rahul"), duration ("3 days"), and clicks "Start Handover".
  2. System generates a temporary invite PIN and shows active handover status banner.
  3. Senior dashboard displays reassurance banner: *"Care temporarily supported by Rahul"*.
  4. Primary caregiver clicks "End Handover" $\rightarrow$ primary caregiver privileges are immediately restored.
  5. Handover auto-expiration: When simulated time passes the `endDate`, handover automatically lapses.

---

### Module 12: Daily Routine & Safety Check
* **Target File:** `tests/e2e/safety-check.spec.ts`
* **Related App Files:** [`components/care-receiver/safety-check.tsx`](file:///c:/Users/Harsh/Desktop/sdac/t/components/care-receiver/safety-check.tsx), [`app/care-receiver/page.tsx`](file:///c:/Users/Harsh/Desktop/sdac/t/app/care-receiver/page.tsx)
* **Objective:** Verify evening daily routine closing and inactivity detection.
* **Test Cases to Implement:**
  1. Evening card appears after 7:00 PM prompting the senior to wrap up the day.
  2. When all pills for the day are taken, displays positive reinforcement: *"You're all set for today! Rest well."*
  3. If no senior activity is detected for an extended window during awake hours, flags safety check card.

---

### Module 13: Doctor Visit Summary Export
* **Target File:** `tests/e2e/doctor-export.spec.ts`
* **Related App Files:** [`components/caregiver/doctor-summary-modal.tsx`](file:///c:/Users/Harsh/Desktop/sdac/t/components/caregiver/doctor-summary-modal.tsx), [`app/caregiver/page.tsx`](file:///c:/Users/Harsh/Desktop/sdac/t/app/caregiver/page.tsx)
* **Objective:** Test generation of physician-ready adherence reports.
* **Test Cases to Implement:**
  1. Caregiver clicks "Doctor Prep" or "Export Summary" button on dashboard.
  2. Summary modal opens displaying senior name, active prescription list, 30-day adherence rate, and recorded side-effect notes.
  3. Clicking "Print / Export PDF" triggers browser print media layout with clean clinical formatting.

---

### Module 14: Visual Accessibility & Theme Modes
* **Target File:** `tests/e2e/accessibility.spec.ts`
* **Related App Files:** [`components/theme-toggle.tsx`](file:///c:/Users/Harsh/Desktop/sdac/t/components/theme-toggle.tsx), [`components/care-receiver/intake-alarm-modal.tsx`](file:///c:/Users/Harsh/Desktop/sdac/t/components/care-receiver/intake-alarm-modal.tsx)
* **Objective:** Verify WCAG compliance for senior accessibility.
* **Test Cases to Implement:**
  1. Toggling Night Mode switches UI to high-contrast dark theme (pure black backgrounds with luminous amber/green accents).
  2. Button touch targets meet senior accessibility standards (minimum 48px to 64px height).
  3. High-contrast text passes minimum 4.5:1 contrast ratio against card backgrounds.

---

### Cloud Integration: Live Supabase Round-Trip (Optional)
* **Target Config:** `playwright.live.config.ts`
* **Objective:** Run the full E2E suite against live remote Supabase endpoints instead of local mock routes.
* **Prerequisites:**
  1. Unpause Supabase project `cydejrgzkvqgbmffqlcc` from the Supabase web dashboard.
  2. Verify DNS resolution succeeds (`Resolve-DnsName cydejrgzkvqgbmffqlcc.supabase.co`).
  3. Execute `npx playwright test --config=playwright.live.config.ts`.

---

## 3. Quick Reference: Running Existing Tests

```bash
# 1. Run ultra-fast unit tests (< 500ms)
npm run test:unit

# 2. Run unit tests in interactive watch mode
npm test

# 3. Run all 11 E2E browser tests in headless mode
npm run test:e2e

# 4. Open interactive visual desktop runner
npm run test:e2e:ui

# 5. Run both Unit and E2E test suites together
npm run test:all
```

