'use client'

/**
 * @file theme-provider.tsx
 * @description The ThemeProvider component for Sahay+.
 * This is a wrapper component that leverages the `next-themes` library to
 * manage the visual theme (light, dark, or system) across the entire
 * application. It ensures that theme preferences are persisted and
 * applied consistently without causing a "flash" of incorrect theme
 * during page loads.
 */

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

/**
 * ThemeProvider component.
 * Provides theme context to the application, allowing components to
 * react to theme changes and ensuring consistent styling.
 *
 * @param {ThemeProviderProps} props - Props passed to the underlying NextThemesProvider.
 * @returns {JSX.Element} The theme-wrapped application tree.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
