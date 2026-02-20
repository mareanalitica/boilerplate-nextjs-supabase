/**
 * useOnboarding Hook
 * Provides onboarding state and flow control
 * Usage: const { currentStep, isCompleted, nextStep } = useOnboarding()
 */

'use client'

import { useCallback } from 'react'
import { useOnboardingContext } from '../state/context/onboarding-context'
import { OnboardingStep, OnboardingData } from '../state/types/onboarding-state'

export interface UseOnboardingReturn {
  // State
  status: string
  currentStep: OnboardingStep | null
  completedSteps: OnboardingStep[]
  data: OnboardingData
  progress: number
  nextStep: OnboardingStep | null
  isCompleted: boolean
  isLoading: boolean
  error: string | null

  // Methods
  completeStep: (step: OnboardingStep, data?: OnboardingData) => void
  skipStep: (step: OnboardingStep) => void
  updateData: (data: OnboardingData) => void
  setOrganizationId: (orgId: string) => void
  setPlan: (plan: string) => void
  completeOnboarding: () => void
  clearError: () => void
  getProgress: () => number
  canSkip: (step: OnboardingStep) => boolean
}

export function useOnboarding(): UseOnboardingReturn {
  const context = useOnboardingContext()
  const { state, dispatch } = context

  const completeStep = useCallback(
    (step: OnboardingStep, data?: OnboardingData) => {
      if (data) {
        dispatch({ type: 'UPDATE_DATA', payload: data })
      }
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: step })
    },
    [dispatch]
  )

  const skipStep = useCallback(
    (step: OnboardingStep) => {
      dispatch({ type: 'SKIP_STEP', payload: step })
    },
    [dispatch]
  )

  const updateData = useCallback(
    (data: OnboardingData) => {
      dispatch({ type: 'UPDATE_DATA', payload: data })
    },
    [dispatch]
  )

  const setOrganizationId = useCallback(
    (orgId: string) => {
      dispatch({ type: 'SET_ORGANIZATION_ID', payload: orgId })
    },
    [dispatch]
  )

  const setPlan = useCallback(
    (plan: string) => {
      dispatch({ type: 'SET_PLAN', payload: plan })
    },
    [dispatch]
  )

  const completeOnboarding = useCallback(() => {
    dispatch({ type: 'COMPLETE_ONBOARDING' })
  }, [dispatch])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [dispatch])

  return {
    status: state.status,
    currentStep: state.current_step,
    completedSteps: state.completed_steps,
    data: state.data,
    progress: context.getProgress(),
    nextStep: context.getNextStep(),
    isCompleted: context.isCompleted(),
    isLoading: state.is_loading,
    error: state.error || null,
    completeStep,
    skipStep,
    updateData,
    setOrganizationId,
    setPlan,
    completeOnboarding,
    clearError,
    getProgress: context.getProgress,
    canSkip: context.canSkipStep,
  }
}
