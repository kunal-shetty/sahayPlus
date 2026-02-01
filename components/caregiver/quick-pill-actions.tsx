'use client'

import { motion } from 'motion/react'
import { useSahay } from '@/lib/sahay-context'
import { Pill, AlertCircle, CheckCircle2 } from 'lucide-react'

/**
 * Quick Pill Actions Card
 * NEW FEATURE: Shows pills that need attention with one-tap actions
 * Displays missing pills, upcoming pills, or pills that need refill soon
 */
export function QuickPillActions() {
  const { data, markMedicationTaken } = useSahay()

  // Get pills needing attention
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
