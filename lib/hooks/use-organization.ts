/**
 * useOrganization Hook
 * Provides organization state and helpers
 * Usage: const { currentOrg, organizations, setCurrentOrg } = useOrganization()
 */

'use client'

import { useCallback } from 'react'
import { useOrganizationContext } from '../state/context/organization-context'
import { Organization, MemberRole } from '../state/types/organization-state'

export interface UseOrganizationReturn {
  // State
  currentOrganizationId: string | null
  currentOrganization: Organization | null
  currentRole: MemberRole | null
  currentPlan: string | null
  organizationsList: Organization[]
  isLoading: boolean
  error: string | null

  // Helpers
  canModifyOrg: () => boolean
  canInviteMembers: () => boolean
  canDeleteOrg: () => boolean
  isAdmin: () => boolean

  // Methods
  setCurrentOrganization: (orgId: string) => void
  clearError: () => void
}

export function useOrganization(): UseOrganizationReturn {
  const { state, dispatch } = useOrganizationContext()

  const canModifyOrg = useCallback((): boolean => {
    return state.current_role === 'admin'
  }, [state.current_role])

  const canInviteMembers = useCallback((): boolean => {
    return state.current_role === 'admin'
  }, [state.current_role])

  const canDeleteOrg = useCallback((): boolean => {
    return state.current_role === 'admin'
  }, [state.current_role])

  const isAdmin = useCallback((): boolean => {
    return state.current_role === 'admin'
  }, [state.current_role])

  const setCurrentOrganization = useCallback(
    (orgId: string) => {
      const org = state.organizations_list.find((o) => o.id === orgId)
      if (org) {
        dispatch({
          type: 'SET_CURRENT_ORGANIZATION',
          payload: org,
        })
      }
    },
    [state.organizations_list, dispatch]
  )

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [dispatch])

  return {
    currentOrganizationId: state.current_organization_id,
    currentOrganization: state.current_organization,
    currentRole: state.current_role,
    currentPlan: state.current_plan,
    organizationsList: state.organizations_list,
    isLoading: state.is_loading,
    error: state.error || null,
    canModifyOrg,
    canInviteMembers,
    canDeleteOrg,
    isAdmin,
    setCurrentOrganization,
    clearError,
  }
}
