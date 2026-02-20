/**
 * Organization State Type Definitions
 * Defines interfaces for multi-tenant organization context
 */

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

export interface OrganizationState {
  // Current organization
  current_organization_id: string | null
  current_organization: Organization | null
  current_role: MemberRole | null
  current_plan: Plan | null
  current_settings: OrganizationSettings | null

  // Organizations list
  organizations_list: Organization[]

  // Members
  members: OrganizationMember[]
  pending_invites: OrganizationInvite[]

  // Status
  is_loading: boolean
  error?: string | null

  // Metadata
  last_updated?: number
}

export interface OrganizationContextType {
  state: OrganizationState
  dispatch: React.Dispatch<OrganizationAction>
}

// Action types
export type OrganizationActionType =
  | 'SET_LOADING'
  | 'SET_CURRENT_ORGANIZATION'
  | 'SET_ORGANIZATIONS_LIST'
  | 'SET_MEMBERS'
  | 'SET_PENDING_INVITES'
  | 'ADD_ORGANIZATION'
  | 'UPDATE_ORGANIZATION'
  | 'ADD_MEMBER'
  | 'REMOVE_MEMBER'
  | 'UPDATE_MEMBER_ROLE'
  | 'ADD_INVITE'
  | 'REMOVE_INVITE'
  | 'SET_SETTINGS'
  | 'SET_ERROR'
  | 'CLEAR_ERROR'
  | 'RESET'

export interface OrganizationAction {
  type: OrganizationActionType
  payload?: any
}

// Initial state
export const initialOrganizationState: OrganizationState = {
  current_organization_id: null,
  current_organization: null,
  current_role: null,
  current_plan: null,
  current_settings: null,
  organizations_list: [],
  members: [],
  pending_invites: [],
  is_loading: false,
  error: null,
  last_updated: undefined,
}
