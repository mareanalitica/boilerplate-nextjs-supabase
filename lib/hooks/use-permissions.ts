/**
 * usePermissions Hook
 * Provides RBAC state and permission checking methods
 * Usage: const { hasPermission, canAction, isFeatureEnabled } = usePermissions()
 */

'use client'

import { useCallback } from 'react'
import { usePermissionsContext } from '../state/context/permissions-context'
import { Permission } from '../state/types/permissions-state'

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
  const context = usePermissionsContext()

  const clearError = useCallback(() => {
    context.dispatch({ type: 'CLEAR_ERROR' })
  }, [context])

  return {
    userPermissions: context.state.user_permissions,
    userRoles: context.state.user_roles,
    orgPermissions: context.state.org_permissions,
    isLoading: context.state.is_loading,
    error: context.state.error || null,
    hasPermission: context.hasPermission,
    hasRole: context.hasRole,
    canAction: context.canAction,
    isFeatureEnabled: context.isFeatureEnabled,
    clearError,
  }
}
