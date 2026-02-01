'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { useSahay } from '@/lib/sahay-context'
import {
  type Medication,
  getCurrentTimeOfDay,
  timeOfDayLabels,
} from '@/lib/types'
import {
  Heart,
  Check,
  Sun,
  Cloud,
  Moon,
  Settings,
  Pill,
  MessageCircle,
  Phone,
  Smile,
  ArrowLeftRight,
} from 'lucide-react'
import { WellnessCheckin } from './wellness-checkin'
import { QuickMessages } from './quick-messages'
import { EmergencyCall } from './emergency-call'

/**
 * Care Receiver Home Screen
 * Extremely simple interface for elderly users
 * Features: Current/next medication, large "I took it" button, gentle confirmations
 * 
 * Design principles:
 * - One primary action per screen
 * - Large text (24px+) and tap targets (48px+)
 * - No lists, no navigation, no warnings
 * - Calm, reassuring messaging
 */
export function CareReceiverHome() {
  const { data, markMedicationTaken, clearRole, isDayClosed, switchRole } = useSahay()
  const [confirmedMed, setConfirmedMed] = useState<Medication | null>(null)
  const [showUndo, setShowUndo] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showWellness, setShowWellness] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)

  // Find the current/next medication to show
  const currentTimeOfDay = getCurrentTimeOfDay()

  // Priority order: current time's pending meds, then upcoming pending meds
  const getNextMedication = useCallback((): Medication | null => {
    const pendingMeds = data.medications.filter((m) => !m.taken)
    if (pendingMeds.length === 0) return null

    // First, check for pending meds at current time
    const currentTimeMeds = pendingMeds.filter(
      (m) => m.timeOfDay === currentTimeOfDay
    )
    if (currentTimeMeds.length > 0) return currentTimeMeds[0]

    // Otherwise, return the first pending med in time order
    const timeOrder = ['morning', 'afternoon', 'evening']
    for (const time of timeOrder) {
      const timeMeds = pendingMeds.filter((m) => m.timeOfDay === time)
      if (timeMeds.length > 0) return timeMeds[0]
    }

    return pendingMeds[0]
  }, [data.medications, currentTimeOfDay])

  const nextMed = getNextMedication()
  const allDone =
    data.medications.length > 0 &&
    data.medications.every((m) => m.taken)
  const dayClosed = isDayClosed()

  // Handle "I took it" action
  const handleTookIt = () => {
    if (nextMed) {
      markMedicationTaken(nextMed.id, true)
      setConfirmedMed(nextMed)
      setShowUndo(true)
    }
  }

  // Handle undo (only available for a few seconds)
  const handleUndo = () => {
    if (confirmedMed) {
      markMedicationTaken(confirmedMed.id, false)
      setConfirmedMed(null)
      setShowUndo(false)
    }
  }

  // Auto-dismiss undo after 5 seconds
  useEffect(() => {
    if (showUndo) {
      const timer = setTimeout(() => {
        setShowUndo(false)
        setConfirmedMed(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showUndo])

  const timeIcons = {
    morning: Sun,
    afternoon: Cloud,
    evening: Moon,
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Show wellness check-in
  if (showWellness) {
    return <WellnessCheckin onClose={() => setShowWellness(false)} />
  }

  // Show quick messages
  if (showMessages) {
    return <QuickMessages onClose={() => setShowMessages(false)} />
  }

  // Show emergency call
  if (showEmergency) {
    return <EmergencyCall onClose={() => setShowEmergency(false)} />
  }

  // Settings view (minimal)
  if (showSettings) {
    return (
      <main className="min-h-screen flex flex-col bg-background p-6">
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <div className="w-20 h-20 rounded-full bg-sahay-sage-light flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-sahay-sage" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2 text-center">
            Sahay+
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-8">
            Gentle medication care
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={switchRole}
              className="w-full py-4 px-6 bg-secondary text-foreground text-xl font-medium 
                       rounded-2xl transition-all touch-manipulation flex items-center justify-center gap-3
                       focus:outline-none focus:ring-2 focus:ring-sahay-sage"
            >
              <ArrowLeftRight className="w-6 h-6" />
              Switch to caregiver view
            </button>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-4 px-6 bg-primary text-primary-foreground text-xl font-semibold 
                       rounded-2xl transition-all touch-manipulation
                       focus:outline-none focus:ring-2 focus:ring-sahay-sage"
            >
              Go back
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Confirmation screen (shown briefly after taking medication)
  if (showUndo && confirmedMed) {
    return (
      <main className="min-h-screen flex flex-col bg-sahay-sage-light p-6">
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          {/* Success icon */}
          <div className="w-24 h-24 rounded-full bg-sahay-success/20 flex items-center justify-center mb-8 animate-in zoom-in duration-300">
            <Check className="w-12 h-12 text-sahay-success" strokeWidth={2} />
          </div>

          {/* Confirmation message */}
          <h1 className="text-3xl font-semibold text-foreground mb-3 text-center text-balance">
            Noted. Take care.
          </h1>
          <p className="text-xl text-muted-foreground text-center mb-8">
            {confirmedMed.name} marked as taken
          </p>

          {/* Undo button */}
          <button
            onClick={handleUndo}
            className="py-4 px-8 bg-card text-foreground text-lg font-medium 
                     rounded-2xl border-2 border-border transition-all touch-manipulation
                     focus:outline-none focus:ring-2 focus:ring-sahay-sage"
          >
            Undo this
          </button>

          {/* Progress indicator */}
          <div className="mt-8 w-full max-w-xs">
            <div className="h-1 bg-sahay-sage/20 rounded-full overflow-hidden">
              <div className="h-full bg-sahay-sage animate-shrink-width" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Day closed screen (caregiver closed the day)
  if (dayClosed) {
    return (
      <main className="min-h-screen flex flex-col bg-sahay-sage-light p-6">
        <div className="flex justify-end">
          <button
            onClick={() => setShowSettings(true)}
            className="w-12 h-12 rounded-xl bg-card/50 flex items-center justify-center 
                     touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <div className="w-24 h-24 rounded-full bg-sahay-success/20 flex items-center justify-center mb-8">
            <Moon className="w-12 h-12 text-sahay-success" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-3 text-center text-balance">
            That&apos;s everything for today.
          </h1>
          <p className="text-xl text-muted-foreground text-center">
            Rest well. Tomorrow is a fresh start.
          </p>
        </div>
      </main>
    )
  }

  // All done screen
  if (allDone) {
    return (
      <main className="min-h-screen flex flex-col bg-background p-6">
        {/* Settings button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowSettings(true)}
            className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center 
                     touch-manipulation focus:outline-none focus:ring-2 focus:ring-sahay-sage"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          {/* Success icon */}
          <div className="w-24 h-24 rounded-full bg-sahay-sage-light flex items-center justify-center mb-8">
            <Check className="w-12 h-12 text-sahay-sage" strokeWidth={2} />
          </div>

          {/* All done message */}
          <h1 className="text-3xl font-semibold text-foreground mb-3 text-center text-balance">
            You&apos;re all set for today
          </h1>
          <p className="text-xl text-muted-foreground text-center">
            Everything looks good right now
          </p>
        </div>
      </main>
    )
  }

  // No medications set up
  if (data.medications.length === 0) {
    return (
      <main className="min-h-screen flex flex-col bg-background p-6">
        {/* Settings button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowSettings(true)}
            className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center 
                     touch-manipulation focus:outline-none focus:ring-2 focus:ring-sahay-sage"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <div className="w-20 h-20 rounded-full bg-sahay-blue-light flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-sahay-blue" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-3 text-center">
            {getGreeting()}
          </h1>
          <p className="text-xl text-muted-foreground text-center">
            Your caregiver will set up your medications
          </p>
        </div>
      </main>
    )
  }

  // Main view: Show current/next medication
  const TimeIcon = timeIcons[nextMed!.timeOfDay]

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg text-muted-foreground">{getGreeting()}</p>
            <h1 className="text-2xl font-semibold text-foreground">
              {data.careReceiver?.name || 'Your care'}
            </h1>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center 
                     touch-manipulation focus:outline-none focus:ring-2 focus:ring-sahay-sage"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Main content - current medication */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Time indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <TimeIcon
              className="w-6 h-6 text-sahay-sage"
              strokeWidth={1.5}
            />
            <span className="text-lg text-muted-foreground">
              {timeOfDayLabels[nextMed!.timeOfDay]}
            </span>
          </div>

          {/* Medication card */}
          <motion.div
            className="bg-card rounded-3xl p-8 border-2 border-border mb-8 text-center glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-3xl font-semibold text-foreground mb-2 text-balance">
              {nextMed!.name}
            </h2>
            <p className="text-2xl text-muted-foreground">{nextMed!.dosage}</p>
            {nextMed!.notes && (
              <p className="text-lg text-muted-foreground/80 mt-3 pt-3 border-t border-border">
                {nextMed!.notes}
              </p>
            )}
            {nextMed!.pharmacistNote && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Pill className="w-4 h-4 text-sahay-blue" />
                  <span className="text-sm text-sahay-blue font-medium">
                    From pharmacist
                  </span>
                </div>
                <p className="text-muted-foreground">{nextMed!.pharmacistNote}</p>
              </div>
            )}
          </motion.div>

          {/* I took it button - the ONE primary action */}
          <motion.button
            onClick={handleTookIt}
            className="w-full py-6 px-8 bg-primary text-primary-foreground text-2xl font-semibold 
                     rounded-2xl flex items-center justify-center gap-3 shadow-lg touch-manipulation button-interactive
                     focus:outline-none focus:ring-4 focus:ring-primary/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05, boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)' }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.6 }}>
              <Check className="w-7 h-7" strokeWidth={2.5} />
            </motion.div>
            I took it
          </motion.button>

          {/* Quick actions - simplified for care receiver */}
          <div className="grid grid-cols-3 gap-3 mt-8">
            <motion.button
              onClick={() => setShowWellness(true)}
              className="p-4 bg-card border-2 border-border rounded-xl flex flex-col items-center gap-2
                       hover:border-sahay-success/50 active:bg-sahay-sage-light transition-all touch-manipulation button-interactive
                       focus:outline-none focus:ring-2 focus:ring-ring"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Smile className="w-7 h-7 text-sahay-success" />
              </motion.div>
              <span className="text-sm font-medium text-foreground">How I feel</span>
            </motion.button>
            <motion.button
              onClick={() => setShowMessages(true)}
              className="p-4 bg-card border-2 border-border rounded-xl flex flex-col items-center gap-2
                       hover:border-sahay-blue/50 active:bg-sahay-sage-light transition-all touch-manipulation button-interactive
                       focus:outline-none focus:ring-2 focus:ring-ring"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}>
                <MessageCircle className="w-7 h-7 text-sahay-blue" />
              </motion.div>
              <span className="text-sm font-medium text-foreground">Message</span>
            </motion.button>
            <motion.button
              onClick={() => setShowEmergency(true)}
              className="p-4 bg-card border-2 border-border rounded-xl flex flex-col items-center gap-2
                       hover:border-destructive/50 active:bg-destructive/10 transition-all touch-manipulation button-interactive
                       focus:outline-none focus:ring-2 focus:ring-ring"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}>
                <Phone className="w-7 h-7 text-destructive" />
              </motion.div>
              <span className="text-sm font-medium text-foreground">Call help</span>
            </motion.button>
          </div>
        </div>
      </div>
    </main>
  )
}
