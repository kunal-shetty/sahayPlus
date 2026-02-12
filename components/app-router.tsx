'use client'

import { useState, useEffect } from 'react'
import { useSahay } from '@/lib/sahay-context'
import { CaregiverOnboarding } from './caregiver/onboarding'
import { CaregiverHome } from './caregiver/home'
import { CareReceiverHome } from './care-receiver/home'
import { LoadingScreen } from './loading-screen'
import { SplashScreen } from './onboarding/splash-screen'
import { OnboardingFlow } from './onboarding/onboarding-flow'
import { EmailLogin } from './email-login'
import { EnterCareCode } from './enter-care-code'

const ONBOARDING_KEY = 'sahay_onboarding_complete'

/**
 * App Router
 * Client-side routing based on auth state, care code linking, and role
 */
export function AppRouter() {
  const { data, isLoading, user } = useSahay()
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

  // ─── Auth gates ───────────────────────────────────────────────────

  // Not logged in → show email login
  if (!user) {
    return <EmailLogin />
  }

  // Logged in but no care relationship → show care code screen
  // Caregivers enter a code, care receivers see their code
  if (!user.care_relationship_id) {
    return <EnterCareCode />
  }

  // ─── Role-based routing ───────────────────────────────────────────

  // Caregiver flow
  if (user.role === 'caregiver') {
    if (!data.caregiver?.setupComplete) {
      return <CaregiverOnboarding />
    }
    return <CaregiverHome />
  }

  // Care Receiver flow
  if (user.role === 'care_receiver') {
    return <CareReceiverHome />
  }

  // Fallback
  return <EmailLogin />
}
