"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OnboardingWelcome } from "./onboarding-welcome"
import { OnboardingFeatures } from "./onboarding-features"
import { OnboardingGoals } from "./onboarding-goals"
import { OnboardingReady } from "./onboarding-ready"

interface OnboardingFlowProps {
    onComplete: () => void
}

const STEPS = [
    { id: "welcome", component: OnboardingWelcome },
    { id: "features", component: OnboardingFeatures },
    { id: "goals", component: OnboardingGoals },
    { id: "ready", component: OnboardingReady },
]

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [direction, setDirection] = useState(0)

    const goNext = () => {
        if (currentStep < STEPS.length - 1) {
            setDirection(1)
            setCurrentStep((prev) => prev + 1)
        } else {
            onComplete()
        }
    }

    const goPrev = () => {
        if (currentStep > 0) {
            setDirection(-1)
            setCurrentStep((prev) => prev - 1)
        }
    }

    const CurrentStepComponent = STEPS[currentStep].component

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0,
        }),
    }

    return (
        <div className="fixed inset-0 z-40 flex flex-col bg-background safe-top safe-bottom">
            {/* Skip button */}
            <div className="flex justify-end p-4">
                <Button variant="ghost" size="sm" onClick={onComplete} className="text-muted-foreground">
                    Skip
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden px-6">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                        }}
                        className="h-full"
                    >
                        <CurrentStepComponent />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress dots and navigation */}
            <div className="p-6">
                {/* Progress dots */}
                <div className="mb-6 flex justify-center gap-2">
                    {STEPS.map((_, index) => (
                        <motion.div
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentStep ? "w-6 bg-primary" : "w-2 bg-muted"
                                }`}
                            initial={false}
                            animate={{
                                scale: index === currentStep ? 1 : 0.8,
                            }}
                        />
                    ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex gap-3">
                    {currentStep > 0 && (
                        <Button variant="outline" size="lg" onClick={goPrev} className="flex-1 bg-transparent">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    )}
                    <Button size="lg" onClick={goNext} className="flex-1">
                        {currentStep === STEPS.length - 1 ? (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Get Started
                            </>
                        ) : (
                            <>
                                Continue
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
