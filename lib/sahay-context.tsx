'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import {
  type AppData,
  type UserRole,
  type Medication,
  type CaregiverProfile,
  type CareReceiverProfile,
  type TimelineEvent,
  type TimelineEventType,
  type ContextualNote,
  type PharmacistContact,
  type DayClosure,
  type CareRoleStatus,
  type TimeOfDay,
  type EmergencyContact,
  type WellnessEntry,
  type WellnessLevel,
  type CareMessage,
  generateId,
  defaultAppData,
  STORAGE_KEY,
} from './types'
import { api } from './api'
import { showNotification } from './notifications'
import { supabase } from './supabase-client'

/**
 * @file sahay-context.tsx
 * @description Central state management for the Sahay+ application.
 * This context provider handles authentication, data synchronization with the API,
 * and provides a global state for medications, timeline events, wellness tracking,
 * and caregiver-receiver relationships.
 */

// localStorage key for persisting auth
const AUTH_STORAGE_KEY = 'sahay_user'

/**
 * Represents the authenticated user session.
 */
export interface SahayUser {
  id: string
  email: string
  name: string
  role: 'caregiver' | 'care_receiver'
  care_code?: string
  care_relationship_id?: string
}

/**
 * The shape of the global state and methods provided by the SahayProvider.
 */
interface SahayContextValue {
  // State
  /** The current application state including medications, timeline, and profiles. */
  data: AppData
  /** Whether the initial authentication check is loading. */
  isLoading: boolean
  /** Whether background data from the API is currently being fetched. */
  isDataLoading: boolean

  // Auth
  /** The currently authenticated user, or null if not logged in. */
  user: SahayUser | null
  /** Authenticates a user and initializes the session. */
  login: (user: any, careRelationship: any) => void
  /** Logs out the current user and clears state. */
  logout: () => void
  /** Links a care receiver to a caregiver using a shared care code. */
  linkCareCode: (code: string) => Promise<void>

  // Profile management
  /** Updates the caregiver's profile information. */
  setCaregiver: (profile: CaregiverProfile) => void
  /** Updates the care receiver's profile information. */
  setCareReceiver: (profile: CareReceiverProfile) => void
  /** Updates the caregiver's current availability status (e.g., 'active', 'away'). */
  updateCaregiverStatus: (status: CareRoleStatus, awayUntil?: string) => void
  /** Sets the times of day when the care receiver is typically independent. */
  setCareReceiverIndependence: (times: TimeOfDay[]) => void

  // Medication management
  /** Adds a new medication to the tracking list. */
  addMedication: (med: Omit<Medication, 'id' | 'taken' | 'lastUpdated'>) => void
  /** Updates an existing medication's details. */
  updateMedication: (
    id: string,
    updates: Partial<Omit<Medication, 'id'>>
  ) => void
  /** Removes a medication from the system. */
  removeMedication: (id: string) => void
  /** Marks a medication as taken or skipped. */
  markMedicationTaken: (id: string, taken: boolean) => void
  /** Updates the number of days remaining before a medication refill is needed. */
  updateRefillStatus: (id: string, daysLeft: number) => void

  // Timeline & notes
  /** Adds a general event to the care timeline. */
  addTimelineEvent: (
    type: TimelineEventType,
    medicationId?: string,
    note?: string
  ) => void
  /** Adds a short-term contextual note linked to a day or medication. */
  addContextualNote: (
    text: string,
    linkedTo?: { type: 'medication' | 'day'; id?: string }
  ) => void
  /** Deletes a contextual note. */
  removeContextualNote: (id: string) => void

  // Pharmacist
  /** Updates the pharmacist's contact information. */
  updatePharmacist: (contact: PharmacistContact) => void
  /** Adds a note from the pharmacist regarding a specific medication. */
  addPharmacistNote: (medicationId: string, note: string) => void

  // Daily closure
  /** Finalizes the care day by summarizing medication adherence. */
  closeDay: () => void
  /** Checks if the care day has already been closed. */
  isDayClosed: () => boolean

  // Check-in suggestions
  /** Returns a suggestion message for the caregiver to check in, or null if not appropriate. */
  getSuggestedCheckIn: () => string | null
  /** Dismisses the current check-in suggestion. */
  dismissCheckInSuggestion: () => void

  // Emergency contacts
  /** Adds a new emergency contact. */
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void
  /** Removes an emergency contact. */
  removeEmergencyContact: (id: string) => void
  /** Sets a specific contact as the primary emergency contact. */
  setPrimaryContact: (id: string) => void

  // Wellness tracking
  /** Logs a wellness level and optional note for the day. */
  logWellness: (level: WellnessLevel, note?: string) => void
  /** Retrieves the wellness entry for today. */
  getTodayWellness: () => WellnessEntry | null
  /** Retrieves a trend of recent wellness entries. */
  getWellnessTrend: () => WellnessEntry[]

  // Messaging
  /** Sends a message to the other party in the care relationship. */
  sendMessage: (text: string, isQuickMessage?: boolean) => void
  /** Marks a specific message as read. */
  markMessageRead: (id: string) => void
  /** Calculates the number of unread messages. */
  getUnreadCount: () => number

  // Analytics helpers
  /** Gets adherence stats (streak, total) for a specific medication. */
  getMedicationStats: (medId: string) => { streak: number; total: number }
  /** Calculates adherence rates for the last 7 days. */
  getWeeklyAdherence: () => { day: string; taken: number; total: number }[]

  // Safety check
  /** Triggers a safety check request (either automatically via motion or manually). */
  triggerSafetyCheck: (by: 'motion' | 'manual') => void
  /** Dismisses an active safety check. */
  dismissSafetyCheck: () => void
  /** Escalates a safety check to the caregiver if the receiver doesn't respond. */
  escalateSafetyCheck: () => void

