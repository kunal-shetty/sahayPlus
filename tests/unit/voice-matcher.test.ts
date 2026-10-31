import { describe, it, expect } from 'vitest';
import {
  cleanText,
  stringSimilarity,
  matchMedicationFromTranscript,
} from '@/lib/voice-matcher';
import { Medication } from '@/lib/types';

describe('Voice Matcher - Elder Speech & Phonetic Processing', () => {
  const sampleMeds: Medication[] = [
    {
      id: 'med-1',
      name: 'Amlodipine',
      dosage: '5mg',
      timeOfDay: 'morning',
      time: '09:00',
      taken: false,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'med-2',
      name: 'Metformin',
      dosage: '500mg',
      timeOfDay: 'afternoon',
      time: '13:00',
      taken: false,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'med-3',
      name: 'Dolo 650',
      dosage: '650mg',
      timeOfDay: 'evening',
      time: '20:00',
      taken: false,
      lastUpdated: new Date().toISOString(),
    },
  ];

  it('normalizes punctuation and lowercases text', () => {
    expect(cleanText('I took my Amlodipine, please!')).toBe('i took my amlodipine please');
  });

  it('calculates string similarity accurately', () => {
    expect(stringSimilarity('paracetamol', 'paracetamol')).toBe(1.0);
    expect(stringSimilarity('dolo', 'dollo')).toBeGreaterThan(0.75);
    expect(stringSimilarity('apple', 'banana')).toBeLessThan(0.4);
  });

  it('matches exact medicine names spoken by an elder', () => {
    const result = matchMedicationFromTranscript('I took my Amlodipine tablet', sampleMeds);
    expect(result.matchedMed?.name).toBe('Amlodipine');
    expect(result.confidence).toBe('high');
    expect(result.intent).toBe('mark_taken');
  });

  it('matches fuzzy/phonetic mispronunciations of medication names', () => {
    const result = matchMedicationFromTranscript('maine dolo le li', sampleMeds);
    expect(result.matchedMed?.name).toBe('Dolo 650');
    expect(result.intent).toBe('mark_taken');
  });

  it('handles general affirmations ("I took it") by matching the next scheduled dose', () => {
    const nextMed = sampleMeds[0];
    const result = matchMedicationFromTranscript('I already took it', sampleMeds, nextMed);
    expect(result.matchedMed?.id).toBe(nextMed.id);
    expect(result.intent).toBe('mark_taken');
  });

  it('handles Hindi speech affirmations ("dawa le li")', () => {
    const nextMed = sampleMeds[0];
    const result = matchMedicationFromTranscript('dawa le li', sampleMeds, nextMed);
    expect(result.matchedMed?.id).toBe(nextMed.id);
    expect(result.intent).toBe('mark_taken');
  });

  it('gracefully returns unknown intent on empty or silent input', () => {
    const result = matchMedicationFromTranscript('', sampleMeds);
    expect(result.matchedMed).toBeNull();
    expect(result.intent).toBe('unknown');
  });
});

