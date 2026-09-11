'use client'

import { useSahay } from '@/lib/sahay-context'
import { ArrowLeft, Smile, Meh, Frown, MessageCircle, Heart, Calendar, Info } from 'lucide-react'
import type { WellnessLevel } from '@/lib/types'
import { CaregiverLayout } from '@/components/caregiver/caregiver-layout'
import { motion } from 'motion/react'

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

export default function WellnessPage() {
  const { data, getWellnessTrend, getTodayWellness } = useSahay()
  const trend = getWellnessTrend()
  const todayWellness = getTodayWellness()
  const careReceiverName = data.careReceiver?.name || 'Care Receiver'

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
      <main className="min-h-screen bg-background p-6">
        <header className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Wellness Tracking</h1>
              <p className="text-muted-foreground text-sm">Monitoring the emotional and physical well-being of {careReceiverName}</p>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Today's Wellness Snapshot */}
          <section className={cn(
            "rounded-3xl p-8 shadow-sm border-2 transition-all",
            todayWellness
              ? `${wellnessConfig[todayWellness.level].bgColor} border-transparent`
              : "bg-secondary/50 border-border border-dashed"
          )}>
            {todayWellness ? (
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <div className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-inner",
                    wellnessConfig[todayWellness.level].bgColor
                  )}>
                    {(() => {
                      const Icon = wellnessConfig[todayWellness.level].icon
                      return <Icon className={cn("w-12 h-12", wellnessConfig[todayWellness.level].color)} />
                    })()}
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center"
                  >
                    <div className="w-2 h-2 rounded-full bg-sahay-success animate-pulse" />
                  </motion.div>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Today's Status</p>
                  <h2 className={cn("text-3xl font-bold mb-2", wellnessConfig[todayWellness.level].color)}>
                    {wellnessConfig[todayWellness.level].label}
                  </h2>
                  {todayWellness.note && (
                    <p className="text-lg text-foreground/80 italic leading-relaxed">
                      &quot;{todayWellness.note}&quot;
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Info className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">No wellness check-in recorded for today</p>
                <p className="text-sm text-muted-foreground mt-1">Check-ins are usually logged by the care receiver</p>
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Weekly Summary Card */}
            <section className="lg:col-span-1 bg-card border-2 border-border rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">Weekly Summary</h3>
              </div>

              {mostCommon ? (
                <div className="space-y-6">
                  <div className="p-4 bg-secondary/30 rounded-2xl">
                    <p className="text-sm text-muted-foreground mb-2">Dominant Mood</p>
                    <p className={cn("text-xl font-bold", wellnessConfig[mostCommon].color)}>
                      {wellnessConfig[mostCommon].label}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Mood Distribution</p>
                    {(['great', 'okay', 'notGreat'] as WellnessLevel[]).map(level => {
                      const config = wellnessConfig[level]
                      const Icon = config.icon
                      const count = wellnessCounts[level] || 0
                      const percent = trend.length > 0 ? (count / trend.length) * 100 : 0
                      return (
                        <div key={level} className="flex items-center gap-3">
                          <Icon className={cn("w-4 h-4", config.color)} />
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              className={cn("h-full", level === 'great' ? 'bg-sahay-success' : level === 'okay' ? 'bg-sahay-pending' : 'bg-destructive')}
                            />
                          </div>
                          <span className="text-xs font-bold w-4 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground italic">Insufficient data to generate a weekly summary.</p>
              )}
            </section>

            {/* History Grid */}
            <section className="lg:col-span-2 bg-card border-2 border-border rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">Recent Detailed Check-ins</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trend.map((entry) => {
                  const config = wellnessConfig[entry.level]
                  const Icon = config.icon
                  return (
                    <motion.div
                      key={entry.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-background border border-border rounded-2xl flex gap-4"
                    >
                      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", config.bgColor)}>
                        <Icon className={cn("w-6 h-6", config.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-foreground">{config.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        {entry.note ? (
                          <p className="text-sm text-muted-foreground italic leading-relaxed">
                            &quot;{entry.note}&quot;
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No additional notes</p>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
                {trend.length === 0 && (
                  <div className="col-span-2 py-12 text-center">
                    <p className="text-muted-foreground">No wellness check-ins recorded yet.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
