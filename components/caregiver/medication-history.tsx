'use client'

import { motion } from 'motion/react'
import { useSahay } from '@/lib/sahay-context'
import { type Medication, type TimelineEvent } from '@/lib/types'
import { ChevronLeft, Calendar, TrendingUp, Pill } from 'lucide-react'

interface MedicationHistoryProps {
  onClose: () => void
}

/**
 * Medication History & Performance Stats
 * NEW FEATURE: View medication adherence history, streaks, and performance over time
 */
export function MedicationHistory({ onClose }: MedicationHistoryProps) {
  const { data } = useSahay()

  // Calculate stats for each medication
  const getMedicationStats = (med: Medication) => {
    const events = data.timeline.filter(
      (e) => e.medicationId === med.id && e.type === 'medication_taken'
    )
    const lastTaken = events[events.length - 1]?.timestamp
    const daysAgo = lastTaken
      ? Math.floor(
          (Date.now() - new Date(lastTaken).getTime()) / (1000 * 60 * 60 * 24)
        )
      : null

    return {
      totalTaken: med.totalTaken || 0,
      streak: med.streak || 0,
      lastTaken: lastTaken ? new Date(lastTaken) : null,
      daysAgo,
      adherenceRate: data.dayClosures.length > 0
        ? Math.round((med.totalTaken || 0) / data.dayClosures.length * 100)
        : 0,
    }
  }

  // Get last 7 days of timeline events
  const getRecentEvents = () => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    return data.timeline
      .filter((e) => new Date(e.timestamp) > sevenDaysAgo)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15)
  }

  const recentEvents = getRecentEvents()

  return (
    <main className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      {/* Header */}
      <motion.header
        className="p-6 pb-4 border-b border-border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Medication History</h1>
            <p className="text-muted-foreground">Performance & adherence tracking</p>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* Overall stats */}
        <motion.div
          className="grid grid-cols-3 gap-3 my-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-card border-2 border-border rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">Total Days</p>
            <p className="text-2xl font-bold text-foreground">{data.totalDaysTracked}</p>
          </div>
          <div className="bg-card border-2 border-sahay-success/20 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">Current Streak</p>
            <p className="text-2xl font-bold text-sahay-success flex items-center justify-center gap-1">
              <span>🔥</span>
              {data.currentStreak}
            </p>
          </div>
          <div className="bg-card border-2 border-border rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">Best Streak</p>
            <p className="text-2xl font-bold text-foreground">{data.longestStreak}</p>
          </div>
        </motion.div>

        {/* Medication performance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Pill className="w-5 h-5 text-sahay-sage" />
            Medication Performance
          </h2>

          <div className="space-y-3">
            {data.medications.map((med, idx) => {
              const stats = getMedicationStats(med)
              return (
                <motion.div
                  key={med.id}
                  className="bg-card border-2 border-border rounded-xl p-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + idx * 0.05 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{med.name}</p>
                      <p className="text-sm text-muted-foreground">{med.dosage}</p>
                    </div>
                    {stats.streak > 0 && (
                      <span className="px-2 py-1 bg-sahay-success/20 text-sahay-success text-xs font-bold rounded-full">
                        🔥 {stats.streak}d
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {/* Adherence bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Adherence</span>
                        <span className="text-xs font-semibold text-foreground">
                          {stats.adherenceRate}%
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-sahay-success"
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.adherenceRate}%` }}
                          transition={{ duration: 0.8, delay: 0.25 + idx * 0.05 }}
                        />
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-secondary rounded-lg">
                        <p className="text-muted-foreground">Total Taken</p>
                        <p className="font-bold text-foreground">{stats.totalTaken}</p>
                      </div>
                      <div className="p-2 bg-secondary rounded-lg">
                        <p className="text-muted-foreground">Last Taken</p>
                        <p className="font-bold text-foreground">
                          {stats.lastTaken
                            ? stats.daysAgo === 0
                              ? 'Today'
                              : stats.daysAgo === 1
                              ? 'Yesterday'
                              : `${stats.daysAgo}d ago`
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sahay-sage" />
            Recent Activity (Last 7 Days)
          </h2>

          <div className="space-y-2">
            {recentEvents.length > 0 ? (
              recentEvents.map((event, idx) => (
                <motion.div
                  key={event.id}
                  className="bg-card border-2 border-border rounded-xl p-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + idx * 0.03 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">
                        {event.medicationName || event.type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        event.type === 'medication_taken'
                          ? 'bg-sahay-success/20 text-sahay-success'
                          : 'bg-sahay-pending/20 text-sahay-pending'
                      }`}
                    >
                      {event.type === 'medication_taken' ? '✓ Taken' : event.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
