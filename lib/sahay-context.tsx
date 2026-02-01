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
  dummyAppData,
  generateId,
  defaultAppData,
  STORAGE_KEY,
} from './types'

interface SahayContextValue {
  // State
  data: AppData
  isLoading: boolean

  // Role management
  setUserRole: (role: UserRole) => void
  clearRole: () => void

  // Profile management
  setCaregiver: (profile: CaregiverProfile) => void
  setCareReceiver: (profile: CareReceiverProfile) => void
  updateCaregiverStatus: (status: CareRoleStatus, awayUntil?: string) => void
  setCareReceiverIndependence: (times: TimeOfDay[]) => void

  // Medication management
  addMedication: (med: Omit<Medication, 'id' | 'taken' | 'lastUpdated'>) => void
  updateMedication: (
    id: string,
    updates: Partial<Omit<Medication, 'id'>>
  ) => void
  removeMedication: (id: string) => void
  markMedicationTaken: (id: string, taken: boolean) => void
  updateRefillStatus: (id: string, daysLeft: number) => void

  // Timeline & notes
  addTimelineEvent: (
    type: TimelineEventType,
    medicationId?: string,
    note?: string
  ) => void
  addContextualNote: (
    text: string,
    linkedTo?: { type: 'medication' | 'day'; id?: string }
  ) => void
  removeContextualNote: (id: string) => void

  // Pharmacist
  updatePharmacist: (contact: PharmacistContact) => void
  addPharmacistNote: (medicationId: string, note: string) => void

  // Daily closure
  closeDay: () => void
  isDayClosed: () => boolean

  // Check-in suggestions
  getSuggestedCheckIn: () => string | null
  dismissCheckInSuggestion: () => void

  // Emergency contacts
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void
  removeEmergencyContact: (id: string) => void
  setPrimaryContact: (id: string) => void

  // Wellness tracking
  logWellness: (level: WellnessLevel, note?: string) => void
  getTodayWellness: () => WellnessEntry | null
  getWellnessTrend: () => WellnessEntry[]

  // Messaging
  sendMessage: (text: string, isQuickMessage?: boolean) => void
  markMessageRead: (id: string) => void
  getUnreadCount: () => number

  // Analytics helpers
  getMedicationStats: (medId: string) => { streak: number; total: number }
  getWeeklyAdherence: () => { day: string; taken: number; total: number }[]

  // Safety check
  triggerSafetyCheck: (by: 'motion' | 'manual') => void
  dismissSafetyCheck: () => void
  escalateSafetyCheck: () => void

  // New features
  completeDailyCheckIn: () => void
  requestHelp: () => void
  startHandover: (targetName: string, endDate: string) => void
  endHandover: () => void
  getHumanInsights: () => string[]
  getDoctorPrepSummary: () => string
  dismissChangeIndicator: () => void

  // Utility
  resetApp: () => void
  switchRole: () => void
}

const SahayContext = createContext<SahayContextValue | null>(null)

// Custom hook to use the context
export function useSahay(): SahayContextValue {
  const context = useContext(SahayContext)
  if (!context) {
    throw new Error('useSahay must be used within a SahayProvider')
  }
  return context
}

