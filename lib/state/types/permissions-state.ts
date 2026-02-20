/**
 * Permissions State Type Definitions
 * Defines interfaces for RBAC and feature flags context
 */

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

export interface PermissionsState {
  // User's global permissions
  user_permissions: Permission[]
  user_roles: string[]

  // Organization-specific permissions
  org_permissions: Permission[]

  // Feature flags
  feature_flags: FeatureFlag[]

  // Status
  is_loading: boolean
  error?: string | null

  // Metadata
  last_updated?: number
}

export interface PermissionsContextType {
  state: PermissionsState
  dispatch: React.Dispatch<PermissionsAction>
  // Helper methods
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  canAction: (action: string) => boolean
  isFeatureEnabled: (feature: string) => boolean
}

// Action types
export type PermissionsActionType =
  | 'SET_LOADING'
  | 'SET_USER_PERMISSIONS'
  | 'SET_USER_ROLES'
  | 'SET_ORG_PERMISSIONS'
  | 'SET_FEATURE_FLAGS'
  | 'UPDATE_FEATURE_FLAG'
  | 'SET_ERROR'
  | 'CLEAR_ERROR'
  | 'RESET'

export interface PermissionsAction {
  type: PermissionsActionType
  payload?: any
}

// Initial state
export const initialPermissionsState: PermissionsState = {
  user_permissions: [],
  user_roles: [],
  org_permissions: [],
  feature_flags: [],
  is_loading: false,
  error: null,
  last_updated: undefined,
}

// Feature mapping by plan
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

// Plan limits
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
