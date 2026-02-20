/**
 * Auth State Type Definitions
 * Defines interfaces for authentication context and related types
 */

export interface JWTClaims {
  sub: string
  email: string
  email_verified: boolean
  aud: string
  iat: number
  exp: number
  iss: string
}

export interface Role {
  id: string
  name: string
  description: string
}

export interface User {
  id: string
  email: string
  email_verified: boolean
  created_at: string
  last_sign_in_at?: string
  user_metadata?: Record<string, any>
}

export interface AuthState {
  // Core auth data
  user: User | null
  user_id: string | null
  email: string | null

  // Status
  is_authenticated: boolean
  is_loading: boolean
  error?: string | null

  // Roles and permissions (basic)
  roles: Role[]
  claims?: JWTClaims | null

  // Metadata
  last_updated?: number
}

export interface AuthContextType {
  state: AuthState
  dispatch: React.Dispatch<AuthAction>
}

// Action types
export type AuthActionType =
  | 'SET_LOADING'
  | 'SET_USER'
  | 'SET_AUTHENTICATED'
  | 'SET_ROLES'
  | 'SET_CLAIMS'
  | 'SET_ERROR'
  | 'CLEAR_ERROR'
  | 'LOGOUT'
  | 'RESET'

export interface AuthAction {
  type: AuthActionType
  payload?: any
}

// Initial state
export const initialAuthState: AuthState = {
  user: null,
  user_id: null,
  email: null,
  is_authenticated: false,
  is_loading: true,
  error: null,
  roles: [],
  claims: null,
  last_updated: undefined,
}
