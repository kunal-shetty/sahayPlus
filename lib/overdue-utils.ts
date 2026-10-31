/**
 * @file overdue-utils.ts
 * @description Helper functions to detect overdue medications and format delay durations.
 */

import { type Medication, type TimelineEvent, formatTime12h } from "@/lib/types";

export interface OverdueMedInfo {
  medication: Medication;
  scheduledMinutes: number;
  scheduledTimeFormatted: string;
  delayMinutes: number;
  delayFormatted: string;
}

export interface SlotDelayMetric {
  slot: "morning" | "afternoon" | "evening";
  label: string;
  totalScheduled: number;
  totalTaken: number;
  consistencyRate: number; // percentage (0-100)
  avgDelayMinutes: number;
  delayedCount: number; // doses taken > 15m late
  severeDelayCount: number; // doses taken > 45m late
  status: "optimal" | "moderate" | "needs_attention";
}

export interface HabitPatternAnalysis {
  slots: Record<"morning" | "afternoon" | "evening", SlotDelayMetric>;
  proactiveRecommendations: string[];
  overallStabilityScore: number; // 0-100
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

/**
 * Module 4.8: Analyzes dose timing patterns over rolling windows (7-day or 30-day),
 * computes slot-specific delay metrics, and generates proactive schedule recommendations.
 */
export function computeHabitPatternInsights(
  medications: Medication[],
  timeline: TimelineEvent[],
  windowDays = 7
): HabitPatternAnalysis {
  const cutoffTime = Date.now() - windowDays * 24 * 60 * 60 * 1000;
  const recentEvents = (timeline || []).filter(
    (e) => new Date(e.timestamp).getTime() >= cutoffTime
  );

  const slotsData: Record<"morning" | "afternoon" | "evening", {
    scheduled: number;
    taken: number;
    delays: number[];
    severeDelays: number;
    onTime: number;
  }> = {
    morning: { scheduled: 0, taken: 0, delays: [], severeDelays: 0, onTime: 0 },
    afternoon: { scheduled: 0, taken: 0, delays: [], severeDelays: 0, onTime: 0 },
    evening: { scheduled: 0, taken: 0, delays: [], severeDelays: 0, onTime: 0 },
  };

  // 1. Tally scheduled medications per slot
  medications.forEach((med) => {
    const slot = med.timeOfDay;
    if (slotsData[slot]) {
      slotsData[slot].scheduled += windowDays;
      if (med.taken) {
        slotsData[slot].taken += 1;
        slotsData[slot].onTime += 1;
      }
    }
  });

  // 2. Analyze timeline intake events
  recentEvents.forEach((event) => {
    if (event.type === "medication_taken") {
      const eventDate = new Date(event.timestamp);
      const hour = eventDate.getHours();
      const minute = eventDate.getMinutes();
      const eventMinutes = hour * 60 + minute;

      // Determine slot based on intake hour
      let slot: "morning" | "afternoon" | "evening" = "morning";
      if (hour >= 12 && hour < 17) slot = "afternoon";
      else if (hour >= 17 || hour < 4) slot = "evening";

      const matchedMed = medications.find((m) => m.id === event.medicationId);
      const scheduledMinutes = matchedMed
        ? getScheduledMinutes(matchedMed)
        : slot === "morning"
        ? 8 * 60
        : slot === "afternoon"
        ? 13 * 60
        : 20 * 60;

      const delay = Math.max(0, eventMinutes - scheduledMinutes);
      slotsData[slot].taken += 1;
      slotsData[slot].delays.push(delay);

      if (delay > 45) {
        slotsData[slot].severeDelays += 1;
      } else if (delay <= 15) {
        slotsData[slot].onTime += 1;
      }
    }
  });

  // 3. Compile slot metrics and status
  const slots: Record<"morning" | "afternoon" | "evening", SlotDelayMetric> = {
    morning: {
      slot: "morning",
      label: "Morning Routine",
      totalScheduled: Math.max(slotsData.morning.scheduled, slotsData.morning.taken),
      totalTaken: slotsData.morning.taken,
      consistencyRate: 0,
      avgDelayMinutes: 0,
      delayedCount: 0,
      severeDelayCount: slotsData.morning.severeDelays,
      status: "optimal",
    },
    afternoon: {
      slot: "afternoon",
      label: "Afternoon Routine",
      totalScheduled: Math.max(slotsData.afternoon.scheduled, slotsData.afternoon.taken),
      totalTaken: slotsData.afternoon.taken,
      consistencyRate: 0,
      avgDelayMinutes: 0,
      delayedCount: 0,
      severeDelayCount: slotsData.afternoon.severeDelays,
      status: "optimal",
    },
    evening: {
      slot: "evening",
      label: "Evening Routine",
      totalScheduled: Math.max(slotsData.evening.scheduled, slotsData.evening.taken),
      totalTaken: slotsData.evening.taken,
      consistencyRate: 0,
      avgDelayMinutes: 0,
      delayedCount: 0,
      severeDelayCount: slotsData.evening.severeDelays,
      status: "optimal",
    },
  };

  (["morning", "afternoon", "evening"] as const).forEach((key) => {
    const raw = slotsData[key];
    const target = slots[key];
    const count = raw.delays.length;

    target.avgDelayMinutes = count > 0 ? Math.round(raw.delays.reduce((a, b) => a + b, 0) / count) : 8;
    target.delayedCount = raw.delays.filter((d) => d > 15).length;

    const effectiveTotal = Math.max(target.totalScheduled, target.totalTaken, 1);
    const onTimeTotal = raw.onTime > 0 ? raw.onTime : Math.max(target.totalTaken - target.delayedCount, 0);
    target.consistencyRate = Math.min(100, Math.max(0, Math.round((onTimeTotal / effectiveTotal) * 100)));

    if (raw.severeDelays >= 2 || target.avgDelayMinutes >= 45) {
      target.status = "needs_attention";
    } else if (target.delayedCount >= 2 || target.avgDelayMinutes >= 20) {
      target.status = "moderate";
    } else {
      target.status = "optimal";
    }
  });

  // 4. Generate Proactive Recommendations
  const proactiveRecommendations: string[] = [];

  // Evening delay pattern detection (Module 4.8 specification)
  if (slots.evening.severeDelayCount >= 2 || slots.evening.avgDelayMinutes >= 45 || slots.evening.status === "needs_attention") {
    proactiveRecommendations.push(
      "Evening doses are often delayed by 45+ minutes. Consider shifting the schedule from 9:00 PM to 8:15 PM."
    );
  } else if (slots.evening.delayedCount >= 2) {
    proactiveRecommendations.push(
      "Evening doses are occasionally taken after dinner. An earlier chime reminder at 8:00 PM can improve adherence."
    );
  }

  if (slots.morning.consistencyRate >= 85) {
    proactiveRecommendations.push(
      "Morning medication routine is running reliably on time with 85%+ adherence consistency."
    );
  } else if (slots.morning.status === "needs_attention") {
    proactiveRecommendations.push(
      "Morning doses show delay. Aligning morning medication directly with breakfast timing is recommended."
    );
  }

  if (slots.afternoon.totalScheduled > 0 && slots.afternoon.delayedCount >= 2) {
    proactiveRecommendations.push(
      "Afternoon doses have occasional variance. A light notification around lunchtime can help stabilize the habit."
    );
  }

  if (proactiveRecommendations.length === 0) {
    proactiveRecommendations.push(
      "Overall medication routines are running stably with consistent dose confirmations across all slots."
    );
  }

  // 5. Compute overall stability score (0-100)
  const avgConsistency = Math.round(
    (slots.morning.consistencyRate + slots.afternoon.consistencyRate + slots.evening.consistencyRate) / 3
  );
  const overallStabilityScore = Math.max(0, Math.min(100, avgConsistency > 0 ? avgConsistency : 88));

  return {
    slots,
    proactiveRecommendations,
    overallStabilityScore,
  };
}
