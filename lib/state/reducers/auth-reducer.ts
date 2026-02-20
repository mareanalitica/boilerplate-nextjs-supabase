/**
 * Auth Reducer
 * Manages authentication state transitions
 */

import {
  AuthState,
  AuthAction,
  initialAuthState,
  User,
  Role,
  JWTClaims,
} from '../types/auth-state'

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  const now = Date.now()

  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        is_loading: action.payload ?? true,
        last_updated: now,
      }

    case 'SET_USER': {
      const user: User = action.payload
      return {
        ...state,
        user,
        user_id: user.id,
        email: user.email,
        is_loading: false,
        last_updated: now,
      }
    }

    case 'SET_AUTHENTICATED':
      return {
        ...state,
        is_authenticated: action.payload ?? true,
        is_loading: false,
        last_updated: now,
      }

    case 'SET_ROLES': {
      const roles: Role[] = action.payload ?? []
      return {
        ...state,
        roles,
        last_updated: now,
      }
    }

    case 'SET_CLAIMS': {
      const claims: JWTClaims = action.payload
      return {
        ...state,
        claims,
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

    case 'LOGOUT':
      return {
        ...initialAuthState,
        is_loading: false,
        last_updated: now,
      }

    case 'RESET':
      return initialAuthState

    default:
      return state
  }
}
