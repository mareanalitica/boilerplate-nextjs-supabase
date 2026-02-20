/**
 * Onboarding Reducer
 * Manages onboarding flow state transitions
 */

import {
  OnboardingState,
  OnboardingAction,
  initialOnboardingState,
  OnboardingStatus,
  OnboardingStep,
} from '../types/onboarding-state'

export function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction
): OnboardingState {
  const now = Date.now()

  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        is_loading: action.payload ?? true,
        last_updated: now,
      }

    case 'SET_STATUS': {
      const status: OnboardingStatus = action.payload
      return {
        ...state,
        status,
        is_loading: false,
        last_updated: now,
      }
    }

    case 'SET_CURRENT_STEP': {
      const step: OnboardingStep = action.payload
      return {
        ...state,
        current_step: step,
        last_updated: now,
      }
    }

    case 'MARK_STEP_COMPLETED': {
      const step: OnboardingStep = action.payload
      if (state.completed_steps.includes(step)) {
        return state
      }

      return {
        ...state,
        completed_steps: [...state.completed_steps, step],
        last_updated: now,
      }
    }

    case 'SKIP_STEP': {
      const step: OnboardingStep = action.payload
      if (state.completed_steps.includes(step)) {
        return state
      }

      return {
        ...state,
        completed_steps: [...state.completed_steps, step],
        last_updated: now,
      }
    }

    case 'UPDATE_DATA': {
      const newData = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          ...newData,
        },
        last_updated: now,
      }
    }

    case 'SET_ORGANIZATION_ID':
      return {
        ...state,
        organization_id: action.payload,
        last_updated: now,
      }

    case 'SET_PLAN':
      return {
        ...state,
        plan_selected: action.payload,
        last_updated: now,
      }

    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        status: 'completed',
        completed_at: now,
        is_loading: false,
        last_updated: now,
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        is_loading: false,
        last_updated: now,
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
        last_updated: now,
      }

    case 'RESET':
      return initialOnboardingState

    default:
      return state
  }
}
