/**
 * useOnboarding Hook
 * Provides onboarding state and flow control
 * Usage: const { currentStep, isCompleted, nextStep } = useOnboarding()
 */

'use client'

import {
  useOnboardingStore,
  OnboardingStep,
  OnboardingData,
} from '@/lib/stores/onboarding-store'

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
  /** Alias for updateData */
  updateMetadata: (data: OnboardingData) => void
  setOrganizationId: (orgId: string) => void
  setPlan: (plan: string) => void
  completeOnboarding: () => void
  clearError: () => void
  getProgress: () => number
  canSkip: (step: OnboardingStep) => boolean
}

export function useOnboarding(): UseOnboardingReturn {
  const store = useOnboardingStore()

  return {
    status: store.status,
    currentStep: store.currentStep,
    completedSteps: store.completedSteps,
    data: store.data,
    progress: store.getProgress(),
    nextStep: store.getNextStep(),
    isCompleted: store.isCompleted(),
    isLoading: store.isLoading,
    error: store.error,
    completeStep: store.completeStep,
    skipStep: store.skipStep,
    updateData: store.updateData,
    updateMetadata: store.updateData,
    setOrganizationId: store.setOrganizationId,
    setPlan: store.setPlan,
    completeOnboarding: store.completeOnboarding,
    clearError: store.clearError,
    getProgress: store.getProgress,
    canSkip: store.canSkip,
  }
}
