'use client'

/**
 * @file page.tsx
 * @description The Care Receiver's home page.
 * Designed for elderly users, this page provides an extremely simplified interface
 * focused on medication adherence, daily wellness check-ins, and emergency assistance.
 * It features a dynamic theme that automatically switches to a dark "Night Mode"
 * to reduce eye strain and signal a wind-down period.
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useSahay } from '@/lib/sahay-context'
import {
  type Medication,
  getCurrentTimeOfDay,
  timeOfDayLabels,
  formatTime12h,
} from '@/lib/types'
import {
  Heart,
  Check,
  Clock,
  Sun,
  Cloud,
  Moon,
  Settings,
  Pill,
  MessageCircle,
  Phone,
  Smile,
  ArrowLeftRight,
  Mic,
  Info,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react'
import { WellnessCheckin } from '@/components/care-receiver/wellness-checkin'
import { QuickMessages } from '@/components/care-receiver/quick-messages'
import { EmergencyCall } from '@/components/care-receiver/emergency-call'
import { SafetyCheckPrompt } from '@/components/care-receiver/safety-check-prompt'
import { CareReceiverHomeSkeleton } from '@/components/skeletons'
import { useRouter } from 'next/navigation'

/**
 * CareReceiverPage component.
 * Provides the primary interface for the care receiver, featuring large buttons,
 * a clear "next medication" focus, and quick access to emergency help.
 */
