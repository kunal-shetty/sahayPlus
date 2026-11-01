"use client";

/**
 * @file emergency-sos-modal.tsx
 * @description Module 6: Emergency SOS & Two-Stage Grace Countdown Modal.
 *
 * Provides a 10-second grace window (STAGE_1_10_second_GRACE_WINDOW) with 48pt bold numerals,
 * pulsating audio heartbeat, screen wake-lock, and a prominent "Cancel (False Alarm)" abort button.
 * If uncancelled, escalates to STAGE_2_DISPATCH with GPS coordinates, continuous caregiver siren,
 * and high-priority database broadcast.
 */

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ShieldAlert, Phone, X, MapPin, Radio } from "lucide-react";
import { playHeartbeatPulse, stopHeartbeatPulse } from "@/lib/audio-chime";
import { EMERGENCY_NUMBER } from "@/lib/utils";

interface EmergencySosModalProps {
  isOpen: boolean;
  onCancel: () => void;
  /** Fired the moment the countdown ends — the alert must not wait on GPS. */
  onDispatch: () => void;
  /** Fired afterwards if the phone's location becomes available. */
  onLocation?: (location: { latitude: number; longitude: number }) => void;
  /** "I am safe now" after dispatch — resolves the alert, not just closes the modal. */
  onSafe?: () => void;
  primaryContactName?: string;
  primaryContactPhone?: string;
}

export function EmergencySosModal({
  isOpen,
  onCancel,
  onDispatch,
  onLocation,
  onSafe,
  primaryContactName = "Primary Caregiver",
  primaryContactPhone = EMERGENCY_NUMBER,
}: EmergencySosModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [stage, setStage] = useState<"grace" | "dispatched">("grace");
  const [locationStr, setLocationStr] = useState<string | null>(null);
  const wakeLockRef = useRef<any>(null);
  const isAbortedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  /** Set by "I am safe now": a location arriving later must not be sent. */
  const alertResolvedRef = useRef(false);

  // Manage WakeLock to prevent screen dimming during emergency states
  useEffect(() => {
    if (!isOpen) return;

    const acquireWakeLock = async () => {
      try {
        if ("wakeLock" in navigator && (navigator as any).wakeLock) {
          wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
        }
      } catch (err) {
        console.warn("Wake lock request failed:", err);
      }
    };

    acquireWakeLock();

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release?.().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [isOpen]);

  // Handle 10-second Grace Window Countdown
  useEffect(() => {
    if (!isOpen) {
      isAbortedRef.current = true;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setSecondsLeft(10);
      setStage("grace");
      setLocationStr(null);
      stopHeartbeatPulse();
      return;
    }

    isAbortedRef.current = false;
    alertResolvedRef.current = false;
    setSecondsLeft(10);
    setStage("grace");

    try {
      playHeartbeatPulse();
    } catch (e) {
      console.warn("Heartbeat audio error:", e);
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Only counts down; dispatch happens in the effect below so it can't run
    // twice (React may invoke state updaters more than once).
    timerRef.current = setInterval(() => {
      if (isAbortedRef.current) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      stopHeartbeatPulse();
    };
  }, [isOpen]);

  // Dispatch exactly once when the countdown reaches zero. Kept out of the
  // setState updater above, which React may run twice.
  useEffect(() => {
    if (isOpen && stage === "grace" && secondsLeft === 0) {
      triggerDispatch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, stage, secondsLeft]);

  const triggerDispatch = () => {
    if (isAbortedRef.current) return;
    stopHeartbeatPulse();
    setStage("dispatched");

    // Alert the caregiver immediately; location is a follow-up. Waiting on
    // GPS here would stall the alert behind the browser's permission prompt.
    onDispatch();

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (alertResolvedRef.current) return;
          const loc = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setLocationStr(`${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`);
          onLocation?.(loc);
        },
        () => {
          setLocationStr("Location unavailable");
        },
        { timeout: 10000, enableHighAccuracy: true },
      );
    }
  };

  const handleAbort = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    isAbortedRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopHeartbeatPulse();
    if (wakeLockRef.current) {
      wakeLockRef.current.release?.().catch(() => {});
      wakeLockRef.current = null;
    }
    setStage("grace");
    setSecondsLeft(10);
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-card border-4 border-rose-600 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        {stage === "grace" ? (
          <>
            {/* Stage 1: Grace Countdown Window */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-widest border border-rose-500/30">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Emergency SOS Triggered</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                Sending Emergency Alert In
              </h2>
              <p className="text-sm text-muted-foreground">
                Alert will dispatch to your family caregiver and emergency services
              </p>
            </div>

            {/* 48pt Bold Numerals Countdown Display */}
            <div className="relative flex items-center justify-center my-6">
              <motion.div
                key={secondsLeft}
                initial={{ scale: 1.25, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-8 border-rose-600/30 flex items-center justify-center bg-rose-500/10 shadow-inner"
              >
                <span className="text-6xl sm:text-7xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tighter">
                  {secondsLeft}s
                </span>
              </motion.div>
              <div className="absolute inset-0 rounded-full border-2 border-rose-500/50 animate-ping pointer-events-none" />
            </div>

            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              Press cancel if you touched this by mistake
            </p>

            {/* Abort Button: Prominent "Cancel (False Alarm)" with high contrast & generous padding */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAbort}
                className="w-full py-5 px-6 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground border-4 border-border text-lg sm:text-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg touch-manipulation focus:outline-none focus:ring-4 focus:ring-primary/50 cursor-pointer"
              >
                <X className="w-6 h-6 text-foreground" strokeWidth={3} />
                <span>Cancel (False Alarm)</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Stage 2: Dispatched State */}
            <div className="space-y-3">
              <div className="w-20 h-20 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto shadow-xl animate-bounce">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
                Help Alert Dispatched!
              </h2>
              <p className="text-base text-foreground font-medium">
                Your caregiver has been alerted. Your location will be sent if your phone allows it.
              </p>
              {locationStr && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-full text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>GPS: {locationStr}</span>
                </div>
              )}
            </div>

            {/* One-Tap Direct Emergency Call */}
            <div className="space-y-3 pt-2">
              <a
                href={`tel:${primaryContactPhone}`}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 touch-manipulation"
              >
                <Phone className="w-6 h-6 animate-pulse" />
                <span>Call {primaryContactName}</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  alertResolvedRef.current = true;
                  handleAbort();
                  onSafe?.();
                }}
                className="w-full py-3 px-6 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary transition-all cursor-pointer"
              >
                I am safe now
              </button>
              <button
                type="button"
                onClick={handleAbort}
                className="w-full py-3 px-6 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-secondary transition-all cursor-pointer"
              >
                Close (keep alert on)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
