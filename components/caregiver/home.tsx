'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useSahay } from '@/lib/sahay-context'
import {
  type TimeOfDay,
  type Medication,
  timeOfDayLabels,
  getCurrentTimeOfDay,
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
  AlertTriangle,
  Smile,
  ArrowLeft,
  Pill,
} from 'lucide-react'
import { MedicationForm } from './medication-form'
import { SettingsPanel } from './settings-panel'
import { CareTimeline } from './care-timeline'
import { GentleCheckIn } from './gentle-check-in'
import { CareConfidence } from './care-confidence'
import { DailyClosure } from './daily-closure'
import { RoleStatus } from './role-status'
import { ContextualNotes } from './contextual-notes'
import { AnalyticsDashboard } from './analytics-dashboard'
import { EmergencyContacts } from './emergency-contacts'
import { Messages } from './messages'
import { WellnessOverview } from './wellness-overview'
import { MedicationHistory } from './medication-history'
import { QuickPillActions } from './quick-pill-actions'
import { CaregiverHomeSkeleton } from '../skeletons'
import { CaregiverBottomNav, type CaregiverTab } from './bottom-nav'

/**
 * Inline pharmacist form for the pharmacist panel
 */
function PharmacistInlineForm() {
  const { data, updatePharmacist } = useSahay()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(data.pharmacist?.name || '')
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    updatePharmacist({ name: name.trim() || undefined })
    setTimeout(() => {
      setSaving(false)
      setEditing(false)
    }, 300)
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="w-full py-3 px-4 bg-secondary text-foreground font-medium 
                 rounded-xl transition-all active:scale-[0.97] touch-manipulation
                 hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {data.pharmacist?.name ? 'Edit Pharmacist' : '+ Add Pharmacist'}
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Pharmacist name"
        className="w-full p-3 bg-secondary rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-sahay-blue"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={() => setEditing(false)}
          className="flex-1 py-3 px-4 bg-secondary text-foreground font-medium 
                   rounded-xl transition-all active:scale-[0.97] touch-manipulation"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 px-4 bg-primary text-primary-foreground font-medium 
                   rounded-xl transition-all active:scale-[0.97] touch-manipulation
                   disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
              <Clock className="w-4 h-4" />
            </motion.div>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </div>
  )
}

/**
 * Per-medication pharmacist note entry
 */
