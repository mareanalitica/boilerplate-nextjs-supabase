/**
 * Auth Context Provider
 * Manages authentication state for the entire application
 */

'use client'

import React, { createContext, useReducer, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import {
  AuthState,
  AuthContextType,
  initialAuthState,
} from '../types/auth-state'
import { authReducer } from '../reducers/auth-reducer'

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState)

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const supabase = createBrowserClient(supabaseUrl, supabaseKey)

  // Initialize auth on mount
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true })

    // Check for existing session
    const initAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (session) {
          // User is authenticated
          dispatch({
            type: 'SET_USER',
            payload: {
              id: session.user.id,
              email: session.user.email,
              email_verified: session.user.email_confirmed_at !== null,
              created_at: session.user.created_at,
              last_sign_in_at: session.user.last_sign_in_at,
              user_metadata: session.user.user_metadata,
            },
          })

          dispatch({ type: 'SET_AUTHENTICATED', payload: true })

          // Extract claims from JWT
          const claims = JSON.parse(
            atob(session.access_token.split('.')[1])
          )
          dispatch({ type: 'SET_CLAIMS', payload: claims })
        } else {
          // User is not authenticated
          dispatch({ type: 'SET_AUTHENTICATED', payload: false })
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Auth error',
        })
      }
    }

    initAuth()

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        dispatch({
          type: 'SET_USER',
          payload: {
            id: session.user.id,
            email: session.user.email,
            email_verified: session.user.email_confirmed_at !== null,
            created_at: session.user.created_at,
            last_sign_in_at: session.user.last_sign_in_at,
            user_metadata: session.user.user_metadata,
          },
        })
        dispatch({ type: 'SET_AUTHENTICATED', payload: true })

        const claims = JSON.parse(
          atob(session.access_token.split('.')[1])
        )
        dispatch({ type: 'SET_CLAIMS', payload: claims })
      } else {
        dispatch({ type: 'SET_AUTHENTICATED', payload: false })
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase])

  const value: AuthContextType = {
    state,
    dispatch,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use Auth Context
 * Must be used inside AuthProvider
 */
export function useAuthContext(): AuthContextType {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used inside AuthProvider')
  }
  return context
}
