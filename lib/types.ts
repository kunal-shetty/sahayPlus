// Sahay+ Data Types
// Simple, human-centered medication management

export type UserRole = 'caregiver' | 'careReceiver' | null

export type TimeOfDay = 'morning' | 'afternoon' | 'evening'

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

export type CareRoleStatus = 'active' | 'away' | 'independent'

export type ConfidenceLevel = 'stable' | 'adjusting' | 'new'

export type WellnessLevel = 'great' | 'okay' | 'notGreat'

export type SafetyCheckStatus = 'idle' | 'pending_check' | 'escalating'

export type MedicationColor = 'white' | 'blue' | 'pink' | 'yellow' | 'orange' | 'green' | 'red'

export type MedicationShape = 'round' | 'oval' | 'capsule' | 'rectangle'

// Emergency contact
export interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  isPrimary: boolean
}

// Wellness check entry
export interface WellnessEntry {
  id: string
  date: string
  level: WellnessLevel
  note?: string
  timestamp: string
}

export interface HandoverInfo {
  isActive: boolean
  targetName?: string
  endDate?: string // ISO date
}

// Message between caregiver and care receiver
export interface CareMessage {
  id: string
  from: 'caregiver' | 'careReceiver'
  text: string
  timestamp: string
  isRead: boolean
  isQuickMessage: boolean // Pre-set messages vs custom
}

export interface TimelineEvent {
  id: string
  type: TimelineEventType
  timestamp: string
  medicationId?: string
  medicationName?: string
  note?: string
  actor?: 'caregiver' | 'careReceiver' | 'pharmacist'
}

export interface ContextualNote {
  id: string
  text: string
  createdAt: string
  linkedTo?: {
    type: 'medication' | 'day'
    id?: string
  }
  fadingAt: string // When this note starts to fade (7 days from creation)
}

export interface Medication {
  id: string
  name: string
  dosage: string
  timeOfDay: TimeOfDay
  time?: string // Specific time (e.g. "08:30")
  notes?: string
  taken: boolean
  lastUpdated: string // ISO date string
  refillDaysLeft?: number // Simple refill awareness
  pharmacistNote?: string // Note from pharmacist
  color?: MedicationColor // Visual identification
  shape?: MedicationShape // Visual identification
  imageUrl?: string // Photo of actual pill
  streak?: number // Consecutive days taken
  totalTaken?: number // Lifetime total
  simpleExplanation?: string // Feature 5: Simple Medication Explanations
}

export interface CaregiverProfile {
  name: string
  setupComplete: boolean
  roleStatus: CareRoleStatus
  awayUntil?: string // ISO date when temporarily away
  handover?: HandoverInfo // Feature 3: Temporary Care Handover
}

export interface CareReceiverProfile {
  name: string
  independentTimes?: TimeOfDay[] // Times they manage independently
  preferLargeText?: boolean // Accessibility
  preferVoiceConfirm?: boolean // Voice confirmation mode
  quickMessages?: string[] // Pre-set messages to send to caregiver
}

export interface PharmacistContact {
  name?: string
  lastRefillConfirm?: string // ISO date
  note?: string
}

export interface DayClosure {
  date: string
  closedAt: string
  allTaken: boolean
  totalMeds: number
  takenCount: number
}

export interface AppData {
  userRole: UserRole
  caregiver: CaregiverProfile | null
  careReceiver: CareReceiverProfile | null
  medications: Medication[]
  lastResetDate: string // Track daily reset
  timeline: TimelineEvent[]
  contextualNotes: ContextualNote[]
  pharmacist: PharmacistContact | null
  dayClosures: DayClosure[]
  lastCheckInSuggestion?: string // ISO date of last suggestion
  // New advanced features
  emergencyContacts: EmergencyContact[]
  wellnessEntries: WellnessEntry[]
  messages: CareMessage[]
  currentStreak: number // Days in a row with all meds taken
  longestStreak: number
  totalDaysTracked: number
  lastChangeNotifiedAt?: string // Feature 7: Calm "Something Changed" Indicator
  lastFineCheckIn?: string // Feature 1: Daily "I'm Fine Today" Check-In
  safetyCheck: {
    status: SafetyCheckStatus
    lastTriggered?: string
    triggeredBy?: 'motion' | 'manual'
  }
}

// Storage key for localStorage
export const STORAGE_KEY = 'sahay-app-data'

// Default empty state
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

// Helper to create dates relative to today
function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

// Dummy data for wireframe/design preview
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

// Calculate care confidence based on recent activity
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

  // New if less than 3 days of history
  if (dayClosures.length < 3) return 'new'

  // Check for recent changes (dose changes, new meds, etc.)
  const hasRecentChanges = recentEvents.some((e) =>
    ['dose_changed', 'medication_added', 'medication_removed'].includes(e.type)
  )

  if (hasRecentChanges) return 'adjusting'

  return 'stable'
}

// Get confidence message
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

// Helper to generate unique IDs
export function generateId(): string {
  return `med_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Time of day display labels
export const timeOfDayLabels: Record<TimeOfDay, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
}

// Get current time of day
export function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}
