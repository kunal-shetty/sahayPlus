"use client";

/**
 * @file wellness-checkin.tsx
 * @description The Wellness Check-in interface for Care Receivers.
 * Allows users to log their daily emotional and physical state using a
 * simplified scale (Great, Okay, Not Great). This data is then shared with
 * the caregiver to provide a baseline of the receiver's daily well-being.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSahay } from "@/lib/sahay-context";
import { ArrowLeft, Smile, Meh, Frown, Check } from "lucide-react";
import type { WellnessLevel } from "@/lib/types";

/**
 * Configuration for wellness levels.
 * Defines the visual and textual representation for each possible wellness state.
 */
const wellnessOptions: {
  level: WellnessLevel;
  icon: typeof Smile;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}[] = [
  {
    level: "great",
    icon: Smile,
    label: "Feeling Great",
    description: "I feel good today",
    color: "text-sahay-success",
    bgColor: "bg-sahay-success/10 border-sahay-success/30",
  },
  {
    level: "okay",
    icon: Meh,
    label: "Doing Okay",
    description: "I'm managing alright",
    color: "text-sahay-pending",
    bgColor: "bg-sahay-pending/10 border-sahay-pending/30",
  },
  {
    level: "notGreat",
    icon: Frown,
    label: "Not Feeling Great",
    description: "Could be better",
    color: "text-destructive",
    bgColor: "bg-destructive/10 border-destructive/30",
  },
];

/**
 * WellnessCheckin component.
 * Handles the process of selecting a wellness level, adding an optional note,
 * and submitting the data. Also displays a read-only view if a check-in
 * has already been completed for the current day.
 *
 * @param {WellnessCheckinProps} props - Component props.
 * @returns {JSX.Element} The wellness check-in interface.
 */
interface WellnessCheckinProps {
  onClose: () => void;
}

