/**
 * Preferences Store (Zustand)
 * Manages user preferences and settings
 */

import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'
export type Language = 'pt' | 'en' | 'es'

interface PreferencesState {
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
}

interface PreferencesActions {
  setLoading: (value: boolean) => void
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setLanguage: (language: Language) => void
  setTimezone: (timezone: string) => void
  setNotifications: (enabled: boolean) => void
  toggleEmailNotifications: () => void
  togglePushNotifications: () => void
  toggleDailyDigest: () => void
  setError: (error: string) => void
  clearError: () => void
  reset: () => void
}

const initialState: PreferencesState = {
  theme: 'system',
  sidebarCollapsed: false,
  language: 'en',
  timezone: 'UTC',
  notificationsEnabled: true,
  emailNotifications: true,
  pushNotifications: true,
  dailyDigest: false,
  isLoading: false,
  error: null,
}

export const usePreferencesStore = create<
  PreferencesState & PreferencesActions
>((set) => ({
  ...initialState,

  setLoading: (isLoading) => set({ isLoading }),

  setTheme: (theme) => set({ theme }),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

  setLanguage: (language) => set({ language }),

  setTimezone: (timezone) => set({ timezone }),

  setNotifications: (notificationsEnabled) => set({ notificationsEnabled }),

  toggleEmailNotifications: () =>
    set((state) => ({ emailNotifications: !state.emailNotifications })),

  togglePushNotifications: () =>
    set((state) => ({ pushNotifications: !state.pushNotifications })),

  toggleDailyDigest: () =>
    set((state) => ({ dailyDigest: !state.dailyDigest })),

  setError: (error) => set({ error, isLoading: false }),

  clearError: () => set({ error: null }),

  reset: () => set({ ...initialState }),
}))
