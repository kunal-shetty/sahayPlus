'use client'

import { useState } from 'react'
import { useSahay } from '@/lib/sahay-context'
import { ArrowLeft, LogOut, Trash2, Heart, Pill, Plus } from 'lucide-react'

interface SettingsPanelProps {
  onClose: () => void
}

/**
 * Settings Panel
 * Simple settings for caregiver: switch role, reset app
 * Design: Calm, minimal, clear actions
 */
export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { data, clearRole, resetApp, updatePharmacist, addPharmacistNote } =
    useSahay()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showPharmacistForm, setShowPharmacistForm] = useState(false)
  const [pharmacistName, setPharmacistName] = useState(
    data.pharmacist?.name || ''
  )
  const [selectedMedForNote, setSelectedMedForNote] = useState<string | null>(
    null
  )
  const [pharmacistNote, setPharmacistNote] = useState('')

  const handleSwitchRole = () => {
    clearRole()
  }

  const handleReset = () => {
    resetApp()
  }

  const handleSavePharmacist = () => {
    updatePharmacist({ name: pharmacistName.trim() || undefined })
    setShowPharmacistForm(false)
  }

  const handleAddPharmacistNote = () => {
    if (selectedMedForNote && pharmacistNote.trim()) {
      addPharmacistNote(selectedMedForNote, pharmacistNote.trim())
      setSelectedMedForNote(null)
      setPharmacistNote('')
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b border-border">
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center 
                   hover:bg-secondary/80 transition-colors touch-manipulation
                   focus:outline-none focus:ring-2 focus:ring-sahay-sage"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
      </header>

      {/* Settings content */}
      <div className="flex-1 p-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Profile info */}
          <section className="p-5 bg-card rounded-2xl border-2 border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-sahay-sage-light flex items-center justify-center">
                <Heart className="w-7 h-7 text-sahay-sage" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {data.caregiver?.name}
                </p>
                <p className="text-muted-foreground">
                  Caring for {data.careReceiver?.name}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {data.medications.length} medication
                {data.medications.length !== 1 ? 's' : ''} set up
              </p>
            </div>
          </section>

          {/* Pharmacist (Silent Participant) */}
          <section className="p-5 bg-card rounded-2xl border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-sahay-blue-light flex items-center justify-center">
                <Pill className="w-5 h-5 text-sahay-blue" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  Local Pharmacist
                </h2>
                <p className="text-sm text-muted-foreground">
                  A silent helper for refill notes
                </p>
              </div>
            </div>

            {!showPharmacistForm ? (
              <>
                {data.pharmacist?.name ? (
                  <div className="mb-4 p-3 bg-secondary/50 rounded-xl">
                    <p className="text-foreground">{data.pharmacist.name}</p>
                    {data.pharmacist.lastRefillConfirm && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Last refill:{' '}
                        {new Date(
                          data.pharmacist.lastRefillConfirm
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : null}

                <button
                  onClick={() => setShowPharmacistForm(true)}
                  className="w-full py-3 px-4 bg-secondary text-foreground font-medium 
                           rounded-xl transition-colors touch-manipulation
                           hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {data.pharmacist?.name
                    ? 'Update pharmacist'
                    : 'Add pharmacist name'}
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={pharmacistName}
                  onChange={(e) => setPharmacistName(e.target.value)}
                  placeholder="Pharmacist or pharmacy name"
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl
                           focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPharmacistForm(false)}
                    className="flex-1 py-3 px-4 bg-secondary text-foreground font-medium 
                             rounded-xl transition-colors touch-manipulation
                             focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePharmacist}
                    className="flex-1 py-3 px-4 bg-primary text-primary-foreground font-medium 
                             rounded-xl transition-colors touch-manipulation
                             focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Add pharmacist note to medication */}
            {data.medications.length > 0 && !showPharmacistForm && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">
                  Add a note from pharmacist to a medication
                </p>
                {selectedMedForNote ? (
                  <div className="space-y-3">
                    <p className="text-foreground font-medium">
                      Note for:{' '}
                      {
                        data.medications.find(
                          (m) => m.id === selectedMedForNote
                        )?.name
                      }
                    </p>
                    <input
                      type="text"
                      value={pharmacistNote}
                      onChange={(e) => setPharmacistNote(e.target.value)}
                      placeholder="e.g., Take with food for best absorption"
                      className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl
                               focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedMedForNote(null)
                          setPharmacistNote('')
                        }}
                        className="flex-1 py-3 px-4 bg-secondary text-foreground font-medium 
                                 rounded-xl transition-colors touch-manipulation
                                 focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddPharmacistNote}
                        disabled={!pharmacistNote.trim()}
                        className="flex-1 py-3 px-4 bg-sahay-blue text-accent-foreground font-medium 
                                 rounded-xl transition-colors touch-manipulation disabled:opacity-50
                                 focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        Add note
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {data.medications.map((med) => (
                      <button
                        key={med.id}
                        onClick={() => setSelectedMedForNote(med.id)}
                        className="px-3 py-2 bg-secondary text-foreground text-sm font-medium 
                                 rounded-lg transition-colors touch-manipulation flex items-center gap-1
                                 hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <Plus className="w-3 h-3" />
                        {med.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Actions */}
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground mb-3">
              Actions
            </h2>

            {/* Switch role */}
            <button
              onClick={handleSwitchRole}
              className="w-full p-4 bg-card rounded-xl border-2 border-border 
                       hover:border-sahay-sage/50 transition-all text-left
                       touch-manipulation focus:outline-none focus:ring-2 focus:ring-sahay-sage"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-sahay-blue-light flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-sahay-blue" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Switch role
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Change to a different view
                  </p>
                </div>
              </div>
            </button>

            {/* Reset app */}
            {!showResetConfirm && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full p-4 bg-card rounded-xl border-2 border-border 
                         hover:border-destructive/50 transition-all text-left
                         touch-manipulation focus:outline-none focus:ring-2 focus:ring-destructive"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground">
                      Start fresh
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Remove all data and start over
                    </p>
                  </div>
                </div>
              </button>
            )}

            {/* Reset confirmation */}
            {showResetConfirm && (
              <div className="p-4 bg-destructive/10 rounded-xl border-2 border-destructive/30">
                <p className="text-foreground mb-4">
                  This will remove all your data including medications and
                  profiles. Are you sure?
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-3 px-4 bg-secondary text-foreground font-medium 
                             rounded-xl transition-colors touch-manipulation
                             focus:outline-none focus:ring-2 focus:ring-sahay-sage"
                  >
                    Keep my data
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 py-3 px-4 bg-destructive text-destructive-foreground font-medium 
                             rounded-xl flex items-center justify-center gap-2 transition-colors touch-manipulation
                             focus:outline-none focus:ring-2 focus:ring-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    Start fresh
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* App info */}
          <section className="pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Sahay+ · Gentle medication care
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Your data stays on this device
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
