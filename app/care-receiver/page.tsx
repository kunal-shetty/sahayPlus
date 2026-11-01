"use client";

/**
 * @file page.tsx
 * @description The Care Receiver's home page.
 * Designed for elderly users, this page provides an extremely simplified interface
 * focused on medication adherence, daily wellness check-ins, and emergency assistance.
 * It features a dynamic theme that automatically switches to a dark "Night Mode"
 * to reduce eye strain and signal a wind-down period.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  Phone,
  ArrowLeftRight,
  Mic,
  Info,
  ShieldAlert,
  Bell,
  Camera,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { MorningWellnessCard } from "@/components/care-receiver/morning-wellness-card";
import { QuickMessages } from "@/components/care-receiver/quick-messages";
import { EmergencyCall } from "@/components/care-receiver/emergency-call";
import { SafetyCheckPrompt } from "@/components/care-receiver/safety-check-prompt";
import { EmergencySosModal } from "@/components/care-receiver/emergency-sos-modal";
import { IntakeAlarmModal } from "@/components/care-receiver/intake-alarm-modal";
import { VoiceIntakeModal } from "@/components/care-receiver/voice-intake-modal";
import { PillVisualizer, PillBadge } from "@/components/pill-visualizer";
import { getLocalMedMeta, stripAllMeta } from "@/lib/medication-meta";
import {
  playMedicineChime,
  playLouderMedicineChime,
  stopMedicineChime,
  playSuccessChime,
  unlockAudioContext,
} from "@/lib/audio-chime";
import { CareReceiverHomeSkeleton } from "@/components/skeletons";
import { useRouter } from "next/navigation";
import { cn, toLocalDateString, SHOW_DEMO_TOOLS, EMERGENCY_NUMBER } from "@/lib/utils";
import { useRoleGuard } from "@/hooks/use-role-guard";

/** How long the "Undo this" screen stays up after marking a dose. */
const UNDO_WINDOW_MS = 8000;

const SNOOZE_STORAGE_KEY = "sahay_alarm_snoozed";
const DISMISS_STORAGE_KEY = "sahay_alarm_dismissed";

