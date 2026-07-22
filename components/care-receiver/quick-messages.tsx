'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useSahay } from '@/lib/sahay-context'
import { ArrowLeft, Send, Check, MessageCircle } from 'lucide-react'

interface QuickMessagesProps {
  onClose: () => void
}

export function QuickMessages({ onClose }: QuickMessagesProps) {
  const { data, sendMessage } = useSahay()
  const [sentMessage, setSentMessage] = useState<string | null>(null)
  const [customMessage, setCustomMessage] = useState('')
  const [sendingIndex, setSendingIndex] = useState<number | null>(null)

  const caregiverName = data.caregiver?.name || 'your caregiver'
  const quickMessages = data.careReceiver?.quickMessages || [
    'I took my medicine',
    'Feeling good today',
    'Can you call me?',
    'Need help with refill',
    'All done for the day',
  ]

  const handleSendQuick = (message: string, index: number) => {
    setSendingIndex(index)
    setTimeout(() => {
      sendMessage(message, true)
      setSentMessage(message)
      setSendingIndex(null)
    }, 400)
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
          <motion.div
            className="w-24 h-24 rounded-full bg-sahay-success/20 flex items-center justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
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

          <motion.div
            className="flex flex-col gap-3 mt-8 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={() => setSentMessage(null)}
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
    )
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
                         ${sendingIndex === index
                    ? 'border-sahay-sage bg-sahay-sage-light scale-[0.98]'
                    : 'border-border hover:border-sahay-sage/50 active:bg-sahay-sage-light'
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
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      <Check className="w-5 h-5 text-sahay-sage" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Custom message */}
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
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSendCustom()
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
  )
}
