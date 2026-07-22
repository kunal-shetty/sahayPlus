'use client'

import { useSahay } from '@/lib/sahay-context'
import { Moon, Check } from 'lucide-react'

/**
 * Daily Closure Ritual
 * End-of-day state that gently closes the routine
 * No carryover guilt into the next day
 */
export function DailyClosure() {
  const { data, closeDay, isDayClosed } = useSahay()

  const dayClosed = isDayClosed()
  const totalMeds = data.medications.length
  const takenMeds = data.medications.filter((m) => m.taken).length
  const allTaken = totalMeds > 0 && takenMeds === totalMeds

  // Only show after 6pm or if all medications are taken
  const hour = new Date().getHours()
  const shouldShow = hour >= 18 || allTaken

  if (!shouldShow || totalMeds === 0) return null

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