function readStoredAlarmState<T>(key: string): Record<string, T> {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStoredAlarmState(key: string, value: Record<string, unknown>) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode etc.) — alarm state just won't survive a reload
  }
}

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
    reportOverdueDose,
    dismissChangeIndicator,
    sendMessage,
  } = useSahay();
  const router = useRouter();
  const isAllowed = useRoleGuard("care_receiver");

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
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [helpRequestedAt, setHelpRequestedAt] = useState<string | null>(null);
  const [selectedMedId, setSelectedMedId] = useState<string | null>(null);

  // Scheduled Medicine Alarm State
  const [alarmMedication, setAlarmMedication] = useState<Medication | null>(null);
  const [isAlarmOverdue, setIsAlarmOverdue] = useState(false);
  /** True while the alarm on screen is a test from Settings, not a real dose. */
  const [isTestAlarm, setIsTestAlarm] = useState(false);
  // Snooze/dismiss survive a reload, otherwise the alarm rings again on refresh.
  const [snoozedMeds, setSnoozedMeds] = useState<Record<string, number>>(() =>
    readStoredAlarmState(SNOOZE_STORAGE_KEY),
  );
  const [dismissedMeds, setDismissedMeds] = useState<Record<string, string>>(() =>
    readStoredAlarmState(DISMISS_STORAGE_KEY),
  );

  useEffect(() => {
    writeStoredAlarmState(SNOOZE_STORAGE_KEY, snoozedMeds);
  }, [snoozedMeds]);

  useEffect(() => {
    writeStoredAlarmState(DISMISS_STORAGE_KEY, dismissedMeds);
  }, [dismissedMeds]);
  const [isAlarmSoundMuted, setIsAlarmSoundMuted] = useState(false);
  const reportedOverdueMedsRef = useRef<Record<string, boolean>>({});

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
      const todayStr = toLocalDateString(now);
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
          // Check if 15-minute grace period has passed without confirmation
          const overdue = nowInMinutes >= scheduledMinutes + 15;
          setIsAlarmOverdue(overdue);
          setAlarmMedication(med);
          if (overdue && !reportedOverdueMedsRef.current[med.id]) {
            reportedOverdueMedsRef.current[med.id] = true;
            reportOverdueDose(med.id, nowInMinutes - scheduledMinutes);
          }
          if (!isAlarmSoundMuted) {
            if (overdue) {
              playLouderMedicineChime();
            } else {
              playMedicineChime();
            }
          }
          break;
        }
      }
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 10000);
    return () => clearInterval(interval);
  }, [data.medications, alarmMedication, snoozedMeds, dismissedMeds, isAlarmSoundMuted, reportOverdueDose]);

  /** User confirms taking the alarm dose */
  const handleAlarmTookIt = () => {
    stopMedicineChime();
    playSuccessChime();
    setIsAlarmOverdue(false);
    if (isTestAlarm) {
      // A test alarm must never record a real dose
      setIsTestAlarm(false);
      setAlarmMedication(null);
      return;
    }
    if (alarmMedication) {
      reportedOverdueMedsRef.current[alarmMedication.id] = false;
      markMedicationTaken(alarmMedication.id, true);
      setConfirmedMed(alarmMedication);
      setShowUndo(true);
      setAlarmMedication(null);
    }
  };

  /** User snoozes the dose for 10 minutes */
  const handleAlarmSnooze = () => {
    stopMedicineChime();
    setIsAlarmOverdue(false);
    if (isTestAlarm) {
      setIsTestAlarm(false);
      setAlarmMedication(null);
      return;
    }
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
    setIsAlarmOverdue(false);
    if (isTestAlarm) {
      setIsTestAlarm(false);
      setAlarmMedication(null);
      return;
    }
    if (alarmMedication) {
      const todayStr = toLocalDateString();
      setDismissedMeds((prev) => ({
        ...prev,
        [alarmMedication.id]: todayStr,
      }));
      setAlarmMedication(null);
    }
  };

  /** Test button to preview the full-screen alarm and chime immediately */
  const handleTestAlarm = () => {
    const medToTest = (selectedMedId && data.medications.find((m) => m.id === selectedMedId)) || nextMed || data.medications[0] || {
      id: "demo_pill",
      name: "Metformin",
      dosage: "500 mg",
      timeOfDay: "morning" as const,
      time: "08:00",
      color: "yellow" as const,
      shape: "oval" as const,
      foodInstruction: "after_meal" as const,
      simpleExplanation: "Take 1 tablet with a glass of water after breakfast",
      taken: false,
      lastUpdated: new Date().toISOString(),
    };
    setShowSettings(false);
    setIsTestAlarm(true);
    setIsAlarmOverdue(false);
    setAlarmMedication(medToTest);
    unlockAudioContext();
    if (!isAlarmSoundMuted) {
      playMedicineChime();
    }
  };

  /** Check if an active unresolved help request was triggered today */
  useEffect(() => {
    const today = toLocalDateString();
    const activeHelp = (data.timeline || []).find(
      (e) =>
        e.type === "help_requested" &&
        !e.note?.includes("resolved") &&
        toLocalDateString(e.timestamp) === today,
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
    setShowSosModal(true);
  };

  /** Called by the SOS modal as soon as the countdown ends. */
  const handleSosDispatch = () => {
    requestHelp();
    setHelpRequestedAt(new Date().toISOString());
  };

  /** Called later, if/when the phone's location becomes available. */
  const handleSosLocation = (location: { latitude: number; longitude: number }) => {
    const { latitude, longitude } = location;
    sendMessage(
      `📍 My location: https://maps.google.com/?q=${latitude.toFixed(5)},${longitude.toFixed(5)}`,
    );
  };

  const handleDismissHelp = () => {
    setHelpRequestedAt(null);
    setShowSosModal(false);
    resolveHelpRequest();
  };

  /** Theme state: 'light', 'dark', or 'auto' (automatic night mode). */
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");

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

  const pendingMeds = useMemo(
    () => data.medications.filter((m) => !m.taken),
    [data.medications]
  );

  const activeMed = useMemo(() => {
    if (selectedMedId) {
      const selected = pendingMeds.find((m) => m.id === selectedMedId);
      if (selected) return selected;
    }
    return nextMed;
  }, [selectedMedId, pendingMeds, nextMed]);

  /** Marks the current medication as taken and triggers a temporary undo state. */
  const handleTookIt = () => {
    const medToTake = activeMed || nextMed;
    if (medToTake) {
      markMedicationTaken(medToTake.id, true);
      setConfirmedMed(medToTake);
      setShowUndo(true);
      setSelectedMedId(null);
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
      }, UNDO_WINDOW_MS);
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

  if (!isAllowed || isLoading || isDataLoading) {
    return <CareReceiverHomeSkeleton />;
  }

  /** Full-Screen Medication Alarm View */
  if (alarmMedication) {
    return (
      <IntakeAlarmModal
        medication={alarmMedication}
        isNight={isNight}
        isOverdue={isAlarmOverdue}
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

  if (showMessages) {
    return <QuickMessages onClose={() => setShowMessages(false)} />;
  }

  if (showEmergency) {
    return <EmergencyCall onClose={() => setShowEmergency(false)} />;
  }

  /** Render settings overlay for appearance and account management. */
  if (showSettings) {
    return (
      <main className={cn("h-dvh max-h-screen overflow-hidden flex flex-col bg-background text-foreground p-4 sm:p-6", isNight && "dark")}>
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

            {SHOW_DEMO_TOOLS && (
            <>
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
                setShowSettings(false);
                unlockAudioContext();
                setShowVoiceModal(true);
              }}
              className="w-full py-4 px-6 bg-primary/10 border border-primary/20 text-primary text-xl font-semibold
                       rounded-2xl transition-all active:scale-[0.97] touch-manipulation flex items-center justify-center gap-3
                       focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Mic className="w-6 h-6" />
              Test Voice Intake ("I took my Dolo")
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
            </>
            )}

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
      <main className={cn("h-dvh max-h-screen overflow-hidden flex flex-col bg-background text-foreground p-4 sm:p-6", isNight && "dark")}>
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
              <div
                className="h-full bg-sahay-sage animate-shrink-width"
                style={{ animationDuration: `${UNDO_WINDOW_MS}ms` }}
              />
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
  const primaryContact = data.emergencyContacts?.find((c) => c.isPrimary && c.phone);
  const finishedTitle = "You are all caught up";
  const finishedMessage = "At this time no medicine is required.";

  const doneCount = data.medications.filter((m) => m.taken).length;
  const TimeIcon = nextMed ? timeIcons[nextMed.timeOfDay] : Check;
  const isFineCheckedIn =
    toLocalDateString(data.lastFineCheckIn) === toLocalDateString();
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const isPastLateMorning = currentHour > 9 || (currentHour === 9 && currentMinute >= 30);
  const isLateMorningReminder = !isFineCheckedIn && isPastLateMorning;
  return (
    <main
      className={cn(
        "h-dvh max-h-screen overflow-hidden flex flex-col transition-colors duration-500 bg-background text-foreground",
        isNight && "dark",
      )}
    >
      <AnimatePresence>
        {data.lastChangeNotifiedAt && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-primary/10 border-b border-primary/20 overflow-hidden shrink-0"
          >
            <div className="px-4 py-1.5 flex items-center justify-between max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">
                  Something is a little different today.
                </span>
              </div>
              <button
                onClick={dismissChangeIndicator}
                className="text-[11px] font-bold text-primary uppercase tracking-wider px-2 py-0.5 hover:underline"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="px-4 py-2 sm:px-6 sm:py-3 shrink-0">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-none">
              {getGreeting()}
            </p>
            <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
              {data.careReceiver?.name || "Your care"}
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowMessages(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary text-primary hover:bg-secondary/80 border border-border touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              aria-label="Send Message"
              title="Send message to caregiver"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            {SHOW_DEMO_TOOLS && (
            <button
              onClick={handleTestAlarm}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary text-foreground hover:bg-secondary/80 border border-border touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              aria-label="Test Medicine Reminder"
              title="Test Medicine Reminder Alarm"
            >
              <Bell className="w-4 h-4 text-amber-500" />
            </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary text-foreground hover:bg-secondary/80 border border-border touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-between px-3 py-1 sm:px-6 sm:py-2 min-h-0 overflow-hidden">
        <div className="w-full max-w-md flex flex-col h-full justify-between min-h-0">
          {/* Top section: Alerts & Morning Wellness */}
          <div className="shrink-0 w-full">
            {/* Persistent Help Request Status Banner */}
            <AnimatePresence>
              {helpRequestedAt && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full p-2.5 mb-2 rounded-xl bg-destructive/10 border-2 border-destructive/30 flex items-center justify-between gap-2 shadow-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-destructive flex items-center justify-center text-white shrink-0 animate-pulse">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-destructive leading-tight">Help Alert Active</p>
                      <p className="text-[10px] text-muted-foreground truncate">Caregiver alerted</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDismissHelp}
                    className="px-2.5 py-1 rounded-lg bg-card border border-border text-foreground font-semibold text-[11px] hover:bg-secondary transition-all active:scale-95 shrink-0"
                  >
                    I&apos;m okay
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Module 5: Morning Wellness Check-In Card & Gentle Reminder */}
            <MorningWellnessCard isLateMorningReminder={isLateMorningReminder} />
          </div>

          {activeMed ? (
            <div className="flex-1 flex flex-col justify-between min-h-0 my-1">
              {/* Optional Medication Selector if multiple pending pills exist */}
              {pendingMeds.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-1 px-1 mb-1 max-w-full">
                  {pendingMeds.map((med) => {
                    const isSelected = activeMed.id === med.id;
                    const medMeta = getLocalMedMeta(med.id, med.name);
                    const hasPhoto = !!(med.imageUrl || medMeta?.imageUrl);
                    return (
                      <button
                        key={med.id}
                        type="button"
                        onClick={() => setSelectedMedId(med.id)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 touch-manipulation active:scale-95",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-card text-muted-foreground border-border hover:bg-secondary"
                        )}
                      >
                        {hasPhoto && <Camera className="w-3.5 h-3.5 text-amber-500" />}
                        <span className="truncate max-w-[120px]">{med.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Scheduled slot tag */}
              <div className="flex items-center justify-center gap-1.5 shrink-0 text-muted-foreground mb-1">
                {(() => {
                  const MedTimeIcon = timeIcons[activeMed.timeOfDay] || Sun;
                  return (
                    <>
                      <MedTimeIcon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                      <span className="text-xs sm:text-sm font-semibold">
                        {timeOfDayLabels[activeMed.timeOfDay]}
                        {activeMed.time && ` at ${formatTime12h(activeMed.time)}`}
                      </span>
                    </>
                  );
                })()}
              </div>

              {/* Main Next Med Card */}
              <motion.div
                className="rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 text-center bg-card border-border shadow-md flex-1 flex flex-col items-center justify-center min-h-0 overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {/* Pill Image or Visual Representation */}
                {(() => {
                  const localMeta = getLocalMedMeta(activeMed.id, activeMed.name);
                  const displayImage = activeMed.imageUrl || localMeta?.imageUrl;
                  const pillColor = activeMed.color || localMeta?.color || "yellow";
                  const pillShape = activeMed.shape || localMeta?.shape || "oval";
                  const cleanNotes = stripAllMeta(activeMed.notes);
                  const displayExplanation =
                    activeMed.simpleExplanation ||
                    localMeta?.simpleExplanation ||
                    cleanNotes ||
                    "Take 1 dose with a full glass of water as prescribed.";

                  return (
                    <div className="flex flex-col items-center justify-center w-full min-h-0">
                      {displayImage ? (
                        <div className="flex flex-col items-center shrink min-h-0 mb-1.5">
                          <div className="h-28 w-28 sm:h-36 sm:w-36 max-h-[20vh] aspect-square rounded-2xl overflow-hidden border-3 border-amber-400/80 shadow-md bg-white shrink flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={displayImage}
                              alt={activeMed.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="mt-1 shrink-0">
                            <PillBadge color={pillColor} shape={pillShape} size="sm" />
                          </div>
                        </div>
                      ) : (
                        <div className="mb-1.5 shrink min-h-0 flex flex-col items-center justify-center">
                          <PillVisualizer
                            color={pillColor}
                            shape={pillShape}
                            size="md"
                            showLabel={true}
                          />
                        </div>
                      )}

                      <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-tight truncate max-w-full">
                        {activeMed.name}
                      </h2>

                      {/* Dosage + Meal timing badges grouped on a single row */}
                      <div className="flex items-center justify-center gap-1.5 my-1 flex-wrap shrink-0">
                        <div className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs sm:text-sm">
                          {activeMed.dosage}
                        </div>
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-secondary text-foreground font-semibold text-xs border border-border">
                          {activeMed?.foodInstruction === "before_meal" && "🍽️ Before Meal"}
                          {activeMed?.foodInstruction === "with_meal" && "🍲 With Food"}
                          {(!activeMed?.foodInstruction || activeMed?.foodInstruction === "after_meal") && "☕ After Meal"}
                          {activeMed?.foodInstruction === "anytime" && "🕒 Anytime"}
                        </div>
                      </div>

                      {/* Senior Instructions & Description Section */}
                      <div className="w-full mt-1 p-2 rounded-xl bg-muted/60 border border-border text-left shrink-0">
                        <div className="flex items-center gap-1 text-primary font-bold text-[10px] uppercase tracking-wider mb-0.5">
                          <Info className="w-3 h-3" />
                          <span>How to take</span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-foreground leading-snug line-clamp-2">
                          {displayExplanation}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {activeMed.pharmacistNote && (
                  <div className="mt-1 pt-1 border-t border-border w-full shrink-0">
                    <p className="text-[11px] text-muted-foreground truncate">
                      <span className="font-semibold text-primary">Pharmacist: </span>
                      {activeMed.pharmacistNote}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Action Buttons: "I took it" + Voice */}
              <div className="flex gap-2 my-1.5 shrink-0 w-full">
                <motion.button
                  onClick={handleTookIt}
                  className="flex-1 py-3.5 sm:py-4 px-6 bg-primary text-primary-foreground text-xl sm:text-2xl font-bold
                       rounded-2xl flex items-center justify-center gap-2.5 shadow-md touch-manipulation button-interactive
                       focus:outline-none focus:ring-4 focus:ring-primary/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Check className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
                  <span>I took it</span>
                </motion.button>

                <motion.button
                  onClick={() => {
                    unlockAudioContext();
                    setShowVoiceModal(true);
                  }}
                  className="w-16 rounded-2xl flex items-center justify-center border-2 border-border bg-card text-primary hover:border-primary/50 hover:bg-primary/5 transition-all shadow-xs active:scale-95 shrink-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 }}
                  aria-label="Voice confirmation"
                  title="Speak to confirm taking your medication"
                >
                  <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center min-h-0 my-1 overflow-hidden">
              <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 text-center bg-card border-border shadow-md">
                <div
                  className={cn(
                    "w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-3",
                    allDone ? "bg-sahay-success/15 text-sahay-success" : "bg-primary/10 text-primary",
                  )}
                >
                  {allDone ? (
                    <ShieldCheck
                      className="w-8 h-8"
                      strokeWidth={2}
                    />
                  ) : (
                    <Heart
                      className="w-8 h-8"
                      strokeWidth={1.5}
                    />
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold mb-1 text-balance text-foreground">
                  {allDone ? finishedTitle : getGreeting()}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {allDone
                    ? finishedMessage
                    : "Your caregiver will set up your medications"}
                </p>
              </div>

              {allDone && data.medications.length > 0 && (
                <div className="rounded-2xl p-3 border-2 mt-2 text-left bg-card border-border shadow-xs max-h-[30vh] overflow-y-auto">
                  <p className="text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
                    Today&apos;s medicines ({doneCount} of {data.medications.length} taken)
                  </p>
                  <ul className="divide-y divide-border">
                    {data.medications.map((med) => (
                      <li
                        key={med.id}
                        className="flex items-center justify-between gap-2 py-1.5"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                              med.taken ? "bg-sahay-success/20 text-sahay-success" : "bg-secondary text-muted-foreground",
                            )}
                          >
                            {med.taken ? (
                              <Check
                                className="w-3.5 h-3.5"
                                strokeWidth={2.5}
                              />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold text-foreground truncate">
                              {med.name}
                            </span>
                            <span className="block text-xs text-muted-foreground truncate">
                              {med.dosage}
                            </span>
                          </span>
                        </span>
                        {med.taken && (
                          <button
                            onClick={() => markMedicationTaken(med.id, false)}
                            aria-label={`Undo ${med.name}`}
                            className="shrink-0 py-1 px-2.5 text-xs font-semibold rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            Undo
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/*
            Bottom actions. "Help" is the single SOS: it starts the 10-second
            countdown and alerts the caregiver. While an alert is active it
            never cancels it — it opens the call screen instead; cancelling is
            only done via the explicit "I'm okay" button in the banner above.
          */}
          <div className="grid grid-cols-2 gap-2 shrink-0 w-full mb-1">
            <motion.button
              onClick={helpRequestedAt ? () => setShowEmergency(true) : handleRequestHelp}
              className={cn(
                "py-3 px-2 border-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all touch-manipulation button-interactive shadow-md focus:outline-none focus:ring-4",
                helpRequestedAt
                  ? "bg-amber-600 text-white border-amber-700 ring-2 ring-amber-500/40"
                  : "bg-destructive text-white border-destructive focus:ring-destructive/40",
              )}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              aria-label={helpRequestedAt ? "Help is on the way. Call someone" : "SOS, I need help"}
            >
              <ShieldAlert className={cn("w-6 h-6", helpRequestedAt && "animate-pulse")} />
              <span className="text-sm font-bold">
                {helpRequestedAt ? "Help is coming" : "SOS · I need help"}
              </span>
            </motion.button>

            <motion.button
              onClick={() => setShowEmergency(true)}
              className="py-3 px-2 border-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all touch-manipulation button-interactive bg-card border-border hover:border-destructive/50 text-foreground shadow-xs"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Phone className="w-6 h-6 text-destructive" />
              <span className="text-sm font-semibold">Call someone</span>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isNight && (
          <motion.div
            className="flex items-center justify-center gap-2 py-1 text-muted-foreground shrink-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Moon className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-widest">
              Quiet Night Mode Active
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <VoiceIntakeModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        medications={data.medications}
        nextMed={activeMed || nextMed}
        onConfirmDose={(medId) => {
          const med = data.medications.find((m) => m.id === medId) || activeMed || nextMed;
          markMedicationTaken(medId, true);
          if (med) {
            setConfirmedMed(med);
            setShowUndo(true);
          }
        }}
      />
      <SafetyCheckPrompt />

      {/* Module 6: Emergency SOS & Two-Stage Grace Countdown Modal */}
      <EmergencySosModal
        isOpen={showSosModal}
        onCancel={() => setShowSosModal(false)}
        onDispatch={handleSosDispatch}
        onLocation={handleSosLocation}
        onSafe={handleDismissHelp}
        primaryContactName={primaryContact?.name || `Emergency (${EMERGENCY_NUMBER})`}
        primaryContactPhone={primaryContact?.phone || EMERGENCY_NUMBER}
      />

    </main>
  );
}
