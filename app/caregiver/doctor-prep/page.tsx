'use client'

import { useSahay } from '@/lib/sahay-context'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

/**
 * Doctor Visit Prep Page
 * Generates a professional summary for the next medical appointment
 */
export default function DoctorPrepPage() {
  const { getDoctorPrepSummary } = useSahay()
  const router = useRouter()

  return (
    <main className="min-h-screen flex flex-col bg-background p-6">
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Doctor Visit Prep</h1>
      </header>

      <div className="bg-card border-2 border-border rounded-2xl p-6 whitespace-pre-wrap leading-relaxed">
        {getDoctorPrepSummary()}
      </div>

      <button
        onClick={() => window.print()}
        className="mt-6 w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl"
      >
        Share or Print
      </button>
    </main>
  )
}
