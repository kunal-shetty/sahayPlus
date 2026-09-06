'use client'

/**
 * @file page.tsx
 * @description Entry point for the Sahay+ application.
 * This page handles the initial routing logic, determining whether a user
 * should be directed to onboarding, login, care-code linking, or their
 * respective dashboard based on their authentication and relationship status.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSahay } from '@/lib/sahay-context'
import { LoadingScreen } from '@/components/loading-screen'

/** Local storage key used to track if the user has completed the onboarding flow. */
const ONBOARDING_KEY = 'sahay_onboarding_complete'

/**
 * Home component.
 * Acts as a router/guard that redirects users to the appropriate page.
 *
 * @returns {JSX.Element} A LoadingScreen while the routing logic is executing.
 */
export default function Home() {
  const { user, isLoading, isDataLoading } = useSahay()
  const router = useRouter()

  useEffect(() => {
    // Wait until auth and initial data are loaded before routing
    if (isLoading || isDataLoading) return

    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY) === 'true'

    // 1. Redirect to onboarding if not completed
    if (!hasCompletedOnboarding) {
      router.push('/onboarding')
      return
    }

    // 2. Redirect to login if no user session exists
    if (!user) {
      router.push('/login')
      return
    }

    // 3. Redirect to care-code linking if user is not yet linked to a relationship
    if (!user.care_relationship_id) {
      router.push('/care-code')
      return
    }

    // 4. Route based on user role
    if (user.role === 'caregiver') {
      // Caregivers get a separate dashboard on desktop and a mobile-optimized page on smaller screens
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024
      router.push(isDesktop ? '/dashboard' : '/caregiver')
    } else if (user.role === 'care_receiver') {
      router.push('/care-receiver')
    } else {
      // Fallback to login for unknown roles
      router.push('/login')
    }
  }, [user, isLoading, isDataLoading, router])

  return <LoadingScreen />
}
