/**
 * Preferences State Type Definitions
 * Defines interfaces for user preferences context
 */

export type Theme = 'light' | 'dark' | 'system'
export type Language = 'pt' | 'en' | 'es'

export interface PreferencesState {
  // Appearance
  theme: Theme
  sidebar_collapsed: boolean

  // Localization
  language: Language
  timezone: string

  // Notifications
  notifications_enabled: boolean
  email_notifications: boolean
  push_notifications: boolean
  daily_digest: boolean

  // Status
  is_loading: boolean
  error?: string | null

  // Metadata
  last_updated?: number
}

export interface PreferencesContextType {
  state: PreferencesState
  dispatch: React.Dispatch<PreferencesAction>
}

// Action types
export type PreferencesActionType =
  | 'SET_LOADING'
  | 'SET_THEME'
  | 'TOGGLE_SIDEBAR'
  | 'SET_LANGUAGE'
  | 'SET_TIMEZONE'
  | 'SET_NOTIFICATIONS'
  | 'TOGGLE_EMAIL_NOTIFICATIONS'
  | 'TOGGLE_PUSH_NOTIFICATIONS'
  | 'TOGGLE_DAILY_DIGEST'
  | 'SET_ERROR'
  | 'CLEAR_ERROR'
  | 'RESET'

export interface PreferencesAction {
  type: PreferencesActionType
  payload?: any
}

// Initial state
export const initialPreferencesState: PreferencesState = {
  theme: 'system',
  sidebar_collapsed: false,
  language: 'en',
  timezone: 'UTC',
  notifications_enabled: true,
  email_notifications: true,
  push_notifications: true,
  daily_digest: false,
  is_loading: false,
  error: null,
  last_updated: undefined,
}
