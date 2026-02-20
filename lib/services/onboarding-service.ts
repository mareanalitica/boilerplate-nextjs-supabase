/**
 * Onboarding Service
 * Gerencia o fluxo de onboarding dos usuários
 */

import { BaseService } from './base-service'
import {
  OnboardingRepository,
  OnboardingStateRecord,
} from '../repositories/onboarding-repository'

export type OnboardingStep =
  | 'verify_email'
  | 'create_profile'
  | 'create_organization'
  | 'select_plan'
  | 'configure_basics'
  | 'tutorial'

export const ONBOARDING_STEPS: OnboardingStep[] = [
  'verify_email',
  'create_profile',
  'create_organization',
  'select_plan',
  'configure_basics',
  'tutorial',
]

export const REQUIRED_STEPS: OnboardingStep[] = [
  'verify_email',
  'create_profile',
  'create_organization',
  'select_plan',
]

export class OnboardingService extends BaseService<OnboardingStateRecord> {
  private repository: OnboardingRepository

  constructor(
    repository: OnboardingRepository,
    logger?: any,
    cache?: any
  ) {
    super(repository, logger, cache)
    this.repository = repository
  }

  /**
   * Obter estado de onboarding do usuário
   */
  async getOnboardingState(userId: string): Promise<OnboardingStateRecord | null> {
    return this.withCache(`onboarding:${userId}`, () =>
      this.repository.findByUserId(userId)
    )
  }

  /**
   * Iniciar onboarding para novo usuário
   */
  async initializeOnboarding(userId: string, organizationId?: string): Promise<OnboardingStateRecord> {
    try {
      this.log('initializeOnboarding', { userId, organizationId })

      // Verificar se já existe
      const existing = await this.getOnboardingState(userId)
      if (existing) {
        return existing
      }

      // Criar novo
      const state = await this.repository.createForUser(userId, organizationId)

      this.invalidateCache()
      return state
    } catch (error) {
      this.handleError('initializeOnboarding', error)
      throw error
    }
  }

  /**
   * Marcar step como completo
   */
  async completeStep(userId: string, step: OnboardingStep): Promise<OnboardingStateRecord> {
    try {
      this.log('completeStep', { userId, step })

      // Validar step
      if (!ONBOARDING_STEPS.includes(step)) {
        throw new Error(`Invalid step: ${step}`)
      }

      const state = await this.repository.markStepCompleted(userId, step)

      // Obter próximo step
      const nextStep = this.getNextStep(state.completed_steps as OnboardingStep[])
      if (nextStep) {
        await this.repository.updateCurrentStep(userId, nextStep)
      }

      this.invalidateCache()
      return state
    } catch (error) {
      this.handleError('completeStep', error)
      throw error
    }
  }

  /**
   * Pular step (se permitido)
   */
  async skipStep(userId: string, step: OnboardingStep): Promise<OnboardingStateRecord> {
    try {
      this.log('skipStep', { userId, step })

      // Validar se pode pular
      if (REQUIRED_STEPS.includes(step)) {
        throw new Error(`Cannot skip required step: ${step}`)
      }

      // Marcar como completo mesmo assim
      return this.completeStep(userId, step)
    } catch (error) {
      this.handleError('skipStep', error)
      throw error
    }
  }

  /**
   * Completar onboarding
   */
  async completeOnboarding(userId: string): Promise<OnboardingStateRecord> {
    try {
      this.log('completeOnboarding', { userId })

      const state = await this.repository.complete(userId)

      this.invalidateCache()
      return state
    } catch (error) {
      this.handleError('completeOnboarding', error)
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
      this.log('updateMetadata', { userId, metadata })

      const state = await this.repository.updateMetadata(userId, metadata)

      this.invalidateCache()
      return state
    } catch (error) {
      this.handleError('updateMetadata', error)
      throw error
    }
  }

  /**
   * Obter progresso
   */
  async getProgress(userId: string): Promise<number> {
    try {
      const progress = await this.repository.getProgress(userId)
      return Math.round((progress / ONBOARDING_STEPS.length) * 100)
    } catch (error) {
      this.handleError('getProgress', error)
      return 0
    }
  }

  /**
   * Verificar se onboarding está completo
   */
  async isCompleted(userId: string): Promise<boolean> {
    try {
      const state = await this.getOnboardingState(userId)
      if (!state) return false

      return state.status === 'completed'
    } catch (error) {
      this.handleError('isCompleted', error)
      return false
    }
  }

  /**
   * Verificar se onboarding expirou
   */
  async isExpired(userId: string): Promise<boolean> {
    return this.repository.isExpired(userId)
  }

  /**
   * Obter step atual
   */
  async getCurrentStep(userId: string): Promise<OnboardingStep | null> {
    try {
      const state = await this.getOnboardingState(userId)
      if (!state) return null

      return state.current_step as OnboardingStep
    } catch (error) {
      this.handleError('getCurrentStep', error)
      return null
    }
  }

  /**
   * Obter próximo step
   */
  getNextStep(completedSteps: OnboardingStep[] = []): OnboardingStep | null {
    for (const step of ONBOARDING_STEPS) {
      if (!completedSteps.includes(step)) {
        return step
      }
    }
    return null
  }

  /**
   * Obter passos completados
   */
  async getCompletedSteps(userId: string): Promise<OnboardingStep[]> {
    try {
      const state = await this.getOnboardingState(userId)
      if (!state) return []

      return state.completed_steps as OnboardingStep[]
    } catch (error) {
      this.handleError('getCompletedSteps', error)
      return []
    }
  }

  /**
   * Pode pular step
   */
  canSkipStep(step: OnboardingStep): boolean {
    return !REQUIRED_STEPS.includes(step)
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
