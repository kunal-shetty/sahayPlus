"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseVoiceRecognitionOptions {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  timeoutMs?: number;
}

export function useVoiceRecognition(options?: UseVoiceRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store options in a ref to prevent infinite re-render cycles
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef<string>("");

  const stopStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const hasNativeSpeech =
    typeof window !== "undefined" &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Transcribe recorded audio with Groq Whisper if speech recognition gave no results or hit an error
  const transcribeWithWhisper = useCallback(
    async (audioBlob: Blob) => {
      if (audioBlob.size < 1000) return;

      setIsProcessing(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("file", audioBlob, "speech.webm");

        const res = await fetch("/api/voice/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Whisper transcription failed");
        }

        const recognizedText = (data.text || "").trim();
        if (recognizedText) {
          lastTranscriptRef.current = recognizedText;
          setTranscript(recognizedText);
          optionsRef.current?.onTranscript?.(recognizedText, true);
        }
      } catch (err: any) {
        console.warn("Whisper fallback error:", err);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const stopListening = useCallback(() => {
    clearTimer();

    // 1. Stop native recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    // 2. Stop MediaRecorder and trigger Whisper if native text was empty
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    // If native recognition produced text before stopping, fire final event
    if (lastTranscriptRef.current.trim()) {
      optionsRef.current?.onTranscript?.(lastTranscriptRef.current.trim(), true);
    }

    stopStream();
    setIsListening(false);
  }, [clearTimer, stopStream]);

  const startListening = useCallback(async () => {
    setError(null);
    setTranscript("");
    lastTranscriptRef.current = "";
    clearTimer();

    const maxTimeout = optionsRef.current?.timeoutMs || 10000;
    timeoutRef.current = setTimeout(() => {
      stopListening();
    }, maxTimeout);

    // 1. Always capture microphone stream for Whisper backup
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = [];
        if (!lastTranscriptRef.current.trim()) {
          transcribeWithWhisper(audioBlob);
        }
      };

      recorder.start();
      setIsListening(true);
    } catch (err: any) {
      stopStream();
      setIsListening(false);
      const errMsg =
        err.name === "NotAllowedError"
          ? "Microphone access denied. Please allow microphone permissions."
          : "Could not access microphone.";
      setError(errMsg);
      optionsRef.current?.onError?.(errMsg);
      return;
    }

    // 2. Start Native SpeechRecognition if available (Chrome, Edge, Safari)
    if (hasNativeSpeech) {
      try {
        const SpeechClass =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechClass();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;

        const userLang = navigator.language || "en-US";
        recognition.lang = userLang;

        recognition.onresult = (event: any) => {
          let interim = "";
          let final = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            if (item.isFinal) {
              final += item[0].transcript;
            } else {
              interim += item[0].transcript;
            }
          }

          const currentText = (final || interim).trim();
          if (currentText) {
            lastTranscriptRef.current = currentText;
            setTranscript(currentText);

            optionsRef.current?.onTranscript?.(currentText, Boolean(final));

            if (final) {
              clearTimer();
              setTimeout(() => {
                stopListening();
              }, 400);
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Native SpeechRecognition error:", event.error);
        };

        recognition.onend = () => {
          if (lastTranscriptRef.current.trim()) {
            optionsRef.current?.onTranscript?.(lastTranscriptRef.current.trim(), true);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn("Could not start native speech, relying on Whisper recorder:", err);
      }
    }
  }, [clearTimer, hasNativeSpeech, stopListening, stopStream, transcribeWithWhisper]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    transcript,
    isProcessing,
    error,
    startListening,
    stopListening,
    hasNativeSpeech,
  };
}
