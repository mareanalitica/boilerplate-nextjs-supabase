/**
 * App Provider
 * Initializes global Zustand stores and wraps the app with ThemeProvider
 */

'use client'

import React, { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { createBrowserClient } from '@supabase/ssr'
import { useAuthStore, AuthUser, JWTClaims } from '@/lib/stores/auth-store'
import { useOrganizationStore } from '@/lib/stores/organization-store'
import { getOrganizationService } from '@/lib/services'

function StoreInitializer() {
  const { setUser, setAuthenticated, setLoading, setClaims, logout, userId } =
    useAuthStore()
  const {
    setOrganizationsList,
    setCurrentOrganization,
    setLoading: setOrgLoading,
  } = useOrganizationStore()

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabaseKey) return

    const supabase = createBrowserClient(supabaseUrl, supabaseKey)

    setLoading(true)

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setAuthenticated(false)
        return
      }

      if (session) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email ?? '',
          email_verified: session.user.email_confirmed_at !== null,
          created_at: session.user.created_at,
          last_sign_in_at: session.user.last_sign_in_at,
          user_metadata: session.user.user_metadata,
          full_name: session.user.user_metadata?.full_name as string | undefined,
        }
        setUser(user)
        setAuthenticated(true)

        try {
          const claims = JSON.parse(
            atob(session.access_token.split('.')[1]),
          ) as JWTClaims
          setClaims(claims)
        } catch {
          // Ignore JWT parse errors
        }
      } else {
        setAuthenticated(false)
      }
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email ?? '',
          email_verified: session.user.email_confirmed_at !== null,
          created_at: session.user.created_at,
          last_sign_in_at: session.user.last_sign_in_at,
          user_metadata: session.user.user_metadata,
          full_name: session.user.user_metadata?.full_name as string | undefined,
        }
        setUser(user)
        setAuthenticated(true)

        try {
          const claims = JSON.parse(
            atob(session.access_token.split('.')[1]),
          ) as JWTClaims
          setClaims(claims)
        } catch {
          // Ignore JWT parse errors
        }
      } else {
        logout()
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [setUser, setAuthenticated, setLoading, setClaims, logout])

  // Load user organizations when authenticated
  useEffect(() => {
    if (!userId) return

    const loadOrganizations = async () => {
      try {
        setOrgLoading(true)
        const orgService = getOrganizationService()
        const orgs = await orgService.getUserOrganizations(userId)

        setOrganizationsList(orgs)

        // Set first organization as current with appropriate role
        if (orgs.length > 0) {
          const firstOrg = orgs[0]
          // User is admin if they're the owner
          const role = firstOrg.owner_id === userId ? 'admin' : 'member'
          setCurrentOrganization(firstOrg, role)
        }
      } catch (error) {
        console.error('Failed to load organizations:', error)
      } finally {
        setOrgLoading(false)
      }
    }

    loadOrganizations()
  }, [userId, setOrganizationsList, setCurrentOrganization, setOrgLoading])

  return null
}

interface AppProviderProps {
  children: React.ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <StoreInitializer />
      {children}
    </ThemeProvider>
  )
}