export function WellnessCheckin({ onClose }: WellnessCheckinProps) {
  const { logWellness, getTodayWellness, data } = useSahay();
  const [selectedLevel, setSelectedLevel] = useState<WellnessLevel | null>(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const todayWellness = getTodayWellness();
  const caregiverName = data.caregiver?.name || "your caregiver";

  /**
   * Submits the selected wellness level and optional note to the backend.
   */
  const handleSubmit = () => {
    if (selectedLevel) {
      logWellness(selectedLevel, note.trim() || undefined);
      setSubmitted(true);
      setIsEditing(false);
    }
  };

  /**
   * Read-only view.
   * Rendered when the user has already completed their check-in for the day and is not editing.
   */
  if (todayWellness && !submitted && !isEditing) {
    const normalizedLevel: WellnessLevel =
      todayWellness.level === ("not_great" as any)
        ? "notGreat"
        : (todayWellness.level as WellnessLevel);
    const config =
      wellnessOptions.find((o) => o.level === normalizedLevel) ||
      wellnessOptions[0];
    const Icon = config.icon;

    return (
      <main className="min-h-screen flex flex-col bg-background p-6">
        <button
          onClick={onClose}
          className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6
                   touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <div
            className={`w-24 h-24 rounded-full ${config.bgColor} border-2 flex items-center justify-center mb-6`}
          >
            <Icon className={`w-12 h-12 ${config.color}`} />
          </div>

          <h1 className="text-2xl font-semibold text-foreground mb-1 text-center">
            You checked in today
          </h1>
          <p className="text-xl font-bold text-foreground text-center mb-1">
            {config.label}
          </p>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Shared with {caregiverName}
          </p>
          {todayWellness.note && (
            <p className="text-base text-muted-foreground text-center italic bg-secondary/50 p-3 rounded-xl w-full max-w-xs mb-4">
              &quot;{todayWellness.note}&quot;
            </p>
          )}

          <div className="w-full max-w-xs flex flex-col gap-3 mt-4">
            <button
              onClick={() => {
                setSelectedLevel(normalizedLevel);
                if (todayWellness.note) setNote(todayWellness.note);
                setIsEditing(true);
              }}
              className="w-full py-4 px-6 bg-primary text-primary-foreground text-lg font-semibold rounded-xl
                       touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring transition-all active:scale-[0.98]"
            >
              Update how I feel
            </button>
            <button
              onClick={onClose}
              className="w-full py-3.5 px-6 bg-secondary text-foreground text-base font-medium rounded-xl
                       touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring transition-all active:scale-[0.98]"
            >
              Go back
            </button>
          </div>
        </div>
      </main>
    );
  }

  /**
   * Confirmation View.
   * Rendered immediately after successful submission.
   */
  if (submitted) {
    return (
      <main className="min-h-screen flex flex-col bg-sahay-sage-light p-6">
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <motion.div
            className="w-24 h-24 rounded-full bg-sahay-success/20 flex items-center justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Check className="w-12 h-12 text-sahay-success" />
            </motion.div>
          </motion.div>

          <motion.h1
            className="text-2xl font-semibold text-foreground mb-2 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Thank you for sharing
          </motion.h1>
          <motion.p
            className="text-xl text-muted-foreground text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {caregiverName} will see how you&apos;re feeling
          </motion.p>

          <motion.button
            onClick={onClose}
            className="mt-8 px-8 py-4 bg-primary text-primary-foreground text-lg font-medium rounded-xl
                     touch-manipulation active:scale-[0.97] transition-all
                     focus:outline-none focus:ring-2 focus:ring-ring"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.97 }}
          >
            Done
          </motion.button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={isEditing ? () => setIsEditing(false) : onClose}
          className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center
                   touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        {isEditing && (
          <button
            onClick={() => setIsEditing(false)}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground underline px-2 py-1"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <h1 className="text-3xl font-semibold text-foreground mb-2 text-center">
          {isEditing ? "Update your check-in" : "How are you feeling?"}
        </h1>
        <p className="text-xl text-muted-foreground text-center mb-8">
          {isEditing ? "Change how you're feeling today" : "Take a moment to check in"}
        </p>

        {/* Wellness options selection grid */}
        <div className="space-y-4 mb-8">
          {wellnessOptions.map((option, idx) => {
            const Icon = option.icon;
            const isSelected = selectedLevel === option.level;
            return (
              <motion.button
                key={option.level}
                onClick={() => setSelectedLevel(option.level)}
                className={`w-full p-6 rounded-2xl border-2 flex items-center gap-5
                         touch-manipulation transition-all
                         focus:outline-none focus:ring-2 focus:ring-ring
                         ${
                           isSelected
                             ? option.bgColor
                             : "bg-card border-border hover:border-muted-foreground/50"
                         }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 + 0.1 }}
                whileTap={{ scale: 0.97 }}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center
                            ${isSelected ? option.bgColor : "bg-secondary"}`}
                >
                  <Icon
                    className={`w-8 h-8 ${isSelected ? option.color : "text-muted-foreground"}`}
                  />
                </div>
                <div className="text-left">
                  <p
                    className={`text-xl font-semibold ${
                      isSelected ? option.color : "text-foreground"
                    }`}
                  >
                    {option.label}
                  </p>
                  <p className="text-muted-foreground">{option.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Optional detailed note input */}
        <AnimatePresence>
          {selectedLevel && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-lg font-medium text-foreground mb-2">
                Anything you want to add?{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Feeling a bit tired today"
                className="w-full px-5 py-4 text-lg bg-input border-2 border-border rounded-xl
                         focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20
                         transition-all"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleSubmit}
          disabled={!selectedLevel}
          className="w-full py-5 bg-primary text-primary-foreground text-xl font-semibold rounded-xl
                   touch-manipulation disabled:opacity-50 mt-auto transition-all
                   focus:outline-none focus:ring-2 focus:ring-ring"
          whileTap={{ scale: 0.97 }}
          animate={{ opacity: selectedLevel ? 1 : 0.5 }}
        >
          {isEditing ? "Update how I feel" : "Share how I feel"}
        </motion.button>
      </div>
    </main>
  );
}
