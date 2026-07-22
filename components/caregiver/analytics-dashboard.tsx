'use client'

import { useSahay } from '@/lib/sahay-context'
import { ArrowLeft, TrendingUp, Calendar, Award, Pill } from 'lucide-react'
import { calculateConfidence, getConfidenceMessage } from '@/lib/types'

interface AnalyticsDashboardProps {
  onClose: () => void
}

export function AnalyticsDashboard({ onClose }: AnalyticsDashboardProps) {
  const { data, getWeeklyAdherence, getMedicationStats } = useSahay()

  const weeklyData = getWeeklyAdherence()
  const confidence = calculateConfidence(data.timeline, data.dayClosures)
  const confidenceMessage = getConfidenceMessage(confidence)

  // Calculate overall stats
  const totalTaken = weeklyData.reduce((sum, d) => sum + d.taken, 0)
  const totalPossible = weeklyData.reduce((sum, d) => sum + d.total, 0)
  const adherencePercent = totalPossible > 0 ? Math.round((totalTaken / totalPossible) * 100) : 0

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
              Care Insights
            </h1>
            <p className="text-muted-foreground">
              How things are going
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {/* Confidence indicator */}
        <div className="bg-sahay-sage-light rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-sahay-sage/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-sahay-sage" />
            </div>
            <div>
              <p className="text-sm text-sahay-sage font-medium uppercase tracking-wide">
                Care Confidence
              </p>
              <p className="text-lg font-semibold text-foreground">
                {confidenceMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Weekly overview */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sahay-blue" />
            This Week
          </h2>
          
          <div className="bg-card rounded-2xl border-2 border-border p-5">
            {/* Bar chart */}
            <div className="flex items-end justify-between gap-2 h-32 mb-4">
              {weeklyData.map((day, i) => {
                const percent = day.total > 0 ? (day.taken / day.total) * 100 : 0
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-secondary rounded-lg relative h-24 overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-sahay-sage rounded-lg transition-all"
                        style={{ height: `${percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {day.day}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground">Weekly adherence</p>
                <p className="text-2xl font-bold text-foreground">{adherencePercent}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Doses taken</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalTaken}/{totalPossible}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Streaks */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-sahay-warm" />
            Streaks
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-2xl border-2 border-border p-5">
              <p className="text-sm text-muted-foreground mb-1">Current streak</p>
              <p className="text-3xl font-bold text-sahay-sage">
                {data.currentStreak || 0}
              </p>
              <p className="text-sm text-muted-foreground">days</p>
            </div>
            <div className="bg-card rounded-2xl border-2 border-border p-5">
              <p className="text-sm text-muted-foreground mb-1">Longest streak</p>
              <p className="text-3xl font-bold text-sahay-blue">
                {data.longestStreak || 0}
              </p>
              <p className="text-sm text-muted-foreground">days</p>
            </div>
          </div>
        </section>

        {/* Per-medication stats */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            Medication Details
          </h2>
          
          <div className="space-y-3">
            {data.medications.map((med) => {
              const stats = getMedicationStats(med.id)
              return (
                <div
                  key={med.id}
                  className="bg-card rounded-xl border-2 border-border p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground">{med.name}</p>
                      <p className="text-sm text-muted-foreground">{med.dosage}</p>
                    </div>
                    {med.color && (
                      <div
                        className={`w-8 h-8 rounded-full border-2 border-border ${
                          med.color === 'white' ? 'bg-white' :
                          med.color === 'blue' ? 'bg-blue-300' :
                          med.color === 'pink' ? 'bg-pink-300' :
                          med.color === 'yellow' ? 'bg-yellow-300' :
                          med.color === 'orange' ? 'bg-orange-300' :
                          med.color === 'green' ? 'bg-green-300' :
                          'bg-red-300'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Streak: </span>
                      <span className="font-medium text-sahay-sage">{stats.streak} days</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-medium text-foreground">{stats.total} doses</span>
                    </div>
                    {med.refillDaysLeft !== undefined && med.refillDaysLeft <= 7 && (
                      <div className="text-sahay-pending font-medium">
                        Refill soon
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
