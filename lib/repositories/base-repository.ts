/**
 * Base Repository - Classe abstrata para acesso a dados
 * Implementa padrões comuns: CRUD, queries, filtering
 */

import { createBrowserClient } from '@supabase/ssr'

export abstract class BaseRepository<T> {
  protected supabase: ReturnType<typeof createBrowserClient>
  protected tableName: string = ''

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    this.supabase = createBrowserClient(supabaseUrl, supabaseKey)

    if (!this.tableName) {
      throw new Error(`${this.constructor.name} must define tableName`)
    }
  }

  /**
   * Encontrar um registro por ID
   */
  async find(id: string): Promise<T | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as T | null
    } catch (error) {
      if (error instanceof Error && error.message.includes('No rows')) {
        return null
      }
      throw error
    }
  }

  /**
   * Encontrar todos os registros com filtros opcionais
   */
  async findAll(filters?: Record<string, any>): Promise<T[]> {
    try {
      let query = this.supabase.from(this.tableName).select('*')

      // Aplicar filtros
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value)
          }
        })
      }

      const { data, error } = await query

      if (error) throw error
      return (data as T[]) || []
    } catch (error) {
      throw error
    }
  }

  /**
   * Criar novo registro
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert([data])
        .select()
        .single()

      if (error) throw error
      return result as T
    } catch (error) {
      throw error
    }
  }

  /**
   * Atualizar registro
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result as T
    } catch (error) {
      throw error
    }
  }

  /**
   * Deletar registro
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      throw error
    }
  }

  /**
   * Query customizada com filtros
   */
  async query(filters: Record<string, any>): Promise<T[]> {
    try {
      let query = this.supabase.from(this.tableName).select('*')

      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null) return

        if (key === 'query') {
          // Busca de texto em campos múltiplos (subclass pode customizar)
          return
        }

        if (typeof value === 'object' && 'operator' in value) {
          // Suporta operadores customizados
          const { operator, val } = value
          if (operator === 'gt') {
            query = query.gt(key, val)
          } else if (operator === 'lt') {
            query = query.lt(key, val)
          } else if (operator === 'gte') {
            query = query.gte(key, val)
          } else if (operator === 'lte') {
            query = query.lte(key, val)
          } else if (operator === 'in') {
            query = query.in(key, val)
          }
        } else {
          query = query.eq(key, value)
        }
      })

      const { data, error } = await query

      if (error) throw error
      return (data as T[]) || []
    } catch (error) {
      throw error
    }
  }

  /**
   * Contar registros com filtros
   */
  async count(filters?: Record<string, any>): Promise<number> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value)
          }
        })
      }

      const { count, error } = await query

      if (error) throw error
      return count || 0
    } catch (error) {
      throw error
    }
  }

  /**
   * Paginação
   */
  async paginate(
    page: number = 1,
    pageSize: number = 10,
    filters?: Record<string, any>
  ): Promise<{ data: T[]; total: number; pages: number }> {
    try {
      const total = await this.count(filters)
      const pages = Math.ceil(total / pageSize)
      const offset = (page - 1) * pageSize

      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .range(offset, offset + pageSize - 1)

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value)
          }
        })
      }

      const { data, error } = await query

      if (error) throw error

      return {
        data: (data as T[]) || [],
        total,
        pages,
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Executar query customizada (para casos especiais)
   */
  protected getQuery() {
    return this.supabase.from(this.tableName)
  }
}
