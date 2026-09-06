'use client'

/**
 * @file care-confidence.tsx
 * @description The Care Confidence indicator for caregivers.
 * Instead of using traditional metrics like scores or streaks, this component
 * reframes the medication adherence data into "confidence levels" (e.g., Stable, Adjusting).
 * This approach is designed to reduce caregiver stress and shift the focus
 * from perfection to long-term stability.
 */

import { useSahay } from '@/lib/sahay-context'
import { calculateConfidence, getConfidenceMessage } from '@/lib/types'
import { Leaf, Sparkles, Sprout } from 'lucide-react'

/**
 * CareConfidence component.
 * Calculates and displays a confidence signal based on the receiver's
 * medication timeline and day closure patterns.
 *
 * @returns {JSX.Element} A visually distinct confidence indicator.
 */
export function CareConfidence() {
  const { data } = useSahay()

  /** Calculated confidence state: 'stable', 'adjusting', or 'new'. */
  const confidence = calculateConfidence(data.timeline, data.dayClosures)
  const message = getConfidenceMessage(confidence)

  /**
   * Maps the confidence state to a corresponding nature-themed icon.
   * - Stable -> Leaf (mature stability)
   * - Adjusting -> Sparkles (ongoing progress)
   * - New -> Sprout (initial growth)
   *
   * @returns {typeof Leaf | typeof Sparkles | typeof Sprout} The Lucide icon component.
   */
  const getIcon = () => {
    switch (confidence) {
      case 'stable':
        return Leaf
      case 'adjusting':
        return Sparkles
      case 'new':
        return Sprout
    }
  }

  /**
   * Maps the confidence state to a specific color palette.
   *
   * @returns {{ bg: string, icon: string, border: string }} CSS classes for background, icon, and border.
   */
  const getColors = () => {
    switch (confidence) {
      case 'stable':
        return {
          bg: 'bg-sahay-sage-light',
          icon: 'text-sahay-sage',
          border: 'border-sahay-sage/30',
        }
      case 'adjusting':
        return {
          bg: 'bg-sahay-pending/10',
          icon: 'text-sahay-pending',
          border: 'border-sahay-pending/30',
        }
      case 'new':
        return {
          bg: 'bg-sahay-blue-light',
          icon: 'text-sahay-blue',
          border: 'border-sahay-blue/30',
        }
    }
  }

  const Icon = getIcon()
  const colors = getColors()

  return (
    <div
      className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-4 flex items-center gap-3`}
    >
      <div
        className={`w-10 h-10 rounded-full bg-card flex items-center justify-center`}
      >
        <Icon className={`w-5 h-5 ${colors.icon}`} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-lg font-medium text-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">
          {data.dayClosures.length} day{data.dayClosures.length !== 1 ? 's' : ''}{' '}
          of care recorded
        </p>
      </div>
    </div>
  )
}
