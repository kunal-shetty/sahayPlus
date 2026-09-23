"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, Square, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useSahay } from "@/lib/sahay-context";
import { cn } from "@/lib/utils";
import { matchMedicationFromTranscript } from "@/lib/voice-matcher";
import { playSuccessChime, unlockAudioContext } from "@/lib/audio-chime";

interface VoiceInputProps {
  className?: string;
}

/**
 * MediaRecorder container/codec preferences, in order of preference.
 * Whisper infers the audio format from the container header, so the recorded
 * blob must keep the codec the browser actually produced (webm/ogg/mp4) —
 * relabelling it as `audio/wav` makes the upload unreadable.
 */
const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

/**
 * Picks the best supported recording codec for the current browser.
 * @returns {string | undefined} A supported MIME type, or undefined to let the browser decide.
 */
function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  if (typeof MediaRecorder.isTypeSupported !== "function") return undefined;
  return PREFERRED_MIME_TYPES.find((type) =>
    MediaRecorder.isTypeSupported(type),
  );
}

/**
 * Maps a recording MIME type to a file extension Whisper accepts.
 * @param {string} mimeType - The MIME type of the recorded blob.
 * @returns {string} The matching file extension (without the dot).
 */
function extensionForMimeType(mimeType: string): string {
  const mime = mimeType.toLowerCase();
  if (mime.includes("webm")) return "webm";
  if (mime.includes("ogg") || mime.includes("oga")) return "ogg";
  if (mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac"))
    return "m4a";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  if (mime.includes("wav") || mime.includes("wave")) return "wav";
  return "webm";
}

export function VoiceInput({ className }: VoiceInputProps) {
  const { user, data, markMedicationTaken } = useSahay();
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "recording" | "processing" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  /**
   * Releases the microphone. Without this the browser keeps the recording
   * indicator lit (and the mic hot) long after the user pressed stop.
   */
  const stopStream = useCallback(() => {
    mediaStream.current?.getTracks().forEach((track) => track.stop());
    mediaStream.current = null;
  }, []);

  /** Releases the microphone if the component unmounts mid-recording. */
  useEffect(() => {
    return () => {
      if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
        mediaRecorder.current.stop();
      }
      stopStream();
    };
  }, [stopStream]);

  const startRecording = async () => {
    unlockAudioContext();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      mediaRecorder.current = recorder;
      audioChunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        stopStream();

        const type = recorder.mimeType || mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunks.current, { type });
        audioChunks.current = [];
        await processVoice(audioBlob, extensionForMimeType(type));
      };

      recorder.start();
      setIsRecording(true);
      setStatus("recording");
      setMessage("Listening...");
    } catch (err) {
      console.error("Error accessing microphone:", err);
      stopStream();
      setStatus("error");
      setMessage("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
    stopStream();
    setIsRecording(false);
  };

  const processVoice = async (blob: Blob, extension: string) => {
    setStatus("processing");
    setMessage("Transcribing...");

    try {
      // 1. Transcribe using Groq Whisper, keeping the real container/extension.
      const formData = new FormData();
      formData.append("file", blob, `recording.${extension}`);

      const transRes = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: formData,
      });
      const transData = await transRes.json();

      if (!transRes.ok)
        throw new Error(transData.error || "Transcription failed");

      const text: string = transData.text || "";
      if (!text.trim()) {
        setStatus("error");
        setMessage("I didn't catch that. Please try again.");
        return;
      }

      setMessage(`"${text}"`);

      // 2. Fast Path: Local intelligent matching
      const localMatch = matchMedicationFromTranscript(text, data.medications);
      if (localMatch.matchedMed && localMatch.confidence === "high") {
        playSuccessChime();
        markMedicationTaken(localMatch.matchedMed.id, true);
        setStatus("success");
        setMessage(localMatch.feedbackMessage);
        return;
      }

      // 3. Fallback: LLM processing via /api/voice/process
      setStatus("processing");
      setMessage("Updating records...");
      const procRes = await fetch("/api/voice/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          userId: user?.id,
          careRelationshipId: user?.care_relationship_id,
          medications: data.medications,
        }),
      });
      const procData = await procRes.json();

      if (procRes.ok && procData.success) {
        if (procData.medicationId) {
          playSuccessChime();
          markMedicationTaken(String(procData.medicationId), true);
        }
        setStatus("success");
        setMessage(procData.message);
      } else {
        setStatus("error");
        setMessage(
          procData.error || procData.message || "Something went wrong",
        );
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Voice processing failed");
    } finally {
      // Reset to idle after a few seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative">
        <motion.button
          onClick={isRecording ? stopRecording : startRecording}
          aria-label={isRecording ? "Stop recording" : "Record a voice command"}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg",
            isRecording
              ? "bg-destructive text-white scale-110 animate-pulse"
              : "bg-primary text-primary-foreground hover:scale-105",
          )}
          whileTap={{ scale: 0.9 }}
        >
          {isRecording ? (
            <Square className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </motion.button>

        {/* Recording Waveform Animation */}
        {isRecording && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-20 h-20 rounded-full bg-primary/20 animate-ping" />
            <div className="absolute w-16 h-16 rounded-full bg-primary/40 animate-ping [animation-delay:200ms]" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "px-4 py-2 rounded-2xl text-sm font-medium flex items-center gap-2 shadow-sm border",
              status === "success"
                ? "bg-sahay-success/10 text-sahay-success border-sahay-success/20"
                : status === "error"
                  ? "bg-destructive/10 text-destructive border-destructive/20"
                  : "bg-secondary text-foreground border-border",
            )}
          >
            {status === "processing" && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {status === "success" && <CheckCircle2 className="w-4 h-4" />}
            {status === "error" && <AlertCircle className="w-4 h-4" />}
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
