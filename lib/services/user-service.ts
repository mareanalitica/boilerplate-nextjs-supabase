/**
 * User Service
 * Gerencia operações de usuário
 */

import { BaseService, ValidationResult, ValidationError } from './base-service'
import { UserRepository } from '../repositories/user-repository'
import { User } from '../state/types/auth-state'
import { UserValidator } from '../validators/user-validator'

export class UserService extends BaseService<User> {
  private userRepository: UserRepository
  private validator: UserValidator

  constructor(
    userRepository: UserRepository,
    logger?: any,
    cache?: any
  ) {
    super(userRepository, logger, cache)
    this.userRepository = userRepository
    this.validator = new UserValidator()
  }

  /**
   * Obter perfil do usuário
   */
  async getUserProfile(userId: string): Promise<User | null> {
    return this.withCache(`profile:${userId}`, () =>
      this.userRepository.find(userId)
    )
  }

  /**
   * Obter perfil completo com roles
   */
  async getFullProfile(userId: string): Promise<User | null> {
    return this.withCache(`profile:full:${userId}`, () =>
      this.userRepository.getFullProfile(userId)
    )
  }

  /**
   * Atualizar perfil do usuário
   */
  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    this.validator.validateProfileUpdate()
    return this.update(userId, data)
  }

  /**
   * Buscar por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.withCache(`email:${email}`, () =>
      this.userRepository.findByEmail(email)
    )
  }

  /**
   * Buscar usuários por role
   */
  async findByRole(role: string): Promise<User[]> {
    return this.userRepository.findByRole(role)
  }

  /**
   * Verificar se email existe
   */
  async emailExists(email: string): Promise<boolean> {
    return this.userRepository.emailExists(email)
  }

  /**
   * Criar novo usuário com validações
   */
  async createUser(data: Partial<User>): Promise<User> {
    // Validar dados
    const validation = this.validate(data)
    if (!validation.isValid) {
      throw new ValidationError('Invalid user data', validation.errors)
    }

    // Verificar se email já existe
    if (data.email) {
      const exists = await this.emailExists(data.email)
      if (exists) {
        throw new ValidationError('Invalid user data', {
          email: 'Email already registered'
        })
      }
    }

    return this.create(data)
  }

  /**
   * Deletar usuário
   */
  async deleteUser(userId: string): Promise<void> {
    await this.delete(userId)
  }

  /**
   * Validar dados do usuário
   */
  validate(data: Partial<User>): ValidationResult {
    const errors: Record<string, string> = {}

    // Validar email se presente
    if (data.email) {
      if (!this.isValidEmail(data.email)) {
        errors.email = 'Invalid email format'
      }
    }

    // Validar nome completo se presente
    if (data.full_name) {
      if (data.full_name.length < 2) {
        errors.full_name = 'Full name must have at least 2 characters'
      }
    }

    // Validar avatar URL se presente
    if (data.avatar_url) {
      if (!this.isValidUrl(data.avatar_url)) {
        errors.avatar_url = 'Invalid avatar URL'
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

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}
