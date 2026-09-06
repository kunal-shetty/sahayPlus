"use client"

/**
 * @file onboarding-ready.tsx
 * @description The OnboardingReady component for Sahay+.
 * This is the final screen of the onboarding flow. It serves as a positive
 * culmination of the introduction, signaling to the user that they have
 * completed the setup and are ready to enter the main application.
 *
 * The screen features a celebratory "rocket" animation to create a sense of
 * momentum and progress.
 */

import { motion } from "motion/react"
import { Rocket } from "lucide-react"

/**
 * OnboardingReady component.
 * Renders a final celebratory state before the user enters the app.
 *
 * @returns {JSX.Element} The final onboarding completion screen.
 */
export function OnboardingReady() {
    return (
        <div className="flex h-full flex-col items-center justify-center text-center">
            <motion.div
                className="mb-8"
                initial={{ scale: 0, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
                <motion.div
                    className="flex h-28 w-28 items-center justify-center rounded-3xl bg-primary shadow-xl"
                    animate={{
                        y: [0, -10, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                >
                    <Rocket className="h-14 w-14 text-primary-foreground" />
                </motion.div>
            </motion.div>

            <motion.h2
                className="mb-4 text-3xl font-bold tracking-tight text-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                You&apos;re all set!
            </motion.h2>

            <motion.p
                className="mb-2 max-w-xs text-lg text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                Let&apos;s begin your journey to simpler care management.
            </motion.p>
        </div>
    )
}
