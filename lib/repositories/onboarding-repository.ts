/**
 * Onboarding Repository
 * Operações de dados para rastreamento de onboarding
 */

import { BaseRepository } from './base-repository'

export interface OnboardingStateRecord {
  id: string
  user_id: string
  current_step: string
  completed_steps: string[]
  status: string
  organization_id?: string
  plan_selected?: string
  metadata: Record<string, any>
  started_at: string
  completed_at?: string
  expires_at: string
  created_at: string
  updated_at: string
}

export class OnboardingRepository extends BaseRepository<OnboardingStateRecord> {
  protected tableName = 'public.onboarding_state'

  /**
   * Encontrar por user_id
   */
  async findByUserId(userId: string): Promise<OnboardingStateRecord | null> {
    try {
      const { data, error } = await this.getQuery()
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.message.includes('No rows')) {
        return null
      }

      if (error) throw error
      return data as OnboardingStateRecord | null
    } catch (error) {
      if (error instanceof Error && error.message.includes('No rows')) {
        return null
      }
      throw error
    }
  }

  /**
   * Criar novo onboarding state
   */
  async createForUser(userId: string, organizationId?: string): Promise<OnboardingStateRecord> {
    try {
      const { data, error } = await this.getQuery()
        .insert([
          {
            user_id: userId,
            current_step: 'verify_email',
            completed_steps: [],
            status: 'not_started',
            organization_id: organizationId,
            metadata: {},
            started_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data as OnboardingStateRecord
    } catch (error) {
      throw error
    }
  }

  /**
   * Atualizar step atual
   */
  async updateCurrentStep(userId: string, step: string): Promise<OnboardingStateRecord> {
    try {
      const { data, error } = await this.getQuery()
        .update({ current_step: step })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data as OnboardingStateRecord
    } catch (error) {
      throw error
    }
  }

  /**
   * Marcar step como completo
   */
  async markStepCompleted(userId: string, step: string): Promise<OnboardingStateRecord> {
    try {
      // Buscar estado atual
      const current = await this.findByUserId(userId)
      if (!current) throw new Error('Onboarding state not found')

      const completedSteps = [...new Set([...current.completed_steps, step])]

      const { data, error } = await this.getQuery()
        .update({
          completed_steps: completedSteps,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data as OnboardingStateRecord
    } catch (error) {
      throw error
    }
  }

  /**
   * Completar onboarding
   */
  async complete(userId: string): Promise<OnboardingStateRecord> {
    try {
      const { data, error } = await this.getQuery()
        .update({
          status: 'completed',
          current_step: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data as OnboardingStateRecord
    } catch (error) {
      throw error
    }
  }

  /**
   * Atualizar metadata
   */
  async updateMetadata(
    userId: string,
    metadata: Record<string, any>
  ): Promise<OnboardingStateRecord> {
    try {
      const current = await this.findByUserId(userId)
      if (!current) throw new Error('Onboarding state not found')

      const newMetadata = { ...current.metadata, ...metadata }

      const { data, error } = await this.getQuery()
        .update({
          metadata: newMetadata,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data as OnboardingStateRecord
    } catch (error) {
      throw error
    }
  }

  /**
   * Obter progresso (número de steps completados)
   */
  async getProgress(userId: string): Promise<number> {
    try {
      const state = await this.findByUserId(userId)
      return state?.completed_steps?.length || 0
    } catch (error) {
      throw error
    }
  }

  /**
   * Verificar se onboarding expirou
   */
  async isExpired(userId: string): Promise<boolean> {
    try {
      const state = await this.findByUserId(userId)
      if (!state) return false

      return new Date(state.expires_at) < new Date()
    } catch (error) {
      throw error
    }
  }
}
