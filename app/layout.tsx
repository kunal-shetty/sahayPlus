/**
 * @file layout.tsx
 * @description Root layout for the Sahay+ application.
 * Configures global styles, fonts, viewport settings, and wraps the entire
 * application in the SahayProvider for global state management.
 */

import React from "react"
import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SahayProvider } from '@/lib/sahay-context'
import './globals.css'

/** Nunito font configuration for a soft, accessible look. */
const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

/** SEO and application metadata. */
export const metadata: Metadata = {
  title: 'Sahay+ | Gentle Medication Care',
  description:
    'A calm, human-centered healthcare app for families managing everyday medication routines together.',
}

/** Viewport settings to optimize the mobile experience and prevent unwanted zooming. */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f5f3ed',
}

/**
 * The Root Layout component.
 * Sets up the HTML structure, applies global fonts/styles, and initializes
 * the global application context.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The child pages and components.
 * @returns {JSX.Element} The wrapped application structure.
 */
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
