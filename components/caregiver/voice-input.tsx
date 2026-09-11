'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Mic, Square, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useSahay } from '@/lib/sahay-context'
import { cn } from '@/lib/utils'

interface VoiceInputProps {
  className?: string
}

export function VoiceInput({ className }: VoiceInputProps) {
  const { user } = useSahay()
  const [isRecording, setIsRecording] = useState(false)
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorder.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data)
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' })
        audioChunks.current = []
        await processVoice(audioBlob)
      }

      recorder.start()
      setIsRecording(true)
      setStatus('recording')
      setMessage('Listening...')
    } catch (err) {
      console.error('Error accessing microphone:', err)
      setStatus('error')
      setMessage('Microphone access denied')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop()
      setIsRecording(false)
    }
  }

  const processVoice = async (blob: Blob) => {
    setStatus('processing')
    setMessage('Transcribing...')

    try {
      // 1. Transcribe using Groq Whisper
      const formData = new FormData()
      formData.append('file', blob, 'recording.wav')

      const transRes = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      })
      const transData = await transRes.json()

      if (!transRes.ok) throw new Error(transData.error || 'Transcription failed')

      const text = transData.text
      setMessage(`"${text}"`)

      // 2. Process action
      setStatus('processing')
      setMessage('Updating records...')
      const procRes = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          userId: user?.id,
          careRelationshipId: user?.care_relationship_id,
        }),
      })
      const procData = await procRes.json()

      if (procRes.ok && procData.success) {
        setStatus('success')
        setMessage(procData.message)
      } else {
        setStatus('error')
        setMessage(procData.message || 'Something went wrong')
      }
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Voice processing failed')
    } finally {
      // Reset to idle after a few seconds
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 5000)
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative">
        <motion.button
          onClick={isRecording ? stopRecording : startRecording}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg",
            isRecording
              ? "bg-destructive text-white scale-110 animate-pulse"
              : "bg-primary text-primary-foreground hover:scale-105"
          )}
          whileTap={{ scale: 0.9 }}
        >
          {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
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
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "px-4 py-2 rounded-2xl text-sm font-medium flex items-center gap-2 shadow-sm border",
              status === 'success' ? "bg-sahay-success/10 text-sahay-success border-sahay-success/20" :
              status === 'error' ? "bg-destructive/10 text-destructive border-destructive/20" :
              "bg-secondary text-foreground border-border"
            )}
          >
            {status === 'processing' && <Loader2 className="w-4 h-4 animate-spin" />}
            {status === 'success' && <CheckCircle2 className="w-4 h-4" />}
            {status === 'error' && <AlertCircle className="w-4 h-4" />}
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
