'use client'

import { useSahay } from '@/lib/sahay-context'
import { calculateConfidence, getConfidenceMessage } from '@/lib/types'
import { Leaf, Sparkles, Sprout } from 'lucide-react'

/**
 * Care Confidence Indicator
 * A calm confidence signal - no streaks, no scores
 * Reframes success from perfection to stability
 */
export function CareConfidence() {
  const { data } = useSahay()

  const confidence = calculateConfidence(data.timeline, data.dayClosures)
  const message = getConfidenceMessage(confidence)

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
