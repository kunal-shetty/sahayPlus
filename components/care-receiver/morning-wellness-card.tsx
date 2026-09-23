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
    unlockAudioContext();
    playSuccessChime();
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
    const activeConfig = wellnessOptions.find((o) => o.level === todayWellness.level) || wellnessOptions[0];
    const ActiveIcon = activeConfig.icon;
    const formattedTime = todayWellness.timestamp
      ? new Date(todayWellness.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      : "Earlier today";

    return (
      <div className="w-full mb-6 rounded-2xl bg-card border-2 border-border p-4 shadow-sm transition-all">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
              <ActiveIcon className={`w-6 h-6 ${activeConfig.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Today's Wellness Check-In
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  Shared ✓
                </span>
              </div>
              <p className="text-base font-bold text-foreground">
                {activeConfig.label} <span className="text-xs font-normal text-muted-foreground">({formattedTime})</span>
              </p>
              {todayWellness.note && (
                <p className="text-xs italic text-muted-foreground mt-0.5">
                  &ldquo;{todayWellness.note}&rdquo;
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsUpdating(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-primary hover:bg-secondary border border-border/80 transition-all active:scale-95"
          >
            Update
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full mb-6 rounded-3xl p-5 border-2 shadow-sm transition-all ${
        isLateMorningReminder
          ? "bg-amber-500/10 border-amber-500/40"
          : "bg-card border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {isLateMorningReminder ? "Morning Wellness Reminder" : "Good morning! How are you?"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isLateMorningReminder
                ? `Please let ${caregiverName} know how you are feeling today`
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 mb-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200"
          >
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">
              Thank you! {caregiverName} can see that you are feeling {justSubmitted === "notGreat" ? "not great" : justSubmitted}.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-2.5">
        {wellnessOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.level}
              onClick={() => handleSelectLevel(opt.level)}
              className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-[0.96] touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary ${opt.borderActive} ${opt.bgHover}`}
            >
              <div className="w-12 h-12 rounded-full bg-background/80 flex items-center justify-center shadow-xs">
                <Icon className={`w-7 h-7 ${opt.color}`} />
              </div>
              <span className="text-sm font-bold text-foreground text-center leading-tight">
                {opt.label}
              </span>
              <span className="text-[10px] text-muted-foreground text-center leading-none hidden sm:inline">
                {opt.sublabel}
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
