import { describe, it, expect } from 'vitest';
import {
  cleanText,
  stringSimilarity,
  matchMedicationFromTranscript,
  matchAlarmVoiceIntent,
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

  describe('Hands-Free Alarm Voice Recognition', () => {
    const activeMed = sampleMeds[0]; // Amlodipine

    it('matches intake affirmations hands-free ("I took it", "Done", "Maine le li")', () => {
      const res1 = matchAlarmVoiceIntent('I took it', activeMed);
      expect(res1.intent).toBe('confirm_intake');
      expect(res1.feedback).toContain('Amlodipine');

      const res2 = matchAlarmVoiceIntent('done', activeMed);
      expect(res2.intent).toBe('confirm_intake');

      const res3 = matchAlarmVoiceIntent('maine le li', activeMed);
      expect(res3.intent).toBe('confirm_intake');
    });

    it('matches medication name hands-free during alarm', () => {
      const res = matchAlarmVoiceIntent('Amlodipine', activeMed);
      expect(res.intent).toBe('confirm_intake');
      expect(res.feedback).toContain('Amlodipine');
    });

    it('matches snooze commands hands-free ("snooze", "remind in 10 minutes", "baad mein")', () => {
      const res1 = matchAlarmVoiceIntent('snooze', activeMed);
      expect(res1.intent).toBe('snooze');

      const res2 = matchAlarmVoiceIntent('remind in 10 minutes', activeMed);
      expect(res2.intent).toBe('snooze');

      const res3 = matchAlarmVoiceIntent('baad me', activeMed);
      expect(res3.intent).toBe('snooze');
    });

    it('matches dismiss commands hands-free ("not now", "dismiss", "abhi nahi")', () => {
      const res1 = matchAlarmVoiceIntent('not right now', activeMed);
      expect(res1.intent).toBe('dismiss');

      const res2 = matchAlarmVoiceIntent('dismiss', activeMed);
      expect(res2.intent).toBe('dismiss');

      const res3 = matchAlarmVoiceIntent('abhi nahi', activeMed);
      expect(res3.intent).toBe('dismiss');
    });
  });
});