// Provider component - using dummy data for wireframe/design preview
export function SahayProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(dummyAppData)
  const isLoading = false // No loading needed with dummy data

  // Role management
  const setUserRole = useCallback((role: UserRole) => {
    setData((prev) => ({ ...prev, userRole: role }))
  }, [])

  const clearRole = useCallback(() => {
    setData((prev) => ({ ...prev, userRole: null }))
  }, [])

  // Profile management
  const setCaregiver = useCallback((profile: CaregiverProfile) => {
    setData((prev) => ({ ...prev, caregiver: profile }))
  }, [])

  const setCareReceiver = useCallback((profile: CareReceiverProfile) => {
    setData((prev) => ({ ...prev, careReceiver: profile }))
  }, [])

  // Medication management
  const addMedication = useCallback(
    (med: Omit<Medication, 'id' | 'taken' | 'lastUpdated'>) => {
      const newMed: Medication = {
        ...med,
        id: generateId(),
        taken: false,
        lastUpdated: new Date().toISOString(),
      }
      setData((prev) => ({
        ...prev,
        medications: [...prev.medications, newMed],
      }))
    },
    []
  )

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
    },
    []
  )

  const removeMedication = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      medications: prev.medications.filter((med) => med.id !== id),
      lastChangeNotifiedAt: new Date().toISOString(),
    }))
  }, [])

  const markMedicationTaken = useCallback((id: string, taken: boolean) => {
    setData((prev) => {
      const med = prev.medications.find((m) => m.id === id)
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
  }, [])

  // Refill status
  const updateRefillStatus = useCallback((id: string, daysLeft: number) => {
    setData((prev) => ({
      ...prev,
      medications: prev.medications.map((med) =>
        med.id === id
          ? { ...med, refillDaysLeft: daysLeft, lastUpdated: new Date().toISOString() }
          : med
      ),
    }))
  }, [])

  // Role status management
  const updateCaregiverStatus = useCallback(
    (status: CareRoleStatus, awayUntil?: string) => {
      setData((prev) => ({
        ...prev,
        caregiver: prev.caregiver
          ? { ...prev.caregiver, roleStatus: status, awayUntil }
          : null,
      }))
    },
    []
  )

  const setCareReceiverIndependence = useCallback((times: TimeOfDay[]) => {
    setData((prev) => ({
      ...prev,
      careReceiver: prev.careReceiver
        ? { ...prev.careReceiver, independentTimes: times }
        : null,
    }))
  }, [])

  // Timeline & notes
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

  const addContextualNote = useCallback(
    (text: string, linkedTo?: { type: 'medication' | 'day'; id?: string }) => {
      const now = new Date()
      const fadingAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
      const newNote: ContextualNote = {
        id: generateId(),
        text,
        createdAt: now.toISOString(),
        linkedTo,
        fadingAt: fadingAt.toISOString(),
      }
      setData((prev) => ({
        ...prev,
        contextualNotes: [...prev.contextualNotes, newNote],
      }))
    },
    []
  )

  const removeContextualNote = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      contextualNotes: prev.contextualNotes.filter((n) => n.id !== id),
    }))
  }, [])

  // Pharmacist
  const updatePharmacist = useCallback((contact: PharmacistContact) => {
    setData((prev) => ({
      ...prev,
      pharmacist: { ...prev.pharmacist, ...contact },
    }))
  }, [])

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
  }, [])

  // Daily closure
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
      }
      return {
        ...prev,
        dayClosures: [...prev.dayClosures, newClosure],
        timeline: [...prev.timeline, newEvent],
      }
    })
  }, [])

  const isDayClosed = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    return (data.dayClosures || []).some((c) => c.date === today)
  }, [data.dayClosures])

  // Check-in suggestions (gentle, not aggressive)
  const getSuggestedCheckIn = useCallback(() => {
    if (data.userRole !== 'caregiver') return null

    // Feature 8: Missed-Day Soft Follow-Up
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const yesterdayClosure = (data.dayClosures || []).find((c) => c.date === yesterdayStr)

    // If they missed everything yesterday
    if (yesterdayClosure && yesterdayClosure.totalMeds > 0 && yesterdayClosure.takenCount === 0) {
      return "Would you like to check in?"
    }

    // Default suggestions
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

  const dismissCheckInSuggestion = useCallback(() => {
    setData((prev) => ({
      ...prev,
      lastCheckInSuggestion: new Date().toISOString(),
    }))
  }, [])

  // Emergency contacts
  const addEmergencyContact = useCallback(
    (contact: Omit<EmergencyContact, 'id'>) => {
      const newContact: EmergencyContact = {
        ...contact,
        id: generateId(),
      }
      setData((prev) => ({
        ...prev,
        emergencyContacts: [...(prev.emergencyContacts || []), newContact],
      }))
    },
    []
  )

  const removeEmergencyContact = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      emergencyContacts: (prev.emergencyContacts || []).filter((c) => c.id !== id),
    }))
  }, [])

  const setPrimaryContact = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      emergencyContacts: (prev.emergencyContacts || []).map((c) => ({
        ...c,
        isPrimary: c.id === id,
      })),
    }))
  }, [])

  // Wellness tracking
  const logWellness = useCallback((level: WellnessLevel, note?: string) => {
    const today = new Date().toISOString().split('T')[0]
    const newEntry: WellnessEntry = {
      id: generateId(),
      date: today,
      level,
      note,
      timestamp: new Date().toISOString(),
    }
    setData((prev) => {
      // Remove existing entry for today if any
      const filtered = (prev.wellnessEntries || []).filter((e) => e.date !== today)
      return {
        ...prev,
        wellnessEntries: [...filtered, newEntry],
      }
    })
  }, [])

  const getTodayWellness = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    return (data.wellnessEntries || []).find((e) => e.date === today) || null
  }, [data.wellnessEntries])

  const getWellnessTrend = useCallback(() => {
    return (data.wellnessEntries || [])
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 7)
  }, [data.wellnessEntries])

  // Messaging
  const sendMessage = useCallback(
    (text: string, isQuickMessage = false) => {
      const newMessage: CareMessage = {
        id: generateId(),
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
    },
    [data.userRole]
  )

  const markMessageRead = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      messages: (prev.messages || []).map((m) =>
        m.id === id ? { ...m, isRead: true } : m
      ),
    }))
  }, [])

  const getUnreadCount = useCallback(() => {
    const myRole = data.userRole
    return (data.messages || []).filter(
      (m) => !m.isRead && m.from !== myRole
    ).length
  }, [data.messages, data.userRole])

  // Analytics helpers
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

  // Reset entire app
  const resetApp = useCallback(() => {
    setData(dummyAppData)
  }, [])

  // Switch between caregiver and care receiver role
  const switchRole = useCallback(() => {
    setData((prev) => ({
      ...prev,
      userRole: prev.userRole === 'caregiver' ? 'careReceiver' : 'caregiver',
    }))
  }, [])

  // Safety check actions
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
  }, [])

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
        safetyCheck: {
          ...prev.safetyCheck,
          status: 'idle',
        },
        timeline: [...prev.timeline, newEvent],
      }
    })
  }, [])

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
        safetyCheck: {
          ...prev.safetyCheck,
          status: 'escalating',
        },
        timeline: [...prev.timeline, newEvent],
      }
    })
  }, [])

  // Daily check-in
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
  }, [])

  // Request help
  const requestHelp = useCallback(() => {
    setData((prev) => {
      const newEvent: TimelineEvent = {
        id: generateId(),
        type: 'help_requested',
        timestamp: new Date().toISOString(),
        actor: 'careReceiver',
      }
      return {
        ...prev,
        timeline: [...prev.timeline, newEvent],
      }
    })
  }, [])

  // Handover
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
  }, [])

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
  }, [])

  // Pattern Insights (Feature 2)
  const getHumanInsights = useCallback(() => {
    const insights: string[] = []
    const timeline = data.timeline
    const meds = data.medications

    // 1. Medicines often taken late
    // (Logic: check timeline for medication_taken events that are > 2 hours after typical time)
    // For demo/wireframe, we'll use some sample logic
    const eveningMeds = meds.filter(m => m.timeOfDay === 'evening')
    if (eveningMeds.length > 0 && timeline.length > 5) {
      insights.push("Evenings seem a bit harder lately.")
    }

    // 2. Routine changes
    const recentChanges = timeline.filter(e =>
      ['medication_added', 'medication_removed', 'dose_changed'].includes(e.type)
    )
    if (recentChanges.length > 0) {
      insights.push("This routine has been changing recently.")
    }

    return insights
  }, [data.timeline, data.medications])

  // Doctor Prep (Feature 9)
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

  const dismissChangeIndicator = useCallback(() => {
    setData((prev) => ({
      ...prev,
      lastChangeNotifiedAt: undefined,
    }))
  }, [])

  // Safety check auto-escalation timer
  useEffect(() => {
    if (data.safetyCheck.status === 'pending_check') {
      const timer = setTimeout(() => {
        escalateSafetyCheck()
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearTimeout(timer)
    }
  }, [data.safetyCheck.status, escalateSafetyCheck])

  const value: SahayContextValue = {
    data,
    isLoading,
    setUserRole,
    clearRole,
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
    switchRole,
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
  }

  return <SahayContext.Provider value={value}>{children}</SahayContext.Provider>
}
