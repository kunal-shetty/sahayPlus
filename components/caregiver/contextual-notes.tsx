'use client'

import { useState } from 'react'
import { useSahay } from '@/lib/sahay-context'
import { FileText, Plus, X, ArrowLeft } from 'lucide-react'

/**
 * Contextual Notes
 * Memory without burden - notes tied to medications or days
 * Notes fade over time instead of accumulating
 */
export function ContextualNotes({ onClose }: { onClose: () => void }) {
  const { data, addContextualNote, removeContextualNote } = useSahay()
  const [isAdding, setIsAdding] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [linkedType, setLinkedType] = useState<'day' | 'medication'>('day')
  const [linkedMedId, setLinkedMedId] = useState<string | undefined>()

  // Filter out faded notes (older than 7 days)
  const now = new Date()
  const activeNotes = data.contextualNotes.filter((note) => {
    return new Date(note.fadingAt) > now
  })

  // Calculate opacity based on how close to fading
  const getNoteOpacity = (fadingAt: string) => {
    const fadeDate = new Date(fadingAt)
    const daysLeft = Math.ceil(
      (fadeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysLeft >= 5) return 1
    if (daysLeft >= 3) return 0.8
    if (daysLeft >= 1) return 0.6
    return 0.4
  }

  const handleAddNote = () => {
    if (!noteText.trim()) return

    const linkedTo =
      linkedType === 'medication' && linkedMedId
        ? { type: 'medication' as const, id: linkedMedId }
        : { type: 'day' as const }

    addContextualNote(noteText.trim(), linkedTo)
    setNoteText('')
    setIsAdding(false)
    setLinkedType('day')
    setLinkedMedId(undefined)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getMedName = (medId: string | undefined) => {
    if (!medId) return null
    return data.medications.find((m) => m.id === medId)?.name
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="p-6 pb-4 border-b border-border">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center 
                     hover:bg-secondary/80 transition-colors touch-manipulation
                     focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Notes</h1>
            <p className="text-muted-foreground">
              Quick notes that gently fade over time
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {/* Existing notes */}
        {activeNotes.length === 0 && !isAdding ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg text-muted-foreground">No notes yet</p>
            <p className="text-muted-foreground mt-1">
              Add notes to remember context about changes
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeNotes
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((note) => {
                const opacity = getNoteOpacity(note.fadingAt)
                const medName = getMedName(note.linkedTo?.id)

                return (
                  <div
                    key={note.id}
                    style={{ opacity }}
                    className="bg-card border-2 border-border rounded-xl p-4 transition-opacity"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-foreground">{note.text}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(note.createdAt)}
                          </span>
                          {medName && (
                            <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">
                              {medName}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeContextualNote(note.id)}
                        className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center 
                                 hover:bg-secondary transition-colors touch-manipulation
                                 focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-label="Remove note"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>
        )}

        {/* Add note form */}
        {isAdding && (
          <div className="bg-card border-2 border-sahay-sage rounded-xl p-4 mt-4">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Why did something change? What should you remember?"
              className="w-full p-3 bg-secondary/50 border-0 rounded-lg text-foreground 
                       placeholder:text-muted-foreground resize-none
                       focus:outline-none focus:ring-2 focus:ring-sahay-sage"
              rows={3}
              autoFocus
            />

            {/* Link options */}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setLinkedType('day')
                  setLinkedMedId(undefined)
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                         ${linkedType === 'day' && !linkedMedId ? 'bg-sahay-sage text-primary-foreground' : 'bg-secondary text-foreground'}`}
              >
                General note
              </button>
              {data.medications.map((med) => (
                <button
                  key={med.id}
                  onClick={() => {
                    setLinkedType('medication')
                    setLinkedMedId(med.id)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                           ${linkedMedId === med.id ? 'bg-sahay-sage text-primary-foreground' : 'bg-secondary text-foreground'}`}
                >
                  {med.name}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleAddNote}
                disabled={!noteText.trim()}
                className="flex-1 py-3 px-4 bg-primary text-primary-foreground font-medium 
                         rounded-xl transition-all touch-manipulation
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Save note
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNoteText('')
                }}
                className="py-3 px-4 bg-secondary text-foreground font-medium 
                         rounded-xl transition-all touch-manipulation
                         hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add button */}
      {!isAdding && (
        <div className="fixed bottom-6 left-0 right-0 px-6">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-4 px-6 bg-primary text-primary-foreground text-lg font-semibold 
                       rounded-xl flex items-center justify-center gap-2 transition-all
                       hover:opacity-90 shadow-lg touch-manipulation 
                       focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <Plus className="w-5 h-5" />
              Add a note
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
