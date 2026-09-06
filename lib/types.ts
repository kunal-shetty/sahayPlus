/**
 * @file types.ts
 * @description Defines the core data models and type definitions for the Sahay+ application.
 * This file ensures type safety across the app, covering user roles, medication tracking,
 * wellness entries, and the global application state.
 */

/** The role of the user in the care relationship. */
export type UserRole = 'caregiver' | 'careReceiver' | null

/** General time of day categories for medication scheduling. */
export type TimeOfDay = 'morning' | 'afternoon' | 'evening'

/**
 * Types of events that can be recorded in the care timeline.
 */
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
  | 'routine_changed'

/** The current status of the caregiver's availability. */
export type CareRoleStatus = 'active' | 'away' | 'independent'

/** Qualitative measure of the current care routine's stability. */
export type ConfidenceLevel = 'stable' | 'adjusting' | 'new'

/** Subjective wellness levels reported by the care receiver. */
export type WellnessLevel = 'great' | 'okay' | 'notGreat'

/** The current state of a safety check process. */
export type SafetyCheckStatus = 'idle' | 'pending_check' | 'escalating'

/** Visual identification colors for medications. */
export type MedicationColor = 'white' | 'blue' | 'pink' | 'yellow' | 'orange' | 'green' | 'red'

/** Visual identification shapes for medications. */
export type MedicationShape = 'round' | 'oval' | 'capsule' | 'rectangle'

/**
 * Represents an emergency contact.
 */
export interface EmergencyContact {
  /** Unique identifier for the contact. */
  id: string
  /** Full name of the contact. */
  name: string
  /** Relationship to the care receiver (e.g., 'Doctor', 'Son'). */
  relationship: string
  /** Phone number of the contact. */
  phone: string
  /** Whether this is the primary contact to notify first. */
  isPrimary: boolean
}

/**
 * A single wellness check entry.
 */
export interface WellnessEntry {
  /** Unique identifier for the entry. */
  id: string
  /** Date of the entry (YYYY-MM-DD). */
  date: string
  /** Reported wellness level. */
  level: WellnessLevel
  /** Optional note providing more context. */
  note?: string
  /** ISO timestamp of when the entry was created. */
  timestamp: string
}

/**
 * Information about an active care handover.
 */
export interface HandoverInfo {
  /** Whether a handover is currently in effect. */
  isActive: boolean
  /** Name of the person taking over care. */
  targetName?: string
  /** ISO date when the handover ends. */
  endDate?: string
}

/**
 * A message exchanged between a caregiver and a care receiver.
 */
export interface CareMessage {
  /** Unique identifier for the message. */
  id: string
  /** The sender of the message. */
  from: 'caregiver' | 'careReceiver'
  /** The text content of the message. */
  text: string
  /** ISO timestamp of when the message was sent. */
  timestamp: string
  /** Whether the message has been read by the recipient. */
  isRead: boolean
  /** True if the message was sent using a pre-defined quick-message template. */
  isQuickMessage: boolean
}

/**
 * An event recorded in the care timeline.
 */
export interface TimelineEvent {
  /** Unique identifier for the event. */
  id: string
  /** Type of event (see TimelineEventType). */
  type: TimelineEventType
  /** ISO timestamp of the event. */
  timestamp: string
  /** ID of the medication associated with the event, if applicable. */
  medicationId?: string
  /** Name of the medication associated with the event, if applicable. */
  medicationName?: string
  /** Optional descriptive note. */
  note?: string
  /** The person who performed the action. */
  actor?: 'caregiver' | 'careReceiver' | 'pharmacist'
}

/**
 * A short-term note linked to a specific day or medication.
 */
export interface ContextualNote {
  /** Unique identifier for the note. */
  id: string
  /** Content of the note. */
  text: string
  /** ISO timestamp of creation. */
  createdAt: string
  /** Entity the note is linked to. */
  linkedTo?: {
    /** Type of linked entity. */
    type: 'medication' | 'day'
    /** ID of the linked entity. */
    id?: string
  }
  /** ISO timestamp when the note should begin fading from the UI. */
  fadingAt: string
}

/**
 * Comprehensive details of a medication.
 */
