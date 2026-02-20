/**
 * Permissions Reducer
 * Manages RBAC and feature flags state transitions
 */

import {
  PermissionsState,
  PermissionsAction,
  initialPermissionsState,
} from '../types/permissions-state'

export function permissionsReducer(
  state: PermissionsState,
  action: PermissionsAction
): PermissionsState {
  const now = Date.now()

  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        is_loading: action.payload ?? true,
        last_updated: now,
      }

    case 'SET_USER_PERMISSIONS':
      return {
        ...state,
        user_permissions: action.payload ?? [],
        last_updated: now,
      }

    case 'SET_USER_ROLES':
      return {
        ...state,
        user_roles: action.payload ?? [],
        last_updated: now,
      }

    case 'SET_ORG_PERMISSIONS':
      return {
        ...state,
        org_permissions: action.payload ?? [],
        last_updated: now,
      }

    case 'SET_FEATURE_FLAGS':
      return {
        ...state,
        feature_flags: action.payload ?? [],
        is_loading: false,
        last_updated: now,
      }

    case 'UPDATE_FEATURE_FLAG': {
      const { name, enabled } = action.payload
      return {
        ...state,
        feature_flags: state.feature_flags.map((flag) =>
          flag.name === name ? { ...flag, enabled } : flag
        ),
        last_updated: now,
      }
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
      return initialPermissionsState

    default:
      return state
  }
}
