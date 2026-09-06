'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Pill, Clock } from 'lucide-react'
import { useSahay } from '@/lib/sahay-context'
import { useRouter } from 'next/navigation'
import { type Medication } from '@/lib/types'

/**
 * Pharmacist Panel Page
 * A silent helper for refill notes and pharmacist communication
 */
export default function PharmacistPage() {
  const { data, updatePharmacist, addPharmacistNote } = useSahay()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(data.pharmacist?.name || '')
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    updatePharmacist({ name: name.trim() || undefined } as any)
    setTimeout(() => {
      setSaving(false)
      setEditing(false)
    }, 300)
  }

  return (
    <main className="min-h-screen flex flex-col bg-background p-6">
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center
                   hover:bg-secondary/80 active:scale-95 transition-all touch-manipulation
                   focus:outline-none focus:ring-2 focus:ring-sahay-sage"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Pharmacist</h1>
      </header>

      <div className="space-y-6 max-w-md mx-auto w-full">
        {/* Current pharmacist info */}
        <section className="p-5 bg-card rounded-2xl border-2 border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-sahay-blue-light flex items-center justify-center">
              <Pill className="w-5 h-5 text-sahay-blue" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-foreground">Local Pharmacist</h2>
              <p className="text-sm text-muted-foreground">A silent helper for refill notes</p>
            </div>
          </div>

          {data.pharmacist?.name ? (
            <div className="mb-4 p-3 bg-secondary/50 rounded-xl">
              <p className="text-foreground font-medium">{data.pharmacist.name}</p>
              {data.pharmacist.lastRefillConfirm && (
                <p className="text-sm text-muted-foreground mt-1">
                  Last refill: {new Date(data.pharmacist.lastRefillConfirm).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground mb-4">No pharmacist added yet</p>
          )}

          {editing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Pharmacist name"
                className="w-full p-3 bg-secondary rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-sahay-blue"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-3 px-4 bg-secondary text-foreground font-medium
                           rounded-xl transition-all active:scale-[0.97] touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 px-4 bg-primary text-primary-foreground font-medium
                           rounded-xl transition-all active:scale-[0.97] touch-manipulation
                           disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                      <Clock className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full py-3 px-4 bg-secondary text-foreground font-medium
                       rounded-xl transition-all active:scale-[0.97] touch-manipulation
                       hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {data.pharmacist?.name ? 'Edit Pharmacist' : '+ Add Pharmacist'}
            </button>
          )}
        </section>

        {/* Medication-specific notes from pharmacist */}
        {data.medications.length > 0 && (
          <section className="p-5 bg-card rounded-2xl border-2 border-border">
            <h3 className="text-lg font-medium text-foreground mb-4">Medication Notes</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add notes from your pharmacist for specific medications
            </p>
            <div className="space-y-3">
              {data.medications.map((med) => (
                <MedPharmacistNote key={med.id} med={med} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function MedPharmacistNote({ med }: { med: Medication }) {
  const { addPharmacistNote } = useSahay()
  const [expanded, setExpanded] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    if (!note.trim()) return
    setSaving(true)
    addPharmacistNote(med.id, note.trim())
    setTimeout(() => {
      setSaving(false)
      setNote('')
      setExpanded(false)
    }, 300)
  }

  return (
    <div className="border-2 border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between text-left
                 hover:bg-secondary/50 active:scale-[0.99] transition-all touch-manipulation"
      >
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${med.taken ? 'bg-sahay-success/20' : 'bg-sahay-pending/20'}`}>
            {med.taken ? <Check className="w-3 h-3 text-sahay-success" /> : <Clock className="w-3 h-3 text-sahay-pending" />}
          </div>
          <div>
            <p className="font-medium text-foreground">{med.name}</p>
            {med.pharmacistNote && (
              <p className="text-xs text-sahay-blue mt-0.5">Has pharmacist note</p>
            )}
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 space-y-2">
              {med.pharmacistNote && (
                <div className="p-2 bg-sahay-blue/10 rounded-lg">
                  <p className="text-sm text-sahay-blue font-medium">Current note:</p>
                  <p className="text-sm text-foreground">{med.pharmacistNote}</p>
                </div>
              )}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add note from pharmacist..."
                rows={2}
                className="w-full p-2 bg-secondary rounded-lg border border-border text-sm
                         focus:outline-none focus:ring-2 focus:ring-sahay-blue resize-none"
              />
              <button
                onClick={handleSave}
                disabled={!note.trim() || saving}
                className="w-full py-2 px-3 bg-sahay-blue text-white font-medium text-sm
                         rounded-lg transition-all active:scale-[0.97] touch-manipulation
                         disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                    <Clock className="w-3 h-3" />
                  </motion.div>
                ) : (
                  'Save Note'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
