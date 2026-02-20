/**
 * Hooks Index
 * Central export for all custom hooks
 */

// Auth
export { useAuth } from './use-auth'
export type { UseAuthReturn } from './use-auth'

// Organization
export { useOrganization } from './use-organization'
export type { UseOrganizationReturn } from './use-organization'

// Permissions
export { usePermissions } from './use-permissions'
export type { UsePermissionsReturn } from './use-permissions'

// Preferences
export { usePreferences } from './use-preferences'
export type { UsePreferencesReturn } from './use-preferences'

// Onboarding
export { useOnboarding } from './use-onboarding'
export type { UseOnboardingReturn } from './use-onboarding'
export { useOnboardingRedirect } from './use-onboarding-redirect'
