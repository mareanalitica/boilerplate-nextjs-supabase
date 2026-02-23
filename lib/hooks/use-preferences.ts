/**
 * usePreferences Hook
 * Provides user preferences state and setters
 * Usage: const { theme, setTheme, language, setLanguage } = usePreferences()
 */

'use client'

import {
  usePreferencesStore,
  Theme,
  Language,
} from '@/lib/stores/preferences-store'

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
  const store = usePreferencesStore()

  return {
    theme: store.theme,
    sidebarCollapsed: store.sidebarCollapsed,
    language: store.language,
    timezone: store.timezone,
    notificationsEnabled: store.notificationsEnabled,
    emailNotifications: store.emailNotifications,
    pushNotifications: store.pushNotifications,
    dailyDigest: store.dailyDigest,
    isLoading: store.isLoading,
    error: store.error,
    setTheme: store.setTheme,
    toggleSidebar: store.toggleSidebar,
    setLanguage: store.setLanguage,
    setTimezone: store.setTimezone,
    setNotifications: store.setNotifications,
    toggleEmailNotifications: store.toggleEmailNotifications,
    togglePushNotifications: store.togglePushNotifications,
    toggleDailyDigest: store.toggleDailyDigest,
    clearError: store.clearError,
  }
}
