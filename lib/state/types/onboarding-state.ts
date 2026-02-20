/**
 * Onboarding State Type Definitions
 * Defines interfaces for onboarding flow context
 */

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

export interface OnboardingData {
  // Profile
  full_name?: string
  avatar_url?: string
  bio?: string

  // Organization
  organization_name?: string
  organization_logo_url?: string
  organization_id?: string

  // Plan
  plan_selected?: 'free' | 'pro' | 'enterprise'

  // Settings
  timezone?: string
  language?: string
  notifications_enabled?: boolean

  // Metadata
  [key: string]: any
}

export interface OnboardingState {
  // Status
  status: OnboardingStatus
  current_step: OnboardingStep | null
  completed_steps: OnboardingStep[]

  // Data collected during onboarding
  data: OnboardingData

  // References
  organization_id?: string
  plan_selected?: string

  // Status
  is_loading: boolean
  error?: string | null

  // Timeline
  started_at?: number
  completed_at?: number
  expires_at?: number
  last_updated?: number
}

export interface OnboardingContextType {
  state: OnboardingState
  dispatch: React.Dispatch<OnboardingAction>
  // Helper methods
  getProgress: () => number
  getNextStep: () => OnboardingStep | null
  canSkipStep: (step: OnboardingStep) => boolean
  isCompleted: () => boolean
}

// Action types
export type OnboardingActionType =
  | 'SET_LOADING'
  | 'SET_STATUS'
  | 'SET_CURRENT_STEP'
  | 'MARK_STEP_COMPLETED'
  | 'SKIP_STEP'
  | 'UPDATE_DATA'
  | 'SET_ORGANIZATION_ID'
  | 'SET_PLAN'
  | 'COMPLETE_ONBOARDING'
  | 'SET_ERROR'
  | 'CLEAR_ERROR'
  | 'RESET'

export interface OnboardingAction {
  type: OnboardingActionType
  payload?: any
}

// Initial state
export const initialOnboardingState: OnboardingState = {
  status: 'not_started',
  current_step: null,
  completed_steps: [],
  data: {},
  is_loading: false,
  error: null,
  started_at: undefined,
  completed_at: undefined,
  expires_at: undefined,
  last_updated: undefined,
}
