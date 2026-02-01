'use client'

import { motion } from 'motion/react'
import { Heart } from 'lucide-react'

/**
 * Loading Screen
 * Shown while app is initializing or loading data
 * Clean, minimal design with animated spinner
 */
export function LoadingScreen() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background safe-top safe-bottom">
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Outer pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 0, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ width: 80, height: 80 }}
        />

        {/* Logo container */}
        <motion.div
          className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Heart className="w-10 h-10 text-primary" strokeWidth={1.5} />
        </motion.div>
      </motion.div>

      <motion.p
        className="mt-6 text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Loading...
      </motion.p>
    </main>
  )
}
