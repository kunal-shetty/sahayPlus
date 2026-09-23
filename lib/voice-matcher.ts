/**
 * @file voice-matcher.ts
 * @description Intelligent matching engine that parses spoken speech transcripts
 * and maps them to scheduled medications for the care receiver.
 * Handles exact names, partial names, phonetic/fuzzy variations (Levenshtein distance),
 * brand synonyms, time-of-day slots, generic affirmations ("I took it"),
 * and multilingual phrases (Hindi/Hinglish).
 */

import { type Medication, type TimeOfDay } from "@/lib/types";

export interface VoiceMatchResult {
  matchedMed: Medication | null;
  confidence: "high" | "medium" | "low";
  intent: "mark_taken" | "unknown";
  feedbackMessage: string;
}

/**
 * Normalizes text for comparison by removing punctuation and lowercasing.
 */
export function cleanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"“”]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Computes Levenshtein similarity between two strings (0.0 to 1.0).
 */
export function stringSimilarity(s1: string, s2: string): number {
  const longer = s1.length >= s2.length ? s1 : s2;
  const shorter = s1.length >= s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;

  const costs: number[] = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }
  return (longer.length - costs[shorter.length]) / longer.length;
}

/**
 * Common medical brand synonyms and generic drug equivalents.
 */
const DRUG_SYNONYMS: Record<string, string[]> = {
  paracetamol: ["dolo", "calpol", "crocin", "acetaminophen", "tylenol", "panadol", "fever"],
  acetaminophen: ["dolo", "calpol", "crocin", "paracetamol", "tylenol"],
  dolo: ["paracetamol", "crocin", "calpol", "acetaminophen"],
  metformin: ["sugar", "diabetes", "glycomet", "glucophage"],
  aspirin: ["blood thinner", "ecosprin", "disprin"],
  amlodipine: ["bp", "blood pressure", "amlong", "norvasc"],
  telmisartan: ["bp", "blood pressure", "telma"],
  atorvastatin: ["cholesterol", "atorva", "statin"],
  omeprazole: ["gas", "acidity", "omez", "pantoprazole", "pan"],
  pantoprazole: ["gas", "acidity", "pan 40", "pantocid"],
};

/**
 * Common affirmations elders say when confirming they took their pill.
 */
const AFFIRMATIONS = [
  "i took it",
  "took it",
  "taken",
  "i took",
  "done",
  "all done",
  "yes",
  "yeah",
  "yep",
  "ha",
  "haan",
  "hanji",
  "yes i took it",
  "i have taken it",
  "i already took it",
  "already took",
  "had it",
  "i had it",
  "swallowed it",
  "finished",
  "medicine taken",
  "took my medicine",
  "took the pill",
  "took my pill",
  "took my dose",
  "took medication",
  "dawa le li",
  "dawai le li",
  "maine le li",
  "maine le liya",
  "le liya",
  "le li",
  "kha li",
  "dawai kha li",
  "dawa kha li",
  "ho gaya",
  "le liya hai",
];

/**
 * Matches a spoken transcript against the patient's medications.
 */
