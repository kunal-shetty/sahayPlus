/**
 * @file use-mobile.ts
 * @description Hook for detecting whether the current viewport is in mobile size.
 */

import * as React from 'react'

/** The breakpoint width in pixels below which the device is considered mobile. */
const MOBILE_BREAKPOINT = 768

/**
 * Custom hook that returns a boolean indicating if the user is on a mobile device
 * based on the screen width.
 *
 * @returns {boolean} True if the screen width is below the MOBILE_BREAKPOINT.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile
}