export default function CareReceiverPage() {
  const {
    data,
    isLoading,
    isDataLoading,
    markMedicationTaken,
    isDayClosed,
    logout,
    triggerSafetyCheck,
    completeDailyCheckIn,
    requestHelp,
    dismissChangeIndicator,
  } = useSahay()
  const router = useRouter()

  /**
   * Sets up a global function on the window object to allow external triggers
   * (e.g., from a motion sensor integration) to initiate a safety check.
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.triggerMotionSafetyCheck = () => {
        triggerSafetyCheck('motion');
      };
    }

    return () => {
      window.triggerMotionSafetyCheck = null;
    };
  }, [triggerSafetyCheck]);

  // UI State
  const [confirmedMed, setConfirmedMed] = useState<Medication | null>(null)
  const [showUndo, setShowUndo] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showWellness, setShowWellness] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showHelpConfirmed, setShowHelpConfirmed] = useState(false)

  /** Theme state: 'light', 'dark', or 'auto' (automatic night mode). */
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light')

  /** Restore theme preference from localStorage on mount. */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem('sahay_receiver_theme')
    if (saved === 'light' || saved === 'dark' || saved === 'auto') {
      setTheme(saved)
    }
  }, [])

  /** Updates the theme preference and persists it to localStorage. */
  const updateTheme = (next: 'light' | 'dark' | 'auto') => {
    setTheme(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('sahay_receiver_theme', next)
    }
  }

  const hour = new Date().getHours()
  const isAutoNight = hour >= 21 || hour < 6
  const isNight = theme === 'dark' || (theme === 'auto' && isAutoNight)

  const currentTimeOfDay = getCurrentTimeOfDay()

  /**
   * Determines the next medication that needs to be taken.
   * Prioritizes medications for the current time of day, then follows
   * the natural sequence (morning -> afternoon -> evening).
   */
  const getNextMedication = useCallback((): Medication | null => {
    const pendingMeds = data.medications.filter((m) => !m.taken)
    if (pendingMeds.length === 0) return null

    const currentTimeMeds = pendingMeds.filter(
      (m) => m.timeOfDay === currentTimeOfDay
    )
    if (currentTimeMeds.length > 0) return currentTimeMeds[0]

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

  /** Marks the current medication as taken and triggers a temporary undo state. */
  const handleTookIt = () => {
    if (nextMed) {
      markMedicationTaken(nextMed.id, true)
      setConfirmedMed(nextMed)
      setShowUndo(true)
    }
  }

  /** Reverts a medication marking if the user accidentally tapped "I took it". */
  const handleUndo = () => {
    if (confirmedMed) {
      markMedicationTaken(confirmedMed.id, false)
      setConfirmedMed(null)
      setShowUndo(false)
    }
  }

  /** Timer to automatically clear the undo state and confirmation screen. */
  useEffect(() => {
    if (showUndo) {
      const timer = setTimeout(() => {
        setShowUndo(false)
        setConfirmedMed(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showUndo])

  const timeIcons = {
    morning: Sun,
    afternoon: Cloud,
    evening: Moon,
  }

  /** Returns a time-appropriate greeting. */
  const getGreeting = () => {
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (isLoading || isDataLoading) {
    return <CareReceiverHomeSkeleton />
  }

  if (showWellness) {
    return <WellnessCheckin onClose={() => setShowWellness(false)} />
  }

  if (showMessages) {
    return <QuickMessages onClose={() => setShowMessages(false)} />
  }

  if (showEmergency) {
    return <EmergencyCall onClose={() => setShowEmergency(false)} />
  }

  /** Render settings overlay for appearance and account management. */
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
            <div className="w-full">
              <p className="text-sm font-medium text-muted-foreground mb-2 text-center uppercase tracking-wider">
                Appearance
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'auto', 'dark'] as const).map((opt) => {
                  const active = theme === opt
                  const Icon = opt === 'light' ? Sun : opt === 'dark' ? Moon : Cloud
                  const label = opt === 'light' ? 'Light' : opt === 'dark' ? 'Dark' : 'Auto'
                  return (
                    <button
                      key={opt}
                      onClick={() => updateTheme(opt)}
                      className={`py-4 px-3 rounded-xl text-base font-medium flex flex-col items-center gap-2
                                  transition-all active:scale-[0.97] touch-manipulation
                                  focus:outline-none focus:ring-2 focus:ring-sahay-sage
                                  ${active
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-foreground'}`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                      {label}
                    </button>
                  )
                })}
              </div>
              {theme === 'auto' && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Auto: dark between 9pm and 6am
                </p>
              )}
            </div>

            <button
              onClick={() => {
                triggerSafetyCheck('manual')
                setShowSettings(false)
              }}
              className="w-full py-4 px-6 bg-secondary text-foreground text-xl font-medium
                       rounded-2xl transition-all active:scale-[0.97] touch-manipulation flex items-center justify-center gap-3
                       focus:outline-none focus:ring-2 focus:ring-sahay-sage"
            >
              <Heart className="w-6 h-6 text-sahay-sage" />
              Simulate Safety Check
            </button>

            <button
              onClick={() => {
                logout()
                router.push('/login')
              }}
              className="w-full py-4 px-6 bg-secondary text-foreground text-xl font-medium
                       rounded-2xl transition-all active:scale-[0.97] touch-manipulation flex items-center justify-center gap-3
                       focus:outline-none focus:ring-2 focus:ring-sahay-sage"
            >
              <ArrowLeftRight className="w-6 h-6" />
              Sign Out
            </button>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-4 px-6 bg-primary text-primary-foreground text-xl font-semibold
                       rounded-2xl transition-all active:scale-[0.97] touch-manipulation
                       focus:outline-none focus:ring-2 focus:ring-sahay-sage"
            >
              Go back
            </button>
          </div>
        </div>
      </main>
    )
  }

  /** Confirmation screen shown immediately after marking a med as taken. */
  if (showUndo && confirmedMed) {
    return (
      <main className="min-h-screen flex flex-col bg-sahay-sage-light p-6">
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <div className="w-24 h-24 rounded-full bg-sahay-success/20 flex items-center justify-center mb-8 animate-in zoom-in duration-300">
            <Check className="w-12 h-12 text-sahay-success" strokeWidth={2} />
          </div>

          <h1 className="text-3xl font-semibold text-foreground mb-3 text-center text-balance">
            Noted. Take care.
          </h1>
          <p className="text-xl text-muted-foreground text-center mb-8">
            {confirmedMed.name} marked as taken
          </p>

          <button
            onClick={handleUndo}
            className="py-4 px-8 bg-card text-foreground text-lg font-medium
                     rounded-2xl border-2 border-border transition-all touch-manipulation
                     focus:outline-none focus:ring-2 focus:ring-sahay-sage"
          >
            Undo this
          </button>

          <div className="mt-8 w-full max-w-xs">
            <div className="h-1 bg-sahay-sage/20 rounded-full overflow-hidden">
              <div className="h-full bg-sahay-sage animate-shrink-width" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  /** "Day Closed" screen shown when all meds for the day are complete. */
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

  /** "All Done" screen shown when all current meds are taken, but day isn't formally closed. */
  if (allDone) {
    return (
      <main className="min-h-screen flex flex-col bg-background p-6">
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
          <div className="w-24 h-24 rounded-full bg-sahay-sage-light flex items-center justify-center mb-8">
            <Check className="w-12 h-12 text-sahay-sage" strokeWidth={2} />
          </div>

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

  /** Screen shown when no medications have been set up yet. */
  if (data.medications.length === 0) {
    return (
      <main className="min-h-screen flex flex-col bg-background p-6">
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

  const TimeIcon = timeIcons[nextMed!.timeOfDay]
  const isFineCheckedIn = data.lastFineCheckIn?.startsWith(new Date().toISOString().split('T')[0])

  return (
    <main className={`min-h-screen flex flex-col transition-colors duration-1000 ${isNight ? 'bg-[#0f172a] text-slate-300' : 'bg-background'}`}>
      <AnimatePresence>
        {data.lastChangeNotifiedAt && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-sahay-blue/10 border-b border-sahay-blue/20 overflow-hidden"
          >
            <div className="p-4 flex items-center justify-between max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-sahay-blue" />
                <span className="text-sm font-medium text-sahay-blue">Something is a little different today.</span>
              </div>
              <button
                onClick={dismissChangeIndicator}
                className="text-xs font-bold text-sahay-blue uppercase tracking-wider px-2 py-1"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-lg ${isNight ? 'text-slate-400' : 'text-muted-foreground'}`}>{getGreeting()}</p>
            <h1 className="text-2xl font-semibold">
              {data.careReceiver?.name || 'Your care'}
            </h1>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center touch-manipulation focus:outline-none focus:ring-2 focus:ring-sahay-sage
                      ${isNight ? 'bg-slate-800/50 text-slate-400' : 'bg-secondary/50 text-muted-foreground'}`}
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 -mt-10">
        <div className="w-full max-w-md">
          {!isFineCheckedIn && (
            <motion.button
              onClick={completeDailyCheckIn}
              className={`w-full p-6 rounded-2xl border-2 mb-8 flex items-center gap-4 touch-manipulation transition-all
                        ${isNight ? 'bg-slate-800/40 border-slate-700/50' : 'bg-sahay-sage-light/30 border-sahay-sage/20'}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isNight ? 'bg-slate-700' : 'bg-white shadow-sm'}`}>
                <Smile className="w-6 h-6 text-sahay-sage" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold">I&apos;m fine today</p>
                <p className={`text-sm ${isNight ? 'text-slate-400' : 'text-muted-foreground'}`}>Tap to let {data.caregiver?.name} know</p>
              </div>
            </motion.button>
          )}

          <div className="flex items-center justify-center gap-2 mb-6">
            <TimeIcon
              className="w-6 h-6 text-sahay-sage"
              strokeWidth={1.5}
            />
            <span className={`text-lg font-medium ${isNight ? 'text-slate-400' : 'text-muted-foreground'}`}>
              {timeOfDayLabels[nextMed!.timeOfDay]}
              {nextMed?.time && ` at ${formatTime12h(nextMed.time)}`}
            </span>
          </div>

          <motion.div
            className={`rounded-3xl p-8 border-2 mb-8 text-center glass-card
                      ${isNight ? 'bg-slate-800/60 border-slate-700/80 shadow-2xl' : 'bg-card border-border'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-3xl font-semibold mb-2 text-balance">
              {nextMed!.name}
            </h2>
            {nextMed?.time && (
              <div className="flex items-center justify-center gap-2 mb-2 text-sahay-blue">
                <Clock className="w-5 h-5" strokeWidth={2.5} />
                <span className="text-2xl font-bold">{formatTime12h(nextMed.time)}</span>
              </div>
            )}
            <p className={`text-2xl ${isNight ? 'text-slate-300' : 'text-muted-foreground'}`}>{nextMed!.dosage}</p>

            {nextMed!.simpleExplanation && (
              <p className={`text-lg font-medium mt-4 py-3 border-t ${isNight ? 'border-slate-700 text-sahay-sage' : 'border-border text-sahay-sage'}`}>
                {nextMed!.simpleExplanation}
              </p>
            )}

            {nextMed!.notes && (
              <p className={`text-lg mt-3 pt-3 border-t ${isNight ? 'border-slate-700 text-slate-400' : 'border-border text-muted-foreground/80'}`}>
                {nextMed!.notes}
              </p>
            )}
            {nextMed!.pharmacistNote && (
              <div className={`mt-4 pt-4 border-t ${isNight ? 'border-slate-700' : 'border-border'}`}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Pill className="w-4 h-4 text-sahay-blue" />
                  <span className="text-sm text-sahay-blue font-medium">
                    From pharmacist
                  </span>
                </div>
                <p className={`${isNight ? 'text-slate-400' : 'text-muted-foreground'}`}>{nextMed!.pharmacistNote}</p>
              </div>
            )}
          </motion.div>

          <div className="flex gap-3 mb-8">
            <motion.button
              onClick={handleTookIt}
              className="flex-1 py-6 px-8 bg-primary text-primary-foreground text-2xl font-semibold
                       rounded-2xl flex items-center justify-center gap-3 shadow-lg touch-manipulation button-interactive
                       focus:outline-none focus:ring-4 focus:ring-primary/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Check className="w-7 h-7" strokeWidth={2.5} />
              I took it
            </motion.button>

            <motion.button
              onClick={() => {
                setIsListening(true)
                setTimeout(() => {
                  setIsListening(false)
                  handleTookIt()
                }, 2000)
              }}
              className={`w-20 rounded-2xl flex items-center justify-center border-2 transition-all
                        ${isListening ? 'bg-sahay-blue text-white border-sahay-blue animate-pulse' :
                  isNight ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-card border-border text-muted-foreground hover:border-sahay-blue/50'}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
            >
              <Mic className={`w-8 h-8 ${isListening ? 'scale-125' : ''}`} />
            </motion.button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <motion.button
              onClick={() => setShowWellness(true)}
              className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all touch-manipulation button-interactive
                        ${isNight ? 'bg-slate-800/40 border-slate-700 hover:border-sahay-success/50' : 'bg-card border-border hover:border-sahay-success/50'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Smile className="w-7 h-7 text-sahay-success" />
              <span className="text-sm font-medium">How I feel</span>
            </motion.button>

            <motion.button
              onClick={() => {
                requestHelp()
                setShowHelpConfirmed(true)
                setTimeout(() => setShowHelpConfirmed(false), 3000)
              }}
              className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all touch-manipulation button-interactive
                        ${showHelpConfirmed ? 'bg-sahay-blue/20 border-sahay-blue' :
                  isNight ? 'bg-slate-800/40 border-slate-700 hover:border-sahay-blue/50' : 'bg-card border-border hover:border-sahay-blue/50'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showHelpConfirmed ? (
                <Check className="w-7 h-7 text-sahay-blue" />
              ) : (
                <Heart className="w-7 h-7 text-sahay-blue" />
              )}
              <span className="text-sm font-medium">{showHelpConfirmed ? 'Notified!' : 'I need help'}</span>
            </motion.button>

            <motion.button
              onClick={() => setShowEmergency(true)}
              className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all touch-manipulation button-interactive
                        ${isNight ? 'bg-slate-800/40 border-slate-700 hover:border-destructive/50' : 'bg-card border-border hover:border-destructive/50'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Phone className="w-7 h-7 text-destructive" />
              <span className="text-sm font-medium">Call help</span>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isNight && (
          <motion.div
            className="flex items-center justify-center gap-2 py-4 text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Moon className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-widest">Quiet Night Mode Active</span>
          </motion.div>
        )}
      </AnimatePresence>
      <SafetyCheckPrompt />
    </main>
  )
}
