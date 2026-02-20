# Services Usage Guide - Fase 2

Complete guide for using the services created in Phase 2 of the SaaS Minimal implementation.

## Quick Start

### Import Services

```typescript
import {
  getUserService,
  getOrganizationService,
  getBillingService,
  getOnboardingService,
  getPermissionsService,
} from '@/lib/services'
```

Or use the ServiceContainer directly:

```typescript
import { ServiceContainer } from '@/lib/services'

const container = ServiceContainer.getInstance()
const userService = container.getUserService()
```

## User Service

Manages user operations like profile management, email verification, etc.

### Create User

```typescript
const userService = getUserService()

try {
  const newUser = await userService.createUser({
    email: 'user@example.com',
    full_name: 'John Doe',
    avatar_url: 'https://example.com/avatar.jpg',
  })
  console.log('User created:', newUser)
} catch (error) {
  console.error('Failed to create user:', error)
}
```

### Get User Profile

```typescript
const userService = getUserService()

// Get basic profile (cached)
const profile = await userService.getUserProfile(userId)

// Get full profile with roles
const fullProfile = await userService.getFullProfile(userId)
```

### Update Profile

```typescript
const userService = getUserService()

const updated = await userService.updateProfile(userId, {
  full_name: 'Jane Doe',
  avatar_url: 'https://example.com/new-avatar.jpg',
})
```

### Find by Email

```typescript
const userService = getUserService()

const user = await userService.findByEmail('user@example.com')
const exists = await userService.emailExists('user@example.com')
```

## Organization Service

Manages multi-tenant organizations and member management.

### Create Organization

```typescript
const orgService = getOrganizationService()

const newOrg = await orgService.createOrganization({
  name: 'My Company',
  plan: 'free',
  logo_url: 'https://example.com/logo.png',
})
```

### Get User Organizations

```typescript
const orgService = getOrganizationService()

// Get organizations where user is owner or member
const organizations = await orgService.getUserOrganizations(userId)

// Get only organizations owned by user
const owned = await orgService.getByOwnerId(userId)

// Get organizations where user is member
const memberOf = await orgService.getByMemberId(userId)
```

### Manage Members

```typescript
const orgService = getOrganizationService()

// Add member
await orgService.addMember(orgId, userId, 'member')

// Update member role
await orgService.updateMemberRole(orgId, userId, 'admin')

// Remove member
await orgService.removeMember(orgId, userId)

// List all members
const members = await orgService.listMembers(orgId)

// Count members
const count = await orgService.countMembers(orgId)
```

### Check Permissions

```typescript
const orgService = getOrganizationService()

const isOwner = await orgService.isOwner(orgId, userId)
const isMember = await orgService.isMember(orgId, userId)
const userRole = await orgService.getUserRole(orgId, userId) // 'admin', 'member', 'viewer'
```

## Billing Service

Manages subscriptions, invoices, and usage tracking.

### Plan Configuration

```typescript
import { PLAN_CONFIG } from '@/lib/services'

const proConfig = PLAN_CONFIG.pro
// {
//   price: 29,
//   billingCycle: 'monthly',
//   limits: { users: 5, storage: 100, monthlyRequests: 100000 },
//   features: ['basic_dashboard', 'advanced_analytics', 'api_access'],
// }
```

### Get Subscription

```typescript
const billingService = getBillingService()

const subscription = await billingService.getSubscription(orgId)
// {
//   id: '...',
//   organization_id: orgId,
//   plan: 'pro',
//   status: 'active',
//   billing_cycle: 'monthly',
//   ...
// }
```

### Upgrade/Downgrade Plan

```typescript
const billingService = getBillingService()

// Upgrade plan
const upgraded = await billingService.upgradePlan(
  orgId,
  'pro',
  'pm_1234567890' // Payment method ID
)

// Downgrade plan (allowed)
const downgraded = await billingService.downgradePlan(orgId, 'free')

// Cancel subscription
const cancelled = await billingService.cancelSubscription(orgId)
```

### Track Usage

```typescript
const billingService = getBillingService()

// Log usage of a feature
await billingService.logUsage(orgId, 'api_calls', 5)

// Get monthly usage
const usage = await billingService.getMonthlyUsage(orgId, 'api_calls')
// Returns number of API calls used this month

// Check if feature is available for plan
const hasAdvancedAnalytics = await billingService.isFeatureAvailable(
  orgId,
  'advanced_analytics'
)

// Check if within usage limits
const withinLimit = await billingService.checkUsageLimit(
  orgId,
  'api_calls',
  100000
)
```

### Manage Invoices

```typescript
const billingService = getBillingService()

// Get all invoices
const invoices = await billingService.getInvoices(orgId)

// Mark as paid
await billingService.markInvoiceAsPaid(invoiceId, 'ch_1234567890')

// Count pending invoices
const pending = await billingService.countPendingInvoices(orgId)
```