export interface Medication {
  /** Unique identifier for the medication. */
  id: string
  /** Name of the medication. */
  name: string
  /** Dosage information (e.g., '500mg'). */
  dosage: string
  /** General time of day for administration. */
  timeOfDay: TimeOfDay
  /** Specific administration time (e.g., '08:30'). */
  time?: string
  /** Additional notes about administration. */
  notes?: string
  /** Whether the medication has been taken for the current day. */
  taken: boolean
  /** ISO timestamp of the last update to this medication record. */
  lastUpdated: string
  /** Number of days remaining until a refill is required. */
  refillDaysLeft?: number
  /** Notes provided by the pharmacist. */
  pharmacistNote?: string
  /** Visual color for identification. */
  color?: MedicationColor
  /** Visual shape for identification. */
  shape?: MedicationShape
  /** URL to a photo of the medication. */
  imageUrl?: string
  /** Number of consecutive days the medication was taken. */
  streak?: number
  /** Total number of times the medication has been taken. */
  totalTaken?: number
  /** A simplified explanation of the medicine's purpose for the receiver. */
  simpleExplanation?: string
}

/**
 * Profile information for the caregiver.
 */
export interface CaregiverProfile {
  /** Full name of the caregiver. */
  name: string
  /** Whether the caregiver has completed the onboarding process. */
  setupComplete: boolean
  /** Current availability status. */
  roleStatus: CareRoleStatus
  /** ISO timestamp until which the caregiver is temporarily away. */
  awayUntil?: string
  /** Handover details if care is being temporarily transferred. */
  handover?: HandoverInfo
}

/**
 * Profile information for the care receiver.
 */
export interface CareReceiverProfile {
  /** Full name of the care receiver. */
  name: string
  /** Times of day when the receiver is typically independent. */
  independentTimes?: TimeOfDay[]
  /** Whether the receiver prefers larger text for accessibility. */
  preferLargeText?: boolean
  /** Whether the receiver prefers voice-based confirmation. */
  preferVoiceConfirm?: boolean
  /** List of pre-defined quick messages the receiver can send. */
  quickMessages?: string[]
}

/**
 * Contact information for the pharmacist.
 */
export interface PharmacistContact {
  /** Name of the pharmacist or pharmacy. */
  name?: string
  /** ISO date of the last refill confirmation. */
  lastRefillConfirm?: string
  /** General notes about pharmacy dealings. */
  note?: string
}

/**
 * Summary of a finalized care day.
 */
export interface DayClosure {
  /** Date of the closure (YYYY-MM-DD). */
  date: string
  /** ISO timestamp of when the day was closed. */
  closedAt: string
  /** Whether all scheduled medications were taken. */
  allTaken: boolean
  /** Total number of medications scheduled for the day. */
  totalMeds: number
  /** Number of medications actually taken. */
  takenCount: number
}

/**
 * The global state object for the entire application.
 */
export interface AppData {
  /** The role of the current authenticated user. */
  userRole: UserRole
  /** Profile of the caregiver, if applicable. */
  caregiver: CaregiverProfile | null
  /** Profile of the care receiver, if applicable. */
  careReceiver: CareReceiverProfile | null
  /** List of all medications being tracked. */
  medications: Medication[]
  /** ISO date of the last daily reset. */
  lastResetDate: string
  /** History of all care-related events. */
  timeline: TimelineEvent[]
  /** Collection of short-term contextual notes. */
  contextualNotes: ContextualNote[]
  /** Pharmacist contact details. */
  pharmacist: PharmacistContact | null
  /** History of daily care closures. */
  dayClosures: DayClosure[]
  /** ISO date of the last check-in suggestion shown to the caregiver. */
  lastCheckInSuggestion?: string
  /** List of emergency contacts. */
  emergencyContacts: EmergencyContact[]
  /** History of wellness entries. */
  wellnessEntries: WellnessEntry[]
  /** History of messages between parties. */
  messages: CareMessage[]
  /** Current adherence streak in days. */
  currentStreak: number
  /** Longest adherence streak recorded. */
  longestStreak: number
  /** Total number of days the app has been used for tracking. */
  totalDaysTracked: number
  /** ISO timestamp of the last significant state change notification. */
  lastChangeNotifiedAt?: string
  /** ISO timestamp of the last successful daily check-in. */
  lastFineCheckIn?: string
  /** Current state of the safety check system. */
  safetyCheck: {
    /** Current status of the safety check. */
    status: SafetyCheckStatus
    /** ISO timestamp of the last trigger. */
    lastTriggered?: string
    /** Method used to trigger the last check. */
    triggeredBy?: 'motion' | 'manual'
  }
}

/** Local storage key used to persist AppData. */
export const STORAGE_KEY = 'sahay-app-data'

/** Default initial state for the application. */
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
  safetyCheck: {
    status: 'idle',
  },
}

/**
 * Helper to generate ISO date strings for X days ago.
 * @param {number} days - Number of days to subtract from today.
 * @returns {string} ISO date string.
 */
function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

