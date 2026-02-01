'use client'

import { useState, useEffect } from 'react'
import { useSahay } from '@/lib/sahay-context'
import { RoleSelection } from './role-selection'
import { CaregiverOnboarding } from './caregiver/onboarding'
import { CaregiverHome } from './caregiver/home'
import { CareReceiverHome } from './care-receiver/home'
import { LoadingScreen } from './loading-screen'
import { SplashScreen } from './onboarding/splash-screen'
import { OnboardingFlow } from './onboarding/onboarding-flow'

const ONBOARDING_KEY = 'sahay_onboarding_complete'

/**
 * App Router
 * Client-side routing based on user role and setup status
 * Includes splash screen and onboarding flow for first-time users
 */
export function AppRouter() {
  const { data, isLoading } = useSahay()
  const [showSplash, setShowSplash] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false)

  // Check if user has completed onboarding
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY) === 'true'
      setShowOnboarding(!hasCompletedOnboarding)
      setHasCheckedOnboarding(true)
    }
  }, [])

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_KEY, 'true')
    }
    setShowOnboarding(false)
  }

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  // Show loading screen while checking state
  if (isLoading || !hasCheckedOnboarding) {
    return <LoadingScreen />
  }

  // Show onboarding flow for first-time users
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  // No role selected - show role selection
  if (!data.userRole) {
    return <RoleSelection />
  }

  // Caregiver flow
  if (data.userRole === 'caregiver') {
    // Check if onboarding is complete
    if (!data.caregiver?.setupComplete) {
      return <CaregiverOnboarding />
    }
    return <CaregiverHome />
  }

  // Care Receiver flow
  if (data.userRole === 'careReceiver') {
    return <CareReceiverHome />
  }

  // Fallback to role selection
  return <RoleSelection />
}
