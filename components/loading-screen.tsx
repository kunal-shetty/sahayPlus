'use client'

import { motion } from 'motion/react'
import { Heart } from 'lucide-react'

/**
 * Loading Screen
 * Shown while app is initializing or loading data
 * Clean, minimal design with animated heart and progress
 */
export function LoadingScreen() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background safe-top safe-bottom">
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Outer pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/15"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ width: 80, height: 80 }}
        />

        {/* Second ring with offset timing */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/10"
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.2, 0, 0.2],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          style={{ width: 80, height: 80 }}
        />

        {/* Logo container */}
        <motion.div
          className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
          animate={{
            scale: [1, 1.06, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Heart className="w-10 h-10 text-primary" strokeWidth={1.5} />
        </motion.div>
      </motion.div>

      <motion.div
        className="mt-8 flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <p className="text-muted-foreground font-medium">Loading your care data</p>
        {/* Animated dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/40"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </main>
  )
}
