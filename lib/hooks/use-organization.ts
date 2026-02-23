/**
 * useOrganization Hook
 * Provides organization state and helpers
 * Usage: const { currentOrg, organizations, setCurrentOrg } = useOrganization()
 */

'use client'

import { useCallback } from 'react'
import {
  useOrganizationStore,
  Organization,
  MemberRole,
} from '@/lib/stores/organization-store'

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
  const store = useOrganizationStore()

  const canModifyOrg = useCallback(
    (): boolean => store.currentRole === 'admin',
    [store.currentRole],
  )

  const canInviteMembers = useCallback(
    (): boolean => store.currentRole === 'admin',
    [store.currentRole],
  )

  const canDeleteOrg = useCallback(
    (): boolean => store.currentRole === 'admin',
    [store.currentRole],
  )

  const isAdmin = useCallback(
    (): boolean => store.currentRole === 'admin',
    [store.currentRole],
  )

  const setCurrentOrganization = useCallback(
    (orgId: string) => {
      const org = store.organizationsList.find((o) => o.id === orgId)
      if (org) {
        store.setCurrentOrganization(org)
      }
    },
    [store],
  )

  return {
    currentOrganizationId: store.currentOrganizationId,
    currentOrganization: store.currentOrganization,
    currentRole: store.currentRole,
    currentPlan: store.currentPlan,
    organizationsList: store.organizationsList,
    isLoading: store.isLoading,
    error: store.error,
    canModifyOrg,
    canInviteMembers,
    canDeleteOrg,
    isAdmin,
    setCurrentOrganization,
    clearError: store.clearError,
  }
}
