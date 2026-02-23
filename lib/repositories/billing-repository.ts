/**
 * Billing Repository
 * Operações de dados para billing e subscrições
 */

import { BaseRepository } from './base-repository'

export interface Subscription {
  id: string
  organization_id: string
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'canceled' | 'expired' | 'past_due'
  billing_cycle: 'monthly' | 'annual'
  payment_method_id?: string
  current_period_start: string
  current_period_end: string
  canceled_at?: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  subscription_id: string
  organization_id: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  issued_at: string
  due_at: string
  paid_at?: string
  payment_id?: string
  created_at: string
  updated_at: string
}

export interface UsageLog {
  id: string
  organization_id: string
  feature: string
  amount: number
  period: string
  created_at: string
}

export class SubscriptionRepository extends BaseRepository<Subscription> {
  protected tableName = 'public.subscriptions'

  /**
   * Encontrar subscription por organization_id
   */
  async findByOrganizationId(orgId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await this.getQuery()
        .select('*')
        .eq('organization_id', orgId)
        .single()

      if (error && error.message.includes('No rows')) {
        return null
      }

      if (error) throw error
      return data as Subscription | null
    } catch (error) {
      if (error instanceof Error && error.message.includes('No rows')) {
        return null
      }
      throw error
    }
  }

  /**
   * Atualizar plano
   */
  async updatePlan(
    orgId: string,
    newPlan: 'free' | 'pro' | 'enterprise'
  ): Promise<Subscription> {
    try {
      const { data, error } = await this.getQuery()
        .update({ plan: newPlan, updated_at: new Date().toISOString() })
        .eq('organization_id', orgId)
        .select()
        .single()

      if (error) throw error
      return data as Subscription
    } catch (error) {
      throw error
    }
  }

  /**
   * Cancelar subscription
   */
  async cancel(orgId: string): Promise<Subscription> {
    try {
      const { data, error } = await this.getQuery()
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('organization_id', orgId)
        .select()
        .single()

      if (error) throw error
      return data as Subscription
    } catch (error) {
      throw error
    }
  }

  /**
   * Obter subscriptions ativas
   */
  async findActive(): Promise<Subscription[]> {
    try {
      const { data, error } = await this.getQuery()
        .select('*')
        .eq('status', 'active')

      if (error) throw error
      return (data as Subscription[]) || []
    } catch (error) {
      throw error
    }
  }
}

export class InvoiceRepository extends BaseRepository<Invoice> {
  protected tableName = 'public.invoices'

  /**
   * Encontrar invoices por subscription
   */
  async findBySubscriptionId(subscriptionId: string): Promise<Invoice[]> {
    try {
      const { data, error } = await this.getQuery()
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('issued_at', { ascending: false })

      if (error) throw error
      return (data as Invoice[]) || []
    } catch (error) {
      throw error
    }
  }

  /**
   * Encontrar invoices por organização
   */
  async findByOrganizationId(orgId: string): Promise<Invoice[]> {
    try {
      const { data, error } = await this.getQuery()
        .select('*')
        .eq('organization_id', orgId)
        .order('issued_at', { ascending: false })

      if (error) throw error
      return (data as Invoice[]) || []
    } catch (error) {
      throw error
    }
  }

  /**
   * Marcar invoice como paga
   */
  async markAsPaid(invoiceId: string, paymentId: string): Promise<Invoice> {
    try {
      const { data, error } = await this.getQuery()
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_id: paymentId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .select()
        .single()

      if (error) throw error
      return data as Invoice
    } catch (error) {
      throw error
    }
  }

  /**
   * Contar invoices pendentes
   */
  async countPending(orgId: string): Promise<number> {
    try {
      const { count, error } = await this.getQuery()
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'pending')

      if (error) throw error
      return count || 0
    } catch (error) {
      throw error
    }
  }
}

export class UsageLogRepository extends BaseRepository<UsageLog> {
  protected tableName = 'public.usage_logs'

  /**
   * Obter uso de uma feature neste mês
   */
  async getMonthlyUsage(orgId: string, feature: string): Promise<number> {
    try {
      const today = new Date()
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split('T')[0]
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0]

      const { data, error } = await this.getQuery()
        .select('amount')
        .eq('organization_id', orgId)
        .eq('feature', feature)
        .gte('period', monthStart)
        .lte('period', monthEnd)

      if (error) throw error

      return (data as UsageLog[]).reduce((sum, log) => sum + log.amount, 0)
    } catch (error) {
      throw error
    }
  }

  /**
   * Registrar uso de feature
   */
  async logUsage(orgId: string, feature: string, amount: number = 1): Promise<UsageLog> {
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await this.getQuery()
        .insert([
          {
            organization_id: orgId,
            feature,
            amount,
            period: today,
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data as UsageLog
    } catch (error) {
      throw error
    }
  }

  /**
   * Obter uso total por período
   */
  async getUsageByPeriod(
    orgId: string,
    feature: string,
    startDate: string,
    endDate: string
  ): Promise<UsageLog[]> {
    try {
      const { data, error } = await this.getQuery()
        .select('*')
        .eq('organization_id', orgId)
        .eq('feature', feature)
        .gte('period', startDate)
        .lte('period', endDate)

      if (error) throw error
      return (data as UsageLog[]) || []
    } catch (error) {
      throw error
    }
  }
}
