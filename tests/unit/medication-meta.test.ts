import { describe, it, expect } from 'vitest';
import {
  encodeMedicationNotes,
  decodeMedicationNotes,
  stripAllMeta,
} from '@/lib/medication-meta';

describe('Medication Visual Metadata Synchronization', () => {
  it('should encode imageUrl and visual attributes into notes tag', () => {
    const rawNote = 'Take with a glass of warm water';
    const fakeBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...';

    const encoded = encodeMedicationNotes(rawNote, {
      imageUrl: fakeBase64,
      color: 'pink',
      shape: 'capsule',
      foodInstruction: 'after_meal',
      simpleExplanation: '1 tablet after breakfast',
    });

    expect(encoded).toContain('Take with a glass of warm water');
    expect(encoded).toContain('<!--SAHAY_META:');
    expect(encoded).toContain(fakeBase64);
    expect(encoded).toContain('"color":"pink"');
    expect(encoded).toContain('"shape":"capsule"');
  });

  it('should decode imageUrl and metadata cleanly without data corruption', () => {
    const fakeBase64 = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ';
    const notesString = `Take 1 tablet\n<!--SAHAY_META:{"imageUrl":"${fakeBase64}","color":"blue","shape":"round","foodInstruction":"with_meal"}:SAHAY_META-->`;

    const { cleanNotes, meta } = decodeMedicationNotes(notesString);

    expect(cleanNotes).toBe('Take 1 tablet');
    expect(meta.imageUrl).toBe(fakeBase64);
    expect(meta.color).toBe('blue');
    expect(meta.shape).toBe('round');
    expect(meta.foodInstruction).toBe('with_meal');
  });

  it('should cleanly strip metadata tags from human notes text', () => {
    const notesString = `Drink water\n<!--SAHAY_META:{"color":"yellow"}:SAHAY_META-->`;
    const cleaned = stripAllMeta(notesString);
    expect(cleaned).toBe('Drink water');
  });
});