/**
 * Helper to generate ISO date strings for X days from now.
 * @param {number} days - Number of days to add to today.
 * @returns {string} ISO date string.
 */
function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

/**
 * Dummy data used for development, wireframing, and design previews.
 */
export const dummyAppData: AppData = {
  userRole: 'caregiver',
  caregiver: {
    name: 'Ayushi',
    setupComplete: true,
    roleStatus: 'active',
    handover: { isActive: false },
  },
  careReceiver: {
    name: 'Dad',
    independentTimes: ['morning'],
    preferLargeText: true,
    preferVoiceConfirm: false,
    quickMessages: [
      'I took my medicine',
      'Feeling good today',
      'Can you call me?',
      'Need help with refill',
      'All done for the day',
    ],
  },
  medications: [
    {
      id: 'med_001',
      name: 'Metformin',
      dosage: '500mg',
      timeOfDay: 'morning',
      notes: 'Take with breakfast',
      taken: true,
      lastUpdated: new Date().toISOString(),
      refillDaysLeft: 12,
      pharmacistNote: 'Best absorbed with food',
      simpleExplanation: 'This helps keep your blood pressure steady.',
      color: 'white',
      shape: 'oval',
      streak: 14,
      totalTaken: 45,
    },
    {
      id: 'med_002',
      name: 'Lisinopril',
      dosage: '10mg',
      timeOfDay: 'morning',
      taken: true,
      lastUpdated: new Date().toISOString(),
      refillDaysLeft: 18,
      simpleExplanation: 'This helps with your circulation.',
      color: 'pink',
      shape: 'round',
      streak: 14,
      totalTaken: 45,
    },
    {
      id: 'med_003',
      name: 'Calcium + D3',
      dosage: '1 tablet',
      timeOfDay: 'afternoon',
      notes: 'With lunch',
      taken: false,
      lastUpdated: new Date().toISOString(),
      refillDaysLeft: 5,
      simpleExplanation: 'Strengthens your bones and heart.',
      color: 'white',
      shape: 'round',
      streak: 12,
      totalTaken: 42,
    },
    {
      id: 'med_004',
      name: 'Amlodipine',
      dosage: '5mg',
      timeOfDay: 'evening',
      taken: false,
      lastUpdated: new Date().toISOString(),
      refillDaysLeft: 22,
      simpleExplanation: 'Keeps your heart rate calm.',
      color: 'white',
      shape: 'round',
      streak: 14,
      totalTaken: 45,
    },
    {
      id: 'med_005',
      name: 'Thyronorm',
      dosage: '50mcg',
      timeOfDay: 'morning',
      notes: 'Empty stomach, 30 min before food',
      taken: true,
      lastUpdated: new Date().toISOString(),
      refillDaysLeft: 8,
      pharmacistNote: 'Do not take with calcium supplements',
      simpleExplanation: 'Supports your energy levels and thyroid.',
      color: 'yellow',
      shape: 'round',
      streak: 14,
      totalTaken: 45,
    },
  ],
  lastResetDate: new Date().toISOString().split('T')[0],
  timeline: [
    {
      id: 'evt_001',
      type: 'medication_taken',
      timestamp: daysAgo(0),
      medicationId: 'med_001',
      medicationName: 'Metformin',
      actor: 'careReceiver',
    },
    {
      id: 'evt_002',
      type: 'medication_taken',
      timestamp: daysAgo(0),
      medicationId: 'med_002',
      medicationName: 'Lisinopril',
      actor: 'careReceiver',
    },
    {
      id: 'evt_003',
      type: 'medication_taken',
      timestamp: daysAgo(0),
      medicationId: 'med_005',
      medicationName: 'Thyronorm',
      actor: 'careReceiver',
    },
    {
      id: 'evt_004',
      type: 'check_in',
      timestamp: daysAgo(1),
      note: 'Called Dad, he sounds well',
      actor: 'caregiver',
    },
    {
      id: 'evt_005',
      type: 'day_closed',
      timestamp: daysAgo(1),
      note: 'Day closed with 5/5 taken',
    },
    {
      id: 'evt_006',
      type: 'medication_taken',
      timestamp: daysAgo(1),
      medicationId: 'med_001',
      medicationName: 'Metformin',
      actor: 'careReceiver',
    },
    {
      id: 'evt_007',
      type: 'medication_taken',
      timestamp: daysAgo(1),
      medicationId: 'med_003',
      medicationName: 'Calcium + D3',
      actor: 'caregiver',
    },
    {
      id: 'evt_008',
      type: 'refill_noted',
      timestamp: daysAgo(2),
      medicationId: 'med_003',
      medicationName: 'Calcium + D3',
      note: 'Refill picked up from MedPlus',
      actor: 'pharmacist',
    },
    {
      id: 'evt_009',
      type: 'day_closed',
      timestamp: daysAgo(2),
      note: 'Day closed with 5/5 taken',
    },
    {
      id: 'evt_010',
      type: 'note_added',
      timestamp: daysAgo(3),
      note: 'Dad mentioned mild dizziness after Amlodipine - will monitor',
      actor: 'caregiver',
    },
    {
      id: 'evt_011',
      type: 'day_closed',
      timestamp: daysAgo(3),
      note: 'Day closed with 4/5 taken',
    },
    {
      id: 'evt_012',
      type: 'dose_changed',
      timestamp: daysAgo(5),
      medicationId: 'med_004',
      medicationName: 'Amlodipine',
      note: 'Reduced from 10mg to 5mg per doctor advice',
      actor: 'caregiver',
    },
    {
      id: 'evt_013',
      type: 'day_closed',
      timestamp: daysAgo(4),
      note: 'Day closed with 5/5 taken',
    },
    {
      id: 'evt_014',
      type: 'day_closed',
      timestamp: daysAgo(5),
      note: 'Day closed with 5/5 taken',
    },
    {
      id: 'evt_015',
      type: 'day_closed',
      timestamp: daysAgo(6),
      note: 'Day closed with 5/5 taken',
    },
  ],
  contextualNotes: [
    {
      id: 'note_001',
      text: 'Doctor appointment on Friday at 10am',
      createdAt: daysAgo(2),
      linkedTo: { type: 'day' },
      fadingAt: daysFromNow(5),
    },
    {
      id: 'note_002',
      text: 'Mentioned feeling tired in afternoons - maybe adjust timing?',
      createdAt: daysAgo(1),
      linkedTo: { type: 'medication', id: 'med_003' },
      fadingAt: daysFromNow(6),
    },
    {
      id: 'note_003',
      text: 'Running low - order refill by weekend',
      createdAt: daysAgo(0),
      linkedTo: { type: 'medication', id: 'med_003' },
      fadingAt: daysFromNow(7),
    },
  ],
  pharmacist: {
    name: 'Apollo Pharmacy - Mumbai',
    lastRefillConfirm: daysAgo(2),
    note: 'Ask for Mr. Sharma for home delivery',
  },
  dayClosures: [
    {
      date: daysAgo(1).split('T')[0],
      closedAt: daysAgo(1),
      allTaken: true,
      totalMeds: 5,
      takenCount: 5,
    },
    {
      date: daysAgo(2).split('T')[0],
      closedAt: daysAgo(2),
      allTaken: true,
      totalMeds: 5,
      takenCount: 5,
    },
    {
      date: daysAgo(3).split('T')[0],
      closedAt: daysAgo(3),
      allTaken: false,
      totalMeds: 5,
      takenCount: 4,
    },
    {
      date: daysAgo(4).split('T')[0],
      closedAt: daysAgo(4),
      allTaken: true,
      totalMeds: 5,
      takenCount: 5,
    },
    {
      date: daysAgo(5).split('T')[0],
      closedAt: daysAgo(5),
      allTaken: true,
      totalMeds: 5,
      takenCount: 5,
    },
    {
      date: daysAgo(6).split('T')[0],
      closedAt: daysAgo(6),
      allTaken: true,
      totalMeds: 5,
      takenCount: 5,
    },
  ],
  emergencyContacts: [
    {
      id: 'ec_001',
      name: 'Dr. Rajesh Kumar',
      relationship: 'Family Doctor',
      phone: '+91 98765 43210',
      isPrimary: true,
    },
    {
      id: 'ec_002',
      name: 'Ayushi (Daughter)',
      relationship: 'Family',
      phone: '+91 98765 12345',
      isPrimary: false,
    },
    {
      id: 'ec_003',
      name: 'Apollo Hospital',
      relationship: 'Hospital',
      phone: '+91 80 2630 1234',
      isPrimary: false,
    },
  ],
  wellnessEntries: [
    {
      id: 'well_001',
      date: daysAgo(0).split('T')[0],
      level: 'okay',
      note: 'Slight tiredness in the afternoon',
      timestamp: daysAgo(0),
    },
    {
      id: 'well_002',
      date: daysAgo(1).split('T')[0],
      level: 'great',
      timestamp: daysAgo(1),
    },
    {
      id: 'well_003',
      date: daysAgo(2).split('T')[0],
      level: 'great',
      timestamp: daysAgo(2),
    },
    {
      id: 'well_004',
      date: daysAgo(3).split('T')[0],
      level: 'notGreat',
      note: 'Feeling dizzy after evening medicine',
      timestamp: daysAgo(3),
    },
    {
      id: 'well_005',
      date: daysAgo(4).split('T')[0],
      level: 'okay',
      timestamp: daysAgo(4),
    },
    {
      id: 'well_006',
      date: daysAgo(5).split('T')[0],
      level: 'great',
      timestamp: daysAgo(5),
    },
    {
      id: 'well_007',
      date: daysAgo(6).split('T')[0],
      level: 'great',
      timestamp: daysAgo(6),
    },
  ],
  messages: [
    {
      id: 'msg_001',
      from: 'careReceiver',
      text: 'I took my medicine',
      timestamp: daysAgo(0),
      isRead: true,
      isQuickMessage: true,
    },
    {
      id: 'msg_002',
      from: 'caregiver',
      text: 'Great job, Dad! I will call you this evening.',
      timestamp: daysAgo(0),
      isRead: true,
      isQuickMessage: false,
    },
    {
      id: 'msg_003',
      from: 'careReceiver',
      text: 'Feeling good today',
      timestamp: daysAgo(1),
      isRead: true,
      isQuickMessage: true,
    },
    {
      id: 'msg_004',
      from: 'caregiver',
      text: 'So happy to hear that! Remember to take your afternoon calcium with lunch.',
      timestamp: daysAgo(1),
      isRead: true,
      isQuickMessage: false,
    },
    {
      id: 'msg_005',
      from: 'careReceiver',
      text: 'Can you call me?',
      timestamp: daysAgo(2),
      isRead: true,
      isQuickMessage: true,
    },
    {
      id: 'msg_006',
      from: 'caregiver',
      text: 'Calling you now, Dad.',
      timestamp: daysAgo(2),
      isRead: true,
      isQuickMessage: false,
    },
  ],
  currentStreak: 14,
  longestStreak: 21,
  totalDaysTracked: 45,
  safetyCheck: {
    status: 'idle',
  },
}

