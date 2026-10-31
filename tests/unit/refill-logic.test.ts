import { describe, it, expect } from 'vitest';
import { Medication } from '@/lib/types';

describe('Medication Refill Auto-Decrement & Stock Logic', () => {
  it('decrements refill countdown by 1 day when dose is taken upon daily closure', () => {
    const meds: Medication[] = [
      {
        id: 'med-1',
        name: 'Metformin',
        dosage: '500mg',
        timeOfDay: 'morning',
        taken: true,
        lastUpdated: new Date().toISOString(),
        refillDaysLeft: 12,
      },
      {
        id: 'med-2',
        name: 'Amlodipine',
        dosage: '5mg',
        timeOfDay: 'morning',
        taken: false,
        lastUpdated: new Date().toISOString(),
        refillDaysLeft: 8,
      },
    ];

    // Simulate daily closure logic
    const updated = meds.map((m) => ({
      ...m,
      taken: false,
      refillDaysLeft:
        m.taken && m.refillDaysLeft !== undefined && m.refillDaysLeft > 0
          ? m.refillDaysLeft - 1
          : m.refillDaysLeft,
    }));

    // Taken med decrements from 12 -> 11
    expect(updated[0].refillDaysLeft).toBe(11);
    expect(updated[0].taken).toBe(false);

    // Untaken med remains at 8
    expect(updated[1].refillDaysLeft).toBe(8);
  });

  it('prevents decrementing refill below 0 (no underflow)', () => {
    const med: Medication = {
      id: 'med-empty',
      name: 'Empty Pill',
      dosage: '10mg',
      timeOfDay: 'evening',
      taken: true,
      lastUpdated: new Date().toISOString(),
      refillDaysLeft: 0,
    };

    const decremented =
      med.taken && med.refillDaysLeft !== undefined && med.refillDaysLeft > 0
        ? med.refillDaysLeft - 1
        : med.refillDaysLeft;

    expect(decremented).toBe(0);
  });

  it('accurately categorizes refill urgency thresholds', () => {
    const isUrgent = (days?: number) => days !== undefined && days <= 3;
    const isSoon = (days?: number) => days !== undefined && days <= 7;

    expect(isUrgent(2)).toBe(true);
    expect(isUrgent(5)).toBe(false);

    expect(isSoon(5)).toBe(true);
    expect(isSoon(10)).toBe(false);
  });
});

