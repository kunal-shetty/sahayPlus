"use client";

/**
 * @file intake-alarm-modal.tsx
 * @description Full-screen, high-contrast medication intake alarm modal designed for elderly care receivers.
 * Features extra-large typography, clear instructions, a prominent "I took it" button,
 * and a 10-minute snooze option. Layout prevents any clipping on shorter screens.
 */

import { useState } from "react";
import { motion } from "motion/react";
import { type Medication, formatTime12h } from "@/lib/types";
import { Check, Clock, Volume2, VolumeX, Bell, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLocalMedMeta, stripAllMeta } from "@/lib/medication-meta";
import { PillVisualizer, PillBadge } from "@/components/pill-visualizer";

interface IntakeAlarmModalProps {
  medication: Medication;
  isNight?: boolean;
  isOverdue?: boolean;
  onTookIt: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
  onToggleSound?: (muted: boolean) => void;
  isMuted?: boolean;
}

export function IntakeAlarmModal({
  medication,
  isNight = false,
  isOverdue = false,
  onTookIt,
  onSnooze,
  onDismiss,
  onToggleSound,
  isMuted = false,
}: IntakeAlarmModalProps) {
  const [muted, setMuted] = useState(isMuted);

  const handleMuteToggle = () => {
    const next = !muted;
    setMuted(next);
    onToggleSound?.(next);
  };

  const formattedTime = medication.time
    ? formatTime12h(medication.time)
    : `${medication.timeOfDay.charAt(0).toUpperCase() + medication.timeOfDay.slice(1)} dose`;

  // Safely resolve image, visual color, shape, and clean notes
  const localMeta = getLocalMedMeta(medication.id, medication.name);
  const displayImage = medication.imageUrl || localMeta?.imageUrl;
  const pillColor = medication.color || localMeta?.color || "yellow";
  const pillShape = medication.shape || localMeta?.shape || "oval";
  const cleanNotes = stripAllMeta(medication.notes);
  const displayExplanation =
    medication.simpleExplanation ||
    localMeta?.simpleExplanation ||
    cleanNotes ||
    "Take 1 dose with a full glass of water as prescribed.";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-50 select-none overflow-y-auto",
        isNight
          ? "bg-slate-950 text-slate-100"
          : isOverdue
          ? "bg-rose-50/95 text-slate-900"
          : "bg-amber-50/95 text-slate-900"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Medication reminder"
    >
      <div className="min-h-full max-w-xl mx-auto flex flex-col justify-between p-4 sm:p-8">
        {/* Top Bar: Alarm status & Sound Toggle */}
        <div className="flex items-center justify-between w-full pt-2 pb-4">
          <div
            className={cn(
              "inline-flex items-center gap-2.5 px-4 py-2 rounded-full border font-semibold text-sm shadow-xs",
              isOverdue
                ? "bg-destructive/15 border-destructive/30 text-destructive animate-pulse"
                : "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
            )}
          >
            <motion.div
              animate={{ scale: [1, 1.25, 1], rotate: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: isOverdue ? 1 : 2, ease: "easeInOut" }}
            >
              {isOverdue ? (
                <AlertCircle className="w-5 h-5 text-destructive" />
              ) : (
                <Bell className="w-5 h-5 fill-amber-500/30 text-amber-600 dark:text-amber-400" />
              )}
            </motion.div>
            <span>
              {isOverdue
                ? "⚠️ 2nd Reminder: 15+ mins overdue"
                : "Time for your medicine"}
            </span>
          </div>

          <button
            onClick={handleMuteToggle}
            type="button"
            aria-label={muted ? "Unmute chime" : "Mute chime"}
            className={cn(
              "p-3 rounded-full border transition-colors flex items-center gap-2 text-sm font-medium shadow-xs",
              muted
                ? "bg-muted text-muted-foreground border-border"
                : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
            )}
          >
            {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            <span className="hidden sm:inline">{muted ? "Muted" : "Chiming"}</span>
          </button>
        </div>

        {/* Main Card: Medicine Information (Naturally Centered without clipping) */}
        <div className="py-4 w-full flex flex-col items-center text-center">
          {/* Visual Pill Indicator (Large photo or 3D Pill Visualizer) */}
          {displayImage ? (
            <div className="flex flex-col items-center mb-4">
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400 bg-white shrink-0 flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayImage}
                  alt={medication.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              {/* Prominent pill shape + color tag badge for instant recognition */}
              <div className="mt-3">
                <PillBadge color={pillColor} shape={pillShape} size="lg" />
              </div>
            </div>
          ) : (
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="mb-4 shrink-0"
            >
              <PillVisualizer
                color={pillColor}
                shape={pillShape}
                size="xl"
                showLabel={true}
              />
            </motion.div>
          )}

          {/* Medicine Name & Dosage */}
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2 leading-tight">
            {medication.name}
          </h1>

          <div className="inline-block px-5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-2xl sm:text-3xl mb-3">
            {medication.dosage}
          </div>

          {/* Structured Food / Meal Instruction */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 font-semibold text-lg mb-3">
            {medication.foodInstruction === "before_meal" && "🍽️ Take Before Meal"}
            {medication.foodInstruction === "with_meal" && "🍲 Take With Food"}
            {(!medication.foodInstruction || medication.foodInstruction === "after_meal") && "☕ Take After Meal"}
            {medication.foodInstruction === "anytime" && "🕒 Take Anytime"}
          </div>

          {/* Scheduled Time Banner */}
          <div className="flex items-center gap-2 text-muted-foreground font-medium text-lg mb-4">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>Scheduled for {formattedTime}</span>
          </div>

          {/* Instructions / Explanation Card */}
          <div
            className={cn(
              "w-full p-5 rounded-2xl border text-left mb-2 shadow-sm",
              isNight
                ? "bg-slate-900/80 border-slate-800 text-slate-200"
                : "bg-white border-amber-200/60 text-slate-800"
            )}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              How to take
            </p>
            <p className="text-xl sm:text-2xl font-bold leading-relaxed">
              {displayExplanation}
            </p>
            {medication.simpleExplanation && cleanNotes && cleanNotes !== medication.simpleExplanation && (
              <p className="text-sm text-muted-foreground mt-2 pt-2 border-t border-border">
                Note: {cleanNotes}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Controls: Big Green "I took it" & Snooze */}
        <div className="w-full space-y-4 pt-2 pb-4">
          {/* Primary Action Button: Massive, Unmissable */}
          <button
            onClick={onTookIt}
            type="button"
            className="w-full py-6 px-8 rounded-3xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-2xl sm:text-3xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-4 transition-all border-2 border-emerald-400/40"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-7 h-7 text-white stroke-[3]" />
            </div>
            <span>I took it</span>
          </button>

          {/* Secondary Action: Snooze for 10 minutes */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onSnooze}
              type="button"
              className={cn(
                "py-4 px-4 rounded-2xl border font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                isNight
                  ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              )}
            >
              <Clock className="w-5 h-5 text-amber-500" />
              <span>Remind in 10m</span>
            </button>

            <button
              onClick={onDismiss}
              type="button"
              className={cn(
                "py-4 px-4 rounded-2xl border font-bold text-base sm:text-lg transition-all active:scale-[0.98]",
                isNight
                  ? "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200"
                  : "bg-white/50 border-slate-200 text-slate-500 hover:text-slate-800"
              )}
            >
              Not right now
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
