/**
 * @file medication-meta.ts
 * @description Helpers for encoding, decoding, and caching visual medication metadata
 * (pill photos, colors, shapes, food timing, senior descriptions) safely without
 * column truncation or exposing raw metadata strings to the UI.
 */

import { type MedicationColor, type MedicationShape, type FoodInstruction } from "./types";

export interface MedicationVisualMeta {
  imageUrl?: string;
  color?: MedicationColor;
  shape?: MedicationShape;
  foodInstruction?: FoodInstruction;
  simpleExplanation?: string;
}

const META_TAG_START = "<!--SAHAY_META:";
const META_TAG_END = ":SAHAY_META-->";

/**
 * Strips any internal metadata markers, incomplete HTML comments, or encoded JSON from user text.
 */
export function stripAllMeta(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const cleaned = text
    .replace(/<!--SAHAY_META:[\s\S]*?(?:-->|$)/gi, "")
    .replace(/<!--[\s\S]*?(?:-->|$)/gi, "")
    .trim();
  return cleaned || undefined;
}

/**
 * Encodes lightweight visual metadata into notes.
 * NOTE: Large base64 images are NEVER stored in notes to prevent database text truncation.
 * They are cached in localStorage and synced via dedicated media storage.
 */
export function encodeMedicationNotes(
  plainNotes: string | undefined,
  meta: MedicationVisualMeta
): string | undefined {
  const cleanNotes = stripAllMeta(plainNotes);

  const lightweightMeta: Partial<MedicationVisualMeta> = {};
  if (meta.color) lightweightMeta.color = meta.color;
  if (meta.shape) lightweightMeta.shape = meta.shape;
  if (meta.foodInstruction) lightweightMeta.foodInstruction = meta.foodInstruction;
  if (meta.simpleExplanation) lightweightMeta.simpleExplanation = meta.simpleExplanation;

  const hasMeta = Object.keys(lightweightMeta).length > 0;
  if (!hasMeta) {
    return cleanNotes || undefined;
  }

  const encoded = `${META_TAG_START}${JSON.stringify(lightweightMeta)}${META_TAG_END}`;
  return cleanNotes ? `${cleanNotes}\n${encoded}` : encoded;
}

/**
 * Decodes visual metadata and extracts clean user notes from a notes string.
 */
export function decodeMedicationNotes(packedNotes: string | undefined): {
  cleanNotes?: string;
  meta: MedicationVisualMeta;
} {
  if (!packedNotes) {
    return { cleanNotes: undefined, meta: {} };
  }

  const cleanNotes = stripAllMeta(packedNotes);
  const match = packedNotes.match(/<!--SAHAY_META:([\s\S]*?)(?::SAHAY_META-->|-->|$)/);

  if (!match || !match[1]) {
    return { cleanNotes, meta: {} };
  }

  try {
    const meta: MedicationVisualMeta = JSON.parse(match[1]);
    return { cleanNotes, meta };
  } catch {
    return { cleanNotes, meta: {} };
  }
}

/**
 * Caches visual metadata (including compressed pill photos) in localStorage.
 */
export function saveLocalMedMeta(
  id: string,
  name: string,
  meta: MedicationVisualMeta
) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalMedMeta(id, name) || {};
    const merged = { ...existing, ...meta };
    // Keep existing image if new one is not provided
    if (!merged.imageUrl && existing.imageUrl) {
      merged.imageUrl = existing.imageUrl;
    }
    const payload = JSON.stringify(merged);
    if (id) {
      window.localStorage.setItem(`sahay_med_meta_${id}`, payload);
    }
    if (name) {
      window.localStorage.setItem(`sahay_med_meta_name_${name.toLowerCase().trim()}`, payload);
    }
  } catch {
    // Ignore localStorage quota errors
  }
}

/**
 * Retrieves cached visual metadata from localStorage.
 */
export function getLocalMedMeta(
  id?: string,
  name?: string
): MedicationVisualMeta | null {
  if (typeof window === "undefined") return null;
  try {
    if (id) {
      const item = window.localStorage.getItem(`sahay_med_meta_${id}`);
      if (item) {
        return JSON.parse(item);
      }
    }
    if (name) {
      const item = window.localStorage.getItem(`sahay_med_meta_name_${name.toLowerCase().trim()}`);
      if (item) return JSON.parse(item);
    }
  } catch {
    // Fall through
  }
  return null;
}
