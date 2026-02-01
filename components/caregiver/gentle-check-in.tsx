'use client'

import { useState } from 'react'
import { useSahay } from '@/lib/sahay-context'
import { Phone, MessageCircle, X, Heart } from 'lucide-react'

/**
 * Gentle Human Check-In
 * Replace aggressive reminders with suggested human check-ins
 * Preserves dignity and reduces anxiety
 */
export function GentleCheckIn() {
  const { getSuggestedCheckIn, dismissCheckInSuggestion, addTimelineEvent, data } =
    useSahay()
  const [isVisible, setIsVisible] = useState(true)

  const suggestion = getSuggestedCheckIn()

  if (!suggestion || !isVisible) return null

  const handleCall = () => {
    addTimelineEvent('check_in', undefined, 'Called to check in')
    dismissCheckInSuggestion()
    setIsVisible(false)
  }

  const handleMessage = () => {
    addTimelineEvent('check_in', undefined, 'Sent a message to check in')
    dismissCheckInSuggestion()
    setIsVisible(false)
  }

  const handleDismiss = () => {
    dismissCheckInSuggestion()
    setIsVisible(false)
  }

  return (
    <div className="bg-sahay-blue-light border-2 border-sahay-blue/20 rounded-2xl p-5 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sahay-blue/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-sahay-blue" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-lg font-medium text-foreground">{suggestion}</p>
            <p className="text-muted-foreground">
              {data.medications.filter((m) => !m.taken).length} medications
              pending
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="w-8 h-8 rounded-lg bg-card/50 flex items-center justify-center 
                   hover:bg-card transition-colors touch-manipulation
                   focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Dismiss suggestion"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleCall}
          className="flex-1 py-3 px-4 bg-sahay-blue text-accent-foreground font-medium 
                   rounded-xl flex items-center justify-center gap-2 transition-all
                   hover:opacity-90 touch-manipulation
                   focus:outline-none focus:ring-2 focus:ring-sahay-blue"
        >
          <Phone className="w-5 h-5" />
          Call
        </button>
        <button
          onClick={handleMessage}
          className="flex-1 py-3 px-4 bg-card text-foreground font-medium 
                   rounded-xl flex items-center justify-center gap-2 transition-all border-2 border-border
                   hover:bg-secondary touch-manipulation
                   focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <MessageCircle className="w-5 h-5" />
          Message
        </button>
        <button
          onClick={handleDismiss}
          className="py-3 px-4 bg-card/50 text-muted-foreground font-medium 
                   rounded-xl transition-all
                   hover:bg-secondary touch-manipulation
                   focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Later
        </button>
      </div>
    </div>
  )
}
