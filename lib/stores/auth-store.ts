/**
 * Auth Store (Zustand)
 * Manages authentication state for the entire application
 */

import { create } from 'zustand'

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

export interface AuthUser {
  id: string
  email: string
  email_verified: boolean
  created_at: string
  last_sign_in_at?: string
  user_metadata?: Record<string, unknown>
  // Profile fields (populated from profile table)
  full_name?: string
  avatar_url?: string
}

interface AuthState {
  user: AuthUser | null
  userId: string | null
  email: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  roles: Role[]
  claims: JWTClaims | null
}

interface AuthActions {
  setUser: (user: AuthUser) => void
  setAuthenticated: (value: boolean) => void
  setLoading: (value: boolean) => void
  setClaims: (claims: JWTClaims) => void
  setRoles: (roles: Role[]) => void
  setError: (error: string) => void
  clearError: () => void
  logout: () => void
  reset: () => void
}

const initialState: AuthState = {
  user: null,
  userId: null,
  email: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  roles: [],
  claims: null,
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...initialState,

  setUser: (user) =>
    set({
      user,
      userId: user.id,
      email: user.email,
      isLoading: false,
    }),

  setAuthenticated: (isAuthenticated) =>
    set({ isAuthenticated, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  setClaims: (claims) => set({ claims }),

  setRoles: (roles) => set({ roles }),

  setError: (error) => set({ error, isLoading: false }),

  clearError: () => set({ error: null }),

  logout: () =>
    set({
      user: null,
      userId: null,
      email: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      roles: [],
      claims: null,
    }),

  reset: () => set({ ...initialState, isLoading: false }),
}))
