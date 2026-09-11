'use client'

import { useSahay } from '@/lib/sahay-context'
import { TrendingUp, Calendar, Award, Pill, BarChart3, Info, AlertCircle } from 'lucide-react'
import { calculateConfidence, getConfidenceMessage } from '@/lib/types'
import { CaregiverLayout } from '@/components/caregiver/caregiver-layout'
import { motion } from 'motion/react'

/**
 * Analytics Page
 * Comprehensive oversight of care adherence and wellness trends.
 */
export default function AnalyticsPage() {
  const { data, getWeeklyAdherence, getMedicationStats } = useSahay()

  const weeklyData = getWeeklyAdherence()
  const confidence = calculateConfidence(data.timeline, data.dayClosures)
  const confidenceMessage = getConfidenceMessage(confidence)

  const totalTaken = weeklyData.reduce((sum, d) => sum + d.taken, 0)
  const totalPossible = weeklyData.reduce((sum, d) => sum + d.total, 0)
  const adherencePercent = totalPossible > 0 ? Math.round((totalTaken / totalPossible) * 100) : 0

  return (
      <main className="min-h-screen bg-background p-6">
        <header className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Care Insights</h1>
              <p className="text-muted-foreground text-sm">Detailed analysis of adherence and wellness trends</p>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Top Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <section className="bg-sahay-sage-light border-2 border-sahay-sage/20 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-sahay-sage/20 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-sahay-sage" />
              </div>
              <div>
                <p className="text-xs text-sahay-sage font-bold uppercase tracking-wider">Care Confidence</p>
                <p className="text-lg font-semibold text-foreground">{confidenceMessage}</p>
              </div>
            </section>

            <section className="bg-card border-2 border-border rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Weekly Adherence</p>
                <p className="text-lg font-semibold text-foreground">{adherencePercent}%</p>
              </div>
            </section>

            <section className="bg-card border-2 border-border rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-sahay-blue/10 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-sahay-blue" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Current Streak</p>
                <p className="text-lg font-semibold text-foreground">{data.currentStreak} Days</p>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Weekly Adherence Chart */}
            <section className="lg:col-span-2 bg-card border-2 border-border rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-sahay-blue" />
                  <h2 className="text-xl font-bold">Weekly Activity</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full text-xs font-medium text-muted-foreground">
                  <Info className="w-3 h-3" />
                  <span>Past 7 Days</span>
                </div>
              </div>

              <div className="flex items-end justify-between gap-4 h-48 mb-6">
                {weeklyData.map((day, i) => {
                  const percent = day.total > 0 ? (day.taken / day.total) * 100 : 0
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                      <div className="w-full bg-secondary rounded-t-xl relative h-32 overflow-hidden transition-all group-hover:bg-secondary/80">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${percent}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="absolute bottom-0 left-0 right-0 bg-sahay-sage rounded-t-xl shadow-sm"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                        {day.day}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Medication Adherence</p>
                  <p className="text-3xl font-bold text-foreground">{adherencePercent}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Doses Completed</p>
                  <p className="text-3xl font-bold text-foreground">{totalTaken}<span className="text-lg text-muted-foreground ml-1">/ {totalPossible}</span></p>
                </div>
              </div>
            </section>

            {/* Longest Streak & Goal */}
            <section className="bg-card border-2 border-border rounded-3xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-5 h-5 text-sahay-warm" />
                  <h2 className="text-xl font-bold">Achievement</h2>
                </div>
                <div className="space-y-6">
                  <div className="p-4 bg-secondary/30 rounded-2xl border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Personal Best</p>
                    <p className="text-4xl font-bold text-sahay-blue">{data.longestStreak || 0} <span className="text-lg font-medium text-muted-foreground">days</span></p>
                  </div>
                  <div className="p-4 bg-sahay-sage/10 rounded-2xl border border-sahay-sage/20">
                    <p className="text-sm text-sahay-sage font-medium mb-1">Next Milestone</p>
                    <p className="text-xl font-bold text-foreground">
                      {data.currentStreak >= 30 ? '90 Day Legend' : data.currentStreak >= 14 ? '30 Day Master' : '14 Day Hero'}
                    </p>
                    <div className="w-full bg-secondary rounded-full h-2 mt-3 overflow-hidden">
                      <div
                        className="bg-sahay-sage h-full transition-all"
                        style={{ width: `${Math.min((data.currentStreak / 30) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Medication Detailed Breakdown */}
          <section className="bg-card border-2 border-border rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Pill className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Medication Detail Analysis</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.medications.map((med) => {
                const stats = getMedicationStats(med.id)
                return (
                  <motion.div
                    key={med.id}
                    whileHover={{ y: -5 }}
                    className="bg-background border-2 border-border rounded-2xl p-6 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${med.color === 'white' ? 'bg-white border border-border' :
                          med.color === 'blue' ? 'bg-blue-400' :
                          med.color === 'pink' ? 'bg-pink-400' :
                          med.color === 'yellow' ? 'bg-yellow-400' :
                          med.color === 'orange' ? 'bg-orange-400' :
                          med.color === 'green' ? 'bg-green-400' : 'bg-red-400'}`}
                        />
                        <p className="font-bold text-foreground">{med.name}</p>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{med.dosage}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-secondary/50 rounded-xl">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Streak</p>
                        <p className="text-lg font-bold text-sahay-sage">{stats.streak}d</p>
                      </div>
                      <div className="p-3 bg-secondary/50 rounded-xl">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Total</p>
                        <p className="text-lg font-bold text-foreground">{stats.total}</p>
                      </div>
                    </div>
                    {med.refillDaysLeft !== undefined && med.refillDaysLeft <= 7 && (
                      <div className="mt-4 p-2 bg-sahay-pending/10 border border-sahay-pending/20 rounded-lg text-center">
                        <p className="text-xs font-bold text-sahay-pending flex items-center justify-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Refill needed in {med.refillDaysLeft} days
                        </p>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </section>
        </div>
      </main>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