  // New features
  /** Marks the daily wellness check-in as complete. */
  completeDailyCheckIn: () => void
  /** Sends an urgent help request to the caregiver. */
  requestHelp: () => void
  /** Initiates a care handover to another person. */
  startHandover: (targetName: string, endDate: string) => void
  /** Ends an active care handover. */
  endHandover: () => void
  /** Generates human-readable insights based on timeline patterns. */
  getHumanInsights: () => string[]
  /** Generates a summary of care for a doctor's visit. */
  getDoctorPrepSummary: () => string
  /** Dismisses the notification that data has changed. */
  dismissChangeIndicator: () => void

  // Utility
  /** Resets the application state to defaults. */
  resetApp: () => void

  /** Manually refreshes the care relationship data from the API. */
  refreshRelationshipData: () => Promise<void>
}

const SahayContext = createContext<SahayContextValue | null>(null)

/**
 * Custom hook to access the Sahay global state.
 * @throws {Error} If used outside of a SahayProvider.
 */
export function useSahay(): SahayContextValue {
  const context = useContext(SahayContext)
  if (!context) {
    throw new Error('useSahay must be used within a SahayProvider')
  }
  return context
}

/**
 * Helper to execute an API call and safely handle errors, returning null on failure.
 * Useful for non-critical side effects where a crash would be disruptive.
 *
 * @template T The expected return type.
 * @param {() => Promise<T>} fn - The API call to execute.
 * @returns {Promise<T | null>} The result of the call or null if it failed.
 */
async function safeApiCall<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch (err) {
    console.error('[Sahay API]', err)
    return null
  }
}

/**
 * Retrieves the current active handover ID for a given relationship.
 * @param {string} crId - The care relationship ID.
 * @returns {Promise<string | null>} The handover ID or null if none active.
 */
async function currentHandoverId(crId: string): Promise<string | null> {
  try {
    const res = await api.handover.current(crId)
    return res?.handover?.id ?? null
  } catch {
    return null
  }
}

/**
 * Resolves a safety check ID based on the relationship and the trigger timestamp.
 * @param {string} crId - The care relationship ID.
 * @param {string} triggeredAt - The ISO timestamp when the check was triggered.
 * @returns {Promise<string | null>} The safety check ID or null.
 */
