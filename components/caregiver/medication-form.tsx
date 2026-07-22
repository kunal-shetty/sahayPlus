'use client'

import { useState } from 'react'
import { useSahay } from '@/lib/sahay-context'
import { type TimeOfDay, type Medication, timeOfDayLabels } from '@/lib/types'
import {
  ArrowLeft,
  Check,
  Trash2,
  Sun,
  Cloud,
  Moon,
  RefreshCw,
} from 'lucide-react'

interface MedicationFormProps {
  medication?: Medication | null
  onClose: () => void
}

/**
 * Medication Form
 * Add or edit a medication
 * Design: Simple form with large inputs, clear actions
 */
export function MedicationForm({ medication, onClose }: MedicationFormProps) {
  const { addMedication, updateMedication, removeMedication, updateRefillStatus } =
    useSahay()
  const isEditing = !!medication

  const [name, setName] = useState(medication?.name || '')
  const [dosage, setDosage] = useState(medication?.dosage || '')
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(
    medication?.timeOfDay || 'morning'
  )
  const [notes, setNotes] = useState(medication?.notes || '')
  const [time, setTime] = useState(medication?.time || '')
  const [refillDaysLeft, setRefillDaysLeft] = useState<number | undefined>(
    medication?.refillDaysLeft
  )
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSubmit = () => {
    if (!name.trim() || !dosage.trim()) return

    if (isEditing && medication) {
      updateMedication(medication.id, {
        name: name.trim(),
        dosage: dosage.trim(),
        timeOfDay,
        time: time || undefined,
        notes: notes.trim() || undefined,
        refillDaysLeft,
      })
      if (refillDaysLeft !== undefined) {
        updateRefillStatus(medication.id, refillDaysLeft)
      }
    } else {
      addMedication({
        name: name.trim(),
        dosage: dosage.trim(),
        timeOfDay,
        time: time || undefined,
        notes: notes.trim() || undefined,
        refillDaysLeft,
      })
    }
    onClose()
  }

  const handleDelete = () => {
    if (medication) {
      removeMedication(medication.id)
      onClose()
    }
  }

  const timeIcons: Record<TimeOfDay, typeof Sun> = {
    morning: Sun,
    afternoon: Cloud,
    evening: Moon,
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
        <h1 className="text-xl font-semibold text-foreground">
          {isEditing ? 'Edit medication' : 'Add medication'}
        </h1>
      </header>

      {/* Form content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          {/* Medication name */}
          <div>
            <label
              htmlFor="medName"
              className="block text-lg font-medium text-foreground mb-2"
            >
              Medication name
            </label>
            <input
              id="medName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Aspirin"
              className="w-full px-4 py-4 text-lg bg-input border-2 border-border rounded-xl
                       focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20
                       placeholder:text-muted-foreground/60"
              autoComplete="off"
            />
          </div>

          {/* Dosage */}
          <div>
            <label
              htmlFor="medDosage"
              className="block text-lg font-medium text-foreground mb-2"
            >
              Dosage
            </label>
            <input
              id="medDosage"
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g., 1 tablet"
              className="w-full px-4 py-4 text-lg bg-input border-2 border-border rounded-xl
                       focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20
                       placeholder:text-muted-foreground/60"
              autoComplete="off"
            />
          </div>

          {/* Time of day */}
          <div>
            <label className="block text-lg font-medium text-foreground mb-3">
              When should it be taken?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(timeOfDayLabels) as TimeOfDay[]).map((time) => {
                const Icon = timeIcons[time]
                const isSelected = timeOfDay === time
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setTimeOfDay(time)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                              touch-manipulation focus:outline-none focus:ring-2 focus:ring-sahay-sage
                              ${isSelected
                        ? 'border-sahay-sage bg-sahay-sage-light'
                        : 'border-border bg-card hover:border-sahay-sage/50'
                      }`}
                    aria-pressed={isSelected}
                  >
                    <Icon
                      className={`w-6 h-6 ${isSelected ? 'text-sahay-sage' : 'text-muted-foreground'}`}
                      strokeWidth={1.5}
                    />
                    <span
                      className={`text-base font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      {timeOfDayLabels[time]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Specific Time (optional) */}
          <div>
            <label
              htmlFor="medTime"
              className="block text-lg font-medium text-foreground mb-2"
            >
              Exact time <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              id="medTime"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-4 text-lg bg-input border-2 border-border rounded-xl
                       focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20
                       placeholder:text-muted-foreground/60"
            />
            <p className="text-muted-foreground text-sm mt-2">
              Helps us send more precise reminders
            </p>
          </div>

          {/* Notes (optional) */}
          <div>
            <label
              htmlFor="medNotes"
              className="block text-lg font-medium text-foreground mb-2"
            >
              Notes{' '}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <input
              id="medNotes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., after food"
              className="w-full px-4 py-4 text-lg bg-input border-2 border-border rounded-xl
                       focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20
                       placeholder:text-muted-foreground/60"
              autoComplete="off"
            />
          </div>

          {/* Refill awareness (optional) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-muted-foreground" />
              <label
                htmlFor="medRefill"
                className="text-lg font-medium text-foreground"
              >
                Refill awareness{' '}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
            </div>
            <p className="text-muted-foreground text-sm mb-3">
              No need to count pills - just a gentle awareness of when refill
              might be needed
            </p>
            <div className="flex items-center gap-3">
              <input
                id="medRefill"
                type="number"
                min={0}
                max={90}
                value={refillDaysLeft ?? ''}
                onChange={(e) =>
                  setRefillDaysLeft(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="Days left"
                className="w-32 px-4 py-3 text-lg bg-input border-2 border-border rounded-xl
                         focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20
                         placeholder:text-muted-foreground/60"
              />
              <span className="text-muted-foreground">
                days of supply remaining
              </span>
            </div>
            {refillDaysLeft !== undefined && refillDaysLeft <= 7 && (
              <p className="mt-2 text-sahay-pending text-sm">
                This medication may need a refill soon
              </p>
            )}
          </div>

          {/* Delete button (only when editing) */}
          {isEditing && !showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 px-4 text-destructive text-lg font-medium 
                       rounded-xl border-2 border-destructive/30 bg-destructive/5
                       hover:bg-destructive/10 transition-colors touch-manipulation
                       focus:outline-none focus:ring-2 focus:ring-destructive"
            >
              Remove this medication
            </button>
          )}

          {/* Delete confirmation */}
          {isEditing && showDeleteConfirm && (
            <div className="p-4 bg-destructive/10 rounded-xl border-2 border-destructive/30">
              <p className="text-foreground mb-4">
                Are you sure you want to remove {medication?.name}?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 px-4 bg-secondary text-foreground font-medium 
                           rounded-xl transition-colors touch-manipulation
                           focus:outline-none focus:ring-2 focus:ring-sahay-sage"
                >
                  Keep it
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 py-3 px-4 bg-destructive text-destructive-foreground font-medium 
                           rounded-xl flex items-center justify-center gap-2 transition-colors touch-manipulation
                           focus:outline-none focus:ring-2 focus:ring-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with save button */}
      <footer className="p-6 border-t border-border bg-card">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !dosage.trim()}
            className="w-full py-4 px-6 bg-primary text-primary-foreground text-lg font-semibold 
                     rounded-xl flex items-center justify-center gap-2 transition-all
                     hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                     touch-manipulation focus:outline-none focus:ring-2 focus:ring-sahay-sage focus:ring-offset-2"
          >
            <Check className="w-5 h-5" />
            {isEditing ? 'Save changes' : 'Add medication'}
          </button>
        </div>
      </footer>
    </main>
  )
}
