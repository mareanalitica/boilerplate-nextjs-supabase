/**
 * App Provider
 * Combines all context providers in the correct order
 * Must wrap the entire application
 */

'use client'

import React from 'react'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from './auth-context'
import { OrganizationProvider } from './organization-context'
import { PermissionsProvider } from './permissions-context'
import { PreferencesProvider } from './preferences-context'
import { OnboardingProvider } from './onboarding-context'

interface AppProviderProps {
  children: React.ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <OnboardingProvider>
          <OrganizationProvider>
            <PermissionsProvider>
              <PreferencesProvider>
                {children}
              </PreferencesProvider>
            </PermissionsProvider>
          </OrganizationProvider>
        </OnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
