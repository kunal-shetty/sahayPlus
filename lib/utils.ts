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
