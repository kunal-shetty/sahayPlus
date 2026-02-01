'use client'

import { useState } from 'react'
import { useSahay } from '@/lib/sahay-context'
import { type TimeOfDay, timeOfDayLabels } from '@/lib/types'
import { ArrowLeft, ArrowRight, Check, Sun, Cloud, Moon } from 'lucide-react'

type OnboardingStep = 'names' | 'medication'

/**
 * Caregiver Onboarding
 * Simple 2-step flow:
 * 1. Enter caregiver and care receiver names
 * 2. Add first medication
 * 
 * Design: One action per screen, large inputs, warm messaging
 */
export function CaregiverOnboarding() {
  const { data, setCaregiver, setCareReceiver, addMedication, clearRole } = useSahay()
  const [step, setStep] = useState<OnboardingStep>('names')
  
  // Names step state
  const [caregiverName, setCaregiverName] = useState(data.caregiver?.name || '')
  const [careReceiverName, setCareReceiverName] = useState(data.careReceiver?.name || '')
  
  // Medication step state
  const [medName, setMedName] = useState('')
  const [medDosage, setMedDosage] = useState('')
  const [medTimeOfDay, setMedTimeOfDay] = useState<TimeOfDay>('morning')
  const [medNotes, setMedNotes] = useState('')

  const handleNamesSubmit = () => {
    if (caregiverName.trim() && careReceiverName.trim()) {
      setCaregiver({
        name: caregiverName.trim(),
        setupComplete: false,
        roleStatus: 'active',
      })
      setCareReceiver({ name: careReceiverName.trim() })
      setStep('medication')
    }
  }

  const handleMedicationSubmit = () => {
    if (medName.trim() && medDosage.trim()) {
      addMedication({
        name: medName.trim(),
        dosage: medDosage.trim(),
        timeOfDay: medTimeOfDay,
        notes: medNotes.trim() || undefined,
      })
      // Mark setup as complete
      setCaregiver({
        name: caregiverName.trim(),
        setupComplete: true,
        roleStatus: 'active',
      })
    }
  }

  const handleBack = () => {
    if (step === 'medication') {
      setStep('names')
    } else {
      clearRole()
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
          onClick={handleBack}
          className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center 
                     hover:bg-secondary/80 transition-colors touch-manipulation
                     focus:outline-none focus:ring-2 focus:ring-sahay-sage"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <div>
          <p className="text-sm text-muted-foreground">Getting started</p>
          <p className="text-lg font-semibold text-foreground">
            {step === 'names' ? 'Step 1 of 2' : 'Step 2 of 2'}
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {step === 'names' && (
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-semibold text-foreground mb-2 text-balance">
              Let&apos;s get to know you
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              We&apos;ll personalize the experience for both of you
            </p>

            <div className="space-y-6">
              {/* Caregiver name */}
              <div>
                <label
                  htmlFor="caregiverName"
                  className="block text-lg font-medium text-foreground mb-2"
                >
                  Your name
                </label>
                <input
                  id="caregiverName"
                  type="text"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-4 text-lg bg-input border-2 border-border rounded-xl
                           focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20
                           placeholder:text-muted-foreground/60"
                  autoComplete="given-name"
                />
              </div>

              {/* Care receiver name */}
              <div>
                <label
                  htmlFor="careReceiverName"
                  className="block text-lg font-medium text-foreground mb-2"
                >
                  Who are you caring for?
                </label>
                <input
                  id="careReceiverName"
                  type="text"
                  value={careReceiverName}
                  onChange={(e) => setCareReceiverName(e.target.value)}
                  placeholder="Their name"
                  className="w-full px-4 py-4 text-lg bg-input border-2 border-border rounded-xl
                           focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20
                           placeholder:text-muted-foreground/60"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        )}

        {step === 'medication' && (
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-semibold text-foreground mb-2 text-balance">
              Add the first medication
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              You can add more later from the home screen
            </p>

            <div className="space-y-6">
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
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
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
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
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
                    const isSelected = medTimeOfDay === time
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setMedTimeOfDay(time)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                                  touch-manipulation focus:outline-none focus:ring-2 focus:ring-sahay-sage
                                  ${
                                    isSelected
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

              {/* Notes (optional) */}
              <div>
                <label
                  htmlFor="medNotes"
                  className="block text-lg font-medium text-foreground mb-2"
                >
                  Notes <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  id="medNotes"
                  type="text"
                  value={medNotes}
                  onChange={(e) => setMedNotes(e.target.value)}
                  placeholder="e.g., after food"
                  className="w-full px-4 py-4 text-lg bg-input border-2 border-border rounded-xl
                           focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20
                           placeholder:text-muted-foreground/60"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with action button */}
      <footer className="p-6 border-t border-border bg-card">
        <div className="max-w-md mx-auto">
          {step === 'names' && (
            <button
              onClick={handleNamesSubmit}
              disabled={!caregiverName.trim() || !careReceiverName.trim()}
              className="w-full py-4 px-6 bg-primary text-primary-foreground text-lg font-semibold 
                       rounded-xl flex items-center justify-center gap-2 transition-all
                       hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                       touch-manipulation focus:outline-none focus:ring-2 focus:ring-sahay-sage focus:ring-offset-2"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          {step === 'medication' && (
            <button
              onClick={handleMedicationSubmit}
              disabled={!medName.trim() || !medDosage.trim()}
              className="w-full py-4 px-6 bg-primary text-primary-foreground text-lg font-semibold 
                       rounded-xl flex items-center justify-center gap-2 transition-all
                       hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                       touch-manipulation focus:outline-none focus:ring-2 focus:ring-sahay-sage focus:ring-offset-2"
            >
              <Check className="w-5 h-5" />
              Complete setup
            </button>
          )}
        </div>
      </footer>
    </main>
  )
}
