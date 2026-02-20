/**
 * User Repository
 * Operações de dados para usuários
 */

import { BaseRepository } from './base-repository'
import { User } from '../state/types/auth-state'

export class UserRepository extends BaseRepository<User> {
  protected tableName = 'auth.users'

  /**
   * Encontrar usuário por email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        if (error.message.includes('No rows')) return null
        throw error
      }
      return data as User | null
    } catch (error) {
      if (error instanceof Error && error.message.includes('No rows')) {
        return null
      }
      throw error
    }
  }

  /**
   * Buscar usuários por role
   */
  async findByRole(role: string): Promise<User[]> {
    try {
      const { data, error } = await this.getQuery()
        .select('*')
        .eq('role', role)

      if (error) throw error
      return (data as User[]) || []
    } catch (error) {
      throw error
    }
  }

  /**
   * Obter perfil completo do usuário com roles e permissões
   */
  async getFullProfile(userId: string): Promise<User | null> {
    try {
      const user = await this.find(userId)
      if (!user) return null

      // Get roles
      const { data: roles, error: rolesError } = await this.supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', userId)

      if (rolesError) throw rolesError

      return {
        ...user,
        // @ts-ignore - adding roles property
        roles: roles?.map((r: any) => r.roles?.name).filter(Boolean) || [],
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Verificar se email existe
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('id')
        .eq('email', email)
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
}
