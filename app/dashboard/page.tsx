'use client'

import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { useSahay } from '@/lib/sahay-context'
import {
  type TimeOfDay,
  type Medication,
  timeOfDayLabels,
  formatTime12h,
} from '@/lib/types'
import {
  Sun,
  Cloud,
  Moon,
  Plus,
  Check,
  Clock,
  Settings,
  ChevronRight,
  LayoutDashboard,
  BarChart3,
  FileText,
  ShieldAlert,
  Heart,
  Phone,
  MessageCircle,
  Smile,
  Pill,
  TrendingUp,
  Activity,
  Calendar,
  User,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { MedicationForm } from '@/components/caregiver/medication-form'
import { SettingsPanel } from '@/components/caregiver/settings-panel'
import { CareConfidence } from '@/components/caregiver/care-confidence'
import { DailyClosure } from '@/components/caregiver/daily-closure'

/**
 * Caregiver Responsive Dashboard
 * A high-level oversight view that works on both desktop and mobile.
 */
export default function DashboardPage() {
  const {
    data,
    isLoading,
    isDataLoading,
  } = useSahay()

  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMed, setEditingMed] = useState<Medication | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const groupedMeds: Record<TimeOfDay, Medication[]> = useMemo(() => {
    const grouped: Record<TimeOfDay, Medication[]> = { morning: [], afternoon: [], evening: [] }
    data.medications.forEach(med => {
      if (grouped[med.timeOfDay]) {
        grouped[med.timeOfDay].push(med)
      }
    })
    return grouped
  }, [data.medications])

  const timeIcons: Record<TimeOfDay, any> = { morning: Sun, afternoon: Cloud, evening: Moon }

  if (isLoading || isDataLoading) return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>

  if (showAddForm || editingMed) {
    return <MedicationForm medication={editingMed} onClose={() => { setShowAddForm(false); setEditingMed(null); }} />
  }
  if (showSettings) return <SettingsPanel onClose={() => setShowSettings(false)} />

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8">
      {/* Top Navigation Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-border gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <LayoutDashboard className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{data.careReceiver?.name}'s Health Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">Caregiver View • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-xs md:text-sm font-medium">
            <Activity className="w-4 h-4 text-sahay-success" />
            <span>System Status: Nominal</span>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-all active:scale-95"
          >
            <Settings className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Care Identity & Quick Tools */}
        <div className="col-span-1 lg:col-span-3 space-y-8 order-2 lg:order-1">
          <section className="bg-card border-2 border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-3xl shadow-inner">
                👤
              </div>
              <div>
                <h2 className="text-xl font-bold">{data.careReceiver?.name}</h2>
                <p className="text-sm text-muted-foreground">Care Receiver</p>
              </div>
            </div>
            <div className="space-y-4">
              <CareConfidence />
              <div className="pt-4 border-t border-border flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Streak</span>
                <span className="font-bold text-sahay-success flex items-center gap-1">🔥 {data.currentStreak} days</span>
              </div>
            </div>
          </section>

          <section className="bg-card border-2 border-border rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Quick Navigation
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Analytics', icon: BarChart3, path: '/caregiver/analytics' },
                { label: 'Care Notes', icon: FileText, path: '/caregiver/notes' },
                { label: 'Wellness', icon: Smile, path: '/caregiver/wellness' },
                { label: 'History', icon: Calendar, path: '/caregiver/history' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.path)}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </section>

          <section className="bg-primary text-primary-foreground rounded-3xl p-6 shadow-lg shadow-primary/20">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Quick Action
            </h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 px-4 bg-white text-primary font-bold rounded-xl hover:bg-opacity-90 transition-all active:scale-95 shadow-md"
            >
              Add Medication
            </button>
          </section>
        </div>

        {/* CENTER COLUMN: Today's Care Checklist & Alerts */}
        <div className="col-span-1 lg:col-span-6 space-y-8 order-1 lg:order-2">
          {/* Urgent Alerts Area */}
          <div className="space-y-4">
            {data.timeline.find(e => e.type === 'help_requested' && !e.note?.includes('resolved')) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-sahay-blue text-white rounded-3xl p-6 shadow-xl shadow-sahay-blue/30 flex flex-col md:flex-row items-center justify-between gap-6 border-l-8 border-white/30"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-center md:text-left">Check-in Requested!</h3>
                    <p className="text-white/80 text-center md:text-left">{data.careReceiver?.name} needs your attention immediately.</p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center md:justify-end gap-3">
                  <button onClick={() => router.push('/caregiver/emergency')} className="px-6 py-3 bg-white text-sahay-blue font-bold rounded-xl hover:bg-opacity-90 transition-all flex items-center gap-2"><Phone className="w-5 h-5" /> Call</button>
                  <button onClick={() => router.push('/caregiver/messages')} className="px-6 py-3 bg-sahay-blue-dark text-white font-bold rounded-xl hover:bg-sahay-blue-dark/80 transition-all flex items-center gap-2"><MessageCircle className="w-5 h-5" /> Message</button>
                </div>
              </motion.div>
            )}

            {data.safetyCheck.status === 'escalating' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-destructive text-destructive-foreground rounded-3xl p-6 shadow-xl shadow-destructive/30 flex flex-col md:flex-row items-center justify-between gap-6 border-l-8 border-white/30"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <ShieldAlert className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-center md:text-left">Safety Alert: No Response</h3>
                    <p className="text-white/80 text-center md:text-left">{data.careReceiver?.name} has not responded to the safety check.</p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center md:justify-end gap-3">
                  <button onClick={() => router.push('/caregiver/emergency')} className="px-6 py-3 bg-white text-destructive font-bold rounded-xl hover:bg-opacity-90 transition-all flex items-center gap-2"><Phone className="w-5 h-5" /> Call Now</button>
                  <button onClick={() => router.push('/caregiver/messages')} className="px-6 py-3 bg-destructive-dark text-white font-bold rounded-xl hover:bg-destructive-dark/80 transition-all flex items-center gap-2"><MessageCircle className="w-5 h-5" /> Message</button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Medication Checklist */}
          <section className="bg-card border-2 border-border rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold">Today's Checklist</h2>
                <p className="text-muted-foreground">Ensure all medications are administered</p>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-secondary rounded-full text-sm font-medium w-fit">
                <Pill className="w-4 h-4 text-primary" />
                <span>{data.medications.filter(m => m.taken).length} / {data.medications.length} Taken</span>
              </div>
            </div>

            <div className="space-y-8">
              {(Object.keys(timeOfDayLabels) as TimeOfDay[]).map(time => {
                const meds = groupedMeds[time]
                if (meds.length === 0) return null
                const Icon = timeIcons[time]
                return (
                  <div key={time} className="space-y-4">
                    <div className="flex items-center gap-3 text-muted-foreground mb-2">
                      <Icon className="w-5 h-5" />
                      <h3 className="text-lg font-semibold uppercase tracking-wider">{timeOfDayLabels[time]}</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {meds.map((med) => (
                        <motion.div
                          key={med.id}
                          className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${med.taken ? 'bg-sahay-success/5 border-sahay-success/20' : 'bg-card border-border hover:border-primary/30'}`}
                          whileHover={{ x: 5 }}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${med.taken ? 'bg-sahay-success text-white' : 'bg-secondary text-muted-foreground'}`}>
                              {med.taken ? <Check className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                            </div>
                            <div>
                              <p className={`text-lg font-bold ${med.taken ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{med.name}</p>
                              <p className="text-sm text-muted-foreground">{med.dosage} • {med.time ? formatTime12h(med.time) : 'As needed'}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setEditingMed(med)}
                            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Settings className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-12 pt-8 border-t border-border">
              <DailyClosure />
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Insights & Wellness */}
        <div className="col-span-1 lg:col-span-3 space-y-8 order-3">
          <section className="bg-card border-2 border-border rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Smile className="w-5 h-5 text-sahay-success" />
              Wellness Snapshot
            </h3>
            <div className="space-y-4">
              {data.lastFineCheckIn ? (
                <div className="p-4 bg-sahay-success/10 border-2 border-sahay-success/20 rounded-2xl">
                  <p className="text-sm font-medium text-sahay-success mb-1">Latest Check-in</p>
                  <p className="text-foreground font-bold">Feeling Great</p>
                  <p className="text-xs text-muted-foreground mt-1">Recorded {new Date(data.lastFineCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No check-in data available for today</p>
              )}
              <button
                onClick={() => router.push('/caregiver/wellness')}
                className="w-full py-3 text-sm font-medium text-center text-primary hover:underline"
              >
                View Wellness Trends →
              </button>
            </div>
          </section>

          <section className="bg-card border-2 border-border rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-sahay-blue" />
              AI Human Insights
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-2xl border-l-4 border-sahay-blue">
                <p className="text-sm leading-relaxed italic text-foreground">
                  "{data.careReceiver?.name} has shown a 15% increase in medication adherence this week. Consider a positive reinforcement check-in today."
                </p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-2xl border-l-4 border-sahay-pending">
                <p className="text-sm leading-relaxed italic text-foreground">
                  "Noticeable trend: Evening medications are occasionally missed. Suggesting a revised alarm schedule."
                </p>
              </div>
              <button
                onClick={() => router.push('/caregiver/analytics')}
                className="w-full py-3 text-sm font-medium text-center text-primary hover:underline"
              >
                Explore Full Analysis →
              </button>
            </div>
          </section>

          <section className="bg-card border-2 border-border rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sahay-sage" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {data.timeline.slice(0, 5).map((event) => (
                <div key={event.id} className="flex gap-3 p-2 border-b border-border last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${event.type === 'medication_taken' ? 'bg-sahay-success' : 'bg-sahay-blue'}`} />
                  <div>
                    <p className="text-xs font-bold">{event.medicationName || event.type.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
