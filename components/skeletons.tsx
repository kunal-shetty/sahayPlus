'use client'

import { motion } from 'motion/react'
import { Skeleton } from '@/components/ui/skeleton'

const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4 },
}

/**
 * Caregiver Home Skeleton
 * Shown while data is loading on the caregiver dashboard
 */
export function CaregiverHomeSkeleton() {
    return (
        <motion.main
            className="min-h-screen flex flex-col bg-background safe-top safe-bottom"
            {...fadeIn}
        >
            {/* Header skeleton */}
            <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-7 w-44" />
                    </div>
                    <Skeleton className="w-12 h-12 rounded-xl" />
                </div>

                {/* Status card skeleton */}
                <div className="p-5 rounded-2xl border-2 border-border bg-card/80">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content skeleton */}
            <div className="flex-1 px-6 pb-24">
                {/* Streak card */}
                <div className="rounded-2xl p-5 mb-6 border-2 border-border bg-card">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-3 w-28" />
                        </div>
                        <Skeleton className="w-16 h-16 rounded-full" />
                    </div>
                </div>

                {/* Quick actions grid skeleton */}
                <div className="grid grid-cols-4 gap-3 mb-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-3 bg-card border-2 border-border rounded-xl flex flex-col items-center gap-1.5">
                            <Skeleton className="w-5 h-5 rounded" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-4 gap-3 mb-6">
                    {[5, 6, 7, 8].map((i) => (
                        <div key={i} className="p-3 bg-card border-2 border-border rounded-xl flex flex-col items-center gap-1.5">
                            <Skeleton className="w-5 h-5 rounded" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                    ))}
                </div>

                {/* Medication list skeleton */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Skeleton className="w-5 h-5 rounded" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="space-y-2">
                        {[1, 2].map((i) => (
                            <div key={i} className="p-4 bg-card rounded-xl border-2 border-border">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-5 w-28" />
                                        <Skeleton className="h-4 w-36" />
                                    </div>
                                    <Skeleton className="w-5 h-5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Second time group */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Skeleton className="w-5 h-5 rounded" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                    <div className="space-y-2">
                        <div className="p-4 bg-card rounded-xl border-2 border-border">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-8 h-8 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating button skeleton */}
            <div className="fixed bottom-6 left-0 right-0 px-6">
                <div className="max-w-md mx-auto">
                    <Skeleton className="w-full h-14 rounded-xl" />
                </div>
            </div>
        </motion.main>
    )
}

/**
 * Care Receiver Home Skeleton
 * Minimal skeleton for the elderly-friendly interface
 */
export function CareReceiverHomeSkeleton() {
    return (
        <motion.main
            className="min-h-screen flex flex-col bg-background"
            {...fadeIn}
        >
            {/* Header */}
            <header className="p-6 pb-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-7 w-36" />
                    </div>
                    <Skeleton className="w-12 h-12 rounded-xl" />
                </div>
            </header>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 -mt-10">
                <div className="w-full max-w-md">
                    {/* Daily check-in skeleton */}
                    <div className="w-full p-6 rounded-2xl border-2 border-border mb-8">
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-6 w-36" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                    </div>

                    {/* Time indicator */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Skeleton className="w-6 h-6 rounded" />
                        <Skeleton className="h-5 w-20" />
                    </div>

                    {/* Medication card skeleton */}
                    <div className="rounded-3xl p-8 border-2 border-border mb-8 text-center bg-card">
                        <Skeleton className="h-8 w-40 mx-auto mb-2" />
                        <Skeleton className="h-6 w-24 mx-auto" />
                    </div>

                    {/* Button row skeleton */}
                    <div className="flex gap-3 mb-8">
                        <Skeleton className="flex-1 h-[72px] rounded-2xl" />
                        <Skeleton className="w-20 h-[72px] rounded-2xl" />
                    </div>

                    {/* Quick actions skeleton */}
                    <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 border-2 border-border rounded-xl flex flex-col items-center gap-2">
                                <Skeleton className="w-7 h-7 rounded" />
                                <Skeleton className="h-3 w-14" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.main>
    )
}
