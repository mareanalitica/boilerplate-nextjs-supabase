/**
 * Billing Service
 * Gerencia subscrições, invoices e uso
 */

import { BaseService, ValidationError } from './base-service'
import {
  SubscriptionRepository,
  InvoiceRepository,
  UsageLogRepository,
  Subscription,
  Invoice,
} from '../repositories/billing-repository'
import { BillingValidator } from '../validators/billing-validator'

/**
 * Plan pricing and limits
 */
export const PLAN_CONFIG = {
  free: {
    price: 0,
    billingCycle: null,
    limits: {
      users: 1,
      storage: 1, // GB
      monthlyRequests: 10000,
    },
    features: ['basic_dashboard'],
  },
  pro: {
    price: 29,
    billingCycle: 'monthly',
    limits: {
      users: 5,
      storage: 100, // GB
      monthlyRequests: 100000,
    },
    features: ['basic_dashboard', 'advanced_analytics', 'api_access'],
  },
  enterprise: {
    price: null,
    billingCycle: 'custom',
    limits: {
      users: null,
      storage: null,
      monthlyRequests: null,
    },
    features: ['basic_dashboard', 'advanced_analytics', 'api_access', 'sso', 'custom_branding'],
  },
}

export class BillingService extends BaseService<Subscription> {
  private subscriptionRepository: SubscriptionRepository
  private invoiceRepository: InvoiceRepository
  private usageLogRepository: UsageLogRepository
  private validator: BillingValidator

  constructor(
    subscriptionRepository: SubscriptionRepository,
    invoiceRepository: InvoiceRepository,
    usageLogRepository: UsageLogRepository,
    logger?: any,
    cache?: any
  ) {
    super(subscriptionRepository, logger, cache)
    this.subscriptionRepository = subscriptionRepository
    this.invoiceRepository = invoiceRepository
    this.usageLogRepository = usageLogRepository
    this.validator = new BillingValidator()
  }

  /**
   * Obter subscription da organização
   */
  async getSubscription(orgId: string): Promise<Subscription | null> {
    return this.withCache(`subscription:${orgId}`, () =>
      this.subscriptionRepository.findByOrganizationId(orgId)
    )
  }

  /**
   * Fazer upgrade de plano
   */
  async upgradePlan(
    orgId: string,
    newPlan: 'free' | 'pro' | 'enterprise',
    paymentMethodId?: string
  ): Promise<Subscription> {
    try {
      this.log('upgradePlan', { orgId, newPlan })

      // Obter subscription atual
      const current = await this.getSubscription(orgId)
      if (!current) {
        throw new Error('Subscription not found')
      }

      // Validar upgrade
      if (!this.validator.validateUpgrade(current.plan, newPlan)) {
        throw new ValidationError('Invalid upgrade', {
          plan: 'Cannot downgrade plan',
        })
      }

      // Validar payment method se necessário
      if (!this.validator.validatePaymentMethod(newPlan, paymentMethodId)) {
        throw new ValidationError('Invalid payment method', {
          paymentMethodId: 'Payment method required for pro/enterprise plans',
        })
      }

      // Atualizar subscription
      const updated = await this.subscriptionRepository.updatePlan(orgId, newPlan)

      // Atualizar payment method se fornecido
      if (paymentMethodId) {
        await this.subscriptionRepository.update(current.id, {
          payment_method_id: paymentMethodId,
        } as any)
      }

      this.invalidateCache()
      return updated
    } catch (error) {
      this.handleError('upgradePlan', error)
      throw error
    }
  }

  /**
   * Fazer downgrade de plano
   */
  async downgradePlan(orgId: string, newPlan: 'free' | 'pro' | 'enterprise'): Promise<Subscription> {
    try {
      this.log('downgradePlan', { orgId, newPlan })

      const current = await this.getSubscription(orgId)
      if (!current) {
        throw new Error('Subscription not found')
      }

      // Permitir downgrade
      const updated = await this.subscriptionRepository.updatePlan(orgId, newPlan)

      this.invalidateCache()
      return updated
    } catch (error) {
      this.handleError('downgradePlan', error)
      throw error
    }
  }

  /**
   * Cancelar subscription
   */
  async cancelSubscription(orgId: string): Promise<Subscription> {
    try {
      this.log('cancelSubscription', { orgId })

      const cancelled = await this.subscriptionRepository.cancel(orgId)

      this.invalidateCache()
      return cancelled
    } catch (error) {
      this.handleError('cancelSubscription', error)
      throw error
    }
  }

  /**
   * Obter invoices da organização
   */
  async getInvoices(orgId: string): Promise<Invoice[]> {
    return this.withCache(`invoices:${orgId}`, () =>
      this.invoiceRepository.findByOrganizationId(orgId)
    )
  }

  /**
   * Marcar invoice como paga
   */
  async markInvoiceAsPaid(invoiceId: string, paymentId: string): Promise<Invoice> {
    try {
      this.log('markInvoiceAsPaid', { invoiceId, paymentId })

      const invoice = await this.invoiceRepository.markAsPaid(invoiceId, paymentId)

      this.invalidateCache()
      return invoice
    } catch (error) {
      this.handleError('markInvoiceAsPaid', error)
      throw error
    }
  }

  /**
   * Obter uso de feature neste mês
   */
  async getMonthlyUsage(orgId: string, feature: string): Promise<number> {
    return this.withCache(`usage:${orgId}:${feature}`, () =>
      this.usageLogRepository.getMonthlyUsage(orgId, feature),
      3600 // 1 hora
    )
  }

  /**
   * Registrar uso de feature
   */
  async logUsage(orgId: string, feature: string, amount: number = 1): Promise<void> {
    try {
      this.log('logUsage', { orgId, feature, amount })

      await this.usageLogRepository.logUsage(orgId, feature, amount)

      this.invalidateCache()
    } catch (error) {
      this.handleError('logUsage', error)
      throw error
    }
  }

  /**
   * Verificar se feature está disponível
   */
  async isFeatureAvailable(orgId: string, feature: string): Promise<boolean> {
    try {
      this.log('isFeatureAvailable', { orgId, feature })

      const subscription = await this.getSubscription(orgId)
      if (!subscription) return false

      const planConfig = PLAN_CONFIG[subscription.plan as keyof typeof PLAN_CONFIG]
      return planConfig.features.includes(feature)
    } catch (error) {
      this.handleError('isFeatureAvailable', error)
      return false
    }
  }

  /**
   * Obter limites do plano
   */
  getPlanLimits(plan: 'free' | 'pro' | 'enterprise'): any {
    return PLAN_CONFIG[plan].limits
  }

  /**
   * Obter features do plano
   */
  getPlanFeatures(plan: 'free' | 'pro' | 'enterprise'): string[] {
    return PLAN_CONFIG[plan].features
  }

  /**
   * Obter preço do plano
   */
  getPlanPrice(plan: 'free' | 'pro' | 'enterprise'): number | null {
    return PLAN_CONFIG[plan].price
  }

  /**
   * Contar invoices pendentes
   */
  async countPendingInvoices(orgId: string): Promise<number> {
    return this.invoiceRepository.countPending(orgId)
  }

  /**
   * Verificar se está dentro dos limites
   */
  async checkUsageLimit(orgId: string, feature: string, limit: number): Promise<boolean> {
    try {
      const usage = await this.getMonthlyUsage(orgId, feature)
      return usage < limit
    } catch (error) {
      this.handleError('checkUsageLimit', error)
      return false
    }
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
