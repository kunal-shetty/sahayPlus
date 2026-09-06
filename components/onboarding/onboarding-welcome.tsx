"use client"

/**
 * @file onboarding-welcome.tsx
 * @description The OnboardingWelcome component for Sahay+.
 * This is the entry point of the onboarding flow. It serves as a visual
 * introduction to the application's core values: love (Heart), activity (Activity),
 * and community (Users). It uses a set of coordinated spring animations to
 * create a friendly and welcoming first impression.
 */

import { motion } from "motion/react"
import { Activity, Heart, Users } from "lucide-react"

/**
 * OnboardingWelcome component.
 * Renders a welcoming screen with animated brand icons and introductory text.
 *
 * @returns {JSX.Element} The welcome screen interface.
 */
export function OnboardingWelcome() {
    return (
        <div className="flex h-full flex-col items-center justify-center text-center">
            {/* Animated icons */}
            <div className="relative mb-8 h-40 w-40">
                <motion.div
                    className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-primary shadow-lg"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.1 }}
                >
                    <Heart className="h-10 w-10 text-primary-foreground" />
                </motion.div>

                <motion.div
                    className="absolute left-0 top-0 flex h-14 w-14 items-center justify-center rounded-xl bg-accent shadow-md"
                    initial={{ scale: 0, x: 50, y: 50 }}
                    animate={{ scale: 1, x: 0, y: 0 }}
                    transition={{ type: "spring", delay: 0.3 }}
                >
                    <Activity className="h-7 w-7 text-accent-foreground" />
                </motion.div>

                <motion.div
                    className="absolute bottom-0 right-0 flex h-14 w-14 items-center justify-center rounded-xl bg-sahay-sage shadow-md"
                    initial={{ scale: 0, x: -50, y: -50 }}
                    animate={{ scale: 1, x: 0, y: 0 }}
                    transition={{ type: "spring", delay: 0.5 }}
                >
                    <Users className="h-7 w-7 text-primary-foreground" />
                </motion.div>
            </div>

            <motion.h1
                className="mb-4 text-3xl font-bold tracking-tight text-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                Welcome to Sahay+
            </motion.h1>

            <motion.p
                className="max-w-xs text-lg text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                Simplifying care management for you and your loved ones. Connect, coordinate, and care together.
            </motion.p>
        </div>
    )
}
