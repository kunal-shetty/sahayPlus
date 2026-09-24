"use client";

/**
 * @file morning-wellness-card.tsx
 * @description Senior-friendly Morning Wellness Check-In Card for the Care Receiver home screen.
 * Allows the care receiver to easily share how they are feeling with 1 tap (Feeling Great, Doing Okay, Not Great)
 * with instant feedback, chime, and real-time synchronization to the caregiver dashboard.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Smile, Meh, Frown, Check, Sun, ChevronDown, ChevronUp, Heart } from "lucide-react";
import { useSahay } from "@/lib/sahay-context";
import { type WellnessLevel } from "@/lib/types";
import { playSuccessChime, unlockAudioContext } from "@/lib/audio-chime";

interface MorningWellnessCardProps {
  isLateMorningReminder?: boolean;
}

export function MorningWellnessCard({ isLateMorningReminder = false }: MorningWellnessCardProps) {
  const { data, logWellness, getTodayWellness } = useSahay();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [justSubmitted, setJustSubmitted] = useState<WellnessLevel | null>(null);

  const todayWellness = getTodayWellness();
  const caregiverName = data.caregiver?.name || "your caregiver";

  const handleSelectLevel = (level: WellnessLevel) => {
    try {
      unlockAudioContext();
      playSuccessChime();
    } catch (e) {
      console.warn("Audio chime error:", e);
    }
    logWellness(level, noteText.trim() || undefined);
    setJustSubmitted(level);
    setIsUpdating(false);
    setShowNoteInput(false);
    setNoteText("");

    setTimeout(() => {
      setJustSubmitted(null);
    }, 4000);
  };

  const wellnessOptions: {
    level: WellnessLevel;
    icon: typeof Smile;
    label: string;
    sublabel: string;
    color: string;
    bgHover: string;
    borderActive: string;
  }[] = [
    {
      level: "great",
      icon: Smile,
      label: "Feeling Great",
      sublabel: "Energetic & good",
      color: "text-emerald-600 dark:text-emerald-400",
      bgHover: "hover:bg-emerald-500/10 active:bg-emerald-500/20",
      borderActive: "border-emerald-500/40 bg-emerald-500/5",
    },
    {
      level: "okay",
      icon: Meh,
      label: "Doing Okay",
      sublabel: "Managing alright",
      color: "text-amber-600 dark:text-amber-400",
      bgHover: "hover:bg-amber-500/10 active:bg-amber-500/20",
      borderActive: "border-amber-500/40 bg-amber-500/5",
    },
    {
      level: "notGreat",
      icon: Frown,
      label: "Not Great",
      sublabel: "Need a little care",
      color: "text-rose-600 dark:text-rose-400",
      bgHover: "hover:bg-rose-500/10 active:bg-rose-500/20",
      borderActive: "border-rose-500/40 bg-rose-500/5",
    },
  ];

  // If already checked in today and not currently editing:
  if (todayWellness && !isUpdating) {
    const normalizedLevel: WellnessLevel =
      todayWellness.level === ("not_great" as any)
        ? "notGreat"
        : (todayWellness.level as WellnessLevel);
    const activeConfig =
      wellnessOptions.find((o) => o.level === normalizedLevel) ||
      wellnessOptions[0];
    const ActiveIcon = activeConfig.icon;
    const formattedTime = todayWellness.timestamp
      ? new Date(todayWellness.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      : "Earlier today";

    return (
      <div className="w-full mb-2 rounded-2xl bg-card border border-border p-2.5 sm:p-3 shadow-xs transition-all shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
              <ActiveIcon className={`w-5 h-5 ${activeConfig.color}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Today's Wellness
                </span>
                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  Shared ✓
                </span>
              </div>
              <p className="text-sm font-bold text-foreground truncate">
                {activeConfig.label} <span className="text-xs font-normal text-muted-foreground">({formattedTime})</span>
              </p>
              {todayWellness.note && (
                <p className="text-[11px] italic text-muted-foreground truncate">
                  &ldquo;{todayWellness.note}&rdquo;
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              if (todayWellness.note) {
                setNoteText(todayWellness.note);
                setShowNoteInput(true);
              }
              setIsUpdating(true);
            }}
            className="px-2.5 py-1 rounded-xl text-xs font-semibold text-primary hover:bg-secondary border border-border/80 transition-all active:scale-95 shrink-0"
          >
            Update
          </button>
        </div>
        {justSubmitted && (
          <div className="mt-2 p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold">
              Thank you! {caregiverName} can see how you are feeling.
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`w-full mb-2 rounded-2xl p-2.5 sm:p-3 border shadow-xs transition-all shrink-0 ${
        isLateMorningReminder
          ? "bg-amber-500/10 border-amber-500/40"
          : "bg-card border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
              {isLateMorningReminder ? "Morning Wellness Reminder" : "Good morning! How are you?"}
            </h3>
            <p className="text-[11px] text-muted-foreground leading-none">
              {isLateMorningReminder
                ? `Let ${caregiverName} know how you feel`
                : `1 tap to let ${caregiverName} know you're doing well`}
            </p>
          </div>
        </div>

        {isUpdating && (
          <button
            onClick={() => setIsUpdating(false)}
            className="text-xs text-muted-foreground hover:text-foreground font-medium underline"
          >
            Cancel
          </button>
        )}
      </div>

      <AnimatePresence>
        {justSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-2 mb-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2 text-emerald-800 dark:text-emerald-200"
          >
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold">
              Thank you! {caregiverName} can see that you are feeling {justSubmitted === "notGreat" ? "not great" : justSubmitted}.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-2">
        {wellnessOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.level}
              onClick={() => handleSelectLevel(opt.level)}
              className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.96] touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary ${opt.borderActive} ${opt.bgHover}`}
            >
              <div className="w-8 h-8 rounded-full bg-background/80 flex items-center justify-center shadow-2xs">
                <Icon className={`w-5 h-5 ${opt.color}`} />
              </div>
              <span className="text-xs font-bold text-foreground text-center leading-tight">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Optional Note Expander */}
      <div className="mt-3 pt-2.5 border-t border-border/50">
        {!showNoteInput ? (
          <button
            onClick={() => setShowNoteInput(true)}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mx-auto"
          >
            <span>+ Add a quick note</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Optional note for {caregiverName}:
              </label>
              <button
                onClick={() => setShowNoteInput(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g., Slept well, slightly stiff knee"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
      </div>
    </div>
  );
}
