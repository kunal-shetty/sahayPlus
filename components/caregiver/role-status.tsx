'use client'

import { useState } from 'react'
import { useSahay } from '@/lib/sahay-context'
import { type CareRoleStatus, type TimeOfDay, timeOfDayLabels } from '@/lib/types'
import { User, Calendar, Sun, Cloud, Moon, ArrowLeft, Check } from 'lucide-react'

/**
 * Fluid Care Roles
 * Allow caregiving responsibility to shift, be shared, or be handed over
 * Reflects real family dynamics and prevents burnout
 */
export function RoleStatus({ onClose }: { onClose: () => void }) {
  const { data, updateCaregiverStatus, setCareReceiverIndependence } = useSahay()
  const [awayDays, setAwayDays] = useState(1)

  const currentStatus = data.caregiver?.roleStatus || 'active'
  const independentTimes = data.careReceiver?.independentTimes || []

  const handleStatusChange = (status: CareRoleStatus) => {
    if (status === 'away') {
      const awayUntil = new Date()
      awayUntil.setDate(awayUntil.getDate() + awayDays)
      updateCaregiverStatus(status, awayUntil.toISOString())
    } else {
      updateCaregiverStatus(status, undefined)
    }
  }

  const toggleIndependentTime = (time: TimeOfDay) => {
    if (independentTimes.includes(time)) {
      setCareReceiverIndependence(independentTimes.filter((t) => t !== time))
    } else {
      setCareReceiverIndependence([...independentTimes, time])
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
            <h1 className="text-2xl font-semibold text-foreground">
              Care Roles
            </h1>
            <p className="text-muted-foreground">
              Adjust how care responsibilities are shared
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Caregiver Status */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground">Your Status</h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleStatusChange('active')}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all touch-manipulation
                       focus:outline-none focus:ring-2 focus:ring-ring
                       ${currentStatus === 'active' ? 'border-sahay-sage bg-sahay-sage-light' : 'border-border bg-card hover:border-sahay-sage/50'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Actively caring
                  </p>
                  <p className="text-muted-foreground">
                    You&apos;re managing care as usual
                  </p>
                </div>
                {currentStatus === 'active' && (
                  <Check className="w-5 h-5 text-sahay-sage" />
                )}
              </div>
            </button>

            <div
              className={`w-full p-4 rounded-xl border-2 transition-all
                       ${currentStatus === 'away' ? 'border-sahay-pending bg-sahay-pending/10' : 'border-border bg-card'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Temporarily away
                  </p>
                  <p className="text-muted-foreground">
                    Check-in suggestions will pause
                  </p>
                </div>
                {currentStatus === 'away' && (
                  <Check className="w-5 h-5 text-sahay-pending" />
                )}
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <input
                    type="range"
                    min={1}
                    max={14}
                    value={awayDays}
                    onChange={(e) => setAwayDays(Number(e.target.value))}
                    className="w-full accent-sahay-sage"
                  />
                </div>
                <span className="text-muted-foreground min-w-[60px]">
                  {awayDays} day{awayDays > 1 ? 's' : ''}
                </span>
              </div>

              <button
                onClick={() => handleStatusChange('away')}
                className="mt-3 w-full py-3 px-4 bg-secondary text-foreground font-medium 
                         rounded-xl transition-all touch-manipulation
                         hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Mark as away for {awayDays} day{awayDays > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </section>

        {/* Care Receiver Independence */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground">
              {data.careReceiver?.name || 'Care Receiver'}&apos;s Independence
            </h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Select times when they manage medications on their own
          </p>

          <div className="space-y-3">
            {(Object.keys(timeOfDayLabels) as TimeOfDay[]).map((time) => {
              const Icon = timeIcons[time]
              const isIndependent = independentTimes.includes(time)

              return (
                <button
                  key={time}
                  onClick={() => toggleIndependentTime(time)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all touch-manipulation
                           focus:outline-none focus:ring-2 focus:ring-ring
                           ${isIndependent ? 'border-sahay-blue bg-sahay-blue-light' : 'border-border bg-card hover:border-sahay-blue/50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 ${isIndependent ? 'text-sahay-blue' : 'text-muted-foreground'}`}
                      />
                      <div>
                        <p className="text-lg font-medium text-foreground">
                          {timeOfDayLabels[time]}
                        </p>
                        <p className="text-muted-foreground">
                          {isIndependent
                            ? 'Managing independently'
                            : 'May need support'}
                        </p>
                      </div>
                    </div>
                    {isIndependent && (
                      <Check className="w-5 h-5 text-sahay-blue" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
