/**
 * Onboarding Context Provider
 * Manages onboarding flow state
 */

'use client'

import React, { createContext, useReducer } from 'react'
import {
  OnboardingState,
  OnboardingContextType,
  initialOnboardingState,
  ONBOARDING_STEPS,
  OnboardingStep,
} from '../types/onboarding-state'
import { onboardingReducer } from '../reducers/onboarding-reducer'

export const OnboardingContext = createContext<
  OnboardingContextType | undefined
>(undefined)

interface OnboardingProviderProps {
  children: React.ReactNode
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [state, dispatch] = useReducer(
    onboardingReducer,
    initialOnboardingState
  )

  // Helper methods
  const getProgress = (): number => {
    return Math.round((state.completed_steps.length / ONBOARDING_STEPS.length) * 100)
  }

  const getNextStep = (): OnboardingStep | null => {
    for (const step of ONBOARDING_STEPS) {
      if (!state.completed_steps.includes(step)) {
        return step
      }
    }
    return null
  }

  const canSkipStep = (step: OnboardingStep): boolean => {
    // verify_email cannot be skipped
    if (step === 'verify_email') {
      return false
    }
    // Create organization cannot be skipped (needed for multi-tenant)
    if (step === 'create_organization') {
      return false
    }
    // Plan selection cannot be skipped
    if (step === 'select_plan') {
      return false
    }
    return true
  }

  const isCompleted = (): boolean => {
    return state.status === 'completed'
  }

  const value: OnboardingContextType = {
    state,
    dispatch,
    getProgress,
    getNextStep,
    canSkipStep,
    isCompleted,
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

/**
 * Hook to use Onboarding Context
 */
export function useOnboardingContext(): OnboardingContextType {
  const context = React.useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error(
      'useOnboardingContext must be used inside OnboardingProvider'
    )
  }
  return context
}
