"use client"

import { motion } from "motion/react"
import { Bell, Pill, Shield, Users } from "lucide-react"

const features = [
    {
        icon: Pill,
        title: "Medication Tracking",
        description: "Keep track of schedules and never miss a dose",
        color: "bg-sahay-sage",
        iconColor: "text-primary-foreground",
    },
    {
        icon: Users,
        title: "Care Team",
        description: "Coordinate with family and professional caregivers",
        color: "bg-primary",
        iconColor: "text-primary-foreground",
    },
    {
        icon: Bell,
        title: "Smart Reminders",
        description: "Get timely alerts for meds and appointments",
        color: "bg-sahay-blue",
        iconColor: "text-primary-foreground",
    },
    {
        icon: Shield,
        title: "Secure & Private",
        description: "Your health data represents you, and we keep it safe",
        color: "bg-accent",
        iconColor: "text-accent-foreground",
    },
]

export function OnboardingFeatures() {
    return (
        <div className="flex h-full flex-col justify-center">
            <motion.h2
                className="mb-2 text-center text-2xl font-bold text-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                Powerful Features
            </motion.h2>

            <motion.p
                className="mb-8 text-center text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                Everything you need to succeed
            </motion.p>

            <div className="grid gap-4">
                {features.map((feature, index) => (
                    <motion.div
                        key={feature.title}
                        className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm border border-border"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                    >
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                            <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
