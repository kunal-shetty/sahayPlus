/**
 * @file utils.ts
 * @description General utility functions used across the application.
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines tailwind classes, merging duplicates and handling conditional classes.
 * This is a standard utility for managing dynamic CSS classes in React components.
 *
 * @param {...ClassValue[]} inputs - A list of class names or conditional class objects.
 * @returns {string} The merged and cleaned tailwind class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Timezone used for all calendar-day bookkeeping (dose logs, closures, wellness). */
export const APP_TIME_ZONE = 'Asia/Kolkata'

/**
 * Returns the calendar date (YYYY-MM-DD) of a moment in the app's timezone.
 * Unlike `toISOString().split('T')[0]`, this does not roll back to the previous
 * day between 00:00 and 05:30 IST, and gives the same result on the server (UTC)
 * and in the browser.
 *
 * @param value - A Date, ISO timestamp or epoch ms. Defaults to now.
 * @returns The YYYY-MM-DD date string, or '' if the value is missing or invalid.
 */
export function toLocalDateString(value: Date | string | number | null | undefined = new Date()): string {
  if (value === null || value === undefined || value === '') return ''
  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return ''
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/**
 * Whether testing/demo controls (test alarm, simulated alerts, etc.) are shown.
 * On in development; in production only when NEXT_PUBLIC_DEMO_MODE=true, so
 * real users never see buttons that fake alarms or alerts.
 */
export const SHOW_DEMO_TOOLS =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

/** Default emergency number for India (the app's locale). */
export const EMERGENCY_NUMBER = '112'
