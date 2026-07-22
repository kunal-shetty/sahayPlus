'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useSahay } from '@/lib/sahay-context'
import { ArrowLeft, Send, Heart, Check, CheckCheck, MessageCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface MessagesProps {
  onClose: () => void
}

function MessagesSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${i % 2 === 0 ? 'bg-sahay-sage/20' : 'bg-card border-2 border-border'}`}>
              <Skeleton className={`h-4 ${i % 3 === 0 ? 'w-48' : 'w-32'} mb-2`} />
              {i % 3 === 0 && <Skeleton className="h-4 w-24" />}
              <Skeleton className="h-3 w-16 mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Messages({ onClose }: MessagesProps) {
  const { data, isDataLoading, sendMessage, markMessageRead, getUnreadCount } = useSahay()
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const messages = data.messages || []
  const careReceiverName = data.careReceiver?.name || 'Care Receiver'

  // Mark messages as read when viewing
  useEffect(() => {
    const unread = messages.filter((m) => !m.isRead && m.from === 'careReceiver')
    unread.forEach((m) => markMessageRead(m.id))
  }, [messages, markMessageRead])

  // Scroll to bottom on mount and on new messages
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    // Initial scroll
    const timer = setTimeout(scrollToBottom, 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = useCallback(() => {
    if (newMessage.trim() && !isSending) {
      setIsSending(true)
      sendMessage(newMessage.trim(), false)
      setNewMessage('')
      // Brief visual feedback
      setTimeout(() => setIsSending(false), 300)
      // Refocus input after send
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [newMessage, isSending, sendMessage])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 0) {
      return date.toLocaleTimeString('en', {
        hour: 'numeric',
        minute: '2-digit',
      })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    }
  }

  // Group messages by date for date separators
  const getDateLabel = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return date.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <motion.header
        className="px-6 pt-6 pb-4 border-b border-border bg-background/95 backdrop-blur-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center
                     hover:bg-secondary/80 active:scale-95 transition-all
                     touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">
              {careReceiverName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {getUnreadCount() > 0
                ? `${getUnreadCount()} new message${getUnreadCount() > 1 ? 's' : ''}`
                : 'Stay connected with gentle words'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-sahay-sage-light flex items-center justify-center">
            <Heart className="w-5 h-5 text-sahay-sage" />
          </div>
        </div>
      </motion.header>

      {/* Messages list */}
      {isDataLoading ? (
        <MessagesSkeleton />
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((message, idx) => {
                const isFromMe = message.from === 'caregiver'
                const isUnread = !message.isRead && !isFromMe
                const prevMessage = idx > 0 ? messages[idx - 1] : null
                const showDateSeparator = !prevMessage ||
                  getDateLabel(message.timestamp) !== getDateLabel(prevMessage.timestamp)

                return (
                  <div key={message.id}>
                    {/* Date separator */}
                    {showDateSeparator && (
                      <motion.div
                        className="flex items-center justify-center py-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="px-3 py-1 text-xs font-medium text-muted-foreground bg-secondary rounded-full">
                          {getDateLabel(message.timestamp)}
                        </span>
                      </motion.div>
                    )}

                    <motion.div
                      className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 transition-all ${isFromMe
                          ? 'bg-sahay-sage text-primary-foreground rounded-br-md shadow-sm'
                          : isUnread
                            ? 'bg-card border-2 border-sahay-blue/40 text-foreground rounded-bl-md shadow-sm'
                            : 'bg-card border-2 border-border text-foreground rounded-bl-md'
                          }`}
                      >
                        {message.isQuickMessage && !isFromMe && (
                          <span className="text-xs text-muted-foreground block mb-1 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            Quick message
                          </span>
                        )}
                        <p className={`text-base leading-relaxed ${isFromMe
                          ? 'text-primary-foreground'
                          : isUnread
                            ? 'text-foreground font-medium'
                            : 'text-foreground'
                          }`}>
                          {message.text}
                        </p>
                        <div className={`flex items-center gap-1 mt-1.5 ${isFromMe ? 'justify-end' : ''}`}>
                          <p className={`text-[11px] ${isFromMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {formatTime(message.timestamp)}
                          </p>
                          {isFromMe && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.1 }}
                            >
                              {message.isRead
                                ? <CheckCheck className="w-3.5 h-3.5 text-primary-foreground/70" />
                                : <Check className="w-3.5 h-3.5 text-primary-foreground/50" />
                              }
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 0 && (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-20 h-20 rounded-full bg-sahay-sage-light/50 flex items-center justify-center mx-auto mb-5">
                <MessageCircle className="w-10 h-10 text-sahay-sage/50" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No messages yet</h3>
              <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Send a warm note to {careReceiverName} to stay connected.
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* Input area */}
      <motion.div
        className="p-4 border-t border-border bg-card/95 backdrop-blur-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={`Message ${careReceiverName}...`}
            className="flex-1 px-4 py-3 bg-input border-2 border-border rounded-xl
                     focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20
                     text-foreground placeholder:text-muted-foreground transition-all"
          />
          <motion.button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="w-12 h-12 rounded-xl bg-sahay-sage flex items-center justify-center
                     touch-manipulation disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-ring
                     transition-all"
            whileTap={{ scale: 0.9 }}
            aria-label="Send message"
          >
            <Send className={`w-5 h-5 text-primary-foreground transition-transform ${newMessage.trim() ? 'translate-x-0' : ''}`} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
