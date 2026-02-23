/**
 * Onboarding Store (Zustand)
 * Manages onboarding flow state
 */

import { create } from 'zustand'

export type OnboardingStatus =
  | 'not_started'
  | 'email_verifying'
  | 'email_verified'
  | 'profile_created'
  | 'organization_created'
  | 'plan_selected'
  | 'configured'
  | 'tutorial_completed'
  | 'completed'

export type OnboardingStep =
  | 'verify_email'
  | 'create_profile'
  | 'create_organization'
  | 'select_plan'
  | 'configure_basics'
  | 'tutorial'

export const ONBOARDING_STEPS: OnboardingStep[] = [
  'verify_email',
  'create_profile',
  'create_organization',
  'select_plan',
  'configure_basics',
  'tutorial',
]

// Steps that cannot be skipped
const NON_SKIPPABLE_STEPS: OnboardingStep[] = [
  'verify_email',
  'create_organization',
  'select_plan',
]

export interface OnboardingData {
  full_name?: string
  avatar_url?: string
  bio?: string
  organization_name?: string
  organization_logo_url?: string
  organization_id?: string
  plan_selected?: 'free' | 'pro' | 'enterprise'
  timezone?: string
  language?: string
  notifications_enabled?: boolean
  [key: string]: unknown
}

interface OnboardingState {
  status: OnboardingStatus
  currentStep: OnboardingStep | null
  completedSteps: OnboardingStep[]
  data: OnboardingData
  organizationId: string | undefined
  planSelected: string | undefined
  isLoading: boolean
  error: string | null
  startedAt: number | undefined
  completedAt: number | undefined
}

interface OnboardingActions {
  setLoading: (value: boolean) => void
  setStatus: (status: OnboardingStatus) => void
  setCurrentStep: (step: OnboardingStep | null) => void
  completeStep: (step: OnboardingStep, data?: OnboardingData) => void
  skipStep: (step: OnboardingStep) => void
  updateData: (data: OnboardingData) => void
  setOrganizationId: (orgId: string) => void
  setPlan: (plan: string) => void
  completeOnboarding: () => void
  setError: (error: string) => void
  clearError: () => void
  reset: () => void
  // Computed helpers
  getProgress: () => number
  getNextStep: () => OnboardingStep | null
  isCompleted: () => boolean
  canSkip: (step: OnboardingStep) => boolean
}

const initialState: OnboardingState = {
  status: 'not_started',
  currentStep: null,
  completedSteps: [],
  data: {},
  organizationId: undefined,
  planSelected: undefined,
  isLoading: false,
  error: null,
  startedAt: undefined,
  completedAt: undefined,
}

export const useOnboardingStore = create<OnboardingState & OnboardingActions>(
  (set, get) => ({
    ...initialState,

    setLoading: (isLoading) => set({ isLoading }),

    setStatus: (status) => set({ status }),

    setCurrentStep: (currentStep) => set({ currentStep }),

    completeStep: (step, data) => {
      const { completedSteps } = get()
      if (!completedSteps.includes(step)) {
        set({
          completedSteps: [...completedSteps, step],
          ...(data ? { data: { ...get().data, ...data } } : {}),
        })
      }
    },

    skipStep: (step) => {
      const { completedSteps } = get()
      if (!completedSteps.includes(step)) {
        set({ completedSteps: [...completedSteps, step] })
      }
    },

    updateData: (data) =>
      set((state) => ({ data: { ...state.data, ...data } })),

    setOrganizationId: (organizationId) => set({ organizationId }),

    setPlan: (planSelected) => set({ planSelected }),

    completeOnboarding: () =>
      set({ status: 'completed', completedAt: Date.now() }),

    setError: (error) => set({ error, isLoading: false }),

    clearError: () => set({ error: null }),

    reset: () => set({ ...initialState }),

    getProgress: () => {
      const { completedSteps } = get()
      return Math.round((completedSteps.length / ONBOARDING_STEPS.length) * 100)
    },

    getNextStep: () => {
      const { completedSteps } = get()
      for (const step of ONBOARDING_STEPS) {
        if (!completedSteps.includes(step)) {
          return step
        }
      }
      return null
    },

    isCompleted: () => get().status === 'completed',

    canSkip: (step) => !NON_SKIPPABLE_STEPS.includes(step),
  })
)
