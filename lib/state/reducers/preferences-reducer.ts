/**
 * Preferences Reducer
 * Manages user preferences state transitions
 */

import {
  PreferencesState,
  PreferencesAction,
  initialPreferencesState,
  Theme,
  Language,
} from '../types/preferences-state'

export function preferencesReducer(
  state: PreferencesState,
  action: PreferencesAction
): PreferencesState {
  const now = Date.now()

  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        is_loading: action.payload ?? true,
        last_updated: now,
      }

    case 'SET_THEME': {
      const theme: Theme = action.payload
      return {
        ...state,
        theme,
        is_loading: false,
        last_updated: now,
      }
    }

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebar_collapsed: !state.sidebar_collapsed,
        last_updated: now,
      }

    case 'SET_LANGUAGE': {
      const language: Language = action.payload
      return {
        ...state,
        language,
        last_updated: now,
      }
    }

    case 'SET_TIMEZONE': {
      const timezone: string = action.payload
      return {
        ...state,
        timezone,
        last_updated: now,
      }
    }

    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications_enabled: action.payload ?? true,
        last_updated: now,
      }

    case 'TOGGLE_EMAIL_NOTIFICATIONS':
      return {
        ...state,
        email_notifications: !state.email_notifications,
        last_updated: now,
      }

    case 'TOGGLE_PUSH_NOTIFICATIONS':
      return {
        ...state,
        push_notifications: !state.push_notifications,
        last_updated: now,
      }

    case 'TOGGLE_DAILY_DIGEST':
      return {
        ...state,
        daily_digest: !state.daily_digest,
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
      return initialPreferencesState

    default:
      return state
  }
}
