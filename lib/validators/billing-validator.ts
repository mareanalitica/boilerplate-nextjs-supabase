/**
 * Billing Validator
 * Validações para dados de billing e subscriptions
 */

import { BaseValidator } from './base-validator'

export interface SubscriptionData {
  plan: 'free' | 'pro' | 'enterprise'
  billing_cycle: 'monthly' | 'annual'
  payment_method_id?: string
}

export class BillingValidator extends BaseValidator<SubscriptionData> {
  defineRules(): void {
    // Plan é requerido
    this.addRule('plan', (value: any) => {
      return this.isIn(value, ['free', 'pro', 'enterprise'])
    }, 'Plan must be free, pro, or enterprise')

    // Billing cycle é requerido
    this.addRule('billing_cycle', (value: any) => {
      return this.isIn(value, ['monthly', 'annual'])
    }, 'Billing cycle must be monthly or annual')

    // Payment method ID é opcional para plano free
    this.addRule('payment_method_id', (value: any) => {
      if (!value) return true
      return this.minLength(value, 5)
    }, 'Payment method ID must be valid')
  }

  /**
   * Validar upgrade de plano
   * Não permite downgrade de pro para free, etc
   */
  validateUpgrade(currentPlan: 'free' | 'pro' | 'enterprise', newPlan: 'free' | 'pro' | 'enterprise'): boolean {
    const planHierarchy: Record<string, number> = {
      free: 0,
      pro: 1,
      enterprise: 2,
    }

    return planHierarchy[newPlan] >= planHierarchy[currentPlan]
  }

  /**
   * Validar que plano pro/enterprise têm payment method
   */
  validatePaymentMethod(plan: 'free' | 'pro' | 'enterprise', paymentMethodId?: string): boolean {
    if (plan === 'free') return true
    return !!paymentMethodId && paymentMethodId.length > 0
  }

  /**
   * Validar valor da fatura
   */
  validateInvoiceAmount(amount: number): boolean {
    return this.isPositive(amount) && amount > 0
  }

  /**
   * Validar moeda é válida (3 letras)
   */
  validateCurrency(currency: string): boolean {
    return this.matches(currency, /^[A-Z]{3}$/)
  }
}
