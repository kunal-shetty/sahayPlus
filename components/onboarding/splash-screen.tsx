"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Heart } from "lucide-react"

interface SplashScreenProps {
    onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const duration = 2000
        const interval = 20
        const increment = 100 / (duration / interval)

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer)
                    setTimeout(onComplete, 300)
                    return 100
                }
                return prev + increment
            })
        }, interval)

        return () => clearInterval(timer)
    }, [onComplete])

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary safe-top safe-bottom"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Animated Logo */}
                <motion.div
                    className="relative mb-8"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                    {/* Outer ring pulse */}
                    <motion.div
                        className="absolute inset-0 rounded-full bg-primary-foreground/20"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                        }}
                        style={{ width: 120, height: 120 }}
                    />

                    {/* Logo container */}
                    <motion.div
                        className="relative flex h-28 w-28 items-center justify-center rounded-full bg-primary-foreground shadow-2xl"
                        whileHover={{ scale: 1.05 }}
                    >
                        <motion.div
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                        >
                            <Heart className="h-14 w-14 text-primary" strokeWidth={2} fill="currentColor" />
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* App name */}
                <motion.h1
                    className="mb-2 text-3xl font-bold tracking-tight text-primary-foreground"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Sahay+
                </motion.h1>

                <motion.p
                    className="mb-12 text-primary-foreground/80"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    Care made simple, together
                </motion.p>

                {/* Progress bar */}
                <motion.div
                    className="w-48 overflow-hidden rounded-full bg-primary-foreground/20"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <motion.div
                        className="h-1 rounded-full bg-primary-foreground"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear" }}
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
