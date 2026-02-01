"use client"

import { motion } from "motion/react"
import { Rocket } from "lucide-react"

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

            <motion.div
                className="mt-8 flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <div className="flex gap-1">
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                        <motion.div
                            key={i}
                            className="h-8 w-8 rounded-md bg-primary/20"
                            initial={{ scale: 0 }}
                            animate={{
                                scale: 1,
                                backgroundColor: i < 5 ? "var(--primary)" : undefined
                            }}
                            transition={{ delay: 0.7 + i * 0.05 }}
                            style={{
                                opacity: i < 5 ? 1 : 0.2,
                            }}
                        />
                    ))}
                </div>
                <p className="text-xs text-muted-foreground">Your first week awaits</p>
            </motion.div>
        </div>
    )
}
