import { describe, it, expect } from 'vitest';
import {
  getScheduledMinutes,
  formatDelay,
  getOverdueMeds,
} from '@/lib/overdue-utils';
import { Medication } from '@/lib/types';

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
});