/**
 * Calculates care confidence based on recent activity.
 * @param {TimelineEvent[]} timeline - The event history.
 * @param {DayClosure[]} dayClosures - The history of day closures.
 * @returns {ConfidenceLevel} The determined confidence level.
 */
export function calculateConfidence(
  timeline: TimelineEvent[],
  dayClosures: DayClosure[]
): ConfidenceLevel {
  const recentDays = 7
  const now = new Date()
  const recentEvents = timeline.filter((e) => {
    const eventDate = new Date(e.timestamp)
    const diffDays = Math.floor(
      (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    return diffDays < recentDays
  })

  if (dayClosures.length < 3) return 'new'

  const hasRecentChanges = recentEvents.some((e) =>
    ['dose_changed', 'medication_added', 'medication_removed'].includes(e.type)
  )

  if (hasRecentChanges) return 'adjusting'

  return 'stable'
}

/**
 * Maps a confidence level to a human-readable message.
 * @param {ConfidenceLevel} level - The confidence level.
 * @returns {string} The descriptive message.
 */
export function getConfidenceMessage(level: ConfidenceLevel): string {
  switch (level) {
    case 'stable':
      return 'Routine feels stable'
    case 'adjusting':
      return 'A few changes recently — that\'s okay'
    case 'new':
      return 'Getting started together'
  }
}

/**
 * Generates a unique identifier for new medications or events.
 * @returns {string} A unique string ID.
 */
export function generateId(): string {
  return `med_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Mapping of TimeOfDay keys to human-readable display labels.
 */
export const timeOfDayLabels: Record<TimeOfDay, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
}

/**
 * Determines the current time of day based on the local system clock.
 * @returns {TimeOfDay} The current time category.
 */
export function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

/**
 * Formats a 24-hour time string or Date object into a 12-hour format (e.g., "8:30 AM").
 * @param {string | Date | null | undefined} time - The time value to format.
 * @returns {string} The formatted 12-hour time string, or an empty string if no input.
 */
export function formatTime12h(time: string | Date | null | undefined): string {
  if (!time) return ''
  let h = 0
  let m = 0
  if (time instanceof Date) {
    h = time.getHours()
    m = time.getMinutes()
  } else {
    const match = /^\s*(\d{1,2}):(\d{2})(?::\d{2})?\s*$/.exec(String(time))
    if (!match) return String(time)
    h = parseInt(match[1], 10)
    m = parseInt(match[2], 10)
  }
  if (Number.isNaN(h) || Number.isNaN(m)) return String(time)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hh = ((h + 11) % 12) + 1
  return `${hh}:${String(m).padStart(2, '0')} ${suffix}`
}
