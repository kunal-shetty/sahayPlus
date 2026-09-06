'use client'

/**
 * @file page.tsx
 * @description The Onboarding page for Sahay+.
 * This page provides the initial guided experience for new users to learn about
 * the app's features before proceeding to authentication.
 */

import { useRouter } from 'next/navigation'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'

/** Local storage key used to persist the onboarding completion status. */
const ONBOARDING_KEY = 'sahay_onboarding_complete'

/**
 * OnboardingPage component.
 * Renders the interactive onboarding flow and handles the transition to login upon completion.
 *
 * @returns {JSX.Element} The onboarding flow component.
 */
export default function OnboardingPage() {
    const router = useRouter()

    /**
     * Callback executed when the user finishes the onboarding flow.
     * Marks onboarding as complete in localStorage and redirects to the login page.
     */
    const handleComplete = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true')
        router.push('/login')
    }

    return <OnboardingFlow onComplete={handleComplete} />
}
