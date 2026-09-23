"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSahay } from "@/lib/sahay-context";
import {
  type TimeOfDay,
  type Medication,
  timeOfDayLabels,
  getCurrentTimeOfDay,
  formatTime12h,
  calculateConfidence,
  getConfidenceMessage,
} from "@/lib/types";
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
  AlertTriangle,
  X,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { getOverdueMeds, type OverdueMedInfo } from "@/lib/overdue-utils";

import { MedicationForm } from "@/components/caregiver/medication-form";
import { SettingsPanel } from "@/components/caregiver/settings-panel";
import { CareTimeline } from "@/components/caregiver/care-timeline";
import { GentleCheckIn } from "@/components/caregiver/gentle-check-in";
import { CareConfidence } from "@/components/caregiver/care-confidence";
import { DailyClosure } from "@/components/caregiver/daily-closure";
import { RoleStatus } from "@/components/caregiver/role-status";
import { ContextualNotes } from "@/components/caregiver/contextual-notes";
import { AnalyticsDashboard } from "@/components/caregiver/analytics-dashboard";
import { EmergencyContacts } from "@/components/caregiver/emergency-contacts";
import { Messages } from "@/components/caregiver/messages";
import { WellnessOverview } from "@/components/caregiver/wellness-overview";
import { MedicationHistory } from "@/components/caregiver/medication-history";
import { QuickPillActions } from "@/components/caregiver/quick-pill-actions";
import { CaregiverBottomNav } from "@/components/caregiver/bottom-nav";

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
    resolveHelpRequest,
    sendMessage,
  } = useSahay();

  const router = useRouter();
  const pathname = usePathname();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showRoleStatus, setShowRoleStatus] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showWellness, setShowWellness] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDoctorPrep, setShowDoctorPrep] = useState(false);
  const [showPharmacist, setShowPharmacist] = useState(false);

  const unreadMessages = getUnreadCount();
  const currentTimeOfDay = getCurrentTimeOfDay();

  // Overdue Medicine Escalation State
  const [acknowledgedOverdueMeds, setAcknowledgedOverdueMeds] = useState<Record<string, string>>({});
  const [sentReminders, setSentReminders] = useState<Record<string, boolean>>({});
  const [simulateOverdue, setSimulateOverdue] = useState(false);
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Hydrate acknowledged overdue meds from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sahay_acknowledged_overdue");
      if (stored) {
        setAcknowledgedOverdueMeds(JSON.parse(stored));
      }
    } catch {
      // Local storage unavailable or failed
    }
  }, []);

  const overdueMeds: OverdueMedInfo[] = useMemo(() => {
    const detected = getOverdueMeds(data.medications).filter(
      (item) => acknowledgedOverdueMeds[item.medication.id] !== todayStr
    );
    if (detected.length === 0 && simulateOverdue) {
      if (acknowledgedOverdueMeds["simulated_overdue_pill"] !== todayStr) {
        return [
          {
            medication: {
              id: "simulated_overdue_pill",
              name: "Metformin",
              dosage: "500 mg",
              timeOfDay: "morning",
              time: "08:00",
              taken: false,
              lastUpdated: new Date().toISOString(),
            },
            scheduledMinutes: 8 * 60,
            scheduledTimeFormatted: "8:00 AM",
            delayMinutes: 45,
            delayFormatted: "45m late",
          },
        ];
      }
    }
    return detected;
  }, [data.medications, acknowledgedOverdueMeds, todayStr, simulateOverdue]);

  const handleSendReminder = async (item: OverdueMedInfo) => {
    const medName = item.medication.name;
    const careReceiverName = data.careReceiver?.name || "there";
    const text = `Hi ${careReceiverName}, gentle reminder to take your ${medName} (${item.medication.dosage}) when you can! ❤️`;
    await sendMessage(text, true);
    setSentReminders((prev) => ({ ...prev, [item.medication.id]: true }));
  };

  const handleDismissOverdueAlert = () => {
    setIsAlertDismissed(true);
    setSimulateOverdue(false);
    setAcknowledgedOverdueMeds((prev) => {
      const updated = { ...prev };
      overdueMeds.forEach((item) => {
        updated[item.medication.id] = todayStr;
      });
      updated["simulated_overdue_pill"] = todayStr;
      try {
        localStorage.setItem("sahay_acknowledged_overdue", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const groupedMeds: Record<TimeOfDay, Medication[]> = useMemo(() => {
    const grouped: Record<TimeOfDay, Medication[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };
    data.medications.forEach((med) => {
      if (grouped[med.timeOfDay]) {
        grouped[med.timeOfDay].push(med);
      }
    });
    return grouped;
  }, [data.medications]);

  const totalMeds = data.medications.length;
  const takenMeds = data.medications.filter((m) => m.taken).length;
  const allTaken = totalMeds > 0 && takenMeds === totalMeds;

  const timeIcons: Record<TimeOfDay, any> = {
    morning: Sun,
    afternoon: Cloud,
    evening: Moon,
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading || isDataLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  if (showAddForm || editingMed) {
    return (
      <MedicationForm
        medication={editingMed}
        onClose={() => {
          setShowAddForm(false);
          setEditingMed(null);
        }}
      />
    );
  }
  if (showSettings)
    return <SettingsPanel onClose={() => setShowSettings(false)} />;
  if (showTimeline)
    return <CareTimeline onClose={() => setShowTimeline(false)} />;
  if (showRoleStatus)
    return <RoleStatus onClose={() => setShowRoleStatus(false)} />;
  if (showNotes) return <ContextualNotes onClose={() => setShowNotes(false)} />;
  if (showAnalytics)
    return <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />;
  if (showEmergency)
    return <EmergencyContacts onClose={() => setShowEmergency(false)} />;
  if (showWellness)
    return <WellnessOverview onClose={() => setShowWellness(false)} />;
  if (showHistory)
    return <MedicationHistory onClose={() => setShowHistory(false)} />;

  return (
    <main className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      <header className="p-6 pb-4 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-lg">
            {getGreeting()}, {data.caregiver?.name}
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            {data.careReceiver?.name}'s Care
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsAlertDismissed(false);
              setSimulateOverdue((prev) => {
                const next = !prev;
                if (next) {
                  setAcknowledgedOverdueMeds((curr) => {
                    const copy = { ...curr };
                    delete copy["simulated_overdue_pill"];
                    return copy;
                  });
                }
                return next;
              });
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 active:scale-95 ${
              simulateOverdue
                ? "bg-amber-500 text-slate-950 border-amber-600 shadow-sm"
                : "bg-secondary text-muted-foreground border-border hover:text-foreground"
            }`}
            title="Toggle simulated overdue dose alert to test it"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>{simulateOverdue ? "Overdue Active" : "Simulate Overdue"}</span>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 active:scale-95 transition-all"
            aria-label="Settings"
          >
            <Settings className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </header>

      {data.caregiver?.handover?.isActive && (
        <div className="bg-sahay-blue border-b border-sahay-blue/20 p-2 overflow-hidden text-center">
          <p className="text-xs font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2">
            <ArrowLeftRight className="w-3 h-3" />
            Care handed over to {data.caregiver.handover.targetName}
            <button
              onClick={endHandover}
              className="ml-2 underline opacity-80 hover:opacity-100"
            >
              End Now
            </button>
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

        {/* Proactive Overdue Medicine Alert Banner */}
        {!isAlertDismissed && overdueMeds.length > 0 && (
          <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-5 mb-6 shadow-lg shadow-amber-500/10">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      Overdue Medicine Alert
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      {overdueMeds.length} pending
                    </span>
                  </div>
                  <button
                    onClick={handleDismissOverdueAlert}
                    className="p-1 rounded-lg hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-colors"
                    title="Dismiss alert"
                    aria-label="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-1 space-y-1">
                  {overdueMeds.map((item) => (
                    <p key={item.medication.id} className="text-sm text-foreground">
                      <strong>{item.medication.name}</strong> ({item.medication.dosage}) was scheduled for {item.scheduledTimeFormatted} — <span className="font-bold text-amber-600 dark:text-amber-400">{item.delayFormatted}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <button
                onClick={() => setShowEmergency(true)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm transition-all"
              >
                <Phone className="w-4 h-4" /> Call {data.careReceiver?.name || "Them"}
              </button>
              <button
                onClick={() => handleSendReminder(overdueMeds[0])}
                disabled={sentReminders[overdueMeds[0]?.medication.id]}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-secondary hover:bg-secondary/80 text-foreground font-semibold rounded-xl text-sm transition-all border border-border"
              >
                <MessageCircle className="w-4 h-4" />
                {sentReminders[overdueMeds[0]?.medication.id] ? "Sent ✓" : "Send Reminder"}
              </button>
            </div>

            <button
              onClick={handleDismissOverdueAlert}
              className="w-full py-2 px-3 bg-background/80 hover:bg-background border border-amber-500/30 text-amber-700 dark:text-amber-300 font-medium rounded-xl text-xs transition-all text-center"
            >
              ✓ Acknowledge & Dismiss Alert for Today
            </button>
          </div>
        )}

        {data.timeline.find(
          (e) => e.type === "help_requested" && !e.note?.includes("resolved"),
        ) && (
          <div className="bg-sahay-blue/10 border-2 border-sahay-blue/30 rounded-2xl p-6 mb-6 shadow-lg shadow-sahay-blue/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-sahay-blue/20 flex items-center justify-center shrink-0">
                <Heart className="w-7 h-7 text-sahay-blue" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-sahay-blue mb-1">
                  Check-in Requested
                </h3>
                <p className="text-foreground">
                  {data.careReceiver?.name} just tapped "I need help".
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={() => setShowEmergency(true)}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-sahay-blue text-white font-bold rounded-xl"
              >
                <Phone className="w-5 h-5" /> Call
              </button>
              <button
                onClick={() => router.push("/caregiver/messages")}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary text-foreground font-bold rounded-xl"
              >
                <MessageCircle className="w-5 h-5" /> Message
              </button>
            </div>
            <button
              onClick={() => resolveHelpRequest()}
              className="w-full py-2.5 px-4 bg-background border border-sahay-blue/40 text-sahay-blue hover:bg-sahay-blue/10 font-semibold rounded-xl text-sm transition-all"
            >
              ✓ Mark as Handled & Dismiss
            </button>
          </div>
        )}

        {data.safetyCheck.status === "escalating" && (
          <div className="bg-destructive/10 border-2 border-destructive/30 rounded-2xl p-6 mb-6 shadow-lg shadow-destructive/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-7 h-7 text-destructive" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-destructive mb-1">
                  Safety Alert: No Response
                </h3>
                <p className="text-foreground">
                  {data.careReceiver?.name} did not respond to the safety check.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowEmergency(true)}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-destructive text-destructive-foreground font-bold rounded-xl"
              >
                <Phone className="w-5 h-5" /> Call Them
              </button>
              <button
                onClick={() => router.push("/caregiver/messages")}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary text-foreground font-bold rounded-xl border-2 border-border"
              >
                <MessageCircle className="w-5 h-5" /> Message
              </button>
            </div>
          </div>
        )}

        {totalMeds > 0 && (
          <div className="bg-gradient-to-br from-sahay-sage/10 to-sahay-success/10 rounded-2xl p-5 mb-6 border-2 border-sahay-sage/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Current Streak
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-sahay-sage">
                    {data.currentStreak}
                  </h3>
                  <span className="text-lg text-muted-foreground">days</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-sahay-success/20 flex items-center justify-center text-2xl">
                🔥
              </div>
            </div>
          </div>
        )}

        <QuickPillActions />

        {data.lastFineCheckIn?.startsWith(
          new Date().toISOString().split("T")[0],
        ) && (
          <div className="bg-sahay-success/10 border-2 border-sahay-success/20 rounded-2xl p-5 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sahay-success/20 flex items-center justify-center">
              <Smile className="w-6 h-6 text-sahay-success" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {data.careReceiver?.name} checked in
              </p>
              <p className="text-muted-foreground">
                They tapped "I'm fine today" at{" "}
                {new Date(data.lastFineCheckIn!).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {(Object.keys(timeOfDayLabels) as TimeOfDay[]).map((time) => {
            const meds = groupedMeds[time];
            if (meds.length === 0) return null;
            const Icon = timeIcons[time];
            return (
              <section key={time} className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-lg font-medium text-muted-foreground">
                    {timeOfDayLabels[time]}
                  </h2>
                </div>
                <div className="space-y-2">
                  {meds.map((med) => {
                    const overdueInfo = overdueMeds.find((o) => o.medication.id === med.id);
                    return (
                      <button
                        key={med.id}
                        onClick={() => setEditingMed(med)}
                        className={`w-full p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all ${
                          overdueInfo
                            ? "bg-amber-500/5 border-amber-500/40"
                            : "bg-card border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              med.taken
                                ? "bg-sahay-success/20"
                                : overdueInfo
                                  ? "bg-amber-500/20 animate-pulse"
                                  : "bg-sahay-pending/20"
                            }`}
                          >
                            {med.taken ? (
                              <Check className="w-4 h-4 text-sahay-success" />
                            ) : overdueInfo ? (
                              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            ) : (
                              <Clock className="w-4 h-4 text-sahay-pending" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p
                                className={`text-lg font-medium ${
                                  med.taken
                                    ? "text-muted-foreground line-through"
                                    : "text-foreground"
                                }`}
                              >
                                {med.name}
                              </p>
                              {overdueInfo && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse">
                                  {overdueInfo.delayFormatted}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {med.dosage} •{" "}
                              {med.time ? formatTime12h(med.time) : ""}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-6 mb-8">
          <DailyClosure />
        </div>
      </div>

      <CaregiverBottomNav unreadMessages={unreadMessages} />
    </main>
  );
}
