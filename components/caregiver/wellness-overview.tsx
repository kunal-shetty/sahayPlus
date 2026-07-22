'use client'

import { useSahay } from '@/lib/sahay-context'
import { ArrowLeft, Smile, Meh, Frown, MessageCircle } from 'lucide-react'
import type { WellnessLevel } from '@/lib/types'

interface WellnessOverviewProps {
  onClose: () => void
}

const wellnessConfig: Record<
  WellnessLevel,
  { icon: typeof Smile; label: string; color: string; bgColor: string }
> = {
  great: {
    icon: Smile,
    label: 'Feeling great',
    color: 'text-sahay-success',
    bgColor: 'bg-sahay-success/10',
  },
  okay: {
    icon: Meh,
    label: 'Doing okay',
    color: 'text-sahay-pending',
    bgColor: 'bg-sahay-pending/10',
  },
  notGreat: {
    icon: Frown,
    label: 'Not feeling great',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
}

export function WellnessOverview({ onClose }: WellnessOverviewProps) {
  const { data, getWellnessTrend, getTodayWellness } = useSahay()

  const trend = getWellnessTrend()
  const todayWellness = getTodayWellness()
  const careReceiverName = data.careReceiver?.name || 'Care Receiver'

  // Count wellness levels in last 7 days
  const wellnessCounts = trend.reduce(
    (acc, entry) => {
      acc[entry.level] = (acc[entry.level] || 0) + 1
      return acc
    },
    {} as Record<WellnessLevel, number>
  )

  const mostCommon =
    Object.entries(wellnessCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as
      | WellnessLevel
      | undefined

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center
                     touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              How {careReceiverName} Feels
            </h1>
            <p className="text-muted-foreground">Wellness check-ins</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {/* Today's wellness */}
        {todayWellness && (
          <div
            className={`rounded-2xl p-6 mb-6 ${
              wellnessConfig[todayWellness.level].bgColor
            }`}
          >
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Today
            </p>
            <div className="flex items-center gap-4">
              {(() => {
                const config = wellnessConfig[todayWellness.level]
                const Icon = config.icon
                return (
                  <>
                    <div
                      className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center`}
                    >
                      <Icon className={`w-8 h-8 ${config.color}`} />
                    </div>
                    <div>
                      <p className={`text-xl font-semibold ${config.color}`}>
                        {config.label}
                      </p>
                      {todayWellness.note && (
                        <p className="text-muted-foreground mt-1">
                          &quot;{todayWellness.note}&quot;
                        </p>
                      )}
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {!todayWellness && (
          <div className="rounded-2xl p-6 mb-6 bg-secondary/50 border-2 border-dashed border-border">
            <p className="text-center text-muted-foreground">
              No wellness check-in today yet
            </p>
          </div>
        )}

        {/* Weekly summary */}
        {mostCommon && (
          <div className="bg-card rounded-2xl border-2 border-border p-5 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              This Week
            </h2>
            <p className="text-muted-foreground">
              {careReceiverName} has mostly been{' '}
              <span className={wellnessConfig[mostCommon].color}>
                {wellnessConfig[mostCommon].label.toLowerCase()}
              </span>{' '}
              this week.
            </p>
            <div className="flex items-center gap-4 mt-4">
              {(['great', 'okay', 'notGreat'] as WellnessLevel[]).map(
                (level) => {
                  const config = wellnessConfig[level]
                  const Icon = config.icon
                  const count = wellnessCounts[level] || 0
                  return (
                    <div
                      key={level}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Icon className={`w-5 h-5 ${config.color}`} />
                      <span className="text-foreground font-medium">
                        {count}
                      </span>
                    </div>
                  )
                }
              )}
            </div>
          </div>
        )}

        {/* Wellness history */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Recent Check-ins
          </h2>
          <div className="space-y-3">
            {trend.map((entry) => {
              const config = wellnessConfig[entry.level]
              const Icon = config.icon
              const date = new Date(entry.timestamp)
              return (
                <div
                  key={entry.id}
                  className="bg-card rounded-xl border-2 border-border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}
                      >
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {config.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {date.toLocaleDateString('en', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  {entry.note && (
                    <div className="mt-3 pt-3 border-t border-border flex items-start gap-2">
                      <MessageCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        {entry.note}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}

            {trend.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No wellness check-ins recorded yet
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
