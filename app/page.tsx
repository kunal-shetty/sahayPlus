'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSahay } from '@/lib/sahay-context'
import { LoadingScreen } from '@/components/loading-screen'

const ONBOARDING_KEY = 'sahay_onboarding_complete'

export default function Home() {
  const { user, isLoading, isDataLoading } = useSahay()
  const router = useRouter()

  useEffect(() => {
    if (isLoading || isDataLoading) return

    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY) === 'true'

    if (!hasCompletedOnboarding) {
      router.push('/onboarding')
      return
    }

    if (!user) {
      router.push('/login')
      return
    }

    if (!user.care_relationship_id) {
      router.push('/care-code')
      return
    }

    if (user.role === 'caregiver') {
      router.push('/caregiver')
    } else if (user.role === 'care_receiver') {
      router.push('/care-receiver')
    } else {
      router.push('/login')
    }
  }, [user, isLoading, isDataLoading, router])

  return <LoadingScreen />
}
