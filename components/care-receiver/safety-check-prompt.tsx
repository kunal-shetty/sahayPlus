'use client'

import { useState, useEffect } from 'react'
import { useSahay } from '@/lib/sahay-context'
import { ShieldAlert, Heart, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export function SafetyCheckPrompt() {
    const { data, dismissSafetyCheck } = useSahay()
    const [countdown, setCountdown] = useState(300) // 5 minutes in seconds

    useEffect(() => {
        if (data.safetyCheck.status !== 'pending_check') return

        // Calculate remaining time based on when it was triggered
        const triggeredAt = data.safetyCheck.lastTriggered
            ? new Date(data.safetyCheck.lastTriggered).getTime()
            : Date.now()

        const updateCountdown = () => {
            const now = Date.now()
            const elapsed = Math.floor((now - triggeredAt) / 1000)
            const remaining = Math.max(0, 300 - elapsed)
            setCountdown(remaining)
        }

        updateCountdown()
        const timer = setInterval(updateCountdown, 1000)

        return () => clearInterval(timer)
    }, [data.safetyCheck.status, data.safetyCheck.lastTriggered])

    if (data.safetyCheck.status !== 'pending_check') return null

    const minutes = Math.floor(countdown / 60)
    const seconds = countdown % 60
    const progress = (countdown / 300) * 100

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-background flex flex-col p-6 items-center justify-center"
            >
                <div className="w-full max-w-md flex flex-col items-center">
                    {/* Calm Icon */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-32 h-32 rounded-full bg-sahay-sage-light flex items-center justify-center mb-8 relative"
                    >
                        <div className="absolute inset-0 rounded-full border-4 border-sahay-sage/30 animate-pulse" />
                        <Heart className="w-16 h-16 text-sahay-sage" />
                    </motion.div>

                    <h1 className="text-4xl font-bold text-foreground mb-4 text-center">
                        Are you okay?
                    </h1>

                    <p className="text-2xl text-muted-foreground text-center mb-12 max-w-[280px]">
                        We noticed a quick movement and just wanted to check in.
                    </p>

                    {/* Dismiss Button - Primary Action */}
                    <button
                        onClick={dismissSafetyCheck}
                        className="w-full py-8 bg-primary text-primary-foreground text-3xl font-bold rounded-3xl
                     shadow-xl shadow-primary/20 touch-manipulation active:scale-[0.98] transition-all
                     focus:outline-none focus:ring-4 focus:ring-primary/30 mb-12"
                    >
                        Yes, I&apos;m okay
                    </button>

                    {/* Calm Escalation Info */}
                    <div className="w-full bg-secondary/50 rounded-2xl p-6 flex items-start gap-4">
                        <Info className="w-6 h-6 text-muted-foreground shrink-0 mt-1" />
                        <div>
                            <p className="text-lg text-foreground font-medium mb-1">
                                No rush at all.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                If you don&apos;t respond in {minutes > 0 ? `${minutes}m ` : ''}{seconds}s,
                                we&apos;ll quietly let {data.caregiver?.name || 'your caregiver'} know.
                            </p>

                            {/* Subtle Progress Bar */}
                            <div className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-sahay-sage"
                                    initial={{ width: '100%' }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: 'linear' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
