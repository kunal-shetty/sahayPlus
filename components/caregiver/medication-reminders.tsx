'use client'

/**
 * @file medication-reminders.tsx
 * @description The Medication Reminders component for Caregivers.
 * This component manages high-priority notifications for medications that are
 * currently due. It features a "snooze" mechanism to allow caregivers to
 * defer a reminder for a short period (e.g., 15 minutes) and a "took it" action
 * that updates the medication state and marks it as taken.
 *
 * Reminders are presented as floating cards at the top of the screen, using
 * animations to draw attention without being intrusive.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useSahay } from '@/lib/sahay-context'
import { type Medication } from '@/lib/types'
import { Bell, Clock, X, ChevronLeft } from 'lucide-react'

/**
 * MedicationReminders component.
 * Monitors the current time and medication schedule to display active reminders.
 *
 * @returns {JSX.Element | null} A list of floating reminder cards, or null if no medications are currently due.
 */
export function MedicationReminders() {
  const { data, markMedicationTaken } = useSahay()
  const [snoozedMeds, setSnoozedMeds] = useState<{ [key: string]: number }>({})
  const [dismissedMeds, setDismissedMeds] = useState<Set<string>>(new Set())

  /**
   * Identifies medications that are due based on the current time of day
   * and have not yet been taken or dismissed.
   *
   * @returns {Medication[]} An array of pending medications for the current time window.
   */
  const getPendingMeds = () => {
    const hour = new Date().getHours()
    let currentTime: 'morning' | 'afternoon' | 'evening'

    if (hour < 12) currentTime = 'morning'
    else if (hour < 17) currentTime = 'afternoon'
    else currentTime = 'evening'

    return data.medications.filter(
      (m) => m.timeOfDay === currentTime && !m.taken && !dismissedMeds.has(m.id)
    )
  }

  const pendingMeds = getPendingMeds()

  /**
   * Snoozes a medication reminder for a specified number of minutes.
   *
   * @param {string} medId - The ID of the medication to snooze.
   * @param {number} minutes - The duration to snooze the reminder in minutes.
   */
  const handleSnooze = (medId: string, minutes: number) => {
    setSnoozedMeds((prev) => ({
      ...prev,
      [medId]: Date.now() + minutes * 60 * 1000,
    }))
  }

  /**
   * Dismisses a reminder card from the view without marking the medication as taken.
   *
   * @param {string} medId - The ID of the medication to dismiss.
   */
  const handleDismiss = (medId: string) => {
    setDismissedMeds((prev) => new Set([...prev, medId]))
  }

  /**
   * Marks a medication as taken and dismisses the reminder card.
   *
   * @param {string} medId - The ID of the medication that was taken.
   */
  const handleTook = (medId: string) => {
    markMedicationTaken(medId, true)
    handleDismiss(medId)
  }

  if (pendingMeds.length === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
      <AnimatePresence>
        {pendingMeds.map((med, idx) => (
          <motion.div
            key={med.id}
            className="pointer-events-auto mx-4 mt-4"
            initial={{ opacity: 0, y: -20, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 100 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="bg-card border-2 border-sahay-pending/40 rounded-2xl p-4 shadow-lg glass-card">
              <div className="flex items-start gap-3 mb-3">
                <motion.div
                  className="w-10 h-10 rounded-full bg-sahay-pending/20 flex items-center justify-center flex-shrink-0"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Bell className="w-5 h-5 text-sahay-pending" />
                </motion.div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{med.name}</p>
                  <p className="text-sm text-muted-foreground">{med.dosage}</p>
                </div>
                <button
                  onClick={() => handleDismiss(med.id)}
                  className="w-8 h-8 rounded-lg hover:bg-muted transition-colors touch-manipulation"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <motion.button
                  onClick={() => handleTook(med.id)}
                  className="flex-1 py-2 px-3 bg-sahay-success text-primary-foreground text-sm font-semibold rounded-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Took it
                </motion.button>
                <motion.button
                  onClick={() => handleSnooze(med.id, 15)}
                  className="py-2 px-3 bg-secondary text-foreground text-sm font-medium rounded-lg hover:bg-secondary/80 transition-all flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Clock className="w-3 h-3" />
                  15m
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
