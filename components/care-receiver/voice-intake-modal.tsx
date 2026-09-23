"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Mic, Check, X, Pill, Loader2, Sparkles } from "lucide-react";
import { type Medication } from "@/lib/types";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";
import { matchMedicationFromTranscript, type VoiceMatchResult } from "@/lib/voice-matcher";
import { playSuccessChime } from "@/lib/audio-chime";

interface VoiceIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  medications: Medication[];
  nextMed?: Medication | null;
  onConfirmDose: (medicationId: string) => void;
}

export function VoiceIntakeModal({
  isOpen,
  onClose,
  medications,
  nextMed,
  onConfirmDose,
}: VoiceIntakeModalProps) {
  const [matchResult, setMatchResult] = useState<VoiceMatchResult | null>(null);
  const [confirmedMed, setConfirmedMed] = useState<Medication | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Listening... say your medicine name or 'I took it'");
  const processedRef = useRef(false);

  const confirmDoseAndClose = useCallback(
    (med: Medication) => {
      if (processedRef.current) return;
      processedRef.current = true;

      playSuccessChime();
      setConfirmedMed(med);
      onConfirmDose(med.id);

      setTimeout(() => {
        onClose();
      }, 1800);
    },
    [onConfirmDose, onClose]
  );

  const evaluateSpeech = useCallback(
    (spokenText: string, isFinal: boolean) => {
      if (!spokenText.trim() || processedRef.current) return;

      const result = matchMedicationFromTranscript(spokenText, medications, nextMed);
      setMatchResult(result);

      if (result.matchedMed && result.confidence === "high") {
        if (isFinal) {
          confirmDoseAndClose(result.matchedMed);
        } else {
          setStatusMessage(`Identified: ${result.matchedMed.name}`);
        }
      } else if (result.matchedMed && result.confidence === "medium") {
        setStatusMessage(result.feedbackMessage);
      } else {
        setStatusMessage(result.feedbackMessage);
      }
    },
    [medications, nextMed, confirmDoseAndClose]
  );

  const { isListening, transcript, isProcessing, error, startListening, stopListening } =
    useVoiceRecognition({
      onTranscript: (currentTranscript, isFinal) => {
        evaluateSpeech(currentTranscript, isFinal);
      },
      onError: (err) => {
        setStatusMessage(err);
      },
    });

  // Start listening only when isOpen changes — completely stable
  useEffect(() => {
    if (isOpen) {
      processedRef.current = false;
      setMatchResult(null);
      setConfirmedMed(null);
      setStatusMessage("Listening... say your medicine name or 'I took it'");
      startListening();
    } else {
      stopListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const untakenMeds = medications.filter((m) => !m.taken);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-card text-foreground border-2 border-border rounded-3xl p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center select-none">
        {/* Close button */}
        <button
          onClick={() => {
            stopListening();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors active:scale-95 cursor-pointer"
          aria-label="Close voice modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Title */}
        <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-wider uppercase mb-5">
          <Sparkles className="w-4 h-4" />
          <span>Voice Medication Confirmation</span>
        </div>

        {/* Central Static Microphone or Success Icon (Strict fixed dimensions, zero shaking) */}
        <div className="w-24 h-24 my-3 flex items-center justify-center shrink-0">
          {confirmedMed ? (
            <div className="w-24 h-24 rounded-full bg-sahay-success text-white flex items-center justify-center shadow-lg shadow-sahay-success/30">
              <Check className="w-12 h-12" strokeWidth={3} />
            </div>
          ) : (
            <button
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  startListening();
                }
              }}
              className={`w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-sm cursor-pointer transition-colors ${
                isListening
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : isProcessing
                  ? "bg-secondary text-foreground"
                  : "bg-primary/10 text-primary border-2 border-primary/40 hover:bg-primary/20"
              }`}
              aria-label={isListening ? "Listening - tap to stop" : "Tap to speak"}
            >
              {isProcessing ? (
                <Loader2 className="w-9 h-9 animate-spin text-primary" />
              ) : (
                <>
                  <Mic className="w-9 h-9" />
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-90">
                    {isListening ? "Listening..." : "Tap to speak"}
                  </span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Status & Live Transcript Area (Strict fixed height: 84px to prevent vertical jumping) */}
        <div className="h-[84px] w-full flex flex-col items-center justify-center px-2 my-2 overflow-hidden">
          {confirmedMed ? (
            <div className="space-y-1">
              <h3 className="text-xl font-black text-sahay-success">
                {confirmedMed.name} Recorded!
              </h3>
              <p className="text-xs font-medium text-muted-foreground">
                Marked as taken and shared with caregiver ❤️
              </p>
            </div>
          ) : transcript ? (
            <div className="space-y-1 w-full truncate">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                You said:
              </p>
              <p className="text-xl font-extrabold text-foreground italic truncate">
                "{transcript}"
              </p>
              <p className="text-xs font-semibold text-primary truncate">{statusMessage}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">
                {isListening ? "Speak clearly into your microphone" : "Tap the microphone to speak"}
              </p>
              <p className="text-xs text-muted-foreground">
                Say: "I took my Dolo", "Took morning pill", or "I took it"
              </p>
            </div>
          )}
        </div>

        {/* Senior 1-Tap Pills Selection: Senior can speak OR simply tap their medicine */}
        {!confirmedMed && (
          <div className="mt-3 w-full pt-4 border-t border-border">
            <p className="text-xs font-bold text-muted-foreground mb-2.5 uppercase tracking-wider">
              Or tap your medicine below:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {untakenMeds.map((med) => (
                <button
                  key={med.id}
                  onClick={() => confirmDoseAndClose(med)}
                  className="px-3.5 py-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground text-xs font-bold transition-colors border border-border flex items-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
                >
                  <Pill className="w-3.5 h-3.5 text-primary" />
                  <span>Took {med.name}</span>
                </button>
              ))}
              {nextMed && (
                <button
                  onClick={() => confirmDoseAndClose(nextMed)}
                  className="px-3.5 py-2 rounded-xl bg-sahay-success/15 hover:bg-sahay-success hover:text-white text-sahay-success text-xs font-bold transition-colors border border-sahay-success/30 active:scale-95 cursor-pointer"
                >
                  ✓ "I took it"
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
