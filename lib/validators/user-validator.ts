/**
 * User Validator
 * Validações para dados de usuário
 */

import { BaseValidator } from './base-validator'
import { User } from '../state/types/auth-state'

export class UserValidator extends BaseValidator<User> {
  defineRules(): void {
    // Email é requerido e deve ser válido
    this.addRule('email', (value: any) => {
      if (!value) return false
      return this.isEmail(value)
    }, 'Email must be valid')

    // Full name é requerido e deve ter pelo menos 2 caracteres
    this.addRule('full_name', (value: any) => {
      if (!value) return false
      return this.minLength(value, 2)
    }, 'Full name must have at least 2 characters')

    // Avatar URL é opcional mas deve ser válida se fornecida
    this.addRule('avatar_url', (value: any) => {
      if (!value) return true
      return this.isUrl(value)
    }, 'Avatar URL must be valid')
  }

  /**
   * Validar email existe (assíncrono)
   */
  validateEmailUnique(existingEmails: string[]): void {
    this.addAsyncRule('email', async (value: any) => {
      if (!value) return true
      return this.isUnique(value, existingEmails)
    }, 'Email already registered')
  }

  /**
   * Validação customizada para atualização de perfil
   */
  validateProfileUpdate(): void {
    // Reset rules para atualização (campos opcionais)
    this.rules = []

    // Email é opcional na atualização
    this.addRule('email', (value: any) => {
      if (!value) return true
      return this.isEmail(value)
    }, 'Email must be valid')

    // Full name é opcional
    this.addRule('full_name', (value: any) => {
      if (!value) return true
      return this.minLength(value, 2)
    }, 'Full name must have at least 2 characters')

    // Avatar URL é opcional
    this.addRule('avatar_url', (value: any) => {
      if (!value) return true
      return this.isUrl(value)
    }, 'Avatar URL must be valid')
  }
}
