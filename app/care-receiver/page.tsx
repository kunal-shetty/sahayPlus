"use client";

/**
 * @file page.tsx
 * @description The Care Receiver's home page.
 * Designed for elderly users, this page provides an extremely simplified interface
 * focused on medication adherence, daily wellness check-ins, and emergency assistance.
 * It features a dynamic theme that automatically switches to a dark "Night Mode"
 * to reduce eye strain and signal a wind-down period.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSahay } from "@/lib/sahay-context";
import {
  type Medication,
  getCurrentTimeOfDay,
  timeOfDayLabels,
  formatTime12h,
} from "@/lib/types";
import {
  Heart,
  Check,
  Clock,
  Sun,
  Cloud,
  Moon,
  Settings,
  Pill,
  MessageCircle,
  Phone,
  Smile,
  ArrowLeftRight,
  Mic,
  Info,
  ShieldAlert,
  AlertTriangle,
  Bell,
} from "lucide-react";
import { WellnessCheckin } from "@/components/care-receiver/wellness-checkin";
import { QuickMessages } from "@/components/care-receiver/quick-messages";
import { EmergencyCall } from "@/components/care-receiver/emergency-call";
import { SafetyCheckPrompt } from "@/components/care-receiver/safety-check-prompt";
import { IntakeAlarmModal } from "@/components/care-receiver/intake-alarm-modal";
import {
  playMedicineChime,
  stopMedicineChime,
  playSuccessChime,
  unlockAudioContext,
} from "@/lib/audio-chime";
import { CareReceiverHomeSkeleton } from "@/components/skeletons";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * CareReceiverPage component.
 * Provides the primary interface for the care receiver, featuring large buttons,
 * a clear "next medication" focus, and quick access to emergency help.
 */