function MedPharmacistNote({ med }: { med: Medication }) {
  const { addPharmacistNote } = useSahay()
  const [expanded, setExpanded] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    if (!note.trim()) return
    setSaving(true)
    addPharmacistNote(med.id, note.trim())
    setTimeout(() => {
      setSaving(false)
      setNote('')
      setExpanded(false)
    }, 300)
  }

  return (
    <div className="border-2 border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between text-left
                 hover:bg-secondary/50 active:scale-[0.99] transition-all touch-manipulation"
      >
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${med.taken ? 'bg-sahay-success/20' : 'bg-sahay-pending/20'}`}>
            {med.taken ? <Check className="w-3 h-3 text-sahay-success" /> : <Clock className="w-3 h-3 text-sahay-pending" />}
          </div>
          <div>
            <p className="font-medium text-foreground">{med.name}</p>
            {med.pharmacistNote && (
              <p className="text-xs text-sahay-blue mt-0.5">Has pharmacist note</p>
            )}
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 space-y-2">
              {med.pharmacistNote && (
                <div className="p-2 bg-sahay-blue/10 rounded-lg">
                  <p className="text-sm text-sahay-blue font-medium">Current note:</p>
                  <p className="text-sm text-foreground">{med.pharmacistNote}</p>
                </div>
              )}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add note from pharmacist..."
                rows={2}
                className="w-full p-2 bg-secondary rounded-lg border border-border text-sm
                         focus:outline-none focus:ring-2 focus:ring-sahay-blue resize-none"
              />
              <button
                onClick={handleSave}
                disabled={!note.trim() || saving}
                className="w-full py-2 px-3 bg-sahay-blue text-white font-medium text-sm
                         rounded-lg transition-all active:scale-[0.97] touch-manipulation
                         disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                    <Clock className="w-3 h-3" />
                  </motion.div>
                ) : (
                  'Save Note'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Caregiver Home Screen
 * Passive overview of today's medication status
 * Features: medication list grouped by time, add/edit/remove, calm status indicators
 */
export function CaregiverHome() {
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
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMed, setEditingMed] = useState<Medication | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [showRoleStatus, setShowRoleStatus] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [showWellness, setShowWellness] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showDoctorPrep, setShowDoctorPrep] = useState(false)
  const [showPharmacist, setShowPharmacist] = useState(false)
  const [showHandoverSetup, setShowHandoverSetup] = useState(false)
  const [handoverName, setHandoverName] = useState('')
  const [handoverDays, setHandoverDays] = useState('3')
  const [activeTab, setActiveTab] = useState<CaregiverTab>('home')

  const unreadMessages = getUnreadCount()

  const currentTimeOfDay = getCurrentTimeOfDay()

  // Group medications by time of day
  const groupedMeds: Record<TimeOfDay, Medication[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  }

  for (const med of data.medications) {
    groupedMeds[med.timeOfDay].push(med)
  }

  // Calculate overall status
  const totalMeds = data.medications.length
  const takenMeds = data.medications.filter((m) => m.taken).length
  const allTaken = totalMeds > 0 && takenMeds === totalMeds

  const timeIcons: Record<TimeOfDay, typeof Sun> = {
    morning: Sun,
    afternoon: Cloud,
    evening: Moon,
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Show skeleton during loading (both initial auth check and API data fetching)
  if (isLoading || isDataLoading) {
    return <CaregiverHomeSkeleton />
  }

  // Show medication form if adding or editing
  if (showAddForm || editingMed) {
    return (
      <MedicationForm
        medication={editingMed}
        onClose={() => {
          setShowAddForm(false)
          setEditingMed(null)
        }}
      />
    )
  }

  // Show settings panel
  if (showSettings) {
    return <SettingsPanel onClose={() => setShowSettings(false)} />
  }

  // Show care timeline
  if (showTimeline) {
    return <CareTimeline onClose={() => setShowTimeline(false)} />
  }

  // Show role status
  if (showRoleStatus) {
    return <RoleStatus onClose={() => setShowRoleStatus(false)} />
  }

  // Show notes
  if (showNotes) {
    return <ContextualNotes onClose={() => setShowNotes(false)} />
  }

  // Show analytics
  if (showAnalytics) {
    return <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />
  }

  // Show emergency contacts
  if (showEmergency) {
    return <EmergencyContacts onClose={() => setShowEmergency(false)} />
  }

  // Show messages
  if (showMessages) {
    return <Messages onClose={() => setShowMessages(false)} />
  }

  // Show wellness
  if (showWellness) {
    return <WellnessOverview onClose={() => setShowWellness(false)} />
  }

  // Show medication history
  if (showHistory) {
    return <MedicationHistory onClose={() => setShowHistory(false)} />
  }

  // Show pharmacist panel
  if (showPharmacist) {
    return (
      <main className="min-h-screen flex flex-col bg-background p-6">
        <header className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setShowPharmacist(false)}
            className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center
                     hover:bg-secondary/80 active:scale-95 transition-all touch-manipulation
                     focus:outline-none focus:ring-2 focus:ring-sahay-sage"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Pharmacist</h1>
        </header>

        <div className="space-y-6 max-w-md mx-auto w-full">
          {/* Current pharmacist info */}
          <section className="p-5 bg-card rounded-2xl border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-sahay-blue-light flex items-center justify-center">
                <Pill className="w-5 h-5 text-sahay-blue" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-foreground">Local Pharmacist</h2>
                <p className="text-sm text-muted-foreground">A silent helper for refill notes</p>
              </div>
            </div>

            {data.pharmacist?.name ? (
              <div className="mb-4 p-3 bg-secondary/50 rounded-xl">
                <p className="text-foreground font-medium">{data.pharmacist.name}</p>
                {data.pharmacist.lastRefillConfirm && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Last refill: {new Date(data.pharmacist.lastRefillConfirm).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground mb-4">No pharmacist added yet</p>
            )}

            <PharmacistInlineForm />
          </section>

          {/* Medication-specific notes from pharmacist */}
          {data.medications.length > 0 && (
            <section className="p-5 bg-card rounded-2xl border-2 border-border">
              <h3 className="text-lg font-medium text-foreground mb-4">Medication Notes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add notes from your pharmacist for specific medications
              </p>
              <div className="space-y-3">
                {data.medications.map((med) => (
                  <MedPharmacistNote key={med.id} med={med} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    )
  }

  // Doctor Visit Prep Modal (Feature 9)
  if (showDoctorPrep) {
    return (
      <main className="min-h-screen flex flex-col bg-background p-6">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => setShowDoctorPrep(false)} className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center"><ArrowLeft className="w-6 h-6" /></button>
          <h1 className="text-2xl font-bold">Doctor Visit Prep</h1>
        </header>
        <div className="bg-card border-2 border-border rounded-2xl p-6 whitespace-pre-wrap leading-relaxed">
          {getDoctorPrepSummary()}
        </div>
        <button onClick={() => window.print()} className="mt-6 w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl">Share or Print</button>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      {/* Header - Only show for non-messaging tabs for a cleaner look */}
      <AnimatePresence mode="wait">
        {activeTab !== 'messages' && (
          <motion.header
            key="main-header"
            className="p-6 pb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-lg">
                  {getGreeting()}, {data.caregiver?.name}
                </p>
                <h1 className="text-2xl font-semibold text-foreground">
                  {data.careReceiver?.name}&apos;s Care
                </h1>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center 
                         hover:bg-secondary/80 active:scale-95 transition-all touch-manipulation
                         focus:outline-none focus:ring-2 focus:ring-sahay-sage"
                aria-label="Settings"
              >
                <Settings className="w-6 h-6 text-foreground" />
              </button>
            </div>

            {/* Status card */}
            <motion.div
              className={`p-5 rounded-2xl glass-card ${allTaken
                ? 'bg-sahay-sage-light/80 border-2 border-sahay-sage/30'
                : 'bg-card/80 border-2 border-border'
                }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              {totalMeds === 0 ? (
                <p className="text-lg text-muted-foreground">
                  No medications added yet
                </p>
              ) : allTaken ? (
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 rounded-full bg-sahay-success/20 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    <Check className="w-5 h-5 text-sahay-success" />
                  </motion.div>
                  <div>
                    <p className="text-lg font-medium text-foreground">
                      Everything looks good today
                    </p>
                    <p className="text-muted-foreground">
                      All {totalMeds} medications taken
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 rounded-full bg-sahay-pending/20 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Clock className="w-5 h-5 text-sahay-pending" />
                  </motion.div>
                  <div>
                    <p className="text-lg font-medium text-foreground">
                      {takenMeds} of {totalMeds} taken today
                    </p>
                    <p className="text-muted-foreground">
                      {totalMeds - takenMeds} pending
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Feature 3: Active Handover Banner */}
      {data.caregiver?.handover?.isActive && (
        <div className="bg-sahay-blue border-b border-sahay-blue/20 p-2 overflow-hidden text-center">
          <p className="text-xs font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2">
            <ArrowLeftRight className="w-3 h-3" />
            Care handed over to {data.caregiver.handover.targetName}
            <button onClick={endHandover} className="ml-2 underline opacity-80 hover:opacity-100">End Now</button>
          </p>
        </div>
      )}

      {/* Scrollable content area */}
      <div className={`flex-1 ${activeTab === 'messages' ? 'overflow-hidden' : 'overflow-y-auto px-6 pb-24 overflow-x-hidden'}`}>

        {/* ═══ HOME TAB ═══ */}
        {activeTab === 'home' && (
          <>
            {/* Add medication button - MOVED TO TOP */}
            <motion.button
              onClick={() => setShowAddForm(true)}
              className="w-full py-4 px-6 mb-6 bg-primary text-primary-foreground text-lg font-semibold 
                       rounded-xl flex items-center justify-center gap-2 shadow-sm touch-manipulation button-interactive
                       focus:outline-none focus:ring-2 focus:ring-sahay-sage"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              Add medication
            </motion.button>

            {/* Feature 4: Help Requested Alert */}
            {data.timeline.find(e => e.type === 'help_requested' && !e.note?.includes('resolved')) && (
              <motion.div
                className="bg-sahay-blue/10 border-2 border-sahay-blue/30 rounded-2xl p-6 mb-6 shadow-lg shadow-sahay-blue/10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-sahay-blue/20 flex items-center justify-center shrink-0">
                    <Heart className="w-7 h-7 text-sahay-blue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-sahay-blue mb-1">
                      Check-in Requested
                    </h3>
                    <p className="text-foreground leading-snug">
                      {data.careReceiver?.name} just tapped &quot;I need help&quot;. No alarm was triggered, but they&apos;d appreciate a check-in.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setShowEmergency(true)} className="flex items-center justify-center gap-2 py-3 px-4 bg-sahay-blue text-white font-bold rounded-xl"><Phone className="w-5 h-5" /> Call</button>
                  <button onClick={() => setActiveTab('messages')} className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary text-foreground font-bold rounded-xl"><MessageCircle className="w-5 h-5" /> Message</button>
                </div>
              </motion.div>
            )}

            {/* Safety Check Escalation Alert */}
            {data.safetyCheck.status === 'escalating' && (
              <motion.div
                className="bg-destructive/10 border-2 border-destructive/30 rounded-2xl p-6 mb-6 shadow-lg shadow-destructive/10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-7 h-7 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-destructive mb-1">
                      Safety Alert: No Response
                    </h3>
                    <p className="text-foreground leading-snug">
                      {data.careReceiver?.name} did not respond to the safety check.
                      Please try to reach them immediately.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowEmergency(true)}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-destructive text-destructive-foreground font-bold rounded-xl"
                  >
                    <Phone className="w-5 h-5" />
                    Call Them
                  </button>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary text-foreground font-bold rounded-xl border-2 border-border"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Message
                  </button>
                </div>
              </motion.div>
            )}

            {/* Medication Streak Counter */}
            {totalMeds > 0 && (
              <motion.div
                className="bg-gradient-to-br from-sahay-sage/10 to-sahay-success/10 rounded-2xl p-5 mb-6 border-2 border-sahay-sage/20 card-interactive"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-bold text-sahay-sage">{data.currentStreak}</h3>
                      <span className="text-lg text-muted-foreground">days</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Best: {data.longestStreak} days
                    </p>
                  </div>
                  <motion.div
                    className="w-16 h-16 rounded-full bg-sahay-success/20 flex items-center justify-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-2xl">🔥</span>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Quick Pill Actions */}
            {totalMeds > 0 && <QuickPillActions />}

            {/* Feature 1: "I'm Fine Today" Status */}
            {data.lastFineCheckIn?.startsWith(new Date().toISOString().split('T')[0]) && (
              <motion.div
                className="bg-sahay-success/10 border-2 border-sahay-success/20 rounded-2xl p-5 mb-6 flex items-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-12 h-12 rounded-full bg-sahay-success/20 flex items-center justify-center">
                  <Smile className="w-6 h-6 text-sahay-success" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{data.careReceiver?.name} checked in</p>
                  <p className="text-muted-foreground">They tapped &quot;I&apos;m fine today&quot; at {new Date(data.lastFineCheckIn!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </motion.div>
            )}

            {/* Refill awareness */}
            {data.medications.some(
              (m) => m.refillDaysLeft !== undefined && m.refillDaysLeft <= 7
            ) && (
                <div className="bg-sahay-pending/10 border-2 border-sahay-pending/30 rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-sahay-pending" />
                    <div>
                      <p className="font-medium text-foreground">
                        Refill may be needed soon
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {data.medications
                          .filter((m) => m.refillDaysLeft !== undefined && m.refillDaysLeft <= 7)
                          .map((m) => m.name)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Medication list grouped by time */}
            {(Object.keys(timeOfDayLabels) as TimeOfDay[]).map((timeOfDay) => {
              const meds = groupedMeds[timeOfDay]
              if (meds.length === 0) return null

              const Icon = timeIcons[timeOfDay]
              const isCurrent = timeOfDay === currentTimeOfDay

              return (
                <section key={timeOfDay} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon
                      className={`w-5 h-5 ${isCurrent ? 'text-sahay-sage' : 'text-muted-foreground'}`}
                      strokeWidth={1.5}
                    />
                    <h2
                      className={`text-lg font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      {timeOfDayLabels[timeOfDay]}
                    </h2>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-sahay-sage-light text-sahay-sage rounded-full">
                        Now
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {meds.map((med, idx) => (
                      <motion.button
                        key={med.id}
                        onClick={() => setEditingMed(med)}
                        className="w-full p-4 bg-card rounded-xl border-2 border-border 
                                 hover:border-sahay-sage/50 active:bg-sahay-sage/5 text-left
                                 touch-manipulation button-interactive focus:outline-none focus:ring-2 focus:ring-sahay-sage"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05, duration: 0.4 }}
                        whileHover={{ x: 4, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <motion.div
                              className={`w-8 h-8 rounded-full flex items-center justify-center
                                        ${med.taken ? 'bg-sahay-success/20' : 'bg-sahay-pending/20'}`}
                              animate={med.taken ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {med.taken ? (
                                <motion.div
                                  animate={{ scale: [0, 1] }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <Check className="w-4 h-4 text-sahay-success" />
                                </motion.div>
                              ) : (
                                <Clock className="w-4 h-4 text-sahay-pending" />
                              )}
                            </motion.div>
                            <div>
                              <p className={`text-lg font-medium ${med.taken ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                {med.name}
                              </p>
                              <p className="text-muted-foreground flex items-center gap-1.5 flex-wrap">
                                <span>{med.dosage}</span>
                                {med.time && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                    <span className="flex items-center gap-1 text-sahay-blue font-medium">
                                      <Clock className="w-3 h-3" />
                                      {med.time}
                                    </span>
                                  </>
                                )}
                                {med.notes && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                    <span>{med.notes}</span>
                                  </>
                                )}
                              </p>
                              <motion.p
                                className="text-xs font-medium mt-1 flex items-center gap-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                {med.streak && med.streak > 0 ? (
                                  <span className="text-sahay-success">🔥 {med.streak} day streak</span>
                                ) : (
                                  <span className="text-muted-foreground italic">No streak yet 🔥</span>
                                )}
                              </motion.p>
                            </div>
                          </div>
                          <motion.div
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </motion.div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </section>
              )
            })}

            {totalMeds === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  Add your first medication to get started
                </p>
              </div>
            )}

            {/* Daily closure ritual */}
            {totalMeds > 0 && (
              <div className="mt-6 mb-8">
                <DailyClosure />
              </div>
            )}
          </>
        )}

        {/* ═══ ACTIVITY TAB ═══ */}
        {activeTab === 'activity' && (
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Activity & Insights</h2>

            {/* Pattern Insights - inline */}
            {getHumanInsights().length > 0 && (
              <div className="space-y-3 mb-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Daily Insights</h3>
                {getHumanInsights().map((insight, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-card border-2 border-border rounded-2xl p-5 flex items-start gap-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-sahay-warm/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-sahay-warm" />
                    </div>
                    <p className="text-lg font-medium text-foreground leading-snug pt-1">{insight}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Gentle check-in */}
            <GentleCheckIn />

            {/* Care confidence */}
            {totalMeds > 0 && (
              <motion.div
                className="mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CareConfidence />
              </motion.div>
            )}

            {/* Activity action cards */}
            {[
              { label: 'Care Timeline', desc: 'Full history of care events', icon: BookOpen, bgColor: 'bg-sahay-sage/10', iconColor: 'text-sahay-sage', action: () => setShowTimeline(true) },
              { label: 'Analytics', desc: 'Charts, trends & patterns', icon: BarChart3, bgColor: 'bg-sahay-blue/10', iconColor: 'text-sahay-blue', action: () => setShowAnalytics(true) },
              { label: 'Wellness Log', desc: 'Track how they\'re feeling', icon: Heart, bgColor: 'bg-sahay-success/10', iconColor: 'text-sahay-success', action: () => setShowWellness(true) },
              { label: 'Medication History', desc: 'Past medications & changes', icon: History, bgColor: 'bg-sahay-blue/10', iconColor: 'text-sahay-blue', action: () => setShowHistory(true) },
            ].map((item, idx) => (
              <motion.button
                key={item.label}
                onClick={item.action}
                className="w-full p-4 bg-card border-2 border-border rounded-2xl flex items-center justify-between group
                         hover:border-border/80 active:scale-[0.98] transition-all touch-manipulation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${item.bgColor} flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-semibold text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </motion.button>
            ))}
          </div>
        )}

        {/* ═══ CARE TAB ═══ */}
        {activeTab === 'care' && (
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Care Tools</h2>

            {/* Care action cards */}
            {[
              { label: 'Contextual Notes', desc: 'Quick notes about care', icon: FileText, bgColor: 'bg-sahay-warm/10', iconColor: 'text-sahay-warm', action: () => setShowNotes(true) },
              { label: 'Care Roles', desc: 'Manage who helps with care', icon: Users, bgColor: 'bg-sahay-blue/10', iconColor: 'text-sahay-blue', action: () => setShowRoleStatus(true) },
              { label: 'Emergency Contacts', desc: 'Quick-dial important numbers', icon: Phone, bgColor: 'bg-destructive/10', iconColor: 'text-destructive', action: () => setShowEmergency(true) },
              { label: 'Pharmacist', desc: 'Pharmacist info & med notes', icon: Pill, bgColor: 'bg-sahay-blue/10', iconColor: 'text-sahay-blue', action: () => setShowPharmacist(true) },
              { label: 'Doctor Visit Prep', desc: 'Summary for your next visit', icon: BookOpen, bgColor: 'bg-sahay-sage/10', iconColor: 'text-sahay-sage', action: () => setShowDoctorPrep(true) },
            ].map((item, idx) => (
              <motion.button
                key={item.label}
                onClick={item.action}
                className="w-full p-4 bg-card border-2 border-border rounded-2xl flex items-center justify-between group
                         hover:border-border/80 active:scale-[0.98] transition-all touch-manipulation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${item.bgColor} flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-semibold text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </motion.button>
            ))}

            {/* Handover section - inline */}
            <div className="mt-4">
              <motion.button
                onClick={() => setShowHandoverSetup(!showHandoverSetup)}
                className="w-full p-4 bg-sahay-blue/5 border-2 border-sahay-blue/20 rounded-2xl flex items-center justify-between group"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-sahay-blue/10 flex items-center justify-center">
                    <ArrowLeftRight className="w-5 h-5 text-sahay-blue" />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-semibold text-foreground">Temporary Handover</p>
                    <p className="text-sm text-muted-foreground">Let someone else handle care</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${showHandoverSetup ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
              </motion.button>

              <AnimatePresence>
                {showHandoverSetup && (
                  <motion.div
                    className="bg-card border-2 border-border rounded-2xl p-5 mt-3 overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <h4 className="text-lg font-bold mb-4">Handover Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Trusted Person&apos;s Name</label>
                        <input
                          type="text"
                          value={handoverName}
                          onChange={(e) => setHandoverName(e.target.value)}
                          placeholder="e.g., Sibling Name"
                          className="w-full p-3 bg-secondary rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-sahay-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">For how many days?</label>
                        <select
                          value={handoverDays}
                          onChange={(e) => setHandoverDays(e.target.value)}
                          className="w-full p-3 bg-secondary rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-sahay-blue"
                        >
                          <option value="3">3 days</option>
                          <option value="5">5 days</option>
                          <option value="7">1 week</option>
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          const date = new Date();
                          date.setDate(date.getDate() + parseInt(handoverDays));
                          startHandover(handoverName, date.toISOString());
                          setShowHandoverSetup(false);
                        }}
                        disabled={!handoverName}
                        className="w-full py-4 bg-sahay-blue text-white font-bold rounded-xl disabled:opacity-50 active:scale-[0.97] transition-all"
                      >
                        Confirm Handover
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ═══ MESSAGES TAB ═══ */}
        {activeTab === 'messages' && (
          <div className="h-full">
            <Messages onClose={() => setActiveTab('home')} />
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <CaregiverBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
        }}
        unreadMessages={unreadMessages}
      />
    </main>
  )
}

