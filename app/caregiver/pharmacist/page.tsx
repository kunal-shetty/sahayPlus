'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Pill, Clock, Save, X, Plus, ChevronRight } from 'lucide-react'
import { useSahay } from '@/lib/sahay-context'
import { useRouter } from 'next/navigation'
import { type Medication } from '@/lib/types'
import { CaregiverLayout } from '@/components/caregiver/caregiver-layout'

/**
 * Pharmacist Panel Page
 * A professional interface for managing pharmacist details and medication-specific refill notes.
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
      <main className="min-h-screen bg-background p-6">
        <header className="flex items-center justify-between mb-8 max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pharmacist Panel</h1>
              <p className="text-muted-foreground text-sm">Manage pharmacy contacts and medication refill notes</p>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Pharmacist Identity Section */}
          <section className="bg-card border-2 border-border rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-sahay-blue-light flex items-center justify-center text-2xl">
                  💊
                </div>
                <div>
                  <h2 className="text-xl font-bold">Local Pharmacy</h2>
                  <p className="text-muted-foreground text-sm">Primary medication provider</p>
                </div>
              </div>

              {editing ? (
                <div className="flex items-center gap-2 bg-secondary p-2 rounded-2xl border border-border">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Pharmacy Name"
                    className="bg-transparent px-3 py-2 text-sm outline-none w-full md:w-64"
                    autoFocus
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {saving ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="p-2 bg-secondary text-foreground rounded-xl hover:bg-secondary/80 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-lg">{data.pharmacist?.name || 'Not Set'}</p>
                    {data.pharmacist?.lastRefillConfirm && (
                      <p className="text-xs text-muted-foreground">
                        Last Refill: {new Date(data.pharmacist.lastRefillConfirm).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-secondary text-foreground text-sm font-medium rounded-xl hover:bg-secondary/80 transition-all"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Medication Notes Table */}
          <section className="bg-card border-2 border-border rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Medication Notes</h3>
                <p className="text-sm text-muted-foreground">Notes provided by the pharmacist for each medication</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Medication</th>
                    <th className="px-6 py-4">Current Note</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.medications.length > 0 ? (
                    data.medications.map((med) => (
                      <MedPharmacistRow key={med.id} med={med} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground italic">
                        No medications tracked yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
  )
}

function MedPharmacistRow({ med }: { med: Medication }) {
  const { addPharmacistNote } = useSahay()
  const [isEditing, setIsEditing] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    if (!note.trim()) return
    setSaving(true)
    addPharmacistNote(med.id, note.trim())
    setTimeout(() => {
      setSaving(false)
      setNote('')
      setIsEditing(false)
    }, 300)
  }

  return (
    <tr className="hover:bg-secondary/30 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${med.taken ? 'bg-sahay-success' : 'bg-sahay-pending'}`} />
          <span className="font-medium">{med.name}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        {isEditing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter pharmacist note..."
              className="bg-secondary border border-border rounded-lg px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary w-full"
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {saving ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <p className={cn("text-sm", med.pharmacistNote ? "text-foreground" : "text-muted-foreground italic")}>
              {med.pharmacistNote || 'No note provided'}
            </p>
            {med.pharmacistNote && <div className="w-1.5 h-1.5 rounded-full bg-sahay-blue" />}
          </div>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={() => {
            setNote(med.pharmacistNote || '')
            setIsEditing(true)
          }}
          className="text-xs font-bold text-primary hover:underline"
        >
          {isEditing ? 'Cancel' : 'Update Note'}
        </button>
      </td>
    </tr>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
