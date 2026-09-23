"use client";

/**
 * @file intake-alarm-modal.tsx
 * @description Full-screen, high-contrast medication intake alarm modal designed for elderly care receivers.
 * Features extra-large typography, clear instructions, a prominent "I took it" button,
 * and a 10-minute snooze option.
 */

import { useState } from "react";
import { motion } from "motion/react";
import { type Medication, formatTime12h } from "@/lib/types";
import { Check, Clock, Volume2, VolumeX, Pill, Bell, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntakeAlarmModalProps {
  medication: Medication;
  isNight?: boolean;
  onTookIt: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
  onToggleSound?: (muted: boolean) => void;
  isMuted?: boolean;
}

export function IntakeAlarmModal({
  medication,
  isNight = false,
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 select-none overflow-y-auto",
        isNight
          ? "bg-slate-950 text-slate-100"
          : "bg-amber-50/95 text-slate-900"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Medication reminder"
    >
      {/* Top Bar: Alarm status & Sound Toggle */}
      <div className="flex items-center justify-between max-w-xl w-full mx-auto pt-2">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold text-sm">
          <motion.div
            animate={{ scale: [1, 1.25, 1], rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <Bell className="w-5 h-5 fill-amber-500/30 text-amber-600 dark:text-amber-400" />
          </motion.div>
          <span>Time for your medicine</span>
        </div>

        <button
          onClick={handleMuteToggle}
          type="button"
          aria-label={muted ? "Unmute chime" : "Mute chime"}
          className={cn(
            "p-3 rounded-full border transition-colors flex items-center gap-2 text-sm font-medium",
            muted
              ? "bg-muted text-muted-foreground border-border"
              : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
          )}
        >
          {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          <span className="hidden sm:inline">{muted ? "Muted" : "Chiming"}</span>
        </button>
      </div>

      {/* Main Card: Medicine Information */}
      <div className="my-auto py-8 max-w-xl w-full mx-auto flex flex-col items-center text-center">
        {/* Visual Pill Indicator */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className={cn(
            "w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-xl border-2",
            isNight
              ? "bg-slate-900 border-amber-500/30 shadow-amber-950/40"
              : "bg-white border-amber-400/40 shadow-amber-200/50"
          )}
        >
          <Pill className="w-12 h-12 text-amber-500" strokeWidth={1.8} />
        </motion.div>

        {/* Medicine Name & Dosage */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2 leading-tight">
          {medication.name}
        </h1>

        <div className="inline-block px-5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-2xl sm:text-3xl mb-4">
          {medication.dosage}
        </div>

        {/* Scheduled Time Banner */}
        <div className="flex items-center gap-2 text-muted-foreground font-medium text-lg mb-6">
          <Clock className="w-5 h-5 text-amber-500" />
          <span>Scheduled for {formattedTime}</span>
        </div>

        {/* Instructions / Explanation Card */}
        {(medication.simpleExplanation || medication.notes || medication.pharmacistNote) && (
          <div
            className={cn(
              "w-full p-5 rounded-2xl border text-left mb-4 shadow-sm",
              isNight
                ? "bg-slate-900/80 border-slate-800 text-slate-200"
                : "bg-white border-amber-200/60 text-slate-800"
            )}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              How to take
            </p>
            <p className="text-xl sm:text-2xl font-semibold leading-relaxed">
              {medication.simpleExplanation || medication.notes || medication.pharmacistNote}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Controls: Big Green "I took it" & Snooze */}
      <div className="max-w-xl w-full mx-auto space-y-4 pb-4">
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
    </motion.div>
  );
}
