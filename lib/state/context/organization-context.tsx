/**
 * Organization Context Provider
 * Manages multi-tenant organization state
 */

'use client'

import React, { createContext, useReducer } from 'react'
import {
  OrganizationState,
  OrganizationContextType,
  initialOrganizationState,
} from '../types/organization-state'
import { organizationReducer } from '../reducers/organization-reducer'

export const OrganizationContext = createContext<
  OrganizationContextType | undefined
>(undefined)

interface OrganizationProviderProps {
  children: React.ReactNode
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const [state, dispatch] = useReducer(
    organizationReducer,
    initialOrganizationState
  )

  const value: OrganizationContextType = {
    state,
    dispatch,
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

/**
 * Hook to use Organization Context
 */
export function useOrganizationContext(): OrganizationContextType {
  const context = React.useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganizationContext must be used inside OrganizationProvider')
  }
  return context
}
