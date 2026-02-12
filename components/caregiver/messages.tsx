'use client'

import { useState, useRef, useEffect } from 'react'
import { useSahay } from '@/lib/sahay-context'
import { ArrowLeft, Send, Heart, Check, CheckCheck } from 'lucide-react'

interface MessagesProps {
  onClose: () => void
}

export function Messages({ onClose }: MessagesProps) {
  const { data, sendMessage, markMessageRead, getUnreadCount } = useSahay()
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messages = data.messages || []
  const careReceiverName = data.careReceiver?.name || 'Care Receiver'

  // Mark messages as read when viewing
  useEffect(() => {
    messages
      .filter((m) => !m.isRead && m.from === 'careReceiver')
      .forEach((m) => markMessageRead(m.id))
  }, [messages, markMessageRead])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage.trim(), false)
      setNewMessage('')
    }
  }

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

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="px-6 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center
                     touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">
              Messages with {careReceiverName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Stay connected with gentle words
            </p>
            {getUnreadCount() > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full bg-sahay-blue/10 text-sahay-blue text-xs font-medium">
                {getUnreadCount()} unread
              </span>
            )}
          </div>
          <div className="w-12 h-12 rounded-full bg-sahay-sage-light flex items-center justify-center">
            <Heart className="w-5 h-5 text-sahay-sage" />
          </div>
        </div>
      </header>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isFromMe = message.from === 'caregiver'
            const isUnread = !message.isRead && !isFromMe
            return (
              <div
                key={message.id}
                className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
              >
                {/* Unread dot for incoming messages */}
                {isUnread && (
                  <div className="flex items-center mr-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-sahay-blue animate-pulse" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${isFromMe
                    ? 'bg-sahay-sage text-primary-foreground rounded-br-md'
                    : isUnread
                      ? 'bg-card border-2 border-sahay-blue/40 text-foreground rounded-bl-md'
                      : 'bg-card border-2 border-border text-foreground rounded-bl-md'
                    }`}
                >
                  {message.isQuickMessage && !isFromMe && (
                    <span className="text-xs text-muted-foreground block mb-1">
                      Quick message
                    </span>
                  )}
                  <p className={`text-base ${isFromMe
                    ? 'text-primary-foreground'
                    : isUnread
                      ? 'text-foreground font-semibold'
                      : 'text-foreground'
                    }`}>
                    {message.text}
                  </p>
                  <div className={`flex items-center gap-1 mt-1 ${isFromMe ? 'justify-end' : ''
                    }`}>
                    <p
                      className={`text-xs ${isFromMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                    {/* Read receipt for sent messages */}
                    {isFromMe && (
                      message.isRead
                        ? <CheckCheck className="w-3.5 h-3.5 text-primary-foreground/70" />
                        : <Check className="w-3.5 h-3.5 text-primary-foreground/50" />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No messages yet. Send a warm note to {careReceiverName}.
            </p>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={`Send a message to ${careReceiverName}...`}
            className="flex-1 px-4 py-3 bg-input border-2 border-border rounded-xl
                     focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20
                     text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="w-12 h-12 rounded-xl bg-sahay-sage flex items-center justify-center
                     touch-manipulation disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Send message"
          >
            <Send className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </div>
    </main>
  )
}
