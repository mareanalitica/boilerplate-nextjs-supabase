/**
 * Organization Store (Zustand)
 * Manages multi-tenant organization state
 */

import { create } from 'zustand'

export type Plan = 'free' | 'pro' | 'enterprise'
export type MemberRole = 'admin' | 'member' | 'viewer'
export type InviteStatus = 'pending' | 'accepted' | 'expired'

export interface Organization {
  id: string
  owner_id: string
  name: string
  logo_url?: string
  plan: Plan
  created_at: string
  updated_at: string
}

export interface OrganizationMember {
  organization_id: string
  user_id: string
  name?: string
  email: string
  avatar_url?: string
  role: MemberRole
  permissions?: string[]
  joined_at: string
}

export interface OrganizationInvite {
  id: string
  organization_id: string
  email: string
  role: MemberRole
  token: string
  expires_at: string
  created_at: string
  accepted_at?: string
}

export interface OrganizationSettings {
  organization_id: string
  branding_color?: string
  timezone: string
  language: string
  notification_settings: {
    email_notifications: boolean
    push_notifications: boolean
    daily_digest: boolean
  }
  created_at: string
  updated_at: string
}

interface OrganizationState {
  currentOrganizationId: string | null
  currentOrganization: Organization | null
  currentRole: MemberRole | null
  currentPlan: Plan | null
  currentSettings: OrganizationSettings | null
  organizationsList: Organization[]
  members: OrganizationMember[]
  pendingInvites: OrganizationInvite[]
  isLoading: boolean
  error: string | null
}

interface OrganizationActions {
  setLoading: (value: boolean) => void
  setCurrentOrganization: (org: Organization, role?: MemberRole) => void
  setOrganizationsList: (orgs: Organization[]) => void
  addOrganization: (org: Organization) => void
  updateOrganization: (org: Organization) => void
  setMembers: (members: OrganizationMember[]) => void
  addMember: (member: OrganizationMember) => void
  removeMember: (userId: string) => void
  updateMemberRole: (userId: string, role: MemberRole) => void
  setPendingInvites: (invites: OrganizationInvite[]) => void
  addInvite: (invite: OrganizationInvite) => void
  removeInvite: (inviteId: string) => void
  setSettings: (settings: OrganizationSettings) => void
  setError: (error: string) => void
  clearError: () => void
  reset: () => void
}

const initialState: OrganizationState = {
  currentOrganizationId: null,
  currentOrganization: null,
  currentRole: null,
  currentPlan: null,
  currentSettings: null,
  organizationsList: [],
  members: [],
  pendingInvites: [],
  isLoading: false,
  error: null,
}

export const useOrganizationStore = create<
  OrganizationState & OrganizationActions
>((set, get) => ({
  ...initialState,

  setLoading: (isLoading) => set({ isLoading }),

  setCurrentOrganization: (org, role) =>
    set({
      currentOrganization: org,
      currentOrganizationId: org.id,
      currentPlan: org.plan,
      ...(role !== undefined ? { currentRole: role } : {}),
    }),

  setOrganizationsList: (organizationsList) => set({ organizationsList }),

  addOrganization: (org) =>
    set((state) => ({
      organizationsList: [...state.organizationsList, org],
    })),

  updateOrganization: (org) =>
    set((state) => ({
      organizationsList: state.organizationsList.map((o) =>
        o.id === org.id ? org : o,
      ),
      currentOrganization:
        state.currentOrganization?.id === org.id
          ? org
          : state.currentOrganization,
    })),

  setMembers: (members) => set({ members }),

  addMember: (member) =>
    set((state) => ({ members: [...state.members, member] })),

  removeMember: (userId) =>
    set((state) => ({
      members: state.members.filter((m) => m.user_id !== userId),
    })),

  updateMemberRole: (userId, role) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.user_id === userId ? { ...m, role } : m,
      ),
    })),

  setPendingInvites: (pendingInvites) => set({ pendingInvites }),

  addInvite: (invite) =>
    set((state) => ({
      pendingInvites: [...state.pendingInvites, invite],
    })),

  removeInvite: (inviteId) =>
    set((state) => ({
      pendingInvites: state.pendingInvites.filter((i) => i.id !== inviteId),
    })),

  setSettings: (currentSettings) => set({ currentSettings }),

  setError: (error) => set({ error, isLoading: false }),

  clearError: () => set({ error: null }),

  reset: () => set({ ...initialState }),
}))
