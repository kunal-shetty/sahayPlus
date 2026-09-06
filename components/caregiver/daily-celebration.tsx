'use client'

/**
 * @file daily-celebration.tsx
 * @description The Daily Celebration component for Caregivers.
 * This component provides a positive reinforcement signal when a care receiver
 * has completed all their scheduled medications for the day. It uses a confetti
 * animation and celebratory messaging to reward the caregiver's effort and
 * the receiver's adherence.
 */

import { motion } from 'motion/react'
import { Sparkles, Trophy } from 'lucide-react'

/**
 * Props for the DailyCelebration component.
 * @interface DailyCelebrationProps
 * @property {number} streak - The current number of consecutive successful days.
 * @property {number} medicationCount - The total number of medications completed today.
 */
interface DailyCelebrationProps {
  streak: number
  medicationCount: number
}

/**
 * DailyCelebration component.
 * Renders an animated celebration screen with confetti and streak information.
 *
 * @param {DailyCelebrationProps} props - Component props.
 * @returns {JSX.Element} The celebratory UI.
 */
export function DailyCelebration({ streak, medicationCount }: DailyCelebrationProps) {
  // Generate confetti particles with randomized properties for a natural look.
  const confetti = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.3,
    x: Math.random() * 100 - 50,
    duration: 2 + Math.random() * 1,
  }))

  return (
    <div className="relative">
      {/* Confetti Particles: Randomly colored and animated to fall from the top. */}
      {confetti.map((particle) => (
        <motion.div
          key={particle.id}
          className="fixed w-2 h-2 rounded-full pointer-events-none"
          style={{
            left: `${50 + particle.x}%`,
            top: 0,
            backgroundColor: ['#65CDA6', '#F4B860', '#FF6B6B', '#4ECDC4'][
              Math.floor(Math.random() * 4)
            ],
          }}
          animate={{
            y: window.innerHeight + 100,
            x: particle.x * 50,
            opacity: [1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: 'easeIn',
          }}
        />
      ))}

      {/* Celebration Message: Centered text and trophy icons. */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="inline-flex items-center justify-center gap-2 mb-3"
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.6 }}
        >
          <Trophy className="w-8 h-8 text-sahay-warm" />
          <Sparkles className="w-8 h-8 text-sahay-sage" />
        </motion.div>

        <h2 className="text-3xl font-bold text-foreground mb-2 text-balance">
          Perfect Day!
        </h2>

        <motion.p
          className="text-lg text-muted-foreground mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          All {medicationCount} medications taken
        </motion.p>

        {/* Streak Badge: Only shown if the streak is greater than 1 day. */}
        {streak > 1 && (
          <motion.div
            className="inline-block px-4 py-2 bg-sahay-sage/20 border-2 border-sahay-sage/50 rounded-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm font-bold text-sahay-sage">
              🔥 {streak} day streak!
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
