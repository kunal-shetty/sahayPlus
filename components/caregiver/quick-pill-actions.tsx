'use client'

/**
 * @file quick-pill-actions.tsx
 * @description The Quick Pill Actions component for Caregivers.
 * This component acts as an attention-layer on the home dashboard, identifying
 * medications that require immediate or near-future action. It surfaces two
 * main types of issues:
 * 1. Pending Medications: Pills that have not been marked as taken for the current period.
 * 2. Refill Alerts: Medications with very low supply (<= 3 days).
 *
 * For pending medications, it provides "one-tap" mark-as-taken buttons to
 * streamline the caregiver's workflow and reduce friction.
 */

import { motion } from 'motion/react'
import { useSahay } from '@/lib/sahay-context'
import { Pill, AlertCircle, CheckCircle2 } from 'lucide-react'

/**
 * QuickPillActions component.
 * Scans medication data for critical issues and renders an action-oriented card for each.
 *
 * @returns {JSX.Element | null} A collection of issue cards, or null if all medications are up-to-date.
 */
export function QuickPillActions() {
  const { data, markMedicationTaken } = useSahay()

  /**
   * Identifies medications that need attention based on their 'taken' status
   * and remaining refill supply.
   *
   * @returns {Array<{ type: 'pending' | 'refill', count: number, meds: Medication[] }>}
   * A list of detected issues with the associated medication data.
   */
  const getPillsNeedingAttention = () => {
    const issues = []

    // Find missed/pending pills
    const pending = data.medications.filter((m) => !m.taken)
    if (pending.length > 0) {
      issues.push({
        type: 'pending',
        count: pending.length,
        meds: pending,
      })
    }

    // Find refills needed soon
    const needRefill = data.medications.filter(
      (m) => m.refillDaysLeft !== undefined && m.refillDaysLeft <= 3
    )
    if (needRefill.length > 0) {
      issues.push({
        type: 'refill',
        count: needRefill.length,
        meds: needRefill,
      })
    }

    return issues
  }

  const issues = getPillsNeedingAttention()

  if (issues.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 mb-6">
      {issues.map((issue, idx) => (
        <motion.div
          key={`${issue.type}-${idx}`}
          className={`rounded-2xl p-4 border-2 glass-card ${
            issue.type === 'pending'
              ? 'bg-sahay-pending/10 border-sahay-pending/30'
              : 'bg-sahay-warm/10 border-sahay-warm/30'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * idx }}
        >
          <div className="flex items-start gap-3">
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                issue.type === 'pending'
                  ? 'bg-sahay-pending/20'
                  : 'bg-sahay-warm/20'
              }`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {issue.type === 'pending' ? (
                <AlertCircle className="w-5 h-5 text-sahay-pending" />
              ) : (
                <Pill className="w-5 h-5 text-sahay-warm" />
              )}
            </motion.div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                {issue.type === 'pending'
                  ? `${issue.count} pending ${issue.count === 1 ? 'pill' : 'pills'}`
                  : `${issue.count} need refill soon`}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {issue.meds.map((m) => m.name).join(', ')}
              </p>
            </div>
          </div>

          {/* Quick action buttons */}
          {issue.type === 'pending' && issue.meds.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {issue.meds.slice(0, 2).map((med) => (
                <motion.button
                  key={med.id}
                  onClick={() => markMedicationTaken(med.id, true)}
                  className="py-2 px-3 bg-sahay-success/20 hover:bg-sahay-success/30 text-sahay-success text-xs font-semibold rounded-lg transition-all active:scale-95"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="truncate">✓ {med.name}</span>
                </motion.button>
              ))}
              {issue.meds.length > 2 && (
                <motion.button
                  className="py-2 px-3 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold rounded-lg transition-all col-span-2 active:scale-95"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  +{issue.meds.length - 2} more
                </motion.button>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
