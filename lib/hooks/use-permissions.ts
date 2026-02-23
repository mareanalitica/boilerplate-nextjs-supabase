/**
 * usePermissions Hook
 * Provides RBAC state and permission checking methods
 * Usage: const { hasPermission, canAction, isFeatureEnabled } = usePermissions()
 */

'use client'

import {
  usePermissionsStore,
  Permission,
} from '@/lib/stores/permissions-store'

export interface UsePermissionsReturn {
  // State
  userPermissions: Permission[]
  userRoles: string[]
  orgPermissions: Permission[]
  isLoading: boolean
  error: string | null

  // Methods
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  canAction: (action: string) => boolean
  isFeatureEnabled: (feature: string) => boolean
  clearError: () => void
}

export function usePermissions(): UsePermissionsReturn {
  const store = usePermissionsStore()

  return {
    userPermissions: store.userPermissions,
    userRoles: store.userRoles,
    orgPermissions: store.orgPermissions,
    isLoading: store.isLoading,
    error: store.error,
    hasPermission: store.hasPermission,
    hasRole: store.hasRole,
    canAction: store.canAction,
    isFeatureEnabled: store.isFeatureEnabled,
    clearError: store.clearError,
  }
}
