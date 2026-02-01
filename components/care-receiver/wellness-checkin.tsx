'use client'

import { useState } from 'react'
import { useSahay } from '@/lib/sahay-context'
import { ArrowLeft, Smile, Meh, Frown, Check } from 'lucide-react'
import type { WellnessLevel } from '@/lib/types'

interface WellnessCheckinProps {
  onClose: () => void
}

const wellnessOptions: {
  level: WellnessLevel
  icon: typeof Smile
  label: string
  description: string
  color: string
  bgColor: string
}[] = [
  {
    level: 'great',
    icon: Smile,
    label: 'Feeling Great',
    description: 'I feel good today',
    color: 'text-sahay-success',
    bgColor: 'bg-sahay-success/10 border-sahay-success/30',
  },
  {
    level: 'okay',
    icon: Meh,
    label: 'Doing Okay',
    description: 'I\'m managing alright',
    color: 'text-sahay-pending',
    bgColor: 'bg-sahay-pending/10 border-sahay-pending/30',
  },
  {
    level: 'notGreat',
    icon: Frown,
    label: 'Not Feeling Great',
    description: 'Could be better',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10 border-destructive/30',
  },
]

export function WellnessCheckin({ onClose }: WellnessCheckinProps) {
  const { logWellness, getTodayWellness, data } = useSahay()
  const [selectedLevel, setSelectedLevel] = useState<WellnessLevel | null>(null)
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const todayWellness = getTodayWellness()
  const caregiverName = data.caregiver?.name || 'your caregiver'

  const handleSubmit = () => {
    if (selectedLevel) {
      logWellness(selectedLevel, note.trim() || undefined)
      setSubmitted(true)
    }
  }

  // Already submitted today view
  if (todayWellness && !submitted) {
    const config = wellnessOptions.find((o) => o.level === todayWellness.level)!
    const Icon = config.icon

    return (
      <main className="min-h-screen flex flex-col bg-background p-6">
        <button
          onClick={onClose}
          className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6
                   touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <div
            className={`w-24 h-24 rounded-full ${config.bgColor} border-2 flex items-center justify-center mb-6`}
          >
            <Icon className={`w-12 h-12 ${config.color}`} />
          </div>

          <h1 className="text-2xl font-semibold text-foreground mb-2 text-center">
            You checked in today
          </h1>
          <p className="text-xl text-muted-foreground text-center mb-4">
            {config.label}
          </p>
          {todayWellness.note && (
            <p className="text-muted-foreground text-center italic">
              &quot;{todayWellness.note}&quot;
            </p>
          )}

          <button
            onClick={onClose}
            className="mt-8 px-8 py-4 bg-secondary text-foreground text-lg font-medium rounded-xl
                     touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Go back
          </button>
        </div>
      </main>
    )
  }

  // Success view
  if (submitted) {
    return (
      <main className="min-h-screen flex flex-col bg-sahay-sage-light p-6">
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <div className="w-24 h-24 rounded-full bg-sahay-success/20 flex items-center justify-center mb-6">
            <Check className="w-12 h-12 text-sahay-success" />
          </div>

          <h1 className="text-2xl font-semibold text-foreground mb-2 text-center">
            Thank you for sharing
          </h1>
          <p className="text-xl text-muted-foreground text-center">
            {caregiverName} will see how you&apos;re feeling
          </p>

          <button
            onClick={onClose}
            className="mt-8 px-8 py-4 bg-primary text-primary-foreground text-lg font-medium rounded-xl
                     touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Done
          </button>
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
        <h1 className="text-3xl font-semibold text-foreground mb-2 text-center">
          How are you feeling?
        </h1>
        <p className="text-xl text-muted-foreground text-center mb-8">
          Take a moment to check in
        </p>

        {/* Wellness options */}
        <div className="space-y-4 mb-8">
          {wellnessOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selectedLevel === option.level
            return (
              <button
                key={option.level}
                onClick={() => setSelectedLevel(option.level)}
                className={`w-full p-6 rounded-2xl border-2 flex items-center gap-5 
                         touch-manipulation transition-all
                         focus:outline-none focus:ring-2 focus:ring-ring
                         ${
                           isSelected
                             ? option.bgColor
                             : 'bg-card border-border hover:border-muted-foreground/50'
                         }`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center
                            ${isSelected ? option.bgColor : 'bg-secondary'}`}
                >
                  <Icon
                    className={`w-8 h-8 ${isSelected ? option.color : 'text-muted-foreground'}`}
                  />
                </div>
                <div className="text-left">
                  <p
                    className={`text-xl font-semibold ${
                      isSelected ? option.color : 'text-foreground'
                    }`}
                  >
                    {option.label}
                  </p>
                  <p className="text-muted-foreground">{option.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Optional note */}
        {selectedLevel && (
          <div className="mb-8">
            <label className="block text-lg font-medium text-foreground mb-2">
              Anything you want to add?{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Feeling a bit tired today"
              className="w-full px-5 py-4 text-lg bg-input border-2 border-border rounded-xl
                       focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20"
            />
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedLevel}
          className="w-full py-5 bg-primary text-primary-foreground text-xl font-semibold rounded-xl
                   touch-manipulation disabled:opacity-50 mt-auto
                   focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Share how I feel
        </button>
      </div>
    </main>
  )
}
