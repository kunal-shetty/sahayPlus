// Sahay+ Data Types — identical to web version
export type UserRole = 'caregiver' | 'careReceiver' | null;
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export type TimelineEventType =
  | 'medication_taken'
  | 'medication_skipped'
  | 'dose_changed'
  | 'medication_added'
  | 'medication_removed'
  | 'refill_noted'
  | 'note_added'
  | 'check_in'
  | 'day_closed'
  | 'wellness_logged'
  | 'emergency_contact'
  | 'voice_confirmed'
  | 'message_sent'
  | 'safety_check_triggered'
  | 'safety_check_dismissed'
  | 'safety_check_escalated'
  | 'fine_check_in'
  | 'help_requested'
  | 'handover_started'
  | 'handover_ended'
  | 'routine_changed';

export type CareRoleStatus = 'active' | 'away' | 'independent';
export type ConfidenceLevel = 'stable' | 'adjusting' | 'new';
export type WellnessLevel = 'great' | 'okay' | 'notGreat';
export type SafetyCheckStatus = 'idle' | 'pending_check' | 'escalating';
export type MedicationColor = 'white' | 'blue' | 'pink' | 'yellow' | 'orange' | 'green' | 'red';
export type MedicationShape = 'round' | 'oval' | 'capsule' | 'rectangle';

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface WellnessEntry {
  id: string;
  date: string;
  level: WellnessLevel;
  note?: string;
  timestamp: string;
}

export interface HandoverInfo {
  isActive: boolean;
  targetName?: string;
  endDate?: string;
}

export interface CareMessage {
  id: string;
  from: 'caregiver' | 'careReceiver';
  text: string;
  timestamp: string;
  isRead: boolean;
  isQuickMessage: boolean;
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: string;
  medicationId?: string;
  medicationName?: string;
  note?: string;
  actor?: 'caregiver' | 'careReceiver' | 'pharmacist';
}

export interface ContextualNote {
  id: string;
  text: string;
  createdAt: string;
  linkedTo?: {
    type: 'medication' | 'day';
    id?: string;
  };
  fadingAt: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  timeOfDay: TimeOfDay;
  time?: string;
  notes?: string;
  taken: boolean;
  lastUpdated: string;
  refillDaysLeft?: number;
  pharmacistNote?: string;
  color?: MedicationColor;
  shape?: MedicationShape;
  imageUrl?: string;
  streak?: number;
  totalTaken?: number;
  simpleExplanation?: string;
}

export interface CaregiverProfile {
  name: string;
  setupComplete: boolean;
  roleStatus: CareRoleStatus;
  awayUntil?: string;
  handover?: HandoverInfo;
}

export interface CareReceiverProfile {
  name: string;
  independentTimes?: TimeOfDay[];
  preferLargeText?: boolean;
  preferVoiceConfirm?: boolean;
  quickMessages?: string[];
}

export interface PharmacistContact {
  name?: string;
  lastRefillConfirm?: string;
  note?: string;
}

export interface DayClosure {
  date: string;
  closedAt: string;
  allTaken: boolean;
  totalMeds: number;
  takenCount: number;
}

export interface AppData {
  userRole: UserRole;
  caregiver: CaregiverProfile | null;
  careReceiver: CareReceiverProfile | null;
  medications: Medication[];
  lastResetDate: string;
  timeline: TimelineEvent[];
  contextualNotes: ContextualNote[];
  pharmacist: PharmacistContact | null;
  dayClosures: DayClosure[];
  lastCheckInSuggestion?: string;
  emergencyContacts: EmergencyContact[];
  wellnessEntries: WellnessEntry[];
  messages: CareMessage[];
  currentStreak: number;
  longestStreak: number;
  totalDaysTracked: number;
  lastChangeNotifiedAt?: string;
  lastFineCheckIn?: string;
  safetyCheck: {
    status: SafetyCheckStatus;
    lastTriggered?: string;
    triggeredBy?: 'motion' | 'manual';
  };
}

export const STORAGE_KEY = 'sahay-app-data';

export const defaultAppData: AppData = {
  userRole: null,
  caregiver: null,
  careReceiver: null,
  medications: [],
  lastResetDate: new Date().toISOString().split('T')[0],
  timeline: [],
  contextualNotes: [],
  pharmacist: null,
  dayClosures: [],
  emergencyContacts: [],
  wellnessEntries: [],
  messages: [],
  currentStreak: 0,
  longestStreak: 0,
  totalDaysTracked: 0,
  safetyCheck: { status: 'idle' },
};

export function generateId(): string {
  return `med_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const timeOfDayLabels: Record<TimeOfDay, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

export function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function calculateConfidence(
  timeline: TimelineEvent[],
  dayClosures: DayClosure[]
): ConfidenceLevel {
  const recentDays = 7;
  const now = new Date();
  const recentEvents = timeline.filter((e) => {
    const eventDate = new Date(e.timestamp);
    const diffDays = Math.floor(
      (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays < recentDays;
  });
  if (dayClosures.length < 3) return 'new';
  const hasRecentChanges = recentEvents.some((e) =>
    ['dose_changed', 'medication_added', 'medication_removed'].includes(e.type)
  );
  if (hasRecentChanges) return 'adjusting';
  return 'stable';
}

export function getConfidenceMessage(level: ConfidenceLevel): string {
  switch (level) {
    case 'stable': return 'Routine feels stable';
    case 'adjusting': return "A few changes recently — that's okay";
    case 'new': return 'Getting started together';
  }
}
