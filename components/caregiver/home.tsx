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

/**
 * Caregiver Home Screen
 * Passive overview of today's medication status
 * Features: medication list grouped by time, add/edit/remove, calm status indicators
 */
export function CaregiverHome() {
  const {
    data,
    getUnreadCount,
    switchRole,
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
  const [showHandoverSetup, setShowHandoverSetup] = useState(false)
  const [handoverName, setHandoverName] = useState('')
  const [handoverDays, setHandoverDays] = useState('3')

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
      {/* Header */}
      <motion.header
        className="p-6 pb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
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
                     hover:bg-secondary/80 transition-colors touch-manipulation
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
      <div className="flex-1 overflow-y-auto px-6 pb-24">
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
              <button onClick={() => setShowMessages(true)} className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary text-foreground font-bold rounded-xl"><MessageCircle className="w-5 h-5" /> Message</button>
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
                onClick={() => setShowMessages(true)}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary text-foreground font-bold rounded-xl border-2 border-border"
              >
                <MessageCircle className="w-5 h-5" />
                Message
              </button>
            </div>
          </motion.div>
        )}

        {/* Medication Streak Counter - NEW FEATURE */}
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

        {/* Quick Pill Actions - NEW FEATURE */}
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

        {/* Feature 2: Pattern Insights */}
        {getHumanInsights().length > 0 && (
          <div className="space-y-3 mb-6">
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

        {/* Gentle check-in suggestion */}
        <GentleCheckIn />

        {/* Care confidence indicator */}
        {totalMeds > 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CareConfidence />
          </motion.div>
        )}

        {/* Quick actions - row 1 */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          <motion.button
            onClick={() => setShowTimeline(true)}
            className="p-3 bg-card border-2 border-border rounded-xl flex flex-col items-center gap-1.5
                     hover:border-sahay-sage/50 active:bg-sahay-sage/5 transition-all touch-manipulation button-interactive
                     focus:outline-none focus:ring-2 focus:ring-ring stagger-item-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <BookOpen className="w-5 h-5 text-sahay-sage" />
            </motion.div>
            <span className="text-xs font-medium text-foreground">Timeline</span>
          </motion.button>
          <motion.button
            onClick={() => setShowAnalytics(true)}
            className="p-3 bg-card border-2 border-border rounded-xl flex flex-col items-center gap-1.5
                     hover:border-sahay-blue/50 active:bg-sahay-blue/5 transition-all touch-manipulation button-interactive
                     focus:outline-none focus:ring-2 focus:ring-ring stagger-item-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
            >
              <BarChart3 className="w-5 h-5 text-sahay-blue" />
            </motion.div>
            <span className="text-xs font-medium text-foreground">Insights</span>
          </motion.button>
          <motion.button
            onClick={() => setShowMessages(true)}
            className="p-3 bg-card border-2 border-border rounded-xl flex flex-col items-center gap-1.5
                     hover:border-sahay-warm/50 active:bg-sahay-warm/5 transition-all touch-manipulation button-interactive relative
                     focus:outline-none focus:ring-2 focus:ring-ring stagger-item-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
            >
              <MessageCircle className="w-5 h-5 text-sahay-warm" />
            </motion.div>
            <span className="text-xs font-medium text-foreground">Messages</span>
            {unreadMessages > 0 && (
              <motion.span
                className="absolute top-2 right-2 w-5 h-5 bg-sahay-sage text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {unreadMessages}
              </motion.span>
            )}
          </motion.button>
          <motion.button
            onClick={() => setShowWellness(true)}
            className="p-3 bg-card border-2 border-border rounded-xl flex flex-col items-center gap-1.5
                     hover:border-sahay-success/50 active:bg-sahay-success/5 transition-all touch-manipulation button-interactive
                     focus:outline-none focus:ring-2 focus:ring-ring stagger-item-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            >
              <Heart className="w-5 h-5 text-sahay-success" />
            </motion.div>
            <span className="text-xs font-medium text-foreground">Wellness</span>
          </motion.button>
        </div>

        {/* Quick actions - row 2 */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <motion.button
            onClick={() => setShowRoleStatus(true)}
            className="p-3 bg-card border-2 border-border rounded-xl flex flex-col items-center gap-1.5
                     hover:border-sahay-blue/50 active:bg-sahay-blue/5 transition-all touch-manipulation button-interactive
                     focus:outline-none focus:ring-2 focus:ring-ring stagger-item-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users className="w-5 h-5 text-sahay-blue" />
            <span className="text-xs font-medium text-foreground">Roles</span>
          </motion.button>
          <motion.button
            onClick={() => setShowNotes(true)}
            className="p-3 bg-card border-2 border-border rounded-xl flex flex-col items-center gap-1.5
                     hover:border-sahay-warm/50 active:bg-sahay-warm/5 transition-all touch-manipulation button-interactive
                     focus:outline-none focus:ring-2 focus:ring-ring stagger-item-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FileText className="w-5 h-5 text-sahay-warm" />
            <span className="text-xs font-medium text-foreground">Notes</span>
          </motion.button>
          <motion.button
            onClick={() => setShowEmergency(true)}
            className="p-3 bg-card border-2 border-border rounded-xl flex flex-col items-center gap-1.5
                     hover:border-destructive/50 active:bg-destructive/5 transition-all touch-manipulation button-interactive
                     focus:outline-none focus:ring-2 focus:ring-ring stagger-item-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Phone className="w-5 h-5 text-destructive" />
            <span className="text-xs font-medium text-foreground">Emergency</span>
          </motion.button>
          <motion.button
            onClick={() => setShowHistory(true)}
            className="p-3 bg-card border-2 border-border rounded-xl flex flex-col items-center gap-1.5
                     hover:border-sahay-blue/50 active:bg-sahay-blue/5 transition-all touch-manipulation button-interactive
                     focus:outline-none focus:ring-2 focus:ring-ring stagger-item-5"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <History className="w-5 h-5 text-sahay-blue" />
            <span className="text-xs font-medium text-foreground">History</span>
          </motion.button>
        </div>

        {/* Feature 9: Doctor Visit Prep Button */}
        <motion.button
          onClick={() => setShowDoctorPrep(true)}
          className="w-full py-4 px-5 bg-sahay-sage-light/30 border-2 border-sahay-sage/20 rounded-2xl mb-3 flex items-center justify-between group overflow-hidden relative"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <BookOpen className="w-6 h-6 text-sahay-sage" />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-foreground">Prepare for Doctor Visit</p>
              <p className="text-sm text-muted-foreground">See key routine patterns and notes</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-sahay-sage/5 rounded-full -mr-16 -mt-16" />
        </motion.button>

        {/* Feature 3: Handover Button */}
        <motion.button
          onClick={() => setShowHandoverSetup(!showHandoverSetup)}
          className="w-full py-4 px-5 bg-sahay-blue/10 border-2 border-sahay-blue/20 rounded-2xl mb-6 flex items-center justify-between group overflow-hidden relative"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <ArrowLeftRight className="w-6 h-6 text-sahay-blue" />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-foreground">Temporary Handover</p>
              <p className="text-sm text-muted-foreground">Let someone else handle care for a few days</p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${showHandoverSetup ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
        </motion.button>

        {/* Handover Setup Panel */}
        <AnimatePresence>
          {showHandoverSetup && (
            <motion.div
              className="bg-card border-2 border-border rounded-2xl p-5 mb-6 overflow-hidden"
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
                  className="w-full py-4 bg-sahay-blue text-white font-bold rounded-xl disabled:opacity-50"
                >
                  Confirm Handover
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Switch role button - moved to its own row */}
        <motion.button
          onClick={switchRole}
          className="w-full py-3 px-4 bg-card border-2 border-border rounded-xl flex items-center justify-center gap-2
                   hover:border-muted-foreground/50 active:bg-muted/10 transition-all touch-manipulation button-interactive
                   focus:outline-none focus:ring-2 focus:ring-ring mb-6"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Switch to {data.careReceiver?.name}&apos;s View</span>
        </motion.button>

        {/* Refill awareness - show if any meds need refill soon */}
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
                      .filter(
                        (m) =>
                          m.refillDaysLeft !== undefined && m.refillDaysLeft <= 7
                      )
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
                          <p className="text-muted-foreground">
                            {med.dosage}
                            {med.notes && ` · ${med.notes}`}
                          </p>
                          {med.streak && med.streak > 0 && (
                            <motion.p
                              className="text-xs text-sahay-success font-medium mt-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              🔥 {med.streak} day streak
                            </motion.p>
                          )}
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
          <div className="mt-6">
            <DailyClosure />
          </div>
        )}
      </div>

      {/* Floating add button */}
      <div className="fixed bottom-6 left-0 right-0 px-6">
        <div className="max-w-md mx-auto">
          <motion.button
            onClick={() => setShowAddForm(true)}
            className="w-full py-4 px-6 bg-primary text-primary-foreground text-lg font-semibold 
                     rounded-xl flex items-center justify-center gap-2 shadow-lg touch-manipulation button-interactive
                     focus:outline-none focus:ring-2 focus:ring-sahay-sage focus:ring-offset-2"
            whileHover={{ scale: 1.05, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)' }}
            whileTap={{ scale: 0.98 }}
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: [0, 90, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Plus className="w-5 h-5" />
            </motion.div>
            Add medication
          </motion.button>
        </div>
      </div>
    </main>
  )
}
