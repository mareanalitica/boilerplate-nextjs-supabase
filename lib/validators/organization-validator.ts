/**
 * Organization Validator
 * Validações para dados de organização
 */

import { BaseValidator } from './base-validator'
import type { Organization } from '../stores/organization-store'

export class OrganizationValidator extends BaseValidator<Organization> {
  defineRules(): void {
    // Nome é requerido e deve ter entre 2 e 255 caracteres
    this.addRule('name', (value: any) => {
      if (!value) return false
      return this.minLength(value, 2) && this.maxLength(value, 255)
    }, 'Organization name must be between 2 and 255 characters')

    // Plan é requerido e deve ser um dos planos válidos
    this.addRule('plan', (value: any) => {
      return this.isIn(value, ['free', 'pro', 'enterprise'])
    }, 'Plan must be free, pro, or enterprise')

    // Logo URL é opcional mas deve ser válida se fornecida
    this.addRule('logo_url', (value: any) => {
      if (!value) return true
      return this.isUrl(value)
    }, 'Logo URL must be valid')
  }

  /**
   * Validação customizada para atualização
   */
  validateUpdate(): void {
    this.rules = []

    // Nome é opcional na atualização
    this.addRule('name', (value: any) => {
      if (!value) return true
      return this.minLength(value, 2) && this.maxLength(value, 255)
    }, 'Organization name must be between 2 and 255 characters')

    // Plan é opcional
    this.addRule('plan', (value: any) => {
      if (!value) return true
      return this.isIn(value, ['free', 'pro', 'enterprise'])
    }, 'Plan must be free, pro, or enterprise')

    // Logo URL é opcional
    this.addRule('logo_url', (value: any) => {
      if (!value) return true
      return this.isUrl(value)
    }, 'Logo URL must be valid')
  }

  /**
   * Validar nome é único
   */
  validateNameUnique(existingNames: string[]): void {
    this.addAsyncRule('name', async (value: any) => {
      if (!value) return true
      return this.isUnique(value, existingNames)
    }, 'Organization name already exists')
  }
}
