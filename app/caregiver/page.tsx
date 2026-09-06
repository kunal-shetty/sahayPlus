'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useSahay } from '@/lib/sahay-context'
import {
  type TimeOfDay,
  type Medication,
  timeOfDayLabels,
  getCurrentTimeOfDay,
  formatTime12h,
  calculateConfidence,
  getConfidenceMessage,
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
  BookOpen,
  Users,
  FileText,
  RefreshCw,
  BarChart3,
  Phone,
  MessageCircle,
  Heart,
  ArrowLeftRight,
  History,
  ShieldAlert,
  Smile,
  Pill,
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

import { MedicationForm } from '@/components/caregiver/medication-form'
import { SettingsPanel } from '@/components/caregiver/settings-panel'
import { CareTimeline } from '@/components/caregiver/care-timeline'
import { GentleCheckIn } from '@/components/caregiver/gentle-check-in'
import { CareConfidence } from '@/components/caregiver/care-confidence'
import { DailyClosure } from '@/components/caregiver/daily-closure'
import { RoleStatus } from '@/components/caregiver/role-status'
import { ContextualNotes } from '@/components/caregiver/contextual-notes'
import { AnalyticsDashboard } from '@/components/caregiver/analytics-dashboard'
import { EmergencyContacts } from '@/components/caregiver/emergency-contacts'
import { Messages } from '@/components/caregiver/messages'
import { WellnessOverview } from '@/components/caregiver/wellness-overview'
import { MedicationHistory } from '@/components/caregiver/medication-history'
import { QuickPillActions } from '@/components/caregiver/quick-pill-actions'
import { CaregiverBottomNav } from '@/components/caregiver/bottom-nav'

/**
 * Caregiver Page
 * Mobile-first App View. Desktop users are encouraged to use /dashboard
 */
export default function CaregiverPage() {
  const {
    data,
    isLoading,
    isDataLoading,
    getUnreadCount,
    endHandover,
  } = useSahay()

  const router = useRouter()
  const pathname = usePathname()

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMed, setEditingMed] = useState<Medication | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [showRoleStatus, setShowRoleStatus] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [showWellness, setShowWellness] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showDoctorPrep, setShowDoctorPrep] = useState(false)
  const [showPharmacist, setShowPharmacist] = useState(false)

  const unreadMessages = getUnreadCount()
  const currentTimeOfDay = getCurrentTimeOfDay()

  const groupedMeds: Record<TimeOfDay, Medication[]> = useMemo(() => {
    const grouped = { morning: [], afternoon: [], evening: [] }
    data.medications.forEach(med => grouped[med.timeOfDay].push(med))
    return grouped
  }, [data.medications])

  const totalMeds = data.medications.length
  const takenMeds = data.medications.filter((m) => m.taken).length
  const allTaken = totalMeds > 0 && takenMeds === totalMeds

  const timeIcons: Record<TimeOfDay, any> = { morning: Sun, afternoon: Cloud, evening: Moon }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (isLoading || isDataLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (showAddForm || editingMed) {
    return <MedicationForm medication={editingMed} onClose={() => { setShowAddForm(false); setEditingMed(null); }} />
  }
  if (showSettings) return <SettingsPanel onClose={() => setShowSettings(false)} />
  if (showTimeline) return <CareTimeline onClose={() => setShowTimeline(false)} />
  if (showRoleStatus) return <RoleStatus onClose={() => setShowRoleStatus(false)} />
  if (showNotes) return <ContextualNotes onClose={() => setShowNotes(false)} />
  if (showAnalytics) return <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />
  if (showEmergency) return <EmergencyContacts onClose={() => setShowEmergency(false)} />
  if (showWellness) return <WellnessOverview onClose={() => setShowWellness(false)} />
  if (showHistory) return <MedicationHistory onClose={() => setShowHistory(false)} />

  return (
    <main className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      <header className="p-6 pb-4 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-lg">{getGreeting()}, {data.caregiver?.name}</p>
          <h1 className="text-2xl font-semibold text-foreground">{data.careReceiver?.name}'s Care</h1>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 active:scale-95 transition-all"
        >
          <Settings className="w-6 h-6 text-foreground" />
        </button>
      </header>

      {data.caregiver?.handover?.isActive && (
        <div className="bg-sahay-blue border-b border-sahay-blue/20 p-2 overflow-hidden text-center">
          <p className="text-xs font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2">
            <ArrowLeftRight className="w-3 h-3" />
            Care handed over to {data.caregiver.handover.targetName}
            <button onClick={endHandover} className="ml-2 underline opacity-80 hover:opacity-100">End Now</button>
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        <motion.button
          onClick={() => setShowAddForm(true)}
          className="w-full py-4 px-6 mb-6 bg-primary text-primary-foreground text-lg font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" /> Add medication
        </motion.button>

        {data.timeline.find(e => e.type === 'help_requested' && !e.note?.includes('resolved')) && (
          <div className="bg-sahay-blue/10 border-2 border-sahay-blue/30 rounded-2xl p-6 mb-6 shadow-lg shadow-sahay-blue/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-sahay-blue/20 flex items-center justify-center shrink-0">
                <Heart className="w-7 h-7 text-sahay-blue" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-sahay-blue mb-1">Check-in Requested</h3>
                <p className="text-foreground">{data.careReceiver?.name} just tapped "I need help".</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowEmergency(true)} className="flex items-center justify-center gap-2 py-3 px-4 bg-sahay-blue text-white font-bold rounded-xl"><Phone className="w-5 h-5" /> Call</button>
              <button onClick={() => router.push('/caregiver/messages')} className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary text-foreground font-bold rounded-xl"><MessageCircle className="w-5 h-5" /> Message</button>
            </div>
          </div>
        )}

        {data.safetyCheck.status === 'escalating' && (
          <div className="bg-destructive/10 border-2 border-destructive/30 rounded-2xl p-6 mb-6 shadow-lg shadow-destructive/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-7 h-7 text-destructive" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-destructive mb-1">Safety Alert: No Response</h3>
                <p className="text-foreground">{data.careReceiver?.name} did not respond to the safety check.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowEmergency(true)} className="flex items-center justify-center gap-2 py-3 px-4 bg-destructive text-destructive-foreground font-bold rounded-xl"><Phone className="w-5 h-5" /> Call Them</button>
              <button onClick={() => router.push('/caregiver/messages')} className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary text-foreground font-bold rounded-xl border-2 border-border"><MessageCircle className="w-5 h-5" /> Message</button>
            </div>
          </div>
        )}

        {totalMeds > 0 && (
          <div className="bg-gradient-to-br from-sahay-sage/10 to-sahay-success/10 rounded-2xl p-5 mb-6 border-2 border-sahay-sage/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-sahay-sage">{data.currentStreak}</h3>
                  <span className="text-lg text-muted-foreground">days</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-sahay-success/20 flex items-center justify-center text-2xl">🔥</div>
            </div>
          </div>
        )}

        <QuickPillActions />

        {data.lastFineCheckIn?.startsWith(new Date().toISOString().split('T')[0]) && (
          <div className="bg-sahay-success/10 border-2 border-sahay-success/20 rounded-2xl p-5 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sahay-success/20 flex items-center justify-center"><Smile className="w-6 h-6 text-sahay-success" /></div>
            <div>
              <p className="text-lg font-bold text-foreground">{data.careReceiver?.name} checked in</p>
              <p className="text-muted-foreground">They tapped "I'm fine today" at {new Date(data.lastFineCheckIn!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {(Object.keys(timeOfDayLabels) as TimeOfDay[]).map(time => {
            const meds = groupedMeds[time]
            if (meds.length === 0) return null
            const Icon = timeIcons[time]
            return (
              <section key={time} className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-lg font-medium text-muted-foreground">{timeOfDayLabels[time]}</h2>
                </div>
                <div className="space-y-2">
                  {meds.map((med, idx) => (
                    <button key={med.id} onClick={() => setEditingMed(med)} className="w-full p-4 bg-card rounded-xl border-2 border-border text-left flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${med.taken ? 'bg-sahay-success/20' : 'bg-sahay-pending/20'}`}>
                          {med.taken ? <Check className="w-4 h-4 text-sahay-success" /> : <Clock className="w-4 h-4 text-sahay-pending" />}
                        </div>
                        <div>
                          <p className={`text-lg font-medium ${med.taken ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{med.name}</p>
                          <p className="text-sm text-muted-foreground">{med.dosage} • {med.time ? formatTime12h(med.time) : ''}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        <div className="mt-6 mb-8">
          <DailyClosure />
        </div>
      </div>

      <CaregiverBottomNav
        activeTab={pathname.includes('analytics') ? 'activity' : 'home'}
        onTabChange={(tab) => {
          if (tab === 'home') router.push('/caregiver')
          if (tab === 'activity') router.push('/caregiver/analytics')
          if (tab === 'care') router.push('/caregiver/notes') // Default to notes
          if (tab === 'messages') router.push('/caregiver/messages')
        }}
        unreadMessages={unreadMessages}
      />
    </main>
  )
}
