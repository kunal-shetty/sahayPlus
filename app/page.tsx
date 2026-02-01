import { AppRouter } from '@/components/app-router'

/**
 * Sahay+ Main Page
 * Human-centered medication management for families
 * 
 * The app uses client-side routing based on:
 * 1. User role (caregiver vs care receiver)
 * 2. Setup completion status
 * 3. Current medication state
 */
export default function Home() {
  return <AppRouter />
}
