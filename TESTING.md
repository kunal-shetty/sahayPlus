# Testing Strategy & Documentation - Sahay+

## 1. Overview
The Sahay+ testing strategy is designed to ensure the reliability and accessibility of critical care coordination flows. Given the nature of the application, we prioritize End-to-End (E2E) testing for core journeys that impact patient safety and caregiver peace of mind.

### Goals
- **Stability**: Ensure that critical alerts (Emergency, Safety Checks) always trigger.
- **Accessibility**: Verify that the Care-receiver interface remains simple and usable.
- **Reliability**: Guarantee that medication logs and wellness reports are persisted and visible.

## 2. Testing Levels
- **Unit Tests**: (Planned) Testing individual utility functions and components.
- **Integration Tests**: (Planned) Testing API endpoint responses and database interactions.
- **E2E Tests**: Using Playwright to simulate real user journeys across the entire application.

## 3. Local Setup Guide

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Install Playwright browsers:
   \`\`\`bash
   npx playwright install --with-deps
   \`\`\`

### Running Tests
- **Run all E2E tests**:
  \`\`\`bash
  npm run test:e2e
  \`\`\`
- **Run tests in UI mode (Interactive)**:
  \`\`\`bash
  npm run test:e2e:ui
  \`\`\`
- **View test report**:
  \`\`\`bash
  npm run test:e2e:report
  \`\`\`

## 4. Test Case Matrix

### Suite A: Auth & Onboarding
| ID | Scenario | Input | Expected Result |
| :--- | :--- | :--- | :--- |
| AU-01 | New User Registration | Valid email, name, role | Account created $\rightarrow$ Redirected to Onboarding |
| AU-02 | Invalid Registration | Existing email | Error: "Email already in use" |
| AU-03 | User Login | Registered credentials | Authenticated $\rightarrow$ Redirected to Home/Role Selection |
| AU-04 | Role Selection | Select "Caregiver" | Profile updated as caregiver $\rightarrow$ Caregiver onboarding |
| AU-05 | Care Linking | Valid 6-char Care Code | Link established $\rightarrow$ Care-receiver visible in dashboard |

### Suite B: Caregiver Features
| ID | Scenario | Input | Expected Result |
| :--- | :--- | :--- | :--- |
| CG-01 | Med Log: Take | Mark as "Taken" | Timeline updated $\rightarrow$ Streak increments |
| CG-02 | Med Log: Skip | Mark as "Skipped" + Reason | Logged in history $\rightarrow$ Flagged for review |
| CG-03 | Wellness Monitoring | Check wellness overview | Receiver's reported state visible |
| CG-04 | Care Note | Add contextual note | Note appears on the chronological timeline |
| CG-05 | Emergency Contacts | Update primary contact | Updated info persists $\rightarrow$ Highlighted as primary |

### Suite C: Care-receiver Features
| ID | Scenario | Input | Expected Result |
| :--- | :--- | :--- | :--- |
| CR-01 | Wellness Check-in | Select "Okay" $\rightarrow$ Submit | Confirmation shown $\rightarrow$ Visible to caregiver |
| CR-02 | Emergency Trigger | Tap "Call help" | Immediate alert sent $\rightarrow$ Redirected to call screen |
| CR-03 | Quick Message | Select "I need help" | Message delivered to caregiver dashboard |
| CR-04 | Safety Response | Confirm "I'm okay" on prompt | Prompt dismissed $\rightarrow$ Escalation halted |

## 5. CI/CD Pipeline (Jenkins)
The project uses a Jenkins declarative pipeline to automate quality assurance.

### Pipeline Flow
1. **Checkout**: Pulls latest code from Git.
2. **Install**: Executes \`npm ci\` for clean dependency installation.
3. **Build**: Executes \`npm run build\` to verify Next.js build integrity.
4. **E2E Tests**:
    - Installs Playwright browsers.
    - Runs the full E2E suite.
5. **Reporting**:
    - Generates a JUnit XML report.
    - Publishes the Playwright HTML report as a Jenkins artifact.

### Failure Handling
On test failure, the pipeline:
- Captures a trace and screenshot of the failed step.
- Sends an email notification to the development team.
- Marks the build as failed, blocking merges to the main branch.

## 6. Contributing
When adding new features, please:
1. Add corresponding test cases to the matrix in this file.
2. Implement a new \`.spec.ts\` file in \`tests/e2e/\`.
3. Use Page Object Models in \`tests/e2e/pages/\` to keep tests maintainable.
