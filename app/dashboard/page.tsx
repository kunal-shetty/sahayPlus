"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { useSahay } from "@/lib/sahay-context";
import {
  type TimeOfDay,
  type Medication,
  timeOfDayLabels,
  formatTime12h,
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
  AlertTriangle,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getOverdueMeds, type OverdueMedInfo } from "@/lib/overdue-utils";
import { cn } from "@/lib/utils";
import {
  playCaregiverEmergencySiren,
  stopCaregiverEmergencySiren,
} from "@/lib/audio-chime";

import { MedicationForm } from "@/components/caregiver/medication-form";
import { SettingsPanel } from "@/components/caregiver/settings-panel";
import { CareConfidence } from "@/components/caregiver/care-confidence";
import { DailyClosure } from "@/components/caregiver/daily-closure";
import { CaregiverLayout } from "@/components/caregiver/caregiver-layout";
import { VoiceInput } from "@/components/caregiver/voice-input";

/**
 * Caregiver Responsive Dashboard
 * A high-level oversight view that works on both desktop and mobile.
 */
export default function DashboardPage() {
  const {
    data,
    isLoading,
    isDataLoading,
    sendMessage,
    getTodayWellness,
    getHumanInsights,
    resolveHelpRequest,
  } = useSahay();

  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Overdue Medicine Escalation State
  const [acknowledgedOverdueMeds, setAcknowledgedOverdueMeds] = useState<Record<string, string>>({});
  const [sentReminders, setSentReminders] = useState<Record<string, boolean>>({});
  const [simulateOverdue, setSimulateOverdue] = useState(false);
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);

  // Morning Wellness Escalation State
  const [simulateMissingWellness, setSimulateMissingWellness] = useState(false);
  const [acknowledgedMissingWellness, setAcknowledgedMissingWellness] = useState(false);
  const [sentWellnessReminder, setSentWellnessReminder] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const todayWellness = getTodayWellness();

  // Determine if morning wellness check-in is overdue (after 9:45 AM — 15 min grace after 9:30 AM reminder) and missing
  const isWellnessOverdue = useMemo(() => {
    if (acknowledgedMissingWellness) return false;
    if (simulateMissingWellness) return true;
    if (todayWellness) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const thresholdMinutes = 9 * 60 + 45; // 9:45 AM (9:30 AM + 15 min grace period)
    return currentMinutes >= thresholdMinutes;
  }, [acknowledgedMissingWellness, simulateMissingWellness, todayWellness]);

  const handleSendWellnessReminder = async () => {
    const careReceiverName = data.careReceiver?.name || "Dad";
    const text = `Hi ${careReceiverName}, just checking in to see how you're feeling today! Hope you have a wonderful morning ❤️`;
    await sendMessage(text, true);
    setSentWellnessReminder(true);
  };

  const handleDismissWellnessAlert = () => {
    setAcknowledgedMissingWellness(true);
    setSimulateMissingWellness(false);
  };

  // Emergency SOS Siren State & Auto-Play (Module 6 Requirement)
  const [isSirenMuted, setIsSirenMuted] = useState(false);
  const activeHelpEvent = useMemo(() => {
    return data.timeline.find(
      (e) => e.type === "help_requested" && !e.note?.includes("resolved")
    );
  }, [data.timeline]);

  useEffect(() => {
    if (activeHelpEvent && !isSirenMuted) {
      playCaregiverEmergencySiren();
    } else {
      stopCaregiverEmergencySiren();
    }
    return () => {
      stopCaregiverEmergencySiren();
    };
  }, [activeHelpEvent, isSirenMuted]);

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

  const timeIcons: Record<TimeOfDay, any> = {
    morning: Sun,
    afternoon: Cloud,
    evening: Moon,
  };

  if (isLoading || isDataLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Dashboard...
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

  return (
    <CaregiverLayout>
      <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8">
        {/* Top Navigation Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-border gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {data.careReceiver?.name}'s Health Dashboard
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Caregiver View •{" "}
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-xs md:text-sm font-medium">
              <Activity className="w-4 h-4 text-sahay-success" />
              <span>System Status: Nominal</span>
            </div>
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
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>{simulateOverdue ? "Overdue Active" : "Simulate Overdue"}</span>
            </button>
            <button
              onClick={() => {
                setAcknowledgedMissingWellness(false);
                setSentWellnessReminder(false);
                setSimulateMissingWellness((prev) => !prev);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 active:scale-95 ${
                simulateMissingWellness
                  ? "bg-orange-500 text-slate-950 border-orange-600 shadow-sm"
                  : "bg-secondary text-muted-foreground border-border hover:text-foreground"
              }`}
              title="Toggle simulated missing morning wellness check-in alert"
            >
              <Smile className="w-4 h-4 text-orange-500" />
              <span>{simulateMissingWellness ? "Missing Wellness Active" : "Simulate Missing Check-in"}</span>
            </button>
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
                  <h2 className="text-xl font-bold">
                    {data.careReceiver?.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">Care Receiver</p>
                </div>
              </div>
              <div className="space-y-4">
                <CareConfidence />
                <div className="pt-4 border-t border-border flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current Streak</span>
                  <span className="font-bold text-sahay-success flex items-center gap-1">
                    🔥 {data.currentStreak} days
                  </span>
                </div>
              </div>
            </section>

            <section className="bg-primary text-primary-foreground rounded-3xl p-6 shadow-lg shadow-primary/20">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Quick Action
              </h3>
              <div className="space-y-4">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-3 px-4 bg-white text-primary font-bold rounded-xl hover:bg-opacity-90 transition-all active:scale-95 shadow-md"
                >
                  Add Medication
                </button>
                <div className="pt-4 border-t border-white/20 flex flex-col items-center gap-2">
                  <p className="text-xs font-medium text-white/80 uppercase tracking-wider">
                    Voice Recording
                  </p>
                  <VoiceInput />
                </div>
              </div>
            </section>
          </div>

          {/* CENTER COLUMN: Today's Care Checklist & Alerts */}
          <div className="col-span-1 lg:col-span-6 space-y-8 order-1 lg:order-2">
            {/* Urgent Alerts Area */}
            <div className="space-y-4">
              {/* Overdue Medicine Alert Banner */}
              {!isAlertDismissed && overdueMeds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-amber-500 text-slate-950 rounded-3xl p-5 md:p-6 shadow-xl shadow-amber-500/20 border-l-8 border-amber-800 overflow-hidden flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-7 h-7 text-amber-950" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-extrabold text-slate-950">
                            Overdue Medicine Alert
                          </h3>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-950 text-white">
                            {overdueMeds.length} pending
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-900/80 mt-0.5">
                          Action required to ensure consistent adherence
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDismissOverdueAlert}
                      className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-slate-950 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                      title="Dismiss alert"
                      aria-label="Dismiss alert"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1 text-sm text-slate-950 bg-black/5 rounded-2xl p-3 border border-black/5">
                    {overdueMeds.map((item) => (
                      <p key={item.medication.id} className="leading-snug">
                        <strong>{item.medication.name}</strong> ({item.medication.dosage}) was scheduled for {item.scheduledTimeFormatted} —{" "}
                        <span className="font-bold underline text-amber-950">{item.delayFormatted}</span>
                      </p>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-black/10">
                    <button
                      onClick={() => router.push("/caregiver/emergency")}
                      className="px-4 py-2 bg-slate-950 text-white font-bold rounded-xl hover:bg-slate-900 transition-all flex items-center gap-2 text-sm shadow-md active:scale-95"
                    >
                      <Phone className="w-4 h-4" /> Call
                    </button>
                    <button
                      onClick={() => handleSendReminder(overdueMeds[0])}
                      disabled={sentReminders[overdueMeds[0]?.medication.id]}
                      className="px-4 py-2 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2 text-sm shadow-md active:scale-95 disabled:opacity-60"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {sentReminders[overdueMeds[0]?.medication.id] ? "Sent ✓" : "Send Reminder"}
                    </button>
                    <button
                      onClick={handleDismissOverdueAlert}
                      className="px-4 py-2 bg-black/10 hover:bg-black/20 text-slate-950 font-bold rounded-xl text-sm transition-all border border-black/10 active:scale-95 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Module 5: Morning Wellness Check-in Escalation Alert Banner */}
              {isWellnessOverdue && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-3xl p-6 shadow-xl shadow-amber-500/20 border-l-8 border-slate-950 flex flex-col gap-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                        <AlertTriangle className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-black tracking-tight text-slate-950">
                            Morning Wellness Check-In Overdue
                          </h2>
                          <span className="px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-slate-950 text-amber-400">
                            Action Needed
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5">
                          {data.careReceiver?.name || "Care Receiver"} has not completed their morning wellness check-in today.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDismissWellnessAlert}
                      className="p-2 rounded-xl bg-black/10 hover:bg-black/20 text-slate-950 transition-colors cursor-pointer"
                      title="Dismiss alert"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-black/10">
                    <button
                      onClick={() => router.push("/caregiver/emergency")}
                      className="px-4 py-2 bg-slate-950 text-white font-bold rounded-xl hover:bg-slate-900 transition-all flex items-center gap-2 text-sm shadow-md active:scale-95"
                    >
                      <Phone className="w-4 h-4" /> Call {data.careReceiver?.name || "Them"}
                    </button>
                    <button
                      onClick={handleSendWellnessReminder}
                      disabled={sentWellnessReminder}
                      className="px-4 py-2 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2 text-sm shadow-md active:scale-95 disabled:opacity-60"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {sentWellnessReminder ? "Reminder Sent ✓" : "Send Friendly Message"}
                    </button>
                    <button
                      onClick={handleDismissWellnessAlert}
                      className="px-4 py-2 bg-black/10 hover:bg-black/20 text-slate-950 font-bold rounded-xl text-sm transition-all border border-black/10 active:scale-95 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              )}
              {activeHelpEvent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-destructive text-destructive-foreground rounded-3xl p-6 shadow-xl shadow-destructive/30 flex flex-col md:flex-row items-center justify-between gap-6 border-l-8 border-white/40 ring-4 ring-destructive/20"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-10 h-10 text-white animate-bounce" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-1">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        🚨 Urgent SOS Active
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-center md:text-left text-white">
                        {data.careReceiver?.name || "Care Receiver"} Pressed SOS!
                      </h3>
                      <p className="text-white/90 text-center md:text-left text-sm mt-0.5">
                        Emergency assistance requested. Audio alarm siren is ringing on your device.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-end gap-3">
                    <button
                      onClick={() => setIsSirenMuted((prev) => !prev)}
                      className="px-4 py-3 bg-white/20 text-white text-sm font-bold rounded-xl hover:bg-white/30 transition-all flex items-center gap-2"
                      title={isSirenMuted ? "Unmute alarm siren" : "Mute alarm siren"}
                    >
                      {isSirenMuted ? "🔇 Unmute Siren" : "🔊 Silence Siren"}
                    </button>
                    <button
                      onClick={() => router.push("/caregiver/emergency")}
                      className="px-5 py-3 bg-white text-destructive font-bold text-sm rounded-xl hover:bg-white/90 transition-all flex items-center gap-2 shadow-md"
                    >
                      <Phone className="w-4 h-4" /> Call Senior
                    </button>
                    <button
                      onClick={() => {
                        stopCaregiverEmergencySiren();
                        resolveHelpRequest();
                      }}
                      className="px-5 py-3 bg-destructive-foreground/15 text-white border border-white/30 text-sm font-bold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Resolve SOS
                    </button>
                  </div>
                </motion.div>
              )}

              {data.safetyCheck.status === "escalating" && (
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
                      <h3 className="text-xl md:text-2xl font-bold text-center md:text-left">
                        Safety Alert: No Response
                      </h3>
                      <p className="text-white/80 text-center md:text-left">
                        {data.careReceiver?.name} has not responded to the
                        safety check.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-end gap-3">
                    <button
                      onClick={() => router.push("/caregiver/emergency")}
                      className="px-6 py-3 bg-white text-destructive font-bold rounded-xl hover:bg-opacity-90 transition-all flex items-center gap-2"
                    >
                      <Phone className="w-5 h-5" /> Call Now
                    </button>
                    <button
                      onClick={() => router.push("/caregiver/messages")}
                      className="px-6 py-3 bg-destructive-dark text-white font-bold rounded-xl hover:bg-destructive-dark/80 transition-all flex items-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" /> Message
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Medication Checklist */}
            <section className="bg-card border-2 border-border rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Today's Checklist</h2>
                  <p className="text-muted-foreground">
                    Ensure all medications are administered
                  </p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-secondary rounded-full text-sm font-medium w-fit">
                  <Pill className="w-4 h-4 text-primary" />
                  <span>
                    {data.medications.filter((m) => m.taken).length} /{" "}
                    {data.medications.length} Taken
                  </span>
                </div>
              </div>

              <div className="space-y-8">
                {(Object.keys(timeOfDayLabels) as TimeOfDay[]).map((time) => {
                  const meds = groupedMeds[time];
                  if (meds.length === 0) return null;
                  const Icon = timeIcons[time];
                  return (
                    <div key={time} className="space-y-4">
                      <div className="flex items-center gap-3 text-muted-foreground mb-2">
                        <Icon className="w-5 h-5" />
                        <h3 className="text-lg font-semibold uppercase tracking-wider">
                          {timeOfDayLabels[time]}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {meds.map((med) => {
                          const overdueInfo = overdueMeds.find((o) => o.medication.id === med.id);
                          return (
                            <motion.div
                              key={med.id}
                              className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                                med.taken
                                  ? "bg-sahay-success/5 border-sahay-success/20"
                                  : overdueInfo
                                    ? "bg-amber-500/10 border-amber-500/40"
                                    : "bg-card border-border hover:border-primary/30"
                              }`}
                              whileHover={{ x: 5 }}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    med.taken
                                      ? "bg-sahay-success text-white"
                                      : overdueInfo
                                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse"
                                        : "bg-secondary text-muted-foreground"
                                  }`}
                                >
                                  {med.taken ? (
                                    <Check className="w-6 h-6" />
                                  ) : overdueInfo ? (
                                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                  ) : (
                                    <Clock className="w-6 h-6" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p
                                      className={`text-lg font-bold ${
                                        med.taken
                                          ? "text-muted-foreground line-through"
                                          : "text-foreground"
                                      }`}
                                    >
                                      {med.name}
                                    </p>
                                    {overdueInfo && (
                                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 animate-pulse">
                                        {overdueInfo.delayFormatted}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {med.dosage} •{" "}
                                    {med.time
                                      ? formatTime12h(med.time)
                                      : "As needed"}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => setEditingMed(med)}
                                className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                              >
                                <Settings className="w-5 h-5" />
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
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
                {todayWellness ? (
                  <div
                    className={`p-4 border-2 rounded-2xl ${
                      todayWellness.level === "great"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200"
                        : todayWellness.level === "okay"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                        Today's Status
                      </p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-background/60 shadow-xs">
                        {todayWellness.timestamp
                          ? new Date(todayWellness.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "Today"}
                      </span>
                    </div>
                    <p className="text-lg font-bold">
                      {todayWellness.level === "great"
                        ? "🟢 Feeling Great"
                        : todayWellness.level === "okay"
                        ? "🟡 Doing Okay"
                        : "🔴 Not Feeling Great"}
                    </p>
                    {todayWellness.note && (
                      <p className="text-xs mt-2 italic opacity-90 bg-background/40 p-2 rounded-lg">
                        &ldquo;{todayWellness.note}&rdquo;
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-secondary/50 border border-border rounded-2xl text-center">
                    <p className="text-sm font-semibold text-foreground">Pending Check-in</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No morning check-in recorded yet for today.
                    </p>
                  </div>
                )}
                <button
                  onClick={() => router.push("/caregiver/wellness")}
                  className="w-full py-3 text-sm font-medium text-center text-primary hover:underline cursor-pointer"
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
                {getHumanInsights().map((insight, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-4 bg-secondary/50 rounded-2xl border-l-4",
                      idx % 3 === 0
                        ? "border-sahay-blue"
                        : idx % 3 === 1
                        ? "border-sahay-pending"
                        : "border-sahay-sage"
                    )}
                  >
                    <p className="text-sm leading-relaxed text-foreground">
                      &ldquo;{insight}&rdquo;
                    </p>
                  </div>
                ))}
                <button
                  onClick={() => router.push("/caregiver/analytics")}
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
                  <div
                    key={event.id}
                    className="flex gap-3 p-2 border-b border-border last:border-0"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 shrink-0 ${event.type === "medication_taken" ? "bg-sahay-success" : "bg-sahay-blue"}`}
                    />
                    <div>
                      <p className="text-xs font-bold">
                        {event.medicationName || event.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </CaregiverLayout>
  );
}
