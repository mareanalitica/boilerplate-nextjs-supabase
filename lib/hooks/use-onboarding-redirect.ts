/**
 * useOnboardingRedirect Hook
 * Redirects to onboarding if not completed
 */

'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from './use-auth'
import { useOnboarding } from './use-onboarding'

/**
 * Hook that redirects unauthenticated users to login
 * and redirects authenticated users without completed onboarding to onboarding flow
 */
export function useOnboardingRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { isCompleted: onboardingCompleted, currentStep } = useOnboarding()
  const [isClient, setIsClient] = useState(false)

  // Only run on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle redirects
  useEffect(() => {
    if (!isClient || authLoading) return

    // If not authenticated and not on auth routes, redirect to login
    if (!isAuthenticated && !pathname.startsWith('/auth')) {
      router.push('/auth/login')
      return
    }

    // If authenticated and onboarding not completed, redirect to onboarding
    if (
      isAuthenticated &&
      !onboardingCompleted &&
      !pathname.startsWith('/onboarding')
    ) {
      const nextStep = currentStep || 'verify_email'
      router.push(`/onboarding/${nextStep}`)
      return
    }

    // If authenticated and onboarding completed, prevent access to onboarding
    if (
      isAuthenticated &&
      onboardingCompleted &&
      pathname.startsWith('/onboarding')
    ) {
      router.push('/dashboard')
      return
    }
  }, [
    isClient,
    authLoading,
    isAuthenticated,
    onboardingCompleted,
    currentStep,
    pathname,
    router,
  ])

  return {
    isReady: isClient && !authLoading,
    isAuthenticated,
    onboardingCompleted,
  }
}
