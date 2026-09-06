'use client'

import { useRouter } from 'next/navigation'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'

const ONBOARDING_KEY = 'sahay_onboarding_complete'

export default function OnboardingPage() {
    const router = useRouter()

    const handleComplete = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true')
        router.push('/login')
    }

    return <OnboardingFlow onComplete={handleComplete} />
}
