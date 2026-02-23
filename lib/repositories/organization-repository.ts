/**
 * Organization Repository
 * Operações de dados para organizações (multi-tenant)
 */

import { BaseRepository } from './base-repository'
import type { Organization } from '../stores/organization-store'

export interface OrganizationWithMembers extends Organization {
  membersCount?: number
  ownerEmail?: string
}

export class OrganizationRepository extends BaseRepository<Organization> {
  protected tableName = 'public.organizations'

  /**
   * Encontrar organizações por proprietário
   */
  async findByOwnerId(ownerId: string): Promise<Organization[]> {
    try {
      const { data, error } = await this.getQuery()
        .select('*')
        .eq('owner_id', ownerId)

      if (error) throw error
      return (data as Organization[]) || []
    } catch (error) {
      throw error
    }
  }

  /**
   * Encontrar organizações de um usuário (como membro)
   */
  async findByMemberId(userId: string): Promise<Organization[]> {
    try {
      const { data, error } = await this.supabase
        .from('public.organizations')
        .select('organizations(*)')
        .from('public.organization_members')
        .eq('user_id', userId)

      if (error) throw error

      return (data?.map((m: any) => m.organizations) || []).filter(Boolean)
    } catch (error) {
      throw error
    }
  }

  /**
   * Obter organização com informações de membros
   */
  async getWithMembers(orgId: string): Promise<OrganizationWithMembers | null> {
    try {
      const org = await this.find(orgId)
      if (!org) return null

      const { count, error: countError } = await this.supabase
        .from('public.organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)

      if (countError) throw countError

      return {
        ...org,
        membersCount: count || 0,
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Verificar se usuário é proprietário
   */
  async isOwner(orgId: string, userId: string): Promise<boolean> {
    try {
      const org = await this.find(orgId)
      return org?.owner_id === userId
    } catch (error) {
      throw error
    }
  }

  /**
   * Verificar se usuário é membro
   */
  async isMember(orgId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('public.organization_members')
        .select('id')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .single()

      if (error && error.message.includes('No rows')) {
        return false
      }

      if (error) throw error
      return !!data
    } catch (error) {
      if (error instanceof Error && error.message.includes('No rows')) {
        return false
      }
      throw error
    }
  }

  /**
   * Obter role do usuário na organização
   */
  async getUserRole(orgId: string, userId: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('public.organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .single()

      if (error && error.message.includes('No rows')) {
        return null
      }

      if (error) throw error
      return data?.role || null
    } catch (error) {
      if (error instanceof Error && error.message.includes('No rows')) {
        return null
      }
      throw error
    }
  }

  /**
   * Contar membros
   */
  async countMembers(orgId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('public.organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)

      if (error) throw error
      return count || 0
    } catch (error) {
      throw error
    }
  }

  /**
   * Listar membros da organização
   */
  async listMembers(orgId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('public.organization_members')
        .select('*, user:user_id(id, email, full_name)')
        .eq('organization_id', orgId)

      if (error) throw error
      return data || []
    } catch (error) {
      throw error
    }
  }
}
