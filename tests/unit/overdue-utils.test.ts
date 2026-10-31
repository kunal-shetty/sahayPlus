import { describe, it, expect } from 'vitest';
import {
  getScheduledMinutes,
  formatDelay,
  getOverdueMeds,
  computeHabitPatternInsights,
} from '@/lib/overdue-utils';
import { Medication, TimelineEvent } from '@/lib/types';

describe('Overdue Utilities - Medication Timing & Grace Periods', () => {
  it('calculates scheduled minutes from midnight correctly', () => {
    const med: Medication = {
      id: 'm1',
      name: 'Test Med',
      dosage: '10mg',
      timeOfDay: 'morning',
      time: '08:30',
      taken: false,
      lastUpdated: new Date().toISOString(),
    };

    expect(getScheduledMinutes(med)).toBe(8 * 60 + 30); // 510 minutes
  });

  it('formats delay minutes into readable human strings', () => {
    expect(formatDelay(15)).toBe('15m late');
    expect(formatDelay(60)).toBe('1h late');
    expect(formatDelay(75)).toBe('1h 15m late');
    expect(formatDelay(130)).toBe('2h 10m late');
  });

  it('filters out medications that are already taken from overdue alerts', () => {
    const med: Medication = {
      id: 'm1',
      name: 'Test Med',
      dosage: '10mg',
      timeOfDay: 'morning',
      time: '06:00', // Past
      taken: true, // Already taken
      lastUpdated: new Date().toISOString(),
    };

    const overdue = getOverdueMeds([med], 15);
    expect(overdue.length).toBe(0);
  });

  it('computes Module 4.8 habit pattern insights and detects evening delays', () => {
    const meds: Medication[] = [
      { id: 'm1', name: 'Morning Med', dosage: '10mg', timeOfDay: 'morning', time: '08:00', taken: true, lastUpdated: new Date().toISOString() },
      { id: 'm2', name: 'Evening Med', dosage: '20mg', timeOfDay: 'evening', time: '20:00', taken: false, lastUpdated: new Date().toISOString() },
    ];

    const timeline: TimelineEvent[] = [
      { id: 'e1', type: 'medication_taken', timestamp: new Date(Date.now() - 3600000).toISOString(), medicationId: 'm1' },
      // Chronic evening delay (>45 min late at 21:30 vs 20:00 scheduled)
      { id: 'e2', type: 'medication_taken', timestamp: '2026-10-30T21:30:00.000Z', medicationId: 'm2' },
      { id: 'e3', type: 'medication_taken', timestamp: '2026-10-29T21:45:00.000Z', medicationId: 'm2' },
    ];

    const insights = computeHabitPatternInsights(meds, timeline, 7);

    expect(insights.slots.morning).toBeDefined();
    expect(insights.slots.evening).toBeDefined();
    expect(insights.overallStabilityScore).toBeGreaterThanOrEqual(0);
    expect(insights.proactiveRecommendations.length).toBeGreaterThan(0);
  });
});

