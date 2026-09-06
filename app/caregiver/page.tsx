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
 * Implements a dual-view: App View (Mobile) and Dashboard View (Desktop).
 */
export default function CaregiverPage() {
  const {
    data,
    isLoading,
    isDataLoading,
    getUnreadCount,
    getHumanInsights,
    getDoctorPrepSummary,
    endHandover,
    startHandover,
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
  const [showHandoverSetup, setShowHandoverSetup] = useState(false)
  const [handoverName, setHandoverName] = useState('')
  const [handoverDays, setHandoverDays] = useState('3')

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
  const adherencePercent = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 0
  const confidence = calculateConfidence(data.timeline, data.dayClosures)
  const confidenceMsg = getConfidenceMessage(confidence)

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
    <main className="min-h-screen bg-background safe-top safe-bottom flex flex-col">
      {/* Responsive Header */}
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

      {/* Active Handover Banner */}
      {data.caregiver?.handover?.isActive && (
        <div className="bg-sahay-blue border-b border-sahay-blue/20 p-2 overflow-hidden text-center">
          <p className="text-xs font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2">
            <ArrowLeftRight className="w-3 h-3" />
            Care handed over to {data.caregiver.handover.targetName}
            <button onClick={endHandover} className="ml-2 underline opacity-80 hover:opacity-100">End Now</button>
          </p>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 pb-24">

        {/* --- DESKTOP VIEW (Hidden on mobile) --- */}
        <div className="hidden lg:grid grid-cols-12 gap-6">
          {/* Left Column: Profile & Quick Actions */}
          <div className="lg:col-span-3 space-y-6">
            <section className="p-6 bg-card rounded-2xl border-2 border-border space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-sahay-sage-light flex items-center justify-center">
                  <Heart className="w-6 h-6 text-sahay-sage" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Care Confidence</p>
                  <p className="font-semibold text-foreground">{confidenceMsg}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Quick Actions</p>
                <div className="grid grid-cols-1 gap-2">
                  <button onClick={() => setShowAddForm(true)} className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
                    <Plus className="w-4 h-4" /> Add Medication
                  </button>
                  <button onClick={() => router.push('/caregiver/messages')} className="w-full py-2 px-4 bg-secondary text-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all">
                    <MessageCircle className="w-4 h-4" /> Message Receiver
                  </button>
                  <button onClick={() => setShowEmergency(true)} className="w-full py-2 px-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-destructive/20 transition-all">
                    <Phone className="w-4 h-4" /> Emergency Call
                  </button>
                </div>
              </div>
            </section>

            <section className="p-6 bg-card rounded-2xl border-2 border-border space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Quick Tools</h3>
              <div className="space-y-2">
                {[
                  { label: 'Timeline', icon: BookOpen, action: () => setShowTimeline(true) },
                  { label: 'Wellness', icon: Heart, action: () => setShowWellness(true) },
                  { label: 'History', icon: History, action: () => setShowHistory(true) },
                  { label: 'Notes', icon: FileText, action: () => setShowNotes(true) },
                ].map(item => (
                  <button key={item.label} onClick={item.action} className="w-full p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-all flex items-center gap-3 text-sm font-medium text-foreground">
                    <item.icon className="w-4 h-4 text-muted-foreground" /> {item.label}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Center Column: Checklist & Alerts */}
          <div className="lg:col-span-6 space-y-6">
            {/* Alerts */}
            {data.timeline.find(e => e.type === 'help_requested' && !e.note?.includes('resolved')) && (
              <div className="bg-sahay-blue/10 border-2 border-sahay-blue/30 rounded-2xl p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-sahay-blue/20 flex items-center justify-center shrink-0">
                  <Heart className="w-7 h-7 text-sahay-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-sahay-blue">Check-in Requested</h3>
                  <p className="text-foreground">{data.careReceiver?.name} just tapped "I need help".</p>
                </div>
              </div>
            )}

            {/* Medication List */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Today's Checklist</h2>
                <span className="px-3 py-1 bg-sahay-sage-light text-sahay-sage rounded-full text-xs font-bold">
                  {takenMeds}/{totalMeds} Taken
                </span>
              </div>
              <div className="space-y-4">
                {(Object.keys(timeOfDayLabels) as TimeOfDay[]).map(time => {
                  const meds = groupedMeds[time]
                  if (meds.length === 0) return null
                  const Icon = timeIcons[time]
                  return (
                    <div key={time} className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{timeOfDayLabels[time]}</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {meds.map(med => (
                          <button key={med.id} onClick={() => setEditingMed(med)} className="p-4 bg-card border-2 border-border rounded-xl flex items-center justify-between hover:border-sahay-sage/50 transition-all">
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${med.taken ? 'bg-sahay-success/20' : 'bg-sahay-pending/20'}`}>
                                {med.taken ? <Check className="w-3 h-3 text-sahay-success" /> : <Clock className="w-3 h-3 text-sahay-pending" />}
                              </div>
                              <div className="text-left">
                                <p className={`font-medium ${med.taken ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{med.name}</p>
                                <p className="text-xs text-muted-foreground">{med.dosage} • {med.time ? formatTime12h(med.time) : ''}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          {/* Right Column: Insights & Wellness */}
          <div className="lg:col-span-3 space-y-6">
            <section className="p-6 bg-card rounded-2xl border-2 border-border space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">AI Insights</h3>
              <div className="space-y-3">
                {getHumanInsights().length > 0 ? getHumanInsights().map((insight, i) => (
                  <div key={i} className="p-3 bg-secondary/50 rounded-lg text-sm text-foreground leading-relaxed">
                    {insight}
                  </div>
                )) : <p className="text-sm text-muted-foreground">No new insights today.</p>}
              </div>
            </section>

            <section className="p-6 bg-card rounded-2xl border-2 border-border space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Wellness</h3>
              <div className="text-center py-4">
                <Smile className="w-10 h-10 text-sahay-success mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Check in on their mood</p>
                <button onClick={() => setShowWellness(true)} className="mt-3 w-full py-2 bg-secondary rounded-lg text-sm font-medium hover:bg-secondary/80 transition-all">
                  Open Log
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* --- MOBILE VIEW (Hidden on desktop) --- */}
        <div className="lg:hidden space-y-6">
          <motion.button
            onClick={() => setShowAddForm(true)}
            className="w-full py-4 px-6 bg-primary text-primary-foreground text-lg font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" /> Add medication
          </motion.button>

          {/* Status card */}
          <div className={`p-5 rounded-2xl glass-card ${allTaken ? 'bg-sahay-sage-light/80 border-2 border-sahay-sage/30' : 'bg-card/80 border-2 border-border'}`}>
            {totalMeds === 0 ? <p className="text-lg text-muted-foreground">No medications added yet</p> :
              allTaken ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sahay-success/20 flex items-center justify-center"><Check className="w-5 h-5 text-sahay-success" /></div>
                  <div><p className="text-lg font-medium">Everything looks good today</p><p className="text-muted-foreground">All {totalMeds} medications taken</p></div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sahay-pending/20 flex items-center justify-center"><Clock className="w-5 h-5 text-sahay-pending" /></div>
                  <div><p className="text-lg font-medium">{takenMeds} of {totalMeds} taken today</p><p className="text-muted-foreground">{totalMeds - takenMeds} pending</p></div>
                </div>
              )
            }
          </div>

          <QuickPillActions />

          {/* Medication list */}
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
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden">
        <CaregiverBottomNav
          activeTab={pathname.includes('analytics') ? 'activity' : 'home'}
          onTabChange={(tab) => {
            if (tab === 'home') router.push('/caregiver')
            if (tab === 'activity') router.push('/caregiver/analytics')
            if (tab === 'care') setShowNotes(true) // Simplified
            if (tab === 'messages') router.push('/caregiver/messages')
          }}
          unreadMessages={unreadMessages}
        />
      </div>
    </main>
  )
}