async function resolveSafetyCheckId(crId: string, triggeredAt: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/safety-checks?care_relationship_id=${crId}&triggered_at=${encodeURIComponent(triggeredAt)}`)
    if (!res.ok) return null
    const payload = await res.json()
    return payload?.safety_check?.id ?? null
  } catch {
    return null
  }
}

/**
 * Provider component that wraps the application and manages global state.
 * It handles auth restoration from localStorage, data synchronization with the API,
 * and provides the business logic for all care-related actions.
 */
export function SahayProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(defaultAppData)
  const [isLoading, setIsLoading] = useState(true)
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [user, setUser] = useState<SahayUser | null>(null)
  const [caregiverId, setCaregiverId] = useState<string | null>(null)

  /** Safely returns the current user ID. */
  const getUserId = useCallback(() => user?.id || '', [user])
  /** Safely returns the current care relationship ID. */
  const getCareRelId = useCallback(() => user?.care_relationship_id || '', [user])

  /**
   * Restores the user session from localStorage on initial mount.
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as SahayUser
          setUser(parsed)
          setData((prev) => ({
            ...prev,
            userRole: parsed.role === 'caregiver' ? 'caregiver' : 'careReceiver',
          }))
        } catch {
          localStorage.removeItem(AUTH_STORAGE_KEY)
        }
      }
    }
    setIsLoading(false)
  }, [])

  /**
   * Re-fetches the user profile and relationship from the DB.
   * This ensures the client picks up relationship changes made on other devices.
   */
  const refreshUserFromDb = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await fetch(
        `/api/care-relationships/me?user_id=${encodeURIComponent(user.id)}`
      )
      if (!res.ok) return
      const payload = await res.json()
      const freshUser = payload?.user
      const rel = payload?.relationship
      if (!freshUser) return

      const updated: SahayUser = {
        ...user,
        email: freshUser.email || user.email,
        name: freshUser.name || user.name,
        role: (freshUser.role as SahayUser['role']) || user.role,
        care_code: freshUser.care_code || user.care_code,
        care_relationship_id: rel ? String(rel.id) : user.care_relationship_id,
      }

      if (
        updated.care_relationship_id !== user.care_relationship_id ||
        updated.care_code !== user.care_code ||
        updated.name !== user.name
      ) {
        setUser(updated)
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated))
      }
    } catch (err) {
      console.error('[Sahay] refreshUserFromDb failed:', err)
    }
  }, [user])

  /**
   * Handles the login process by setting the user session and initializing state.
   */
  const login = useCallback((userData: any, careRelationship: any) => {
    const u: SahayUser = {
      id: String(userData.id),
      email: userData.email,
      name: userData.name,
      role: userData.role,
      care_code: userData.care_code || undefined,
      care_relationship_id: careRelationship ? String(careRelationship.id) : undefined,
    }
    setUser(u)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u))
    setData({
      ...defaultAppData,
      userRole: u.role === 'caregiver' ? 'caregiver' : 'careReceiver',
      caregiver: u.role === 'caregiver' ? { name: u.name, setupComplete: true, roleStatus: 'active' } : null,
      careReceiver: u.role === 'care_receiver' ? { name: u.name, preferVoiceConfirm: false } : null,
    })
  }, [])

  /**
   * Logs out the user by clearing session and state.
   */
  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setData(defaultAppData)
  }, [])

  /**
   * Links the current user to a care relationship using a provided care code.
   */
  const linkCareCode = useCallback(async (code: string) => {
    if (!user) throw new Error('Not logged in')
    const res = await fetch('/api/care-relationships/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caregiver_id: user.id, care_code: code }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to link')

    const updatedUser: SahayUser = {
      ...user,
      care_relationship_id: String(data.relationship.id),
    }
    setUser(updatedUser)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))

    if (data.care_receiver) {
      setData((prev) => ({
        ...prev,
        careReceiver: { name: data.care_receiver.name, preferVoiceConfirm: false },
      }))
    }
  }, [user])

  /**
   * Effect that loads all necessary data from the API when a user is linked to a relationship.
   * Fetches medications, timeline, notes, wellness, closures, messages, and emergency contacts.
   */
  useEffect(() => {
    if (!user?.care_relationship_id) return

    const crId = user.care_relationship_id
    const userId = user.id

    setIsDataLoading(true)

    async function loadData() {
      try {
        const [medsRes, timelineRes, notesRes, wellnessRes, dayRes, msgsRes, contactsRes, relRes] =
          await Promise.allSettled([
            api.medications.list(crId),
            api.timeline.list(crId),
            api.notes.list(crId),
            api.wellness.list(crId),
            api.day.history(crId),
            api.messages.list(crId),
            api.emergencyContacts.list(crId),
            api.careRelationships.get(crId),
          ])

        let otherPartyName: string | undefined
        if (relRes.status === 'fulfilled') {
          const rel = relRes.value.relationship
          if (rel) {
            setCaregiverId(rel.caregiver_id)
            const otherId = user!.role === 'caregiver'
              ? rel.care_receiver_id
              : rel.caregiver_id
            if (otherId) {
              try {
                const otherRes = await fetch(
                  `/api/care-relationships/me?user_id=${encodeURIComponent(otherId)}`
                )
                if (otherRes.ok) {
                  const otherPayload = await otherRes.json()
                  otherPartyName = otherPayload?.user?.name
                }
              } catch {
                // best-effort
              }
            }
          }
        }

        const today = new Date().toISOString().split('T')[0]
        let takenMedIds = new Set<string>()
        try {
          const logsRes = await fetch(
            `/api/medication-logs?care_relationship_id=${crId}&date=${today}`
          )
          if (logsRes.ok) {
            const logsPayload = await logsRes.json()
            const logs: any[] = logsPayload?.logs || []
            takenMedIds = new Set(
              logs.filter((l) => l.taken).map((l) => String(l.medication_id))
            )
          }
        } catch {
          // best-effort
        }

        setData((prev) => {
          const medsWithTaken = (medsRes.status === 'fulfilled'
            ? medsRes.value.medications.map((m: any) => ({
              id: String(m.id),
              name: m.name,
              dosage: m.dosage,
              timeOfDay: m.time_of_day as TimeOfDay,
              time: m.time || undefined,
              notes: m.notes || undefined,
              taken: takenMedIds.has(String(m.id)),
              lastUpdated: m.updated_at || m.created_at,
              refillDaysLeft: m.refill_days_left || undefined,
              pharmacistNote: m.pharmacist_note || undefined,
              simpleExplanation: m.simple_explanation || undefined,
              streak: 0,
              totalTaken: 0,
            }))
            : prev.medications.map((m) => ({
              ...m,
              taken: takenMedIds.has(m.id) || m.taken,
            }))
          )

          return {
            ...prev,
            medications: medsWithTaken,
            timeline: timelineRes.status === 'fulfilled'
              ? timelineRes.value.events.map((e: any) => ({
                id: String(e.id),
                type: e.type as TimelineEventType,
                timestamp: e.created_at,
                medicationId: e.medication_id ? String(e.medication_id) : undefined,
                note: e.note || undefined,
                actor: e.actor_type as any,
              }))
              : prev.timeline,
            contextualNotes: notesRes.status === 'fulfilled'
              ? notesRes.value.notes.map((n: any) => ({
                id: String(n.id),
                text: n.text,
                createdAt: n.created_at,
                linkedTo: n.linked_type
                  ? { type: n.linked_type, id: n.linked_medication_id ? String(n.linked_medication_id) : undefined }
                  : undefined,
                fadingAt: new Date(new Date(n.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              }))
              : prev.contextualNotes,
            wellnessEntries: wellnessRes.status === 'fulfilled'
              ? wellnessRes.value.entries.map((w: any) => ({
                id: String(w.id),
                date: w.date,
                level: w.level as WellnessLevel,
                note: w.note || undefined,
                timestamp: w.created_at,
                isRead: false,
              }))
              : prev.wellnessEntries,
            dayClosures: dayRes.status === 'fulfilled'
              ? dayRes.value.closures.map((d: any) => ({
                date: d.date,
                closedAt: d.closed_at,
                allTaken: d.all_taken,
                totalMeds: d.total_meds,
                takenCount: d.taken_count,
              }))
              : prev.dayClosures,
            messages: msgsRes.status === 'fulfilled'
              ? msgsRes.value.messages.map((m: any) => ({
                id: String(m.id),
                from: m.from_user_id === userId ? (user!.role === 'caregiver' ? 'caregiver' : 'careReceiver') : (user!.role === 'caregiver' ? 'careReceiver' : 'caregiver') as any,
                text: m.text,
                timestamp: m.created_at,
                isRead: !!m.read_at,
                isQuickMessage: false,
              })).reverse()
              : prev.messages,
            emergencyContacts: contactsRes.status === 'fulfilled'
              ? contactsRes.value.contacts.map((c: any) => ({
                id: String(c.id),
                name: c.name,
                relationship: c.relationship || '',
                phone: c.phone,
                isPrimary: c.is_primary,
              }))
              : prev.emergencyContacts,
            ...(user!.role === 'caregiver'
              ? { careReceiver: { name: otherPartyName || 'Care Receiver', preferVoiceConfirm: false } }
              : { caregiver: prev.caregiver || (otherPartyName ? { name: otherPartyName, setupComplete: true, roleStatus: 'active' as CareRoleStatus } : null) }
            ),
          }
        })
      } catch (err) {
        console.error('[Sahay] Failed to load data from API, using fallback:', err)
      } finally {
        setIsDataLoading(false)
      }
    }
    loadData()
  }, [user?.care_relationship_id, user?.id, user?.role])

  /**
   * Updates the caregiver's profile in local state.
   */
  const setCaregiver = useCallback((profile: CaregiverProfile) => {
    setData((prev) => ({ ...prev, caregiver: profile }))
  }, [])

  /**
   * Updates the care receiver's profile in local state.
   */
  const setCareReceiver = useCallback((profile: CareReceiverProfile) => {
    setData((prev) => ({ ...prev, careReceiver: profile }))
  }, [])

  /**
   * Updates the caregiver's availability status both locally and in the DB.
   */
  const updateCaregiverStatus = useCallback(
    (status: CareRoleStatus, awayUntil?: string) => {
      setData((prev) => ({
        ...prev,
        caregiver: prev.caregiver
          ? { ...prev.caregiver, roleStatus: status, awayUntil }
          : null,
      }))
      const crId = getCareRelId()
      if (crId) {
        safeApiCall(() =>
          api.careRelationships.update(crId, {
            caregiver_status: status,
            away_until: awayUntil || null,
          })
        )
      }
    },
    [getCareRelId]
  )

  /**
   * Sets the times of day when the care receiver is independent.
   */
  const setCareReceiverIndependence = useCallback((times: TimeOfDay[]) => {
    setData((prev) => ({
      ...prev,
      careReceiver: prev.careReceiver
        ? { ...prev.careReceiver, independentTimes: times }
        : null,
    }))
    const crId = getCareRelId()
    if (crId) {
      safeApiCall(() =>
        api.careRelationships.update(crId, {
          independent_times: times,
        })
      )
    }
  }, [getCareRelId])

  /**
   * Adds a new medication to the tracking list and syncs with the API.
   */
  const addMedication = useCallback(
    (med: Omit<Medication, 'id' | 'taken' | 'lastUpdated'>) => {
      const tempId = generateId()
      const newMed: Medication = {
        ...med,
        id: tempId,
        taken: false,
        lastUpdated: new Date().toISOString(),
      }
      setData((prev) => ({
        ...prev,
        medications: [...prev.medications, newMed],
      }))

      const crId = getCareRelId()
      if (crId) {
        safeApiCall(async () => {
          const res = await api.medications.create({
            care_relationship_id: crId,
            name: med.name,
            dosage: med.dosage,
            time_of_day: med.timeOfDay,
            time: med.time,
            notes: med.notes,
            simple_explanation: med.simpleExplanation,
            refill_days_left: med.refillDaysLeft,
            pharmacist_note: med.pharmacistNote,
          })
          setData((prev) => ({
            ...prev,
            medications: prev.medications.map((m) =>
              m.id === tempId ? { ...m, id: String(res.medication.id) } : m
            ),
          }))
        })
      }
    },
    [getCareRelId]
  )

  /**
   * Updates an existing medication's details and syncs with the API.
   */
  const updateMedication = useCallback(
    (id: string, updates: Partial<Omit<Medication, 'id'>>) => {
      setData((prev) => ({
        ...prev,
        medications: prev.medications.map((med) =>
          med.id === id
            ? { ...med, ...updates, lastUpdated: new Date().toISOString() }
            : med
        ),
        lastChangeNotifiedAt: new Date().toISOString(),
      }))

      const dbUpdates: Record<string, any> = {}
      if (updates.name !== undefined) dbUpdates.name = updates.name
      if (updates.dosage !== undefined) dbUpdates.dosage = updates.dosage
      if (updates.timeOfDay !== undefined) dbUpdates.time_of_day = updates.timeOfDay
      if (updates.time !== undefined) dbUpdates.time = updates.time
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes
      if (updates.simpleExplanation !== undefined) dbUpdates.simple_explanation = updates.simpleExplanation
      if (updates.refillDaysLeft !== undefined) dbUpdates.refill_days_left = updates.refillDaysLeft
      if (updates.pharmacistNote !== undefined) dbUpdates.pharmacist_note = updates.pharmacistNote

      if (Object.keys(dbUpdates).length > 0) {
        safeApiCall(() => api.medications.update(id, dbUpdates))
      }
    },
    []
  )

  /**
   * Removes a medication from the list.
   */
  const removeMedication = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      medications: prev.medications.filter((med) => med.id !== id),
      lastChangeNotifiedAt: new Date().toISOString(),
    }))
    safeApiCall(() => api.medications.remove(id))
  }, [])

  /**
   * Marks a medication as taken or skipped and triggers corresponding API calls and notifications.
   */
  const markMedicationTaken = useCallback((id: string, taken: boolean) => {
    const med = data.medications.find((m) => m.id === id)

    setData((prev) => {
      const newTimeline: TimelineEvent = {
        id: generateId(),
        type: taken ? 'medication_taken' : 'medication_skipped',
        timestamp: new Date().toISOString(),
        medicationId: id,
        medicationName: med?.name,
        actor: prev.userRole === 'caregiver' ? 'caregiver' : 'careReceiver',
      }
      return {
        ...prev,
        medications: prev.medications.map((m) =>
          m.id === id
            ? { ...m, taken, lastUpdated: new Date().toISOString() }
            : m
        ),
        timeline: [...prev.timeline, newTimeline],
      }
    })

    const userId = getUserId()
    if (taken) {
      safeApiCall(() => api.medications.take(id, userId))

      if (caregiverId) {
        const medName = med?.name || 'Medicine'
        const careReceiverName = data.careReceiver?.name || 'Care Receiver'
        safeApiCall(() => api.notifications.create({
          user_id: caregiverId,
          type: 'medication_taken',
          title: 'Medication Taken',
          body: `${careReceiverName} took ${medName}`
        }))
        showNotification('Medication Taken', `Notified caregiver that you took ${medName}`)
      }
    } else {
      safeApiCall(() => api.medications.skip(id, userId))
    }
  }, [getUserId, caregiverId, data.careReceiver?.name, data.medications])

  /**
   * Updates the refill countdown for a medication.
   */
  const updateRefillStatus = useCallback((id: string, daysLeft: number) => {
    setData((prev) => ({
      ...prev,
      medications: prev.medications.map((med) =>
        med.id === id
          ? { ...med, refillDaysLeft: daysLeft, lastUpdated: new Date().toISOString() }
          : med
      ),
    }))
    safeApiCall(() => api.medications.update(id, { refill_days_left: daysLeft }))
  }, [])

  /**
   * Adds a general event to the care timeline.
   */
  const addTimelineEvent = useCallback(
    (type: TimelineEventType, medicationId?: string, note?: string) => {
      const med = medicationId
        ? data.medications.find((m) => m.id === medicationId)
        : undefined
      const newEvent: TimelineEvent = {
        id: generateId(),
        type,
        timestamp: new Date().toISOString(),
        medicationId,
        medicationName: med?.name,
        note,
        actor: data.userRole === 'caregiver' ? 'caregiver' : 'careReceiver',
      }
      setData((prev) => ({
        ...prev,
        timeline: [...prev.timeline, newEvent],
      }))
    },
    [data.medications, data.userRole]
  )

  /**
   * Adds a short-term contextual note linked to a day or medication.
   */
  const addContextualNote = useCallback(
    (text: string, linkedTo?: { type: 'medication' | 'day'; id?: string }) => {
      const now = new Date()
      const fadingAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const tempId = generateId()
      const newNote: ContextualNote = {
        id: tempId,
        text,
        createdAt: now.toISOString(),
        linkedTo,
        fadingAt: fadingAt.toISOString(),
      }
      setData((prev) => ({
        ...prev,
        contextualNotes: [...prev.contextualNotes, newNote],
      }))

      const crId = getCareRelId()
      const userId = getUserId()
      if (crId) {
        safeApiCall(async () => {
          const res = await api.notes.create({
            care_relationship_id: crId,
            text,
            linked_type: linkedTo?.type || 'day',
            created_by: userId,
            linked_medication_id: linkedTo?.id,
          })
          setData((prev) => ({
            ...prev,
            contextualNotes: prev.contextualNotes.map((n) =>
              n.id === tempId ? { ...n, id: String(res.note.id) } : n
            ),
          }))
        })
      }
    },
    [getCareRelId, getUserId]
  )

  /**
   * Deletes a contextual note.
   */
  const removeContextualNote = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      contextualNotes: prev.contextualNotes.filter((n) => n.id !== id),
    }))
    safeApiCall(() => api.notes.remove(id))
  }, [])

  /**
   * Updates the pharmacist's contact details.
   */
  const updatePharmacist = useCallback((contact: PharmacistContact) => {
    setData((prev) => ({
      ...prev,
      pharmacist: { ...prev.pharmacist, ...contact },
    }))
  }, [])

  /**
   * Adds a note from the pharmacist about a specific medication.
   */
  const addPharmacistNote = useCallback((medicationId: string, note: string) => {
    setData((prev) => {
      const newEvent: TimelineEvent = {
        id: generateId(),
        type: 'refill_noted',
        timestamp: new Date().toISOString(),
        medicationId,
        medicationName: prev.medications.find((m) => m.id === medicationId)?.name,
        note,
        actor: 'pharmacist',
      }
      return {
        ...prev,
        medications: prev.medications.map((med) =>
          med.id === medicationId
            ? { ...med, pharmacistNote: note, lastUpdated: new Date().toISOString() }
            : med
        ),
        timeline: [...prev.timeline, newEvent],
      }
    })
    safeApiCall(() => api.medications.update(medicationId, { pharmacist_note: note }))
  }, [])

  /**
   * Closes the care day and records a summary of medication adherence.
   */
  const closeDay = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    setData((prev) => {
      const takenCount = prev.medications.filter((m) => m.taken).length
      const newClosure: DayClosure = {
        date: today,
        closedAt: new Date().toISOString(),
        allTaken: takenCount === prev.medications.length,
        totalMeds: prev.medications.length,
        takenCount,
      }
      const newEvent: TimelineEvent = {
        id: generateId(),
        type: 'day_closed',
        timestamp: new Date().toISOString(),
        note: `Day closed with ${takenCount}/${prev.medications.length} taken`,
        actor: 'caregiver',
      }

      const crId = getCareRelId()
      const userId = getUserId()
      if (crId) {
        safeApiCall(() =>
          api.day.close({
            care_relationship_id: crId,
            closed_by: userId,
            all_taken: takenCount === prev.medications.length,
            total_meds: prev.medications.length,
            taken_count: takenCount,
          })
        )
      }

      return {
        ...prev,
        dayClosures: [...prev.dayClosures, newClosure],
        timeline: [...prev.timeline, newEvent],
      }
    })
  }, [getCareRelId, getUserId])

  /**
   * Returns true if the care day has been closed.
   */
  const isDayClosed = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    return (data.dayClosures || []).some((c) => c.date === today)
  }, [data.dayClosures])

  /**
   * Pure getter that determines if the caregiver should be prompted to check in.
   */
  const getSuggestedCheckIn = useCallback(() => {
    if (data.userRole !== 'caregiver') return null
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const yesterdayClosure = (data.dayClosures || []).find((c) => c.date === yesterdayStr)

    if (yesterdayClosure && yesterdayClosure.totalMeds > 0 && yesterdayClosure.takenCount === 0) {
      return "Would you like to check in?"
    }

    if (data.medications.length === 0) return null
    const now = new Date()
    const hour = now.getHours()
    if (hour < 9 || hour > 20) return null
    if (data.lastCheckInSuggestion) {
      const lastSuggestion = new Date(data.lastCheckInSuggestion)
      const hoursSince = (now.getTime() - lastSuggestion.getTime()) / (1000 * 60 * 60)
      if (hoursSince < 8) return null
    }
    if (data.caregiver?.roleStatus === 'away') return null

    const pendingMeds = data.medications.filter((m) => !m.taken)
    if (pendingMeds.length === 0) return null

    const careReceiverName = data.careReceiver?.name || 'them'
    return `You might want to check in with ${careReceiverName}`
  }, [data])

  /**
   * Dismisses the check-in suggestion and updates the cooldown timer.
   */
  const dismissCheckInSuggestion = useCallback(() => {
    setData((prev) => ({
      ...prev,
      lastCheckInSuggestion: new Date().toISOString(),
    }))
  }, [])

  /**
   * Adds a new emergency contact and syncs with the API.
   */
  const addEmergencyContact = useCallback(
    (contact: Omit<EmergencyContact, 'id'>) => {
      const tempId = generateId()
      const newContact: EmergencyContact = { ...contact, id: tempId }
      setData((prev) => ({
        ...prev,
        emergencyContacts: [...(prev.emergencyContacts || []), newContact],
      }))

      const crId = getCareRelId()
      if (crId) {
        safeApiCall(async () => {
          const res = await api.emergencyContacts.create({
            care_relationship_id: crId,
            name: contact.name,
            phone: contact.phone,
            relationship: contact.relationship,
            is_primary: contact.isPrimary,
          })
          setData((prev) => ({
            ...prev,
            emergencyContacts: (prev.emergencyContacts || []).map((c) =>
              c.id === tempId ? { ...c, id: String(res.contact.id) } : c
            ),
          }))
        })
      }
    },
    [getCareRelId]
  )

  /**
   * Removes an emergency contact.
   */
  const removeEmergencyContact = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      emergencyContacts: (prev.emergencyContacts || []).filter((c) => c.id !== id),
    }))
    safeApiCall(() => api.emergencyContacts.remove(id))
  }, [])

  /**
   * Sets a specific emergency contact as the primary one.
   */
  const setPrimaryContact = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      emergencyContacts: (prev.emergencyContacts || []).map((c) => ({
        ...c,
        isPrimary: c.id === id,
      })),
    }))
  }, [])

  /**
   * Logs a daily wellness entry.
   */
  const logWellness = useCallback((level: WellnessLevel, note?: string) => {
    const today = new Date().toISOString().split('T')[0]
    const tempId = generateId()
    const newEntry: WellnessEntry = {
      id: tempId,
      date: today,
      level,
      note,
      timestamp: new Date().toISOString(),
    }
    setData((prev) => {
      const filtered = (prev.wellnessEntries || []).filter((e) => e.date !== today)
      return { ...prev, wellnessEntries: [...filtered, newEntry] }
    })

    const crId = getCareRelId()
    const userId = getUserId()
    if (crId) {
      safeApiCall(async () => {
        const res = await api.wellness.log({
          care_relationship_id: crId,
          user_id: userId,
          level,
          note,
        })
        setData((prev) => ({
          ...prev,
          wellnessEntries: (prev.wellnessEntries || []).map((e) =>
            e.id === tempId ? { ...e, id: String(res.entry.id) } : e
          ),
        }))
      })
    }
  }, [getCareRelId, getUserId])

  /**
   * Retrieves the wellness entry for today.
   */
  const getTodayWellness = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    return (data.wellnessEntries || []).find((e) => e.date === today) || null
  }, [data.wellnessEntries])

  /**
   * Retrieves a trend of the last 7 wellness entries.
   */
  const getWellnessTrend = useCallback(() => {
    return (data.wellnessEntries || [])
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 7)
  }, [data.wellnessEntries])

  /**
   * Sends a message to the other party in the care relationship.
   */
  const sendMessage = useCallback(
    (text: string, isQuickMessage = false) => {
      const tempId = generateId()
      const newMessage: CareMessage = {
        id: tempId,
        from: data.userRole === 'caregiver' ? 'caregiver' : 'careReceiver',
        text,
        timestamp: new Date().toISOString(),
        isRead: false,
        isQuickMessage,
      }
      setData((prev) => ({
        ...prev,
        messages: [...(prev.messages || []), newMessage],
      }))

      const crId = getCareRelId()
      const userId = getUserId()
      if (crId) {
        safeApiCall(async () => {
          const res = await api.messages.send({
            care_relationship_id: crId,
            from_user_id: userId,
            text,
          })
          setData((prev) => ({
            ...prev,
            messages: (prev.messages || []).map((m) =>
              m.id === tempId ? { ...m, id: String(res.data.id) } : m
            ),
          }))
        })
      }
    },
    [data.userRole, getCareRelId, getUserId]
  )

  /**
   * Marks a message as read.
   */
  const markMessageRead = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      messages: (prev.messages || []).map((m) =>
        m.id === id ? { ...m, isRead: true } : m
      ),
    }))
    safeApiCall(() => api.messages.markRead(id))
  }, [])

  /**
   * Calculates the total count of unread messages from the other party.
   */
  const getUnreadCount = useCallback(() => {
    const myRole = data.userRole
    return (data.messages || []).filter(
      (m) => !m.isRead && m.from !== myRole
    ).length
  }, [data.messages, data.userRole])

  /**
   * Pure getter that calculates adherence rates for the last 7 days.
   */
  const getWeeklyAdherence = useCallback(() => {
    const days: { day: string; taken: number; total: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const closure = (data.dayClosures || []).find((c) => c.date === dateStr)
      days.push({
        day: d.toLocaleDateString('en', { weekday: 'short' }),
        taken: closure?.takenCount || 0,
        total: closure?.totalMeds || data.medications.length,
      })
    }
    return days
  }, [data.dayClosures, data.medications.length])

  /**
   * Pure getter that retrieves stats for a specific medication.
   */
  const getMedicationStats = useCallback(
    (medId: string) => {
      const med = data.medications.find((m) => m.id === medId)
      return {
        streak: med?.streak || 0,
        total: med?.totalTaken || 0,
      }
    },
    [data.medications]
  )

  /**
   * Resets the global application state.
   */
  const resetApp = useCallback(() => {
    setData(defaultAppData)
  }, [])

  /**
   * Triggers a safety check. If manual, notifies the caregiver.
   */
  const triggerSafetyCheck = useCallback((by: 'motion' | 'manual') => {
    setData((prev) => {
      const newEvent: TimelineEvent = {
        id: generateId(),
        type: 'safety_check_triggered',
        timestamp: new Date().toISOString(),
        note: `Safety check triggered by ${by}`,
        actor: 'careReceiver',
      }
      return {
        ...prev,
        safetyCheck: {
          status: 'pending_check',
          lastTriggered: new Date().toISOString(),
          triggeredBy: by,
        },
        timeline: [...prev.timeline, newEvent],
      }
    })
    const crId = getCareRelId()
    if (crId) {
      safeApiCall(() => api.safetyCheck.trigger(crId))
    }
    if (caregiverId && by === 'manual') {
      showNotification('Safety Check', 'Safety check initiated.')
    }
  }, [getCareRelId, caregiverId])

  /**
   * Dismisses an active safety check and notifies the backend.
   */
  const dismissSafetyCheck = useCallback(() => {
    setData((prev) => {
      const newEvent: TimelineEvent = {
        id: generateId(),
        type: 'safety_check_dismissed',
        timestamp: new Date().toISOString(),
        note: 'Care receiver confirmed they are okay',
        actor: 'careReceiver',
      }
      return {
        ...prev,
        safetyCheck: { ...prev.safetyCheck, status: 'idle' },
        timeline: [...prev.timeline, newEvent],
      }
    })

    const crId = getCareRelId()
    if (crId && data.safetyCheck.lastTriggered) {
      safeApiCall(async () => {
        const checkId = await resolveSafetyCheckId(crId, data.safetyCheck.lastTriggered!)
        if (checkId) {
          await api.safetyCheck.dismiss(checkId)
        }
      })
    }
  }, [getCareRelId, data.safetyCheck])

  /**
   * Escalates a safety check to the caregiver via system notification.
   */
  const escalateSafetyCheck = useCallback(() => {
    setData((prev) => {
      const newEvent: TimelineEvent = {
        id: generateId(),
        type: 'safety_check_escalated',
        timestamp: new Date().toISOString(),
        note: 'Safety check escalated to caregiver due to no response',
        actor: 'careReceiver',
      }
      return {
        ...prev,
        safetyCheck: { ...prev.safetyCheck, status: 'escalating' },
        timeline: [...prev.timeline, newEvent],
      }
    })

    if (caregiverId) {
      safeApiCall(() => api.notifications.create({
        user_id: caregiverId,
        type: 'safety_escalation',
        title: 'Emergency Alert',
        body: `Safety check escalated! ${data.careReceiver?.name || 'Care Receiver'} needs attention.`
      }))
      showNotification('Emergency Alert', 'Caregiver has been notified of your situation. Hang tight.')
    }
  }, [caregiverId, data.careReceiver?.name])

  /**
   * Marks the daily wellness check-in as complete and notifies the caregiver.
   */
  const completeDailyCheckIn = useCallback(() => {
    setData((prev) => {
      const newEvent: TimelineEvent = {
        id: generateId(),
        type: 'fine_check_in',
        timestamp: new Date().toISOString(),
        actor: 'careReceiver',
      }
      return {
        ...prev,
        lastFineCheckIn: new Date().toISOString(),
        timeline: [...prev.timeline, newEvent],
      }
    })

    if (caregiverId) {
      safeApiCall(() => api.notifications.create({
        user_id: caregiverId,
        type: 'check_in',
        title: 'Check-in Complete',
        body: `${data.careReceiver?.name || 'Care Receiver'} checked in as fine.`
      }))
      showNotification('Check-in Complete', 'Thanks for checking in! Caregiver updated.')
    }
  }, [caregiverId, data.careReceiver?.name])

  /**
   * Sends an urgent help request to the caregiver.
   */
  const requestHelp = useCallback(() => {
    setData((prev) => {
      const newEvent: TimelineEvent = {
        id: generateId(),
        type: 'help_requested',
        timestamp: new Date().toISOString(),
        actor: 'careReceiver',
      }
      return { ...prev, timeline: [...prev.timeline, newEvent] }
    })

    if (caregiverId) {
      safeApiCall(() => api.notifications.create({
        user_id: caregiverId,
        type: 'help_request',
        title: 'Help Requested',
        body: `${data.careReceiver?.name || 'Care Receiver'} requested help.`
      }))
      showNotification('Help Requested', 'Caregiver has been alerted. Help is on the way.')
    }
  }, [caregiverId, data.careReceiver?.name])

  /**
   * Initiates a care handover to another designated person.
   */
  const startHandover = useCallback((targetName: string, endDate: string) => {
    setData((prev) => {
      const newEvent: TimelineEvent = {
        id: generateId(),
        type: 'handover_started',
        timestamp: new Date().toISOString(),
        note: `Handed over care to ${targetName} until ${new Date(endDate).toLocaleDateString()}`,
        actor: 'caregiver',
      }
      return {
        ...prev,
        caregiver: prev.caregiver ? {
          ...prev.caregiver,
          handover: { isActive: true, targetName, endDate }
        } : null,
        timeline: [...prev.timeline, newEvent],
      }
    })
    const crId = getCareRelId()
    const userId = getUserId()
    if (crId) {
      safeApiCall(() =>
        api.handover.start({
          care_relationship_id: crId,
          from_caregiver_id: userId,
          to_person_name: targetName,
          end_date: endDate,
        })
      )
    }
  }, [getCareRelId, getUserId])

  /**
   * Terminates an active care handover.
   */
  const endHandover = useCallback(() => {
    setData((prev) => {
      const newEvent: TimelineEvent = {
        id: generateId(),
        type: 'handover_ended',
        timestamp: new Date().toISOString(),
        actor: 'caregiver',
      }
      return {
        ...prev,
        caregiver: prev.caregiver ? {
          ...prev.caregiver,
          handover: { isActive: false }
        } : null,
        timeline: [...prev.timeline, newEvent],
      }
    })

    const crId = getCareRelId()
    const userId = getUserId()
    if (crId && userId) {
      safeApiCall(async () => {
        const hId = await currentHandoverId(crId)
        if (hId) {
          await api.handover.end(hId)
        }
      })
    }
  }, [getCareRelId, getUserId])

  /**
   * Pure getter that generates human-readable insights based on timeline patterns.
   */
  const getHumanInsights = useCallback(() => {
    const insights: string[] = []
    const timeline = data.timeline
    const meds = data.medications

    const eveningMeds = meds.filter(m => m.timeOfDay === 'evening')
    if (eveningMeds.length > 0 && timeline.length > 5) {
      insights.push("Evenings seem a bit harder lately.")
    }

    const recentChanges = timeline.filter(e =>
      ['medication_added', 'medication_removed', 'dose_changed'].includes(e.type)
    )
    if (recentChanges.length > 0) {
      insights.push("This routine has been changing recently.")
    }

    return insights
  }, [data.timeline, data.medications])

  /**
   * Pure getter that generates a summary of care events and changes for a doctor's visit.
   */
  const getDoctorPrepSummary = useCallback(() => {
    const timeline = data.timeline
    const notes = data.contextualNotes

    let summary = "Summary for Doctor Visit:\n\n"

    const recentNotes = notes.slice(-3).map(n => `- ${n.text}`).join('\n')
    if (recentNotes) summary += `Recent observations:\n${recentNotes}\n\n`

    const changes = timeline.filter(t => t.type === 'dose_changed').slice(-2)
    if (changes.length > 0) {
      summary += "Routine changes:\n"
      changes.forEach(c => summary += `- ${c.medicationName} dose adjusted on ${new Date(c.timestamp).toLocaleDateString()}\n`)
    }

    return summary
  }, [data.timeline, data.contextualNotes])

  /**
   * Dismisses the notification indicating that data has changed.
   */
  const dismissChangeIndicator = useCallback(() => {
    setData((prev) => ({
      ...prev,
      lastChangeNotifiedAt: undefined,
    }))
  }, [])

  /**
   * Effect that manages the safety check auto-escalation timer.
   */
  useEffect(() => {
    if (data.safetyCheck.status === 'pending_check') {
      const timer = setTimeout(() => {
        escalateSafetyCheck()
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearTimeout(timer)
    }
  }, [data.safetyCheck.status, escalateSafetyCheck])

  /**
   * Effect that sets up a Supabase realtime channel for caregiver notifications.
   */
  useEffect(() => {
    if (!user || user.role !== 'caregiver') return

    const channel = supabase
      .channel(`caregiver-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log("Notification received:", payload)
          if (payload.new) {
            showNotification(
              payload.new.title,
              payload.new.body
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, user?.role])

  /**
   * Effect that polls the server for relationship link updates for the care receiver.
   */
  useEffect(() => {
    if (!user || user.role !== 'care_receiver') return
    if (user.care_relationship_id) return // already linked — no need to poll

    const poll = () => {
      refreshUserFromDb()
    }

    poll()
    const interval = setInterval(poll, 3000)
    window.addEventListener('focus', poll)
    document.addEventListener('visibilitychange', poll)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', poll)
      document.removeEventListener('visibilitychange', poll)
    }
  }, [user?.id, user?.role, user?.care_relationship_id, refreshUserFromDb])

  /**
   * Effect that periodically refreshes medication and timeline data for the caregiver.
   */
  const refreshRelationshipData = useCallback(async () => {
    if (!user?.care_relationship_id) return
    const crId = user.care_relationship_id
    const today = new Date().toISOString().split('T')[0]

    try {
      const [logsRes, timelineRes] = await Promise.allSettled([
        fetch(`/api/medication-logs?care_relationship_id=${crId}&date=${today}`).then((r) => (r.ok ? r.json() : null)),
        api.timeline.list(crId),
      ])

      const takenMedIds = new Set<string>()
      if (logsRes.status === 'fulfilled' && logsRes.value?.logs) {
        for (const l of logsRes.value.logs) {
          if (l.taken) takenMedIds.add(String(l.medication_id))
        }
      }

      setData((prev) => ({
        ...prev,
        medications: prev.medications.map((m) => ({
          ...m,
          taken: takenMedIds.has(m.id) ? true : m.taken,
        })),
        timeline: timelineRes.status === 'fulfilled'
          ? timelineRes.value.events.map((e: any) => ({
            id: String(e.id),
            type: e.type as TimelineEventType,
            timestamp: e.created_at,
            medicationId: e.medication_id ? String(e.medication_id) : undefined,
            note: e.note || undefined,
            actor: e.actor_type as any,
          }))
          : prev.timeline,
      }))
    } catch (err) {
      console.error('[Sahay] refreshRelationshipData failed:', err)
    }
  }, [user?.care_relationship_id])

  useEffect(() => {
    if (!user?.care_relationship_id) return

    refreshRelationshipData()
    const interval = setInterval(refreshRelationshipData, 10000)
    const onFocus = () => refreshRelationshipData()
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [user?.care_relationship_id, refreshRelationshipData])

  /**
   * The final context value provided to all consuming components.
   */
  const value: SahayContextValue = {
    data,
    isLoading,
    isDataLoading,
    user,
    login,
    logout,
    linkCareCode,
    setCaregiver,
    setCareReceiver,
    updateCaregiverStatus,
    setCareReceiverIndependence,
    addMedication,
    updateMedication,
    removeMedication,
    markMedicationTaken,
    updateRefillStatus,
    addTimelineEvent,
    addContextualNote,
    removeContextualNote,
    updatePharmacist,
    addPharmacistNote,
    closeDay,
    isDayClosed,
    getSuggestedCheckIn,
    dismissCheckInSuggestion,
    addEmergencyContact,
    removeEmergencyContact,
    setPrimaryContact,
    logWellness,
    getTodayWellness,
    getWellnessTrend,
    sendMessage,
    markMessageRead,
    getUnreadCount,
    getWeeklyAdherence,
    getMedicationStats,
    resetApp,
    triggerSafetyCheck,
    dismissSafetyCheck,
    escalateSafetyCheck,
    completeDailyCheckIn,
    requestHelp,
    startHandover,
    endHandover,
    getHumanInsights,
    getDoctorPrepSummary,
    dismissChangeIndicator,
    refreshRelationshipData,
  }

  return <SahayContext.Provider value={value}>{children}</SahayContext.Provider>
}
