"use client"

import { motion } from "motion/react"
import { Heart, Clock, Sparkles } from "lucide-react"

const goals = [
    {
        icon: Heart,
        title: "Peace of Mind",
        description: "Know your loved ones are cared for",
    },
    {
        icon: Clock,
        title: "Never Miss a Dose",
        description: "Simple tracking keeps everyone on schedule",
    },
    {
        icon: Sparkles,
        title: "Care Together",
        description: "Stay connected with your care circle",
    },
]

export function OnboardingGoals() {
    return (
        <div className="flex h-full flex-col justify-center">
            <motion.h2
                className="mb-2 text-center text-2xl font-bold text-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                Your Care Goals
            </motion.h2>

            <motion.p
                className="mb-8 text-center text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                What matters most to you
            </motion.p>

            <div className="grid gap-6">
                {goals.map((goal, index) => (
                    <motion.div
                        key={goal.title}
                        className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.15 }}
                    >
                        <motion.div
                            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <goal.icon className="h-8 w-8 text-primary" />
                        </motion.div>
                        <h3 className="font-semibold text-lg text-foreground mb-1">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
