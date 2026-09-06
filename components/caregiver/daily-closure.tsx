'use client'

/**
 * @file daily-closure.tsx
 * @description The Daily Closure component for Caregivers.
 * This component implements a "closure ritual" at the end of the day.
 * Instead of focusing on "missed" doses, it emphasizes a clean slate for
 * the next day, reducing caregiver guilt and promoting a sustainable
 * care routine.
 */

import { useSahay } from '@/lib/sahay-context'
import { Moon, Check } from 'lucide-react'

/**
 * DailyClosure component.
 * Provides the interface to formally end the daily medication cycle.
 * It determines visibility based on the time of day (after 6 PM) or
 * when all medications have been marked as taken.
 *
 * @returns {JSX.Element | null} The daily closure ritual interface or null if not applicable.
 */
export function DailyClosure() {
  const { data, closeDay, isDayClosed } = useSahay()

  const dayClosed = isDayClosed()
  const totalMeds = data.medications.length
  const takenMeds = data.medications.filter((m) => m.taken).length
  const allTaken = totalMeds > 0 && takenMeds === totalMeds

  /**
   * Visibility logic: Show the closure ritual if it's late in the day (>= 6 PM)
   * or if all scheduled medications have been taken.
   */
  const hour = new Date().getHours()
  const shouldShow = hour >= 18 || allTaken

  if (!shouldShow || totalMeds === 0) return null

  /**
   * Completed State.
   * Rendered once the caregiver has formally closed the day.
   */
  if (dayClosed) {
    return (
      <div className="bg-sahay-sage-light border-2 border-sahay-sage/30 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-sahay-success/20 flex items-center justify-center">
            <Moon className="w-6 h-6 text-sahay-success" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xl font-medium text-foreground">
              That&apos;s everything for today.
            </p>
            <p className="text-muted-foreground">
              Rest well. Tomorrow is a fresh start.
            </p>
          </div>
        </div>
      </div>
    )
  }

  /**
   * Pending State.
   * Prompts the caregiver to close the day, providing a gentle reminder
   * that missed doses are acceptable and don't carry over as failures.
   */
  return (
    <div className="bg-card border-2 border-border rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-sahay-warm/20 flex items-center justify-center">
            <Moon className="w-6 h-6 text-sahay-warm" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-lg font-medium text-foreground">
              Ready to close the day?
            </p>
            <p className="text-muted-foreground">
              {takenMeds} of {totalMeds} medications taken today
            </p>
          </div>
        </div>
      </div>

      {!allTaken && (
        <p className="text-muted-foreground mb-4 p-3 bg-secondary/50 rounded-xl">
          Some medications weren&apos;t marked as taken today, and that&apos;s
          okay. Tomorrow is a fresh start.
        </p>
      )}

      <button
        onClick={closeDay}
        className="w-full py-4 px-6 bg-primary text-primary-foreground text-lg font-semibold
                 rounded-xl flex items-center justify-center gap-2 transition-all
                 hover:opacity-90 touch-manipulation
                 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <Check className="w-5 h-5" />
        Close today
      </button>
    </div>
  )
}