## Onboarding Service

Manages user onboarding flow with 6 steps.

### Onboarding Steps

1. `verify_email` - Required
2. `create_profile` - Required
3. `create_organization` - Required
4. `select_plan` - Required
5. `configure_basics` - Optional
6. `tutorial` - Optional

### Initialize Onboarding

```typescript
const onboardingService = getOnboardingService()

const state = await onboardingService.initializeOnboarding(userId, organizationId)
```

### Complete Steps

```typescript
const onboardingService = getOnboardingService()

// Mark step as complete
await onboardingService.completeStep(userId, 'verify_email')

// Skip optional step
await onboardingService.skipStep(userId, 'tutorial')

// Get current step
const currentStep = await onboardingService.getCurrentStep(userId)

// Get completed steps
const completed = await onboardingService.getCompletedSteps(userId)

// Get progress percentage
const progress = await onboardingService.getProgress(userId) // 0-100
```

### Complete Onboarding

```typescript
const onboardingService = getOnboardingService()

// Mark onboarding as complete after all steps
await onboardingService.completeOnboarding(userId)

// Check if completed
const isCompleted = await onboardingService.isCompleted(userId)

// Check if expired (30 days default)
const isExpired = await onboardingService.isExpired(userId)
```

### Update Metadata

```typescript
const onboardingService = getOnboardingService()

await onboardingService.updateMetadata(userId, {
  selectedPlan: 'pro',
  organizationName: 'My Company',
  industry: 'SaaS',
})
```

## Permissions Service

Manages RBAC (Role-Based Access Control) and feature flags.

### Roles

- `admin` - Full access to organization
- `member` - Standard member access
- `viewer` - Read-only access

### Check Permissions

```typescript
const permissionsService = getPermissionsService()

// Check if role has permission
const canWrite = permissionsService.hasPermission('admin', 'org:write')

// Check specific actions
const canManageMembers = permissionsService.canManageMembers('admin')
const canManageBilling = permissionsService.canManageBilling('admin')
const canManageOrg = permissionsService.canManageOrganization('admin')

// Generic resource check
const canReadOrg = permissionsService.canRead('member', 'org')
const canWriteOrg = permissionsService.canWrite('admin', 'org')
const canDeleteOrg = permissionsService.canDelete('admin', 'org')
```

### Feature Flags

```typescript
const permissionsService = getPermissionsService()

// Check if feature is enabled for plan
const hasAdvancedAnalytics = permissionsService.isFeatureEnabled('pro', 'advanced_analytics')
const hasSSO = permissionsService.isFeatureEnabled('enterprise', 'sso')

// Get all features for plan
const proFeatures = permissionsService.getFeatureFlags('pro')
```

### Role Helpers

```typescript
const permissionsService = getPermissionsService()

// Check role type
permissionsService.isAdmin('admin') // true
permissionsService.isMember('member') // true
permissionsService.isViewer('viewer') // true

// Get all roles
const allRoles = permissionsService.getAllRoles()

// Get role permissions
const adminPerms = permissionsService.getRolePermissions('admin')
```

## In React Components

### Using with Hooks

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getUserService, getOrganizationService } from '@/lib/services'

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userService = getUserService()

    userService.getUserProfile(userId).then((profile) => {
      setUser(profile)
      setLoading(false)
    })
  }, [userId])

  if (loading) return <div>Loading...</div>
  return <div>{user?.full_name}</div>
}
```

### Integration with useAuth Hook

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks'
import { getOrganizationService } from '@/lib/services'

export function Organizations() {
  const { userId } = useAuth()
  const [orgs, setOrgs] = useState([])

  useEffect(() => {
    if (!userId) return

    const orgService = getOrganizationService()
    orgService.getUserOrganizations(userId).then(setOrgs)
  }, [userId])

  return (
    <ul>
      {orgs.map((org) => (
        <li key={org.id}>{org.name}</li>
      ))}
    </ul>
  )
}
```

## Error Handling

```typescript
import { ValidationError } from '@/lib/services'

try {
  const user = await userService.createUser({
    email: 'invalid-email',
  })
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation errors:', error.errors)
    // { email: 'Invalid email format' }
  } else {
    console.error('Unexpected error:', error)
  }
}
```

## Caching

Services automatically cache results for performance:

```typescript
const userService = getUserService()

// First call hits database
const user1 = await userService.getUserProfile(userId)

// Second call uses cache (1 hour TTL)
const user2 = await userService.getUserProfile(userId)
```

To clear cache:

```typescript
import { ServiceContainer } from '@/lib/services'

ServiceContainer.getInstance().clearCache()
```

## Next Steps (Fase 3)

The services are now ready to be used in:

1. Onboarding flow components
2. Organization management pages
3. Billing/subscription management
4. User profile pages
5. Permission-based UI rendering

See `IMPLEMENTATION_LOG.md` for Phase 3 next steps.
