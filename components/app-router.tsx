'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
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

export function AppRouter() {
  const { data, isLoading } = useSahay()

  const [showSplash, setShowSplash] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false)
  const [user, setUser] = useState<any>(null)

  // ✅ Load user safely from localStorage (hydration safe)
  useEffect(() => {
    const stored = localStorage.getItem('sahay_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        setUser(null)
      }
    }
  }, [])

  // ✅ Check onboarding status
  useEffect(() => {
    const hasCompletedOnboarding =
      localStorage.getItem(ONBOARDING_KEY) === 'true'

    setShowOnboarding(!hasCompletedOnboarding)
    setHasCheckedOnboarding(true)
  }, [])

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setShowOnboarding(false)
  }

  // ✅ Derive setup completion from real DB data
  const caregiverSetupComplete =
    data?.medications?.length > 0

  // ✅ Determine screen
  const screenKey = useMemo(() => {
    if (showSplash) return 'splash'
    if (isLoading || !hasCheckedOnboarding) return 'loading'
    if (showOnboarding) return 'onboarding'
    if (!user) return 'login'
    if (!user.care_relationship_id) return 'care-code'

    if (user.role === 'caregiver') {
      return caregiverSetupComplete
        ? 'caregiver-home'
        : 'caregiver-onboarding'
    }

    if (user.role === 'care_receiver') {
      return 'care-receiver-home'
    }

    return 'login'
  }, [
    showSplash,
    isLoading,
    hasCheckedOnboarding,
    showOnboarding,
    user,
    caregiverSetupComplete,
  ])

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  if (isLoading || !hasCheckedOnboarding) {
    return <LoadingScreen />
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screenKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        {showOnboarding && (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        )}

        {!showOnboarding && !user && <EmailLogin />}

        {!showOnboarding && user && !user.care_relationship_id && (
          <EnterCareCode />
        )}

        {!showOnboarding &&
          user?.care_relationship_id &&
          user.role === 'caregiver' &&
          (caregiverSetupComplete ? (
            <CaregiverHome />
          ) : (
            <CaregiverOnboarding />
          ))}

        {!showOnboarding &&
          user?.care_relationship_id &&
          user.role === 'care_receiver' && <CareReceiverHome />}
      </motion.div>
    </AnimatePresence>
  )
}
