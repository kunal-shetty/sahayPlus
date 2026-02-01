'use client'

import { useSahay } from '@/lib/sahay-context'
import { type TimelineEvent } from '@/lib/types'
import {
  Check,
  AlertCircle,
  RefreshCw,
  Plus,
  Minus,
  FileText,
  Phone,
  Moon,
  ArrowLeft,
} from 'lucide-react'

/**
 * Shared Care Timeline
 * A living story of care, not a checklist
 * Past events gently fade, no red "missed" states
 */
export function CareTimeline({ onClose }: { onClose: () => void }) {
  const { data } = useSahay()

  // Group events by day
  const groupedEvents: Record<string, TimelineEvent[]> = {}

  for (const event of data.timeline) {
    const date = new Date(event.timestamp).toISOString().split('T')[0]
    if (!groupedEvents[date]) {
      groupedEvents[date] = []
    }
    groupedEvents[date].push(event)
  }

  // Sort days descending (most recent first)
  const sortedDays = Object.keys(groupedEvents).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  // Calculate opacity based on age (older = more faded)
  const getOpacity = (date: string) => {
    const now = new Date()
    const eventDate = new Date(date)
    const diffDays = Math.floor(
      (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays === 0) return 1
    if (diffDays <= 2) return 0.9
    if (diffDays <= 5) return 0.7
    if (diffDays <= 10) return 0.5
    return 0.4
  }

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'medication_taken':
        return Check
      case 'medication_skipped':
        return AlertCircle
      case 'dose_changed':
        return RefreshCw
      case 'medication_added':
        return Plus
      case 'medication_removed':
        return Minus
      case 'refill_noted':
        return RefreshCw
      case 'note_added':
        return FileText
      case 'check_in':
        return Phone
      case 'day_closed':
        return Moon
      default:
        return Check
    }
  }

  const getEventMessage = (event: TimelineEvent): string => {
    switch (event.type) {
      case 'medication_taken':
        return `${event.medicationName || 'Medication'} taken`
      case 'medication_skipped':
        return `${event.medicationName || 'Medication'} noted as skipped`
      case 'dose_changed':
        return `${event.medicationName || 'Medication'} dosage adjusted`
      case 'medication_added':
        return `${event.medicationName || 'Medication'} added to routine`
      case 'medication_removed':
        return `${event.medicationName || 'Medication'} removed from routine`
      case 'refill_noted':
        return `Refill noted for ${event.medicationName || 'medication'}`
      case 'note_added':
        return event.note || 'Note added'
      case 'check_in':
        return 'Check-in completed'
      case 'day_closed':
        return event.note || "Day's routine completed"
      default:
        return 'Activity recorded'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="p-6 pb-4 border-b border-border">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center 
                     hover:bg-secondary/80 transition-colors touch-manipulation
                     focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Care Story
            </h1>
            <p className="text-muted-foreground">
              A gentle record of your care journey
            </p>
          </div>
        </div>
      </header>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-6">
        {sortedDays.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Your care story will appear here
            </p>
            <p className="text-muted-foreground mt-2">
              Activities are recorded as they happen
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDays.map((day) => {
              const events = groupedEvents[day]
              const opacity = getOpacity(day)

              return (
                <section
                  key={day}
                  style={{ opacity }}
                  className="transition-opacity duration-300"
                >
                  {/* Day header */}
                  <h2 className="text-lg font-medium text-foreground mb-4 sticky top-0 bg-background py-2">
                    {formatDate(day)}
                  </h2>

                  {/* Events for this day */}
                  <div className="space-y-3 pl-4 border-l-2 border-border">
                    {events
                      .sort(
                        (a, b) =>
                          new Date(b.timestamp).getTime() -
                          new Date(a.timestamp).getTime()
                      )
                      .map((event) => {
                        const Icon = getEventIcon(event.type)
                        const isPositive = [
                          'medication_taken',
                          'day_closed',
                          'check_in',
                        ].includes(event.type)

                        return (
                          <div
                            key={event.id}
                            className="flex items-start gap-3 pl-4 -ml-[9px]"
                          >
                            {/* Event dot/icon */}
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                        ${isPositive ? 'bg-sahay-success/20' : 'bg-sahay-pending/20'}`}
                            >
                              <Icon
                                className={`w-4 h-4 ${isPositive ? 'text-sahay-success' : 'text-sahay-pending'}`}
                              />
                            </div>

                            {/* Event content */}
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground">
                                {getEventMessage(event)}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-muted-foreground">
                                  {formatTime(event.timestamp)}
                                </span>
                                {event.actor && event.actor !== 'careReceiver' && (
                                  <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">
                                    {event.actor === 'pharmacist'
                                      ? 'Pharmacist'
                                      : 'Caregiver'}
                                  </span>
                                )}
                              </div>
                              {event.note && event.type !== 'day_closed' && (
                                <p className="text-sm text-muted-foreground mt-2 p-2 bg-secondary/50 rounded-lg">
                                  {event.note}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
