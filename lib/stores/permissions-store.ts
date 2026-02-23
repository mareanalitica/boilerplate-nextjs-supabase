/**
 * Permissions Store (Zustand)
 * Manages RBAC and feature flags
 */

import { create } from 'zustand'

export interface Permission {
  id: string
  name: string
  description: string
  category: string
  created_at: string
}

export interface FeatureFlag {
  name: string
  enabled: boolean
  plan_level: 'free' | 'pro' | 'enterprise'
  description?: string
}

interface PermissionsState {
  userPermissions: Permission[]
  userRoles: string[]
  orgPermissions: Permission[]
  featureFlags: FeatureFlag[]
  isLoading: boolean
  error: string | null
}

interface PermissionsActions {
  setLoading: (value: boolean) => void
  setUserPermissions: (permissions: Permission[]) => void
  setUserRoles: (roles: string[]) => void
  setOrgPermissions: (permissions: Permission[]) => void
  setFeatureFlags: (flags: FeatureFlag[]) => void
  updateFeatureFlag: (name: string, enabled: boolean) => void
  setError: (error: string) => void
  clearError: () => void
  reset: () => void
  // Helper methods
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  canAction: (action: string) => boolean
  isFeatureEnabled: (feature: string) => boolean
}

const initialState: PermissionsState = {
  userPermissions: [],
  userRoles: [],
  orgPermissions: [],
  featureFlags: [],
  isLoading: false,
  error: null,
}

export const usePermissionsStore = create<PermissionsState & PermissionsActions>(
  (set, get) => ({
    ...initialState,

    setLoading: (isLoading) => set({ isLoading }),

    setUserPermissions: (userPermissions) => set({ userPermissions }),

    setUserRoles: (userRoles) => set({ userRoles }),

    setOrgPermissions: (orgPermissions) => set({ orgPermissions }),

    setFeatureFlags: (featureFlags) => set({ featureFlags }),

    updateFeatureFlag: (name, enabled) =>
      set((state) => ({
        featureFlags: state.featureFlags.map((f) =>
          f.name === name ? { ...f, enabled } : f,
        ),
      })),

    setError: (error) => set({ error, isLoading: false }),

    clearError: () => set({ error: null }),

    reset: () => set({ ...initialState }),

    hasPermission: (permission) =>
      get().userPermissions.some((p) => p.name === permission),

    hasRole: (role) => get().userRoles.includes(role),

    canAction: (action) =>
      get().userPermissions.some((p) => p.name === action),

    isFeatureEnabled: (feature) =>
      get().featureFlags.some((f) => f.name === feature && f.enabled),
  })
)

// Feature mapping by plan (preserved from original)
export const FEATURE_BY_PLAN: Record<string, Record<string, boolean>> = {
  free: {
    dashboard: true,
    basic_analytics: true,
    api_access: false,
    custom_branding: false,
    team_collaboration: false,
    sso: false,
    advanced_analytics: false,
    webhooks: false,
  },
  pro: {
    dashboard: true,
    basic_analytics: true,
    api_access: true,
    custom_branding: true,
    team_collaboration: true,
    sso: false,
    advanced_analytics: true,
    webhooks: true,
  },
  enterprise: {
    dashboard: true,
    basic_analytics: true,
    api_access: true,
    custom_branding: true,
    team_collaboration: true,
    sso: true,
    advanced_analytics: true,
    webhooks: true,
  },
}

export const PLAN_LIMITS: Record<string, Record<string, number>> = {
  free: {
    max_users: 3,
    max_storage_gb: 1,
    max_api_calls_per_month: 10000,
    max_projects: 5,
  },
  pro: {
    max_users: 20,
    max_storage_gb: 100,
    max_api_calls_per_month: 1000000,
    max_projects: 50,
  },
  enterprise: {
    max_users: Infinity,
    max_storage_gb: Infinity,
    max_api_calls_per_month: Infinity,
    max_projects: Infinity,
  },
}
