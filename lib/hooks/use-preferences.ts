/**
 * usePreferences Hook
 * Provides user preferences state and setters
 * Usage: const { theme, setTheme, language, setLanguage } = usePreferences()
 */

'use client'

import { useCallback } from 'react'
import { usePreferencesContext } from '../state/context/preferences-context'
import { Theme, Language } from '../state/types/preferences-state'

export interface UsePreferencesReturn {
  // State
  theme: Theme
  sidebarCollapsed: boolean
  language: Language
  timezone: string
  notificationsEnabled: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  dailyDigest: boolean
  isLoading: boolean
  error: string | null

  // Setters
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setLanguage: (language: Language) => void
  setTimezone: (timezone: string) => void
  setNotifications: (enabled: boolean) => void
  toggleEmailNotifications: () => void
  togglePushNotifications: () => void
  toggleDailyDigest: () => void
  clearError: () => void
}

export function usePreferences(): UsePreferencesReturn {
  const { state, dispatch } = usePreferencesContext()

  const setTheme = useCallback(
    (theme: Theme) => {
      dispatch({ type: 'SET_THEME', payload: theme })
    },
    [dispatch]
  )

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' })
  }, [dispatch])

  const setLanguage = useCallback(
    (language: Language) => {
      dispatch({ type: 'SET_LANGUAGE', payload: language })
    },
    [dispatch]
  )

  const setTimezone = useCallback(
    (timezone: string) => {
      dispatch({ type: 'SET_TIMEZONE', payload: timezone })
    },
    [dispatch]
  )

  const setNotifications = useCallback(
    (enabled: boolean) => {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: enabled })
    },
    [dispatch]
  )

  const toggleEmailNotifications = useCallback(() => {
    dispatch({ type: 'TOGGLE_EMAIL_NOTIFICATIONS' })
  }, [dispatch])

  const togglePushNotifications = useCallback(() => {
    dispatch({ type: 'TOGGLE_PUSH_NOTIFICATIONS' })
  }, [dispatch])

  const toggleDailyDigest = useCallback(() => {
    dispatch({ type: 'TOGGLE_DAILY_DIGEST' })
  }, [dispatch])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [dispatch])

  return {
    theme: state.theme,
    sidebarCollapsed: state.sidebar_collapsed,
    language: state.language,
    timezone: state.timezone,
    notificationsEnabled: state.notifications_enabled,
    emailNotifications: state.email_notifications,
    pushNotifications: state.push_notifications,
    dailyDigest: state.daily_digest,
    isLoading: state.is_loading,
    error: state.error || null,
    setTheme,
    toggleSidebar,
    setLanguage,
    setTimezone,
    setNotifications,
    toggleEmailNotifications,
    togglePushNotifications,
    toggleDailyDigest,
    clearError,
  }
}
