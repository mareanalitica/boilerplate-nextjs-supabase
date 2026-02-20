/**
 * Organization Reducer
 * Manages multi-tenant organization state transitions
 */

import {
  OrganizationState,
  OrganizationAction,
  initialOrganizationState,
  Organization,
} from '../types/organization-state'

export function organizationReducer(
  state: OrganizationState,
  action: OrganizationAction
): OrganizationState {
  const now = Date.now()

  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        is_loading: action.payload ?? true,
        last_updated: now,
      }

    case 'SET_CURRENT_ORGANIZATION': {
      const org: Organization = action.payload
      if (!org) {
        return state
      }
      return {
        ...state,
        current_organization_id: org.id,
        current_organization: org,
        current_plan: org.plan,
        is_loading: false,
        last_updated: now,
      }
    }

    case 'SET_ORGANIZATIONS_LIST': {
      const organizations: Organization[] = action.payload ?? []
      return {
        ...state,
        organizations_list: organizations,
        last_updated: now,
      }
    }

    case 'SET_MEMBERS':
      return {
        ...state,
        members: action.payload ?? [],
        last_updated: now,
      }

    case 'SET_PENDING_INVITES':
      return {
        ...state,
        pending_invites: action.payload ?? [],
        last_updated: now,
      }

    case 'ADD_ORGANIZATION': {
      const org: Organization = action.payload
      if (!org) {
        return state
      }
      return {
        ...state,
        organizations_list: [...state.organizations_list, org],
        last_updated: now,
      }
    }

    case 'UPDATE_ORGANIZATION': {
      const updatedOrg: Organization = action.payload
      if (!updatedOrg) {
        return state
      }

      const updated = {
        ...state,
        organizations_list: state.organizations_list.map((org) =>
          org.id === updatedOrg.id ? updatedOrg : org
        ),
      }

      if (
        state.current_organization_id === updatedOrg.id
      ) {
        updated.current_organization = updatedOrg
        updated.current_plan = updatedOrg.plan
      }

      return {
        ...updated,
        last_updated: now,
      }
    }

    case 'ADD_MEMBER':
      return {
        ...state,
        members: [...state.members, action.payload],
        last_updated: now,
      }

    case 'REMOVE_MEMBER':
      return {
        ...state,
        members: state.members.filter((m) => m.user_id !== action.payload),
        last_updated: now,
      }

    case 'UPDATE_MEMBER_ROLE': {
      const { user_id, role } = action.payload
      return {
        ...state,
        members: state.members.map((m) =>
          m.user_id === user_id ? { ...m, role } : m
        ),
        last_updated: now,
      }
    }

    case 'ADD_INVITE':
      return {
        ...state,
        pending_invites: [...state.pending_invites, action.payload],
        last_updated: now,
      }

    case 'REMOVE_INVITE':
      return {
        ...state,
        pending_invites: state.pending_invites.filter(
          (i) => i.id !== action.payload
        ),
        last_updated: now,
      }

    case 'SET_SETTINGS':
      return {
        ...state,
        current_settings: action.payload,
        last_updated: now,
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        is_loading: false,
        last_updated: now,
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
        last_updated: now,
      }

    case 'RESET':
      return initialOrganizationState

    default:
      return state
  }
}
