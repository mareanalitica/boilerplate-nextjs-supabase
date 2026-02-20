/**
 * Services Index
 * Central export for all services and composition root
 */

// Base
export { BaseService, ValidationResult, ValidationError } from './base-service'

// Services
export { UserService } from './user-service'
export { OrganizationService } from './organization-service'
export { BillingService, PLAN_CONFIG } from './billing-service'
export { OnboardingService, ONBOARDING_STEPS, REQUIRED_STEPS } from './onboarding-service'
export type { OnboardingStep } from './onboarding-service'
export { PermissionsService, FEATURE_FLAGS, DEFAULT_ROLES } from './permissions-service'
export type { RoleConfig, FeatureFlag } from './permissions-service'

// Composition Root
export {
  ServiceContainer,
  Logger,
  Cache,
  getUserService,
  getOrganizationService,
  getBillingService,
  getOnboardingService,
  getPermissionsService,
} from './composition-root'
