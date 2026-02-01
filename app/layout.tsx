import React from "react"
import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SahayProvider } from '@/lib/sahay-context'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sahay+ | Gentle Medication Care',
  description:
    'A calm, human-centered healthcare app for families managing everyday medication routines together.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f5f3ed',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.className} antialiased min-h-screen bg-background text-foreground`}
      >
        <SahayProvider>{children}</SahayProvider>
        <Analytics />
      </body>
    </html>
  )
}
