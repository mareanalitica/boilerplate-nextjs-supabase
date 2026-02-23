/**
 * useAuth Hook
 * Provides authentication state and methods
 * Usage: const { user, isAuthenticated, logout } = useAuth()
 */

'use client'

import { useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuthStore, AuthUser } from '@/lib/stores/auth-store'

export interface UseAuthReturn {
  // State
  user: AuthUser | null
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
  const store = useAuthStore()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const supabase = createBrowserClient(supabaseUrl, supabaseKey)

  const logout = useCallback(async () => {
    try {
      store.setLoading(true)
      await supabase.auth.signOut()
      store.logout()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed'
      store.setError(message)
    }
  }, [supabase, store])

  return {
    user: store.user,
    userId: store.userId,
    email: store.email,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    logout,
    clearError: store.clearError,
  }
}
