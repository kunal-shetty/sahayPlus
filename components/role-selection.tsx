'use client'

import { motion } from 'motion/react'
import { useSahay } from '@/lib/sahay-context'
import { Heart, Users } from 'lucide-react'

/**
 * Role Selection Screen
 * Calm, welcoming, and easy to understand
 * Designed for large touch targets and low cognitive load
 */
export function RoleSelection() {
  const { setUserRole } = useSahay()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background safe-top safe-bottom">
      {/* Logo and welcome */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          <Heart className="w-10 h-10 text-primary" strokeWidth={1.5} />
        </motion.div>

        <motion.h1
          className="text-3xl font-semibold text-foreground mb-3 text-balance"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Welcome to Sahay+
        </motion.h1>

        <motion.p
          className="text-lg text-muted-foreground max-w-sm text-pretty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Everyday care, made a little easier.
        </motion.p>
      </motion.div>

      {/* Role selection cards */}
      <div className="w-full max-w-md space-y-4">
        <motion.p
          className="text-center text-muted-foreground mb-6 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          How would you like to use Sahay+?
        </motion.p>

        {/* Caregiver option */}
        <motion.button
          onClick={() => setUserRole('caregiver')}
          className="w-full p-6 bg-card rounded-2xl border-2 border-border hover:border-primary 
                     transition-colors duration-200 text-left group focus:outline-none focus:ring-2 
                     focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
                     touch-manipulation"
          aria-label="I help care for someone"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, type: 'spring' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start gap-4">
            <motion.div
              className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center 
                        group-hover:bg-primary transition-colors duration-200"
              whileHover={{ rotate: 5 }}
            >
              <Users
                className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors"
                strokeWidth={1.5}
              />
            </motion.div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-foreground mb-1">
                I help care for someone
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Set things up and stay quietly reassured.
              </p>
            </div>
          </div>
        </motion.button>

        {/* Care Receiver option */}
        <motion.button
          onClick={() => setUserRole('careReceiver')}
          className="w-full p-6 bg-card rounded-2xl border-2 border-border hover:border-sahay-blue 
                     transition-colors duration-200 text-left group focus:outline-none focus:ring-2 
                     focus:ring-sahay-blue focus:ring-offset-2 focus:ring-offset-background
                     touch-manipulation"
          aria-label="I manage my own care"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, type: 'spring' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start gap-4">
            <motion.div
              className="flex-shrink-0 w-14 h-14 rounded-xl bg-sahay-blue/10 flex items-center justify-center 
                        group-hover:bg-sahay-blue transition-colors duration-200"
              whileHover={{ rotate: -5 }}
            >
              <Heart
                className="w-7 h-7 text-sahay-blue group-hover:text-primary-foreground transition-colors"
                strokeWidth={1.5}
              />
            </motion.div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-foreground mb-1">
                I manage my own care
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Simple reminders, with family support when needed.
              </p>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Gentle footer message */}
      <motion.p
        className="mt-12 text-sm text-muted-foreground text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        You can change this anytime.
      </motion.p>
    </main>
  )
}
