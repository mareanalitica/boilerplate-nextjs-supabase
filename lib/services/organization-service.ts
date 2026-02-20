/**
 * Organization Service
 * Gerencia operações de organização (multi-tenant)
 */

import { BaseService, ValidationResult, ValidationError } from './base-service'
import { OrganizationRepository } from '../repositories/organization-repository'
import { Organization } from '../state/types/organization-state'
import { OrganizationValidator } from '../validators/organization-validator'

export class OrganizationService extends BaseService<Organization> {
  private orgRepository: OrganizationRepository
  private validator: OrganizationValidator

  constructor(
    orgRepository: OrganizationRepository,
    logger?: any,
    cache?: any
  ) {
    super(orgRepository, logger, cache)
    this.orgRepository = orgRepository
    this.validator = new OrganizationValidator()
  }

  /**
   * Criar nova organização
   */
  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    // Validar dados
    const validation = this.validate(data)
    if (!validation.isValid) {
      throw new ValidationError('Invalid organization data', validation.errors)
    }

    return this.create(data)
  }

  /**
   * Obter organizações do proprietário
   */
  async getByOwnerId(ownerId: string): Promise<Organization[]> {
    return this.withCache(`owner:${ownerId}`, () =>
      this.orgRepository.findByOwnerId(ownerId)
    )
  }

  /**
   * Obter organizações onde usuário é membro
   */
  async getByMemberId(userId: string): Promise<Organization[]> {
    return this.withCache(`member:${userId}`, () =>
      this.orgRepository.findByMemberId(userId)
    )
  }

  /**
   * Obter organizações do usuário (proprietário + membro)
   */
  async getUserOrganizations(userId: string): Promise<Organization[]> {
    try {
      this.log('getUserOrganizations', { userId })

      const [owned, memberOf] = await Promise.all([
        this.getByOwnerId(userId),
        this.getByMemberId(userId),
      ])

      // Combinar e remover duplicatas
      const orgMap = new Map<string, Organization>()
      ;[...owned, ...memberOf].forEach((org) => {
        orgMap.set(org.id, org)
      })

      return Array.from(orgMap.values())
    } catch (error) {
      this.handleError('getUserOrganizations', error)
      throw error
    }
  }

  /**
   * Atualizar organização
   */
  async updateOrganization(orgId: string, data: Partial<Organization>): Promise<Organization> {
    this.validator.validateUpdate()
    return this.update(orgId, data)
  }

  /**
   * Deletar organização
   */
  async deleteOrganization(orgId: string): Promise<void> {
    await this.delete(orgId)
  }

  /**
   * Verificar se usuário é proprietário
   */
  async isOwner(orgId: string, userId: string): Promise<boolean> {
    return this.orgRepository.isOwner(orgId, userId)
  }

  /**
   * Verificar se usuário é membro
   */
  async isMember(orgId: string, userId: string): Promise<boolean> {
    return this.orgRepository.isMember(orgId, userId)
  }

  /**
   * Obter role do usuário na organização
   */
  async getUserRole(orgId: string, userId: string): Promise<string | null> {
    return this.orgRepository.getUserRole(orgId, userId)
  }

  /**
   * Adicionar membro à organização
   */
  async addMember(
    orgId: string,
    userId: string,
    role: 'admin' | 'member' | 'viewer' = 'member'
  ): Promise<void> {
    try {
      this.log('addMember', { orgId, userId, role })

      // Verificar se já é membro
      const isMember = await this.orgRepository.isMember(orgId, userId)
      if (isMember) {
        throw new Error('User is already a member of this organization')
      }

      // Adicionar membro via Supabase
      const { error } = await this.orgRepository['getQuery']()
        .from('public.organization_members')
        .insert([
          {
            organization_id: orgId,
            user_id: userId,
            role,
          },
        ])

      if (error) throw error

      this.invalidateCache()
    } catch (error) {
      this.handleError('addMember', error)
      throw error
    }
  }

  /**
   * Remover membro da organização
   */
  async removeMember(orgId: string, userId: string): Promise<void> {
    try {
      this.log('removeMember', { orgId, userId })

      const { error } = await this.orgRepository['getQuery']()
        .from('public.organization_members')
        .delete()
        .eq('organization_id', orgId)
        .eq('user_id', userId)

      if (error) throw error

      this.invalidateCache()
    } catch (error) {
      this.handleError('removeMember', error)
      throw error
    }
  }

  /**
   * Atualizar role do membro
   */
  async updateMemberRole(
    orgId: string,
    userId: string,
    newRole: 'admin' | 'member' | 'viewer'
  ): Promise<void> {
    try {
      this.log('updateMemberRole', { orgId, userId, newRole })

      const { error } = await this.orgRepository['getQuery']()
        .from('public.organization_members')
        .update({ role: newRole })
        .eq('organization_id', orgId)
        .eq('user_id', userId)

      if (error) throw error

      this.invalidateCache()
    } catch (error) {
      this.handleError('updateMemberRole', error)
      throw error
    }
  }

  /**
   * Contar membros
   */
  async countMembers(orgId: string): Promise<number> {
    return this.withCache(`members:count:${orgId}`, () =>
      this.orgRepository.countMembers(orgId)
    )
  }

  /**
   * Listar membros
   */
  async listMembers(orgId: string): Promise<any[]> {
    return this.withCache(`members:list:${orgId}`, () =>
      this.orgRepository.listMembers(orgId)
    )
  }

  /**
   * Validar dados da organização
   */
  validate(data: Partial<Organization>): ValidationResult {
    const errors: Record<string, string> = {}

    // Validar nome
    if (data.name) {
      if (data.name.length < 2 || data.name.length > 255) {
        errors.name = 'Organization name must be between 2 and 255 characters'
      }
    }

    // Validar plano
    if (data.plan) {
      if (!['free', 'pro', 'enterprise'].includes(data.plan)) {
        errors.plan = 'Invalid plan'
      }
    }

    // Validar logo URL
    if (data.logo_url) {
      if (!this.isValidUrl(data.logo_url)) {
        errors.logo_url = 'Invalid logo URL'
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  /**
   * Helper validations
   */

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}