export function matchMedicationFromTranscript(
  rawTranscript: string,
  medications: Medication[],
  nextMed?: Medication | null
): VoiceMatchResult {
  if (!rawTranscript || !rawTranscript.trim()) {
    return {
      matchedMed: null,
      confidence: "low",
      intent: "unknown",
      feedbackMessage: "No speech detected. Please try speaking again.",
    };
  }

  const cleaned = cleanText(rawTranscript);
  const words = cleaned.split(" ").filter((w) => w.length > 0);
  const untakenMeds = medications.filter((m) => !m.taken);

  // 1. Direct Name & Substring Match
  for (const med of medications) {
    const medClean = cleanText(med.name);
    const medTokens = medClean.split(" ").filter((t) => t.length > 1);

    // Exact substring match (e.g. "dolo" in "i took dolo" or "dolo test 2")
    if (cleaned.includes(medClean) || medClean.includes(cleaned)) {
      return {
        matchedMed: med,
        confidence: "high",
        intent: "mark_taken",
        feedbackMessage: `Matched: ${med.name}`,
      };
    }

    // Match individual significant tokens (e.g. "dolo" matching "dolo test 2")
    for (const token of medTokens) {
      if (token.length >= 3 && (cleaned.includes(token) || words.includes(token))) {
        return {
          matchedMed: med,
          confidence: "high",
          intent: "mark_taken",
          feedbackMessage: `Matched: ${med.name}`,
        };
      }
    }
  }

  // 2. Fuzzy / Phonetic Similarity Match (Catches "dollo", "bolo", "dola" -> "dolo")
  for (const med of medications) {
    const medClean = cleanText(med.name);
    const medTokens = medClean.split(" ").filter((t) => t.length > 1);

    for (const word of words) {
      if (word.length < 3) continue;

      for (const token of medTokens) {
        if (token.length < 3) continue;

        const sim = stringSimilarity(word, token);
        if (sim >= 0.75) {
          return {
            matchedMed: med,
            confidence: "high",
            intent: "mark_taken",
            feedbackMessage: `Matched: ${med.name} (from "${word}")`,
          };
        }
      }
    }
  }

  // 3. Clinical & Brand Synonym Match (e.g. "paracetamol" <-> "dolo")
  for (const med of medications) {
    const medClean = cleanText(med.name);
    for (const [keyDrug, synonyms] of Object.entries(DRUG_SYNONYMS)) {
      const isThisMed = medClean.includes(keyDrug) || synonyms.some((s) => medClean.includes(s));
      if (isThisMed) {
        const spokenMatches =
          cleaned.includes(keyDrug) || synonyms.some((s) => cleaned.includes(s) || words.includes(s));
        if (spokenMatches) {
          return {
            matchedMed: med,
            confidence: "high",
            intent: "mark_taken",
            feedbackMessage: `Matched: ${med.name}`,
          };
        }
      }
    }
  }

  // 4. Time of Day Reference Match
  // e.g. "I took my morning pill", "subah ki dawai"
  const timeSlotKeywords: Record<TimeOfDay, string[]> = {
    morning: ["morning", "breakfast", "subah", "saveraa", "first"],
    afternoon: ["afternoon", "lunch", "dopahar", "noon", "midday"],
    evening: ["evening", "night", "dinner", "bedtime", "shaam", "raat", "last"],
  };

  for (const [slot, keywords] of Object.entries(timeSlotKeywords) as [TimeOfDay, string[]][]) {
    const hasSlotKeyword = keywords.some((kw) => cleaned.includes(kw));
    if (hasSlotKeyword) {
      const candidate = untakenMeds.find((m) => m.timeOfDay === slot) || medications.find((m) => m.timeOfDay === slot);
      if (candidate) {
        return {
          matchedMed: candidate,
          confidence: "high",
          intent: "mark_taken",
          feedbackMessage: `Matched ${slot} dose: ${candidate.name}`,
        };
      }
    }
  }

  // 5. Generic Affirmation ("I took it", "Done", "Dawa le li")
  const isAffirmation = AFFIRMATIONS.some(
    (aff) => cleaned === aff || cleaned.includes(aff) || cleaned.startsWith(aff) || cleaned.endsWith(aff)
  );

  if (isAffirmation) {
    const targetMed = nextMed || untakenMeds[0] || medications[0];
    if (targetMed) {
      return {
        matchedMed: targetMed,
        confidence: "high",
        intent: "mark_taken",
        feedbackMessage: `Confirmed: ${targetMed.name}`,
      };
    }
  }

  // 6. Intent exists ("took", "had", "kha li") but medication name was uncertain
  const hasTakingVerbs = ["took", "taken", "had", "gave", "swallowed", "drank", "le li", "kha li", "done", "pill", "tablet", "dawa"].some((v) =>
    cleaned.includes(v)
  );

  if (hasTakingVerbs) {
    const fallbackMed = nextMed || untakenMeds[0];
    if (fallbackMed) {
      return {
        matchedMed: fallbackMed,
        confidence: "medium",
        intent: "mark_taken",
        feedbackMessage: `Did you mean ${fallbackMed.name}?`,
      };
    }
  }

  // 7. No match found
  return {
    matchedMed: null,
    confidence: "low",
    intent: "unknown",
    feedbackMessage: `Heard: "${rawTranscript}". Tap your pill below or say the name again.`,
  };
}
