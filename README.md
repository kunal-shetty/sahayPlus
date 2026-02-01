# Sahay+: The Master Interaction & Feature Guide

This document is a complete "Master Guide" to Sahay+. It explains every screen, every button, every micro-interaction, and the underlying logic that makes the app work.

---

## 🏗️ 1. The Core Architecture

### Philosophy: The "Calm Tech" Approach
Sahay+ is built on the principle of **Calm Technology**. Instead of loud alarms and red "missed" warnings, it uses:
*   **Vibrant but Muted Colors**: Sage greens, soft blues, and warm ambers.
*   **Human Language**: "Evenings seem harder" instead of "Adherence: 45%".
*   **Privacy by Design**: Monitoring is passive and respects life's rhythms.

---

## 🚦 2. Entry & Role Selection

### Page: `RoleSelection`
When the app first opens without a saved profile, the user sees two large, beautiful cards.
*   **Left Card (Receiver)**: "I receive care."
    - **Click Interaction**: Tapping the card causes it to subtly "press" into the screen (`scale: 0.98`) and then expand.
    - **Transition**: The screen slides to the left, bringing in the `CareReceiverHome`.
*   **Right Card (Caregiver)**: "I provide care."
    - **Click Interaction**: Same press effect.
    - **Transition**: Slides into the `CaregiverHome` dashboard.

---

## 👵 3. The Care Receiver Experience (`CareReceiverHome`)

### 3.1 The Header (Top Row)
*   **The Greeting**: Displays "Good morning/afternoon/evening" followed by the user's name.
*   **The Gear Icon (Settings)**:
    - **Location**: Top right corner.
    - **Interaction**: Tapping slides in a panel.
    - **Action - Simulate Safety Check**: A special button for testing the "Are you okay?" logic.
*   **"Something Changed" Banner (Feature 7)**:
    - **Visibility**: Only appears if a med name, dose, or time was changed by the caregiver.
    - **Interaction**: An `AnimatePresence` slide-down. It doesn't scream "Warning!"; it just notes that something is different today.

### 3.2 Feature 1: "I'm Fine Today" (The Morning Ritual)
*   **Location**: Top of the list, above medications.
*   **Interaction**: Tapping this large "Smile" button creates a "Happy Pulse" animation.
*   **Result**: The button fades out smoothly. On the caregiver side, a notification appears saying "Dad checked in — everything is okay."

### 3.3 The Current Medication Card
*   **Visuals**: A large white (or dark blue in Night Mode) card with a soft shadow.
*   **Feature 5: Simple Explanation**: Below the dose, a bold line like *"This helps your circulation."*
*   **Primary Action: "I took it"**:
    - **Click Interaction**: Tapping this button triggers a rotation of the checkmark icon and a `spring` animation.
    - **Behind the Scenes**: This records the time, increases the user's "Streak", and adds a `medication_taken` event to the `Care Story`.

### 3.4 Feature 6: Voice Confirmation (The Microphone)
*   **Location**: To the right of the "I took it" button.
*   **Micro-interaction**: Tapping makes the microphone icon scale up and glow with a blue pulse.
*   **Logic**: The app "listens" for keywords. In this simulation, it waits 2 seconds and "confirms" the medication automatically.

### 3.5 Feature 4: "I Need Help" Button
*   **Visual**: A soft blue heart in the quick actions row.
*   **Click Interaction**: Tapping triggers a "Checkmark" to appear inside the button, and the text changes to *"Notified!"*.
*   **Logic**: It silently adds a `help_requested` event. It does **not** call emergency services; it just tells the caregiver that a check-in would be appreciated.

### 3.6 Feature 10: Quiet Night Mode (The Respectful Interface)
*   **Trigger**: The system clock hitting 9:00 PM.
*   **The Transition**: The entire app background smoothly fades from white to a deep midnight navy (`#0f172a`).
*   **Function**: Buttons become less "glowy," text becomes slate-colored to avoid eye strain, and a small moon icon appears to confirm the mode is active.

---

## 👩‍⚕️ 4. The Caregiver Experience (`CaregiverHome`)

### 4.1 Feature 2: Pattern Awareness (The "Insight" Cards)
*   **Location**: Near the top of the dashboard.
*   **Logic**: The app scans the `Timeline`. If it sees multiple `medication_taken` events occurring late at night, it generates a card: *"Evenings seem a bit harder lately."*
*   **Interaction**: These cards are non-dismissible until the next day, serving as a gentle prompt for the caregiver's next conversation.

### 4.2 Feature 8: Missed-Day Soft Follow-Up
*   **Trigger**: If the Receiver's `takenCount` for *yesterday* was zero.
*   **Visual**: A special card appears: *"Would you like to check in?"*
*   **Interaction**: Tapping it opens the call or message menu directly.

### 4.3 Feature 3: Temporary Care Handover
*   **Interaction**: Tapping the "Temporary Handover" button slides down a configuration panel.
*   **Input**: You choose a name (e.g., "Aunt Meera") and a duration (3, 5, or 7 days).
*   **The Banner**: Once active, a persistent blue bar appears at the top: *"Care handed over to Aunt Meera"*.
*   **End Logic**: Tapping "End Now" in the banner immediately restores control to the primary caregiver.

### 4.4 Feature 9: Doctor Visit Prep
*   **Interaction**: A button at the bottom of the dashboard.
*   **The Result**: Opens a full-screen view that summarizes:
    1.  The last 3 notes added.
    2.  Any medication changes in the last 7 days.
    3.  A summary of wellness scores.
*   **Micro-interaction**: Includes a "Share" button to send this summary as a text or print it.

---

## 🛡️ 5. Feature 11: The Gentle Safety Check (Motion Detection)

This is the most critical logic-driven feature.

1.  **Trigger**: Phone sensors notice a sudden stop or lack of movement (Simulated via Settings).
2.  **The Prompt**: A full-screen overlay asks: *"Are you okay?"* with a calm heart icon.
3.  **Interaction**: The user has 5 minutes (300 seconds) to tap "Yes, I'm okay."
4.  **Auto-Escalation**: If the countdown hits 0, the `SahayProvider` automatically triggers `escalateSafetyCheck()`.
5.  **Caregiver Notification**: The caregiver's screen suddenly shows a high-priority red alert: *"Safety Alert: No Response"*.
6.  **Resolution**: The alert stays until the caregiver makes contact or dismisses it.

---

## 📜 6. The Shared Care Story (CareTimeline)

*   **Logic**: Every single button click above (taking a med, dismissing a check, requesting help) creates a `TimelineEvent`.
*   **Micro-interaction**: On the Timeline page, older events (from 2+ days ago) have lower opacity (they "fade"), keeping the focus on the present while preserving the history.