export default function CareReceiverPage() {
  const {
    data,
    isLoading,
    isDataLoading,
    markMedicationTaken,
    logout,
    triggerSafetyCheck,
    completeDailyCheckIn,
    requestHelp,
    resolveHelpRequest,
    dismissChangeIndicator,
  } = useSahay();
  const router = useRouter();

  /**
   * Sets up a global function on the window object to allow external triggers
   * (e.g., from a motion sensor integration) to initiate a safety check.
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).triggerMotionSafetyCheck = () => {
        triggerSafetyCheck("motion");
      };
    }

    return () => {
      (window as any).triggerMotionSafetyCheck = null;
    };
  }, [triggerSafetyCheck]);

  // UI State
  const [confirmedMed, setConfirmedMed] = useState<Medication | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWellness, setShowWellness] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [helpRequestedAt, setHelpRequestedAt] = useState<string | null>(null);

  // Scheduled Medicine Alarm State
  const [alarmMedication, setAlarmMedication] = useState<Medication | null>(null);
  const [snoozedMeds, setSnoozedMeds] = useState<Record<string, number>>({});
  const [dismissedMeds, setDismissedMeds] = useState<Record<string, string>>({});
  const [isAlarmSoundMuted, setIsAlarmSoundMuted] = useState(false);

  /** Unlock browser AudioContext on first touch/click */
  useEffect(() => {
    const handleUnlock = () => {
      unlockAudioContext();
    };
    window.addEventListener("click", handleUnlock, { once: true });
    window.addEventListener("touchstart", handleUnlock, { once: true });
    return () => {
      window.removeEventListener("click", handleUnlock);
      window.removeEventListener("touchstart", handleUnlock);
    };
  }, []);

  /**
   * Active Background Scheduler:
   * Checks every 10 seconds if any untaken medication has reached or passed
   * its scheduled dose time.
   */
  useEffect(() => {
    if (alarmMedication) return; // Alarm is already ringing

    const checkSchedule = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const nowInMinutes = currentHours * 60 + currentMinutes;
      const todayStr = now.toISOString().split("T")[0];
      const nowTs = Date.now();

      const untaken = data.medications.filter((m) => !m.taken);

      for (const med of untaken) {
        // Skip if snoozed and snooze period has not yet expired
        if (snoozedMeds[med.id] && snoozedMeds[med.id] > nowTs) {
          continue;
        }

        // Skip if dismissed today and not actively snoozed
        if (dismissedMeds[med.id] === todayStr && !snoozedMeds[med.id]) {
          continue;
        }

        // Determine scheduled clock time in minutes
        let scheduledMinutes: number | null = null;
        if (med.time) {
          const parts = med.time.split(":");
          if (parts.length >= 2) {
            const h = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            if (!isNaN(h) && !isNaN(m)) {
              scheduledMinutes = h * 60 + m;
            }
          }
        }

        if (scheduledMinutes === null) {
          if (med.timeOfDay === "morning") scheduledMinutes = 8 * 60; // 08:00 AM
          else if (med.timeOfDay === "afternoon") scheduledMinutes = 13 * 60; // 01:00 PM
          else if (med.timeOfDay === "evening") scheduledMinutes = 19 * 60; // 07:00 PM
        }

        // If clock time is at or past scheduled time (within a 3-hour alert window)
        if (
          scheduledMinutes !== null &&
          nowInMinutes >= scheduledMinutes &&
          nowInMinutes <= scheduledMinutes + 180
        ) {
          setAlarmMedication(med);
          if (!isAlarmSoundMuted) {
            playMedicineChime();
          }
          break;
        }
      }
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 10000);
    return () => clearInterval(interval);
  }, [data.medications, alarmMedication, snoozedMeds, dismissedMeds, isAlarmSoundMuted]);

  /** User confirms taking the alarm dose */
  const handleAlarmTookIt = () => {
    stopMedicineChime();
    playSuccessChime();
    if (alarmMedication) {
      markMedicationTaken(alarmMedication.id, true);
      setConfirmedMed(alarmMedication);
      setShowUndo(true);
      setAlarmMedication(null);
    }
  };

  /** User snoozes the dose for 10 minutes */
  const handleAlarmSnooze = () => {
    stopMedicineChime();
    if (alarmMedication) {
      const tenMinutesLater = Date.now() + 10 * 60 * 1000;
      setSnoozedMeds((prev) => ({
        ...prev,
        [alarmMedication.id]: tenMinutesLater,
      }));
      setAlarmMedication(null);
    }
  };

  /** User dismisses the alarm for now */
  const handleAlarmDismiss = () => {
    stopMedicineChime();
    if (alarmMedication) {
      const todayStr = new Date().toISOString().split("T")[0];
      setDismissedMeds((prev) => ({
        ...prev,
        [alarmMedication.id]: todayStr,
      }));
      setAlarmMedication(null);
    }
  };

  /** Test button to preview the full-screen alarm and chime immediately */
  const handleTestAlarm = () => {
    const medToTest = nextMed || data.medications[0] || {
      id: "demo_pill",
      name: "Metformin",
      dosage: "500 mg",
      timeOfDay: "morning" as const,
      time: "08:00",
      simpleExplanation: "Take 1 tablet with a glass of water after breakfast",
      taken: false,
      lastUpdated: new Date().toISOString(),
    };
    setShowSettings(false);
    setAlarmMedication(medToTest);
    unlockAudioContext();
    if (!isAlarmSoundMuted) {
      playMedicineChime();
    }
  };

  /** Check if an active unresolved help request was triggered today */
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const activeHelp = (data.timeline || []).find(
      (e) =>
        e.type === "help_requested" &&
        !e.note?.includes("resolved") &&
        e.timestamp.startsWith(today),
    );
    if (activeHelp) {
      if (helpRequestedAt !== activeHelp.timestamp) {
        setHelpRequestedAt(activeHelp.timestamp);
      }
    } else {
      if (helpRequestedAt !== null) {
        setHelpRequestedAt(null);
      }
    }
  }, [data.timeline, helpRequestedAt]);

  const handleRequestHelp = () => {
    requestHelp();
    const nowIso = new Date().toISOString();
    setHelpRequestedAt(nowIso);
  };

  const handleDismissHelp = () => {
    setHelpRequestedAt(null);
    resolveHelpRequest();
  };

  /** Theme state: 'light', 'dark', or 'auto' (automatic night mode). */
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");

  /** Restore theme preference from localStorage on mount. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("sahay_receiver_theme");
    if (saved === "light" || saved === "dark" || saved === "auto") {
      setTheme(saved);
    }
  }, []);

  /** Updates the theme preference and persists it to localStorage. */
  const updateTheme = (next: "light" | "dark" | "auto") => {
    setTheme(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sahay_receiver_theme", next);
    }
  };

  const hour = new Date().getHours();
  const isAutoNight = hour >= 21 || hour < 6;
  const isNight = theme === "dark" || (theme === "auto" && isAutoNight);

  const currentTimeOfDay = getCurrentTimeOfDay();

  /**
   * Determines the next medication that needs to be taken.
   * Prioritizes medications for the current time of day, then follows
   * the natural sequence (morning -> afternoon -> evening).
   */
  const getNextMedication = useCallback((): Medication | null => {
    const pendingMeds = data.medications.filter((m) => !m.taken);
    if (pendingMeds.length === 0) return null;

    const currentTimeMeds = pendingMeds.filter(
      (m) => m.timeOfDay === currentTimeOfDay,
    );
    if (currentTimeMeds.length > 0) return currentTimeMeds[0];

    const timeOrder = ["morning", "afternoon", "evening"];
    for (const time of timeOrder) {
      const timeMeds = pendingMeds.filter((m) => m.timeOfDay === time);
      if (timeMeds.length > 0) return timeMeds[0];
    }

    return pendingMeds[0];
  }, [data.medications, currentTimeOfDay]);

  const nextMed = getNextMedication();
  const allDone =
    data.medications.length > 0 && data.medications.every((m) => m.taken);

  /** Marks the current medication as taken and triggers a temporary undo state. */
  const handleTookIt = () => {
    if (nextMed) {
      markMedicationTaken(nextMed.id, true);
      setConfirmedMed(nextMed);
      setShowUndo(true);
    }
  };

  /** Reverts a medication marking if the user accidentally tapped "I took it". */
  const handleUndo = () => {
    if (confirmedMed) {
      markMedicationTaken(confirmedMed.id, false);
      setConfirmedMed(null);
      setShowUndo(false);
    }
  };

  /** Timer to automatically clear the undo state and confirmation screen. */
  useEffect(() => {
    if (showUndo) {
      const timer = setTimeout(() => {
        setShowUndo(false);
        setConfirmedMed(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showUndo]);

  const timeIcons = {
    morning: Sun,
    afternoon: Cloud,
    evening: Moon,
  };

  /** Returns a time-appropriate greeting. */
  const getGreeting = () => {
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading || isDataLoading) {
    return <CareReceiverHomeSkeleton />;
  }

  /** Full-Screen Medication Alarm View */
  if (alarmMedication) {
    return (
      <IntakeAlarmModal
        medication={alarmMedication}
        isNight={isNight}
        onTookIt={handleAlarmTookIt}
        onSnooze={handleAlarmSnooze}
        onDismiss={handleAlarmDismiss}
        onToggleSound={(muted) => {
          setIsAlarmSoundMuted(muted);
          if (muted) {
            stopMedicineChime();
          } else {
            playMedicineChime();
          }
        }}
        isMuted={isAlarmSoundMuted}
      />
    );
  }

  if (showWellness) {
    return <WellnessCheckin onClose={() => setShowWellness(false)} />;
  }

  if (showMessages) {
    return <QuickMessages onClose={() => setShowMessages(false)} />;
  }

  if (showEmergency) {
    return <EmergencyCall onClose={() => setShowEmergency(false)} />;
  }

  /** Render settings overlay for appearance and account management. */
  if (showSettings) {
    return (
      <main className={cn("min-h-screen flex flex-col bg-background text-foreground p-6", isNight && "dark")}>
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <div className="w-20 h-20 rounded-full bg-sahay-sage-light flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-sahay-sage" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2 text-center">
            Sahay+
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-8">
            Gentle medication care
          </p>

          <div className="w-full space-y-3">
            <div className="w-full">
              <p className="text-sm font-medium text-muted-foreground mb-2 text-center uppercase tracking-wider">
                Appearance
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(["light", "auto", "dark"] as const).map((opt) => {
                  const active = theme === opt;
                  const Icon =
                    opt === "light" ? Sun : opt === "dark" ? Moon : Cloud;
                  const label =
                    opt === "light"
                      ? "Light"
                      : opt === "dark"
                        ? "Dark"
                        : "Auto";
                  return (
                    <button
                      key={opt}
                      onClick={() => updateTheme(opt)}
                      className={`py-4 px-3 rounded-xl text-base font-medium flex flex-col items-center gap-2
                                  transition-all active:scale-[0.97] touch-manipulation
                                  focus:outline-none focus:ring-2 focus:ring-sahay-sage
                                  ${
                                    active
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-secondary text-foreground"
                                  }`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                      {label}
                    </button>
                  );
                })}
              </div>
              {theme === "auto" && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Auto: dark between 9pm and 6am
                </p>
              )}
            </div>

            <button
              onClick={handleTestAlarm}
              className="w-full py-4 px-6 bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xl font-semibold
                       rounded-2xl transition-all active:scale-[0.97] touch-manipulation flex items-center justify-center gap-3
                       focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <Bell className="w-6 h-6 text-amber-500" />
              Test Medicine Alarm & Chime
            </button>

            <button
              onClick={() => {
                triggerSafetyCheck("manual");
                setShowSettings(false);
              }}
              className="w-full py-4 px-6 bg-secondary text-foreground text-xl font-medium
                       rounded-2xl transition-all active:scale-[0.97] touch-manipulation flex items-center justify-center gap-3
                       focus:outline-none focus:ring-2 focus:ring-sahay-sage"
            >
              <Heart className="w-6 h-6 text-sahay-sage" />
              Simulate Safety Check
            </button>

            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="w-full py-4 px-6 bg-secondary text-foreground text-xl font-medium
                       rounded-2xl transition-all active:scale-[0.97] touch-manipulation flex items-center justify-center gap-3
                       focus:outline-none focus:ring-2 focus:ring-sahay-sage"
            >
              <ArrowLeftRight className="w-6 h-6" />
              Sign Out
            </button>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-4 px-6 bg-primary text-primary-foreground text-xl font-semibold
                       rounded-2xl transition-all active:scale-[0.97] touch-manipulation
                       focus:outline-none focus:ring-2 focus:ring-sahay-sage"
            >
              Go back
            </button>
          </div>
        </div>
      </main>
    );
  }

  /** Confirmation screen shown immediately after marking a med as taken. */
  if (showUndo && confirmedMed) {
    return (
      <main className={cn("min-h-screen flex flex-col bg-background text-foreground p-6", isNight && "dark")}>
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <div className="w-24 h-24 rounded-full bg-sahay-success/20 flex items-center justify-center mb-8 animate-in zoom-in duration-300">
            <Check className="w-12 h-12 text-sahay-success" strokeWidth={2} />
          </div>

          <h1 className="text-3xl font-semibold text-foreground mb-3 text-center text-balance">
            Noted. Take care.
          </h1>
          <p className="text-xl text-muted-foreground text-center mb-8">
            {confirmedMed.name} marked as taken
          </p>

          <button
            onClick={handleUndo}
            className="py-4 px-8 bg-card text-foreground text-lg font-medium
                     rounded-2xl border-2 border-border transition-all touch-manipulation
                     focus:outline-none focus:ring-2 focus:ring-sahay-sage"
          >
            Undo this
          </button>

          <div className="mt-8 w-full max-w-xs">
            <div className="h-1 bg-sahay-sage/20 rounded-full overflow-hidden">
              <div className="h-full bg-sahay-sage animate-shrink-width" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /**
   * Copy for the finished / not-set-up states. These are rendered *inside* the
   * main layout below: returning a bare screen here would unmount the check-in,
   * "I need help" and "Call help" actions, which a care receiver may need at
   * any moment — emergencies often follow a dose. A formally closed day shares
   * the same reassuring card, since the pills are equally all recorded.
   */
  const finishedTitle = "You're all set for today!";
  const finishedMessage = "All medications have been recorded. Rest well.";

  const doneCount = data.medications.filter((m) => m.taken).length;
  const TimeIcon = nextMed ? timeIcons[nextMed.timeOfDay] : Check;
  const isFineCheckedIn = data.lastFineCheckIn?.startsWith(
    new Date().toISOString().split("T")[0],
  );
  return (
    <main
      className={cn(
        "min-h-screen flex flex-col transition-colors duration-500 bg-background text-foreground",
        isNight && "dark",
      )}
    >
      <AnimatePresence>
        {data.lastChangeNotifiedAt && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-primary/10 border-b border-primary/20 overflow-hidden"
          >
            <div className="p-4 flex items-center justify-between max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Something is a little different today.
                </span>
              </div>
              <button
                onClick={dismissChangeIndicator}
                className="text-xs font-bold text-primary uppercase tracking-wider px-2 py-1 hover:underline"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg text-muted-foreground">
              {getGreeting()}
            </p>
            <h1 className="text-2xl font-bold text-foreground">
              {data.careReceiver?.name || "Your care"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestAlarm}
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-secondary text-foreground hover:bg-secondary/80 border border-border touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              aria-label="Test Medicine Reminder"
              title="Test Medicine Reminder Alarm"
            >
              <Bell className="w-5 h-5 text-amber-500" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-secondary text-foreground hover:bg-secondary/80 border border-border touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 -mt-10">
        <div className="w-full max-w-md">
          {/* Persistent Help Request Status Banner */}
          <AnimatePresence>
            {helpRequestedAt && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full p-4 mb-6 rounded-2xl bg-destructive/10 border-2 border-destructive/30 flex flex-col gap-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center text-white shrink-0 animate-pulse">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-destructive">Help Alert Active</p>
                      <p className="text-xs text-muted-foreground">
                        {data.caregiver?.name || "Caregiver"} was alerted at{" "}
                        {new Date(helpRequestedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDismissHelp}
                    className="px-3 py-1.5 rounded-xl bg-card border border-border text-foreground font-semibold text-xs hover:bg-secondary transition-all active:scale-95 shadow-xs"
                  >
                    I&apos;m okay now
                  </button>
                </div>
                <p className="text-xs text-foreground/80 bg-background/50 p-2.5 rounded-xl border border-border/40">
                  Help is on the way. If this is an urgent emergency, tap <strong>Call help</strong> below.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!isFineCheckedIn && (
            <motion.button
              onClick={completeDailyCheckIn}
              className="w-full p-6 rounded-2xl border-2 mb-8 flex items-center gap-4 touch-manipulation transition-all bg-card border-border hover:border-primary/50 text-card-foreground shadow-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                <Smile className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-foreground">I&apos;m fine today</p>
                <p className="text-sm text-muted-foreground">
                  Tap to let {data.caregiver?.name} know
                </p>
              </div>
            </motion.button>
          )}

          {nextMed ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-6">
                <TimeIcon
                  className="w-6 h-6 text-primary"
                  strokeWidth={1.5}
                />
                <span className="text-lg font-semibold text-muted-foreground">
                  {timeOfDayLabels[nextMed!.timeOfDay]}
                  {nextMed?.time && ` at ${formatTime12h(nextMed.time)}`}
                </span>
              </div>

              <motion.div
                className="rounded-3xl p-8 border-2 mb-8 text-center bg-card border-border shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-3xl font-bold mb-2 text-balance text-foreground">
                  {nextMed!.name}
                </h2>
                {nextMed?.time && (
                  <div className="flex items-center justify-center gap-2 mb-2 text-primary font-bold">
                    <Clock className="w-5 h-5" strokeWidth={2.5} />
                    <span className="text-2xl">
                      {formatTime12h(nextMed.time)}
                    </span>
                  </div>
                )}
                <p className="text-2xl font-medium text-muted-foreground">
                  {nextMed!.dosage}
                </p>

                {nextMed!.simpleExplanation && (
                  <p className="text-lg font-medium mt-4 py-3 border-t border-border text-primary">
                    {nextMed!.simpleExplanation}
                  </p>
                )}

                {nextMed!.notes && (
                  <p className="text-lg mt-3 pt-3 border-t border-border text-foreground/80">
                    {nextMed!.notes}
                  </p>
                )}
                {nextMed!.pharmacistNote && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Pill className="w-4 h-4 text-primary" />
                      <span className="text-sm text-primary font-semibold">
                        From pharmacist
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {nextMed!.pharmacistNote}
                    </p>
                  </div>
                )}
              </motion.div>

              <div className="flex gap-3 mb-8">
                <motion.button
                  onClick={handleTookIt}
                  className="flex-1 py-6 px-8 bg-primary text-primary-foreground text-2xl font-bold
                       rounded-2xl flex items-center justify-center gap-3 shadow-lg touch-manipulation button-interactive
                       focus:outline-none focus:ring-4 focus:ring-primary/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Check className="w-7 h-7" strokeWidth={2.5} />I took it
                </motion.button>

                <motion.button
                  onClick={() => {
                    setIsListening(true);
                    setTimeout(() => {
                      setIsListening(false);
                      handleTookIt();
                    }, 2000);
                  }}
                  className={cn(
                    "w-20 rounded-2xl flex items-center justify-center border-2 transition-all",
                    isListening
                      ? "bg-primary text-primary-foreground border-primary animate-pulse"
                      : "bg-card border-border text-muted-foreground hover:border-primary/50",
                  )}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 }}
                  aria-label="Voice confirmation"
                >
                  <Mic
                    className={cn("w-8 h-8", isListening && "scale-125")}
                  />
                </motion.button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-3xl p-8 border-2 mb-8 text-center bg-card border-border shadow-md">
                <div
                  className={cn(
                    "w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6",
                    allDone ? "bg-sahay-success/15 text-sahay-success" : "bg-primary/10 text-primary",
                  )}
                >
                  {allDone ? (
                    <Check
                      className="w-10 h-10"
                      strokeWidth={2}
                    />
                  ) : (
                    <Heart
                      className="w-10 h-10"
                      strokeWidth={1.5}
                    />
                  )}
                </div>

                <h2 className="text-3xl font-bold mb-3 text-balance text-foreground">
                  {allDone ? finishedTitle : getGreeting()}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {allDone
                    ? finishedMessage
                    : "Your caregiver will set up your medications"}
                </p>
              </div>

              {allDone && (
                <div className="rounded-3xl p-6 border-2 mb-8 text-left bg-card border-border shadow-md">
                  <p className="text-sm font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                    Today&apos;s medicines ({doneCount} of{" "}
                    {data.medications.length} taken)
                  </p>
                  <ul>
                    {data.medications.map((med) => (
                      <li
                        key={med.id}
                        className="flex items-center justify-between gap-3 py-3 border-t border-border"
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span
                            className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                              med.taken ? "bg-sahay-success/20 text-sahay-success" : "bg-secondary text-muted-foreground",
                            )}
                          >
                            {med.taken ? (
                              <Check
                                className="w-5 h-5"
                                strokeWidth={2.5}
                              />
                            ) : (
                              <Clock className="w-5 h-5" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-lg font-bold text-foreground truncate">
                              {med.name}
                            </span>
                            <span className="block text-sm text-muted-foreground">
                              {med.dosage} •{" "}
                              {med.time
                                ? formatTime12h(med.time)
                                : timeOfDayLabels[med.timeOfDay]}
                            </span>
                          </span>
                        </span>
                        {med.taken && (
                          <button
                            onClick={() => markMedicationTaken(med.id, false)}
                            aria-label={`Undo ${med.name}`}
                            className="shrink-0 py-2 px-4 text-sm font-semibold rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            Undo
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-3 gap-3">
            <motion.button
              onClick={() => setShowWellness(true)}
              className="p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all touch-manipulation button-interactive bg-card border-border hover:border-sahay-success/50 text-foreground shadow-xs"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Smile className="w-7 h-7 text-sahay-success" />
              <span className="text-sm font-semibold">How I feel</span>
            </motion.button>

            <motion.button
              onClick={helpRequestedAt ? handleDismissHelp : handleRequestHelp}
              className={cn(
                "p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all touch-manipulation button-interactive shadow-xs",
                helpRequestedAt
                  ? "bg-destructive/15 border-destructive text-destructive font-bold ring-2 ring-destructive/30"
                  : "bg-card border-border hover:border-primary/50 text-foreground",
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {helpRequestedAt ? (
                <ShieldAlert className="w-7 h-7 text-destructive animate-pulse" />
              ) : (
                <Heart className="w-7 h-7 text-primary" />
              )}
              <span className="text-sm font-semibold">
                {helpRequestedAt ? "Alert Active" : "I need help"}
              </span>
            </motion.button>

            <motion.button
              onClick={() => setShowEmergency(true)}
              className="p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all touch-manipulation button-interactive bg-card border-border hover:border-destructive/50 text-foreground shadow-xs"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Phone className="w-7 h-7 text-destructive" />
              <span className="text-sm font-semibold">Call help</span>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isNight && (
          <motion.div
            className="flex items-center justify-center gap-2 py-4 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Moon className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest">
              Quiet Night Mode Active
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <SafetyCheckPrompt />
    </main>
  );
}
