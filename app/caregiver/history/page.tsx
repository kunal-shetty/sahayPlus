'use client'

import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { useSahay } from '@/lib/sahay-context'
import { type Medication, type TimelineEvent } from '@/lib/types'
import { Calendar, TrendingUp, Pill, Filter, Download, Search } from 'lucide-react'
import { CaregiverLayout } from '@/components/caregiver/caregiver-layout'

/**
 * Medication History & Performance Stats Page
 * View medication adherence history, streaks, and performance over time.
 */
export default function HistoryPage() {
  const { data } = useSahay()
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Calculate stats for each medication
  const medStats = useMemo(() => {
    return data.medications.map(med => {
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
        ...med,
        totalTaken: med.totalTaken || 0,
        streak: med.streak || 0,
        lastTaken: lastTaken ? new Date(lastTaken) : null,
        daysAgo,
        adherenceRate: data.dayClosures.length > 0
          ? Math.round((med.totalTaken || 0) / data.dayClosures.length * 100)
          : 0,
      }
    })
  }, [data.medications, data.timeline, data.dayClosures])

  // Filtered and sorted timeline events
  const filteredEvents = useMemo(() => {
    return data.timeline
      .filter(e => {
        const matchesType = filterType === 'all' || e.type === filterType
        const matchesSearch = !searchQuery ||
          (e.medicationName || e.type).toLowerCase().includes(searchQuery.toLowerCase())
        return matchesType && matchesSearch
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [data.timeline, filterType, searchQuery])

  return (
      <main className="min-h-screen bg-background p-6">
        <header className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Medication History</h1>
              <p className="text-muted-foreground text-sm">Performance and adherence tracking</p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground text-sm font-medium rounded-xl hover:bg-secondary/80 transition-all"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </header>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Overall Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <section className="bg-card border-2 border-border rounded-3xl p-6 shadow-sm text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Tracking Days</p>
              <p className="text-3xl font-bold text-foreground">{data.totalDaysTracked}</p>
            </section>
            <section className="bg-card border-2 border-sahay-success/20 rounded-3xl p-6 shadow-sm text-center">
              <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
              <p className="text-3xl font-bold text-sahay-success">🔥 {data.currentStreak}</p>
            </section>
            <section className="bg-card border-2 border-border rounded-3xl p-6 shadow-sm text-center">
              <p className="text-sm text-muted-foreground mb-1">Personal Best</p>
              <p className="text-3xl font-bold text-foreground">{data.longestStreak}</p>
            </section>
          </div>

          {/* Medication Performance Grid */}
          <section className="bg-card border-2 border-border rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Pill className="w-5 h-5 text-sahay-sage" />
              <h2 className="text-xl font-bold">Medication Performance</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medStats.map((med, idx) => (
                <motion.div
                  key={med.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-background border-2 border-border rounded-2xl p-5 hover:border-primary/30 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-foreground">{med.name}</p>
                      <p className="text-sm text-muted-foreground">{med.dosage}</p>
                    </div>
                    {med.streak > 0 && (
                      <span className="px-2 py-1 bg-sahay-success/20 text-sahay-success text-xs font-bold rounded-full">
                        🔥 {med.streak}d
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Adherence Rate</span>
                        <span className="font-bold text-foreground">{med.adherenceRate}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-sahay-success"
                          initial={{ width: 0 }}
                          animate={{ width: `${med.adherenceRate}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-secondary rounded-lg text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Total</p>
                        <p className="text-sm font-bold">{med.totalTaken}</p>
                      </div>
                      <div className="p-2 bg-secondary rounded-lg text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Last Taken</p>
                        <p className="text-sm font-bold">
                          {med.daysAgo === 0 ? 'Today' : med.daysAgo === 1 ? 'Yesterday' : `${med.daysAgo}d ago`}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Detailed Activity Log */}
          <section className="bg-card border-2 border-border rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-sahay-sage" />
                <h2 className="text-xl font-bold">Activity Log</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-secondary border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="relative group">
                  <button className="p-2 bg-secondary rounded-xl hover:bg-secondary/80 transition-all">
                    <Filter className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card border-2 border-border rounded-2xl shadow-xl p-2 z-10 hidden group-hover:block">
                    <button
                      onClick={() => setFilterType('all')}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        filterType === 'all' ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                      )}
                    >
                      All Events
                    </button>
                    <button
                      onClick={() => setFilterType('medication_taken')}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        filterType === 'medication_taken' ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                      )}
                    >
                      Medications Taken
                    </button>
                    <button
                      onClick={() => setFilterType('note_added')}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        filterType === 'note_added' ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                      )}
                    >
                      Care Notes
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Event</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Actor</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full shrink-0",
                              event.type === 'medication_taken' ? 'bg-sahay-success' : 'bg-sahay-blue'
                            )} />
                            <span className="font-medium">{event.medicationName || event.type.replace(/_/g, ' ')}</span>
                          </div>
                          {event.note && <p className="text-xs text-muted-foreground ml-5 mt-1 italic">{event.note}</p>}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="capitalize">{event.actor || 'System'}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={cn(
                            "px-2 py-1 text-xs font-bold rounded-full",
                            event.type === 'medication_taken' ? 'bg-sahay-success/20 text-sahay-success' : 'bg-sahay-pending/20 text-sahay-pending'
                          )}>
                            {event.type === 'medication_taken' ? 'Completed' : 'Recorded'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                        No events match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
