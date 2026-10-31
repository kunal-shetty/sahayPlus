"use client";

/**
 * @file quick-messages.tsx
 * @description The Quick Messages interface for Care Receivers.
 * Allows elderly users to quickly communicate common needs or statuses to
 * their caregiver via a set of pre-defined "tap-to-send" buttons or a
 * custom text input. Features high-contrast buttons and immediate visual feedback.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSahay } from "@/lib/sahay-context";
import { ArrowLeft, Send, Check, MessageCircle, Pill } from "lucide-react";
import { playSuccessChime } from "@/lib/audio-chime";
import { matchMedicationFromTranscript } from "@/lib/voice-matcher";

/**
 * Props for the QuickMessages component.
 * @interface QuickMessagesProps
 * @property {() => void} onClose - Callback to close the messages screen and return to home.
 */
interface QuickMessagesProps {
  onClose: () => void;
}

/**
 * QuickMessages component.
 * Provides a streamlined messaging experience for care receivers,
 * reducing the friction of typing by offering a library of quick-send options.
 *
 * @param {QuickMessagesProps} props - Component props.
 * @returns {JSX.Element} The messaging interface.
 */
export function QuickMessages({ onClose }: QuickMessagesProps) {
  const { data, sendMessage, markMedicationTaken } = useSahay();
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [loggedMedication, setLoggedMedication] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [sendingIndex, setSendingIndex] = useState<number | null>(null);

  const caregiverName = data.caregiver?.name || "your caregiver";

  /**
   * The list of pre-defined messages.
   * Uses user-specific messages if available, otherwise defaults to a general set.
   */
  const quickMessages = data.careReceiver?.quickMessages || [
    "I took my medicine",
    "Feeling good today",
    "Can you call me?",
    "Need help with refill",
    "All done for the day",
  ];

  /**
   * Handles sending a pre-defined quick message.
   * If the message indicates medicine intake ("I took my medicine"), it automatically
   * marks the active pending medication as taken so the caregiver dashboard,
   * adherence charts, and scheduled alarm stay strictly synchronized.
   *
   * @param {string} message - The content of the message to send.
   * @param {number} index - The index of the message in the list for UI tracking.
   */
  const handleSendQuick = (message: string, index: number) => {
    setSendingIndex(index);
    setTimeout(() => {
      // 1. Send chat notification to caregiver
      sendMessage(message, true);

      // 2. Identify if this confirms medication intake
      let loggedName: string | null = null;
      const lower = message.toLowerCase();
      const isIntakeMsg =
        lower.includes("took my medicine") ||
        lower.includes("took medicine") ||
        lower.includes("took my pill") ||
        lower.includes("dawa le li") ||
        lower.includes("dawai le li");

      if (isIntakeMsg) {
        // Find the active pending / untaken medication
        const pendingMed = data.medications.find((m) => !m.taken);
        if (pendingMed) {
          markMedicationTaken(pendingMed.id, true);
          loggedName = pendingMed.name;
          playSuccessChime();
        }
      }

      setLoggedMedication(loggedName);
      setSentMessage(message);
      setSendingIndex(null);
    }, 400);
  };

  /**
   * Handles sending a user-typed custom message.
   * Also parses medicine names or affirmations to update dose schedule automatically.
   */
  const handleSendCustom = () => {
    if (customMessage.trim()) {
      const msg = customMessage.trim();
      sendMessage(msg, false);

      let loggedName: string | null = null;
      const match = matchMedicationFromTranscript(msg, data.medications);
      if (match.intent === "mark_taken" && match.matchedMed && !match.matchedMed.taken) {
        markMedicationTaken(match.matchedMed.id, true);
        loggedName = match.matchedMed.name;
        playSuccessChime();
      }

      setLoggedMedication(loggedName);
      setSentMessage(msg);
      setCustomMessage("");
    }
  };

  /**
   * Success View.
   * Rendered after a message has been successfully sent, providing clear
   * confirmation of what was sent and who will receive it.
   */
  if (sentMessage) {
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
              transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
            >
              <Check className="w-12 h-12 text-sahay-success" />
            </motion.div>
          </motion.div>

          <motion.h1
            className="text-2xl font-semibold text-foreground mb-3 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Message sent
          </motion.h1>
          <motion.p
            className="text-xl text-muted-foreground text-center mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {caregiverName} will see:
          </motion.p>
          <motion.p
            className="text-lg text-foreground text-center bg-card rounded-xl px-6 py-4 border-2 border-border shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            &quot;{sentMessage}&quot;
          </motion.p>

          {loggedMedication && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              className="mt-4 px-4 py-3 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-center font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-xs"
            >
              <Pill className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Marked {loggedMedication} as taken in your schedule!</span>
            </motion.div>
          )}

          <motion.div
            className="flex flex-col gap-3 mt-8 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={() => {
                setSentMessage(null);
                setLoggedMedication(null);
              }}
              className="w-full py-4 bg-secondary text-foreground text-lg font-medium rounded-xl
                       touch-manipulation active:scale-[0.98] transition-all
                       focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Send another message
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 bg-primary text-primary-foreground text-lg font-medium rounded-xl
                       touch-manipulation active:scale-[0.98] transition-all
                       focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Done
            </button>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-background p-6">
      {/* Header */}
      <motion.button
        onClick={onClose}
        className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6
                 hover:bg-secondary/80 active:scale-95 transition-all
                 touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Go back"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <ArrowLeft className="w-6 h-6 text-foreground" />
      </motion.button>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-14 h-14 rounded-full bg-sahay-sage-light flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-sahay-sage" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Send a message
            </h1>
            <p className="text-muted-foreground">to {caregiverName}</p>
          </div>
        </motion.div>

        {/* Quick message buttons */}
        <motion.p
          className="text-lg font-medium text-foreground mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          Tap to send
        </motion.p>
        <div className="space-y-3 mb-8">
          <AnimatePresence>
            {quickMessages.map((message, index) => (
              <motion.button
                key={index}
                onClick={() => handleSendQuick(message, index)}
                className={`w-full p-5 bg-card border-2 rounded-xl text-left
                         transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring
                         ${
                           sendingIndex === index
                             ? "border-sahay-sage bg-sahay-sage-light scale-[0.98]"
                             : "border-border hover:border-sahay-sage/50 active:bg-sahay-sage-light"
                         }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index + 0.2, duration: 0.3 }}
                whileTap={{ scale: 0.97 }}
                disabled={sendingIndex !== null}
              >
                <div className="flex items-center gap-3">
                  <p className="text-xl text-foreground flex-1">{message}</p>
                  {sendingIndex === index && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Check className="w-5 h-5 text-sahay-sage" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Custom message input area */}
        <motion.div
          className="mt-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-lg font-medium text-foreground mb-3">
            Or write your own
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-5 py-4 text-lg bg-input border-2 border-border rounded-xl
                       focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20
                       transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSendCustom();
                }
              }}
            />
            <motion.button
              onClick={handleSendCustom}
              disabled={!customMessage.trim()}
              className="w-14 h-14 rounded-xl bg-sahay-sage flex items-center justify-center
                       touch-manipulation disabled:opacity-40 flex-shrink-0
                       focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              whileTap={{ scale: 0.9 }}
              aria-label="Send"
            >
              <Send className="w-6 h-6 text-primary-foreground" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
