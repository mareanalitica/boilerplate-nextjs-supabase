/**
 * Base Service - Classe abstrata para todas as services
 * Implementa padrões comuns: logging, erro handling, validação
 */

import { BaseRepository } from '../repositories/base-repository'

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export abstract class BaseService<T> {
  constructor(
    protected repository: BaseRepository<T>,
    protected logger?: any,
    protected cache?: any
  ) {}

  /**
   * Obter todos os registros
   */
  async getAll(filters?: Record<string, any>): Promise<T[]> {
    try {
      this.log('getAll', { filters })
      const data = await this.repository.findAll(filters)
      return data
    } catch (error) {
      this.handleError('getAll', error)
      throw error
    }
  }

  /**
   * Obter um registro por ID
   */
  async getById(id: string): Promise<T | null> {
    try {
      this.log('getById', { id })
      const data = await this.repository.find(id)
      return data
    } catch (error) {
      this.handleError('getById', error)
      throw error
    }
  }

  /**
   * Criar novo registro
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      this.log('create', { data })

      // Validar dados
      const validation = this.validate(data)
      if (!validation.isValid) {
        throw new ValidationError('Invalid data', validation.errors)
      }

      // Transformar dados (hook para subclasses)
      const transformedData = this.transform(data) as Partial<T>

      // Criar no banco
      const result = await this.repository.create(transformedData)

      // Invalidar cache se existe
      this.invalidateCache()

      return result
    } catch (error) {
      this.handleError('create', error)
      throw error
    }
  }

  /**
   * Atualizar registro
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      this.log('update', { id, data })

      // Validar dados
      const validation = this.validate(data)
      if (!validation.isValid) {
        throw new ValidationError('Invalid data', validation.errors)
      }

      // Transformar dados
      const transformedData = this.transform(data) as Partial<T>

      // Atualizar no banco
      const result = await this.repository.update(id, transformedData)

      // Invalidar cache
      this.invalidateCache()

      return result
    } catch (error) {
      this.handleError('update', error)
      throw error
    }
  }

  /**
   * Deletar registro
   */
  async delete(id: string): Promise<void> {
    try {
      this.log('delete', { id })
      await this.repository.delete(id)
      this.invalidateCache()
    } catch (error) {
      this.handleError('delete', error)
      throw error
    }
  }

  /**
   * Buscar registros com filtro
   */
  async search(query: string, filters?: Record<string, any>): Promise<T[]> {
    try {
      this.log('search', { query, filters })
      const data = await this.repository.query({
        ...filters,
        query,
      })
      return data
    } catch (error) {
      this.handleError('search', error)
      throw error
    }
  }

  /**
   * Validar dados - deve ser implementado por subclasses
   */
  abstract validate(data: Partial<T>): ValidationResult

  /**
   * Transformar dados antes de salvar - pode ser sobrescrito por subclasses
   */
  protected transform(data: Partial<T>): Partial<T> {
    return data
  }

  /**
   * Logging
   */
  protected log(method: string, data?: any): void {
    if (this.logger) {
      this.logger.log(`[${this.constructor.name}] ${method}`, data)
    }
  }

  /**
   * Error handling
   */
  protected handleError(method: string, error: any): void {
    if (this.logger) {
      this.logger.error(
        `[${this.constructor.name}] ${method}`,
        error instanceof Error ? error.message : error
      )
    }
  }

  /**
   * Invalidar cache
   */
  protected invalidateCache(): void {
    if (this.cache) {
      this.cache.invalidate(`${this.constructor.name}:*`)
    }
  }

  /**
   * Obter do cache ou executar função
   */
  protected async withCache<R>(
    key: string,
    fn: () => Promise<R>,
    ttl: number = 3600
  ): Promise<R> {
    if (!this.cache) {
      return fn()
    }

    const cacheKey = `${this.constructor.name}:${key}`
    const cached = this.cache.get(cacheKey)

    if (cached) {
      return cached
    }

    const result = await fn()
    this.cache.set(cacheKey, result, ttl)
    return result
  }
}

/**
 * Erro de validação
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Record<string, string>
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}
