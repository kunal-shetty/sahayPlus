"use client"

/**
 * @file onboarding-features.tsx
 * @description The OnboardingFeatures component for Sahay+.
 * This component is used during the initial onboarding flow to introduce
 * users to the core value propositions of the application. It presents a
 * set of key features (daily routines, shared care, gentle reminders, and
 * privacy) using a grid of visually distinct cards.
 *
 * The goal is to build trust and excitement by highlighting how the app
 * reduces the friction and anxiety typically associated with medication management.
 */

import { motion } from "motion/react"
import { Bell, Pill, Shield, Users } from "lucide-react"

/**
 * Data structure for a feature highlight.
 * @typedef {Object} Feature
 * @property {React.ComponentType} icon - The Lucide icon to represent the feature.
 * @property {string} title - The short, punchy headline for the feature.
 * @property {string} description - A brief explanation of the benefit.
 * @property {string} color - The Tailwind CSS background color class for the icon container.
 * @property {string} iconColor - The Tailwind CSS text color class for the icon.
 */
const features = [
    {
        icon: Pill,
        title: "Daily routines, made easier",
        description: "Clear, simple guidance for everyday medication.",
        color: "bg-sahay-sage",
        iconColor: "text-primary-foreground",
    },
    {
        icon: Users,
        title: "Care, shared thoughtfully",
        description: "Stay in sync with family or caregivers, without over-monitoring.",
        color: "bg-primary",
        iconColor: "text-primary-foreground",
    },
    {
        icon: Bell,
        title: "Gentle reminders",
        description: "Soft nudges that blend into the day.",
        color: "bg-sahay-blue",
        iconColor: "text-primary-foreground",
    },
    {
        icon: Shield,
        title: "Your care stays yours",
        description: "Private, respectful, and under your control.",
        color: "bg-accent",
        iconColor: "text-accent-foreground",
    },
]

/**
 * OnboardingFeatures component.
 * Renders a curated list of feature highlights with entry animations.
 *
 * @returns {JSX.Element} The feature showcase interface.
 */
export function OnboardingFeatures() {
    return (
        <div className="flex h-full flex-col justify-center">
            <motion.h2
                className="mb-2 text-center text-2xl font-semibold text-foreground"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
            >
                How Sahay+ supports you
            </motion.h2>

            <motion.p
                className="mb-8 text-center text-muted-foreground"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                Simple tools designed for real people and everyday care
            </motion.p>

            <div className="grid gap-4">
                {features.map((feature, index) => (
                    <motion.div
                        key={feature.title}
                        className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm border border-border"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                    >
                        <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
                        >
                            <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                        </div>
                        <div>
                            <h3 className="font-medium text-foreground">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
