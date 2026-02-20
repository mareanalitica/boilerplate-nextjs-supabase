/**
 * useAuth Hook
 * Provides authentication state and methods
 * Usage: const { user, isAuthenticated, logout } = useAuth()
 */

'use client'

import { useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuthContext } from '../state/context/auth-context'
import { AuthState, User } from '../state/types/auth-state'

export interface UseAuthReturn {
  // State
  user: User | null
  userId: string | null
  email: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Methods
  logout: () => Promise<void>
  clearError: () => void
}

export function useAuth(): UseAuthReturn {
  const { state, dispatch } = useAuthContext()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const supabase = createBrowserClient(supabaseUrl, supabaseKey)

  const logout = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      await supabase.auth.signOut()
      dispatch({ type: 'LOGOUT' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed'
      dispatch({ type: 'SET_ERROR', payload: message })
    }
  }, [supabase, dispatch])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [dispatch])

  return {
    user: state.user,
    userId: state.user_id,
    email: state.email,
    isAuthenticated: state.is_authenticated,
    isLoading: state.is_loading,
    error: state.error || null,
    logout,
    clearError,
  }
}
