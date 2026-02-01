'use client'

import { useState } from 'react'
import { useSahay } from '@/lib/sahay-context'
import { ArrowLeft, Send, Check, MessageCircle } from 'lucide-react'

interface QuickMessagesProps {
  onClose: () => void
}

export function QuickMessages({ onClose }: QuickMessagesProps) {
  const { data, sendMessage } = useSahay()
  const [sentMessage, setSentMessage] = useState<string | null>(null)
  const [customMessage, setCustomMessage] = useState('')

  const caregiverName = data.caregiver?.name || 'your caregiver'
  const quickMessages = data.careReceiver?.quickMessages || [
    'I took my medicine',
    'Feeling good today',
    'Can you call me?',
    'Need help with refill',
    'All done for the day',
  ]

  const handleSendQuick = (message: string) => {
    sendMessage(message, true)
    setSentMessage(message)
  }

  const handleSendCustom = () => {
    if (customMessage.trim()) {
      sendMessage(customMessage.trim(), false)
      setSentMessage(customMessage.trim())
      setCustomMessage('')
    }
  }

  // Success view after sending
  if (sentMessage) {
    return (
      <main className="min-h-screen flex flex-col bg-sahay-sage-light p-6">
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <div className="w-24 h-24 rounded-full bg-sahay-success/20 flex items-center justify-center mb-6">
            <Check className="w-12 h-12 text-sahay-success" />
          </div>

          <h1 className="text-2xl font-semibold text-foreground mb-3 text-center">
            Message sent
          </h1>
          <p className="text-xl text-muted-foreground text-center mb-2">
            {caregiverName} will see:
          </p>
          <p className="text-lg text-foreground text-center bg-card rounded-xl px-6 py-4 border-2 border-border">
            &quot;{sentMessage}&quot;
          </p>

          <div className="flex flex-col gap-3 mt-8 w-full">
            <button
              onClick={() => setSentMessage(null)}
              className="w-full py-4 bg-secondary text-foreground text-lg font-medium rounded-xl
                       touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Send another message
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 bg-primary text-primary-foreground text-lg font-medium rounded-xl
                       touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Done
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-background p-6">
      {/* Header */}
      <button
        onClick={onClose}
        className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6
                 touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Go back"
      >
        <ArrowLeft className="w-6 h-6 text-foreground" />
      </button>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full bg-sahay-sage-light flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-sahay-sage" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Send a message
            </h1>
            <p className="text-muted-foreground">to {caregiverName}</p>
          </div>
        </div>

        {/* Quick message buttons */}
        <p className="text-lg font-medium text-foreground mb-3">
          Tap to send
        </p>
        <div className="space-y-3 mb-8">
          {quickMessages.map((message, index) => (
            <button
              key={index}
              onClick={() => handleSendQuick(message)}
              className="w-full p-5 bg-card border-2 border-border rounded-xl text-left
                       hover:border-sahay-sage/50 active:bg-sahay-sage-light transition-all
                       touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <p className="text-xl text-foreground">{message}</p>
            </button>
          ))}
        </div>

        {/* Custom message */}
        <div className="mt-auto">
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
                       focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSendCustom()
                }
              }}
            />
            <button
              onClick={handleSendCustom}
              disabled={!customMessage.trim()}
              className="w-14 h-14 rounded-xl bg-sahay-sage flex items-center justify-center
                       touch-manipulation disabled:opacity-50 flex-shrink-0
                       focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Send"
            >
              <Send className="w-6 h-6 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
