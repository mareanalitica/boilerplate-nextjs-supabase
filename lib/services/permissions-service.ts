/**
 * Permissions Service
 * Gerencia permissões, roles e feature flags (RBAC)
 */

import { BaseService } from './base-service'
import { BaseRepository } from '../repositories/base-repository'

export interface RoleConfig {
  id: string
  name: string
  description: string
  permissions: string[]
}

export interface FeatureFlag {
  name: string
  enabled: boolean
  plan?: 'free' | 'pro' | 'enterprise'
}

/**
 * Feature flags por plano
 */
export const FEATURE_FLAGS: Record<string, FeatureFlag[]> = {
  free: [
    { name: 'basic_dashboard', enabled: true },
    { name: 'advanced_analytics', enabled: false },
    { name: 'api_access', enabled: false },
    { name: 'sso', enabled: false },
    { name: 'custom_branding', enabled: false },
  ],
  pro: [
    { name: 'basic_dashboard', enabled: true },
    { name: 'advanced_analytics', enabled: true },
    { name: 'api_access', enabled: true },
    { name: 'sso', enabled: false },
    { name: 'custom_branding', enabled: false },
  ],
  enterprise: [
    { name: 'basic_dashboard', enabled: true },
    { name: 'advanced_analytics', enabled: true },
    { name: 'api_access', enabled: true },
    { name: 'sso', enabled: true },
    { name: 'custom_branding', enabled: true },
  ],
}

/**
 * Default roles com suas permissões
 */
export const DEFAULT_ROLES: RoleConfig[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to organization',
    permissions: [
      'org:read',
      'org:write',
      'org:delete',
      'members:read',
      'members:write',
      'members:delete',
      'billing:read',
      'billing:write',
      'settings:read',
      'settings:write',
    ],
  },
  {
    id: 'member',
    name: 'Member',
    description: 'Standard member access',
    permissions: [
      'org:read',
      'members:read',
      'billing:read',
      'settings:read',
    ],
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    permissions: [
      'org:read',
      'members:read',
      'billing:read',
      'settings:read',
    ],
  },
]

export class PermissionsService extends BaseService<any> {
  constructor(
    repository: BaseRepository<any>,
    logger?: any,
    cache?: any
  ) {
    super(repository, logger, cache)
  }

  /**
   * Obter permissões de um role
   */
  getRolePermissions(role: string): string[] {
    const roleConfig = DEFAULT_ROLES.find((r) => r.id === role)
    return roleConfig?.permissions || []
  }

  /**
   * Verificar se role tem permissão
   */
  hasPermission(role: string, permission: string): boolean {
    const permissions = this.getRolePermissions(role)
    return permissions.includes(permission)
  }

  /**
   * Obter feature flags para plano
   */
  getFeatureFlags(plan: 'free' | 'pro' | 'enterprise'): FeatureFlag[] {
    return FEATURE_FLAGS[plan] || FEATURE_FLAGS.free
  }

  /**
   * Verificar se feature está ativa
   */
  isFeatureEnabled(plan: 'free' | 'pro' | 'enterprise', feature: string): boolean {
    const flags = this.getFeatureFlags(plan)
    const flag = flags.find((f) => f.name === feature)
    return flag?.enabled || false
  }

  /**
   * Obter todas as permissões disponíveis
   */
  getAllPermissions(): string[] {
    const allPermissions = new Set<string>()
    DEFAULT_ROLES.forEach((role) => {
      role.permissions.forEach((perm) => {
        allPermissions.add(perm)
      })
    })
    return Array.from(allPermissions).sort()
  }

  /**
   * Obter todos os roles disponíveis
   */
  getAllRoles(): RoleConfig[] {
    return DEFAULT_ROLES
  }

  /**
   * Verificar se role é admin
   */
  isAdmin(role: string): boolean {
    return role === 'admin'
  }

  /**
   * Verificar se role é viewer
   */
  isViewer(role: string): boolean {
    return role === 'viewer'
  }

  /**
   * Verificar se role é member
   */
  isMember(role: string): boolean {
    return role === 'member'
  }

  /**
   * Pode gerenciar membros
   */
  canManageMembers(role: string): boolean {
    return this.hasPermission(role, 'members:write')
  }

  /**
   * Pode gerenciar billing
   */
  canManageBilling(role: string): boolean {
    return this.hasPermission(role, 'billing:write')
  }

  /**
   * Pode gerenciar organização
   */
  canManageOrganization(role: string): boolean {
    return this.hasPermission(role, 'org:write')
  }

  /**
   * Pode ler dados
   */
  canRead(role: string, resource: string): boolean {
    return this.hasPermission(role, `${resource}:read`)
  }

  /**
   * Pode escrever dados
   */
  canWrite(role: string, resource: string): boolean {
    return this.hasPermission(role, `${resource}:write`)
  }

  /**
   * Pode deletar dados
   */
  canDelete(role: string, resource: string): boolean {
    return this.hasPermission(role, `${resource}:delete`)
  }

  /**
   * Validar dados
   */
  validate(): any {
    return {
      isValid: true,
      errors: {},
    }
  }
}
