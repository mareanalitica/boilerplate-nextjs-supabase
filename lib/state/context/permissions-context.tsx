/**
 * Permissions Context Provider
 * Manages RBAC and feature flags
 */

'use client'

import React, { createContext, useReducer } from 'react'
import {
  PermissionsState,
  PermissionsContextType,
  initialPermissionsState,
  FEATURE_BY_PLAN,
} from '../types/permissions-state'
import { permissionsReducer } from '../reducers/permissions-reducer'

export const PermissionsContext = createContext<
  PermissionsContextType | undefined
>(undefined)

interface PermissionsProviderProps {
  children: React.ReactNode
}

export function PermissionsProvider({ children }: PermissionsProviderProps) {
  const [state, dispatch] = useReducer(
    permissionsReducer,
    initialPermissionsState
  )

  // Helper methods
  const hasPermission = (permission: string): boolean => {
    return state.user_permissions.some((p) => p.name === permission)
  }

  const hasRole = (role: string): boolean => {
    return state.user_roles.includes(role)
  }

  const canAction = (action: string): boolean => {
    return state.user_permissions.some((p) => p.name === action)
  }

  const isFeatureEnabled = (feature: string): boolean => {
    return state.feature_flags.some((f) => f.name === feature && f.enabled)
  }

  const value: PermissionsContextType = {
    state,
    dispatch,
    hasPermission,
    hasRole,
    canAction,
    isFeatureEnabled,
  }

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  )
}

/**
 * Hook to use Permissions Context
 */
export function usePermissionsContext(): PermissionsContextType {
  const context = React.useContext(PermissionsContext)
  if (context === undefined) {
    throw new Error('usePermissionsContext must be used inside PermissionsProvider')
  }
  return context
}
