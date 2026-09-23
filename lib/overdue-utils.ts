/**
 * @file overdue-utils.ts
 * @description Helper functions to detect overdue medications and format delay durations.
 */

import { type Medication, formatTime12h } from "@/lib/types";

export interface OverdueMedInfo {
  medication: Medication;
  scheduledMinutes: number;
  scheduledTimeFormatted: string;
  delayMinutes: number;
  delayFormatted: string;
}

/**
 * Returns scheduled time in minutes from midnight for a medication.
 */
export function getScheduledMinutes(med: Medication): number {
  if (med.time) {
    const parts = med.time.split(":");
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(h) && !isNaN(m)) {
        return h * 60 + m;
      }
    }
  }

  // Fallback defaults based on time of day slot
  if (med.timeOfDay === "morning") return 8 * 60; // 08:00 AM
  if (med.timeOfDay === "afternoon") return 13 * 60; // 01:00 PM
  return 19 * 60; // 07:00 PM
}

/**
 * Formats a delay duration in minutes to human-readable format (e.g. '35m late', '1h 15m late').
 */
export function formatDelay(delayMinutes: number): string {
  if (delayMinutes < 60) {
    return `${delayMinutes}m late`;
  }
  const hours = Math.floor(delayMinutes / 60);
  const mins = delayMinutes % 60;
  if (mins === 0) {
    return `${hours}h late`;
  }
  return `${hours}h ${mins}m late`;
}

/**
 * Evaluates a list of medications and returns those that are untaken
 * and at least `thresholdMinutes` (default 30 mins) past their scheduled dose time today.
 */
export function getOverdueMeds(
  medications: Medication[],
  thresholdMinutes = 30
): OverdueMedInfo[] {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const overdueList: OverdueMedInfo[] = [];

  for (const med of medications) {
    if (med.taken) continue;

    const scheduledMinutes = getScheduledMinutes(med);
    const delayMinutes = currentMinutes - scheduledMinutes;

    // Check if overdue by at least thresholdMinutes, up to 12 hours late
    if (delayMinutes >= thresholdMinutes && delayMinutes <= 12 * 60) {
      const scheduledFormatted = med.time
        ? formatTime12h(med.time)
        : `${med.timeOfDay.charAt(0).toUpperCase() + med.timeOfDay.slice(1)}`;

      overdueList.push({
        medication: med,
        scheduledMinutes,
        scheduledTimeFormatted: scheduledFormatted,
        delayMinutes,
        delayFormatted: formatDelay(delayMinutes),
      });
    }
  }

  // Sort by highest delay first
  return overdueList.sort((a, b) => b.delayMinutes - a.delayMinutes);
}
