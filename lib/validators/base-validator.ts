/**
 * Base Validator - Classe abstrata para validações
 * Implementa sistema de regras para validação de dados
 */

export interface ValidationRule {
  field: string
  validator: (value: any) => boolean | Promise<boolean>
  message: string
}

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export abstract class BaseValidator<T = any> {
  protected rules: ValidationRule[] = []
  protected errors: ValidationError[] = []

  constructor() {
    this.defineRules()
  }

  /**
   * Definir regras de validação - deve ser implementado por subclasses
   */
  abstract defineRules(): void

  /**
   * Adicionar regra de validação
   */
  protected addRule(field: string, validator: (value: any) => boolean, message: string): void {
    this.rules.push({ field, validator, message })
  }

  /**
   * Adicionar regra assíncrona
   */
  protected addAsyncRule(
    field: string,
    validator: (value: any) => Promise<boolean>,
    message: string
  ): void {
    this.rules.push({ field, validator, message })
  }

  /**
   * Validar dados
   */
  async validate(data: Partial<T>): Promise<ValidationResult> {
    this.errors = []

    // Executar todas as regras
    const promises = this.rules.map(async (rule) => {
      const value = (data as any)[rule.field]

      try {
        const isValid = await Promise.resolve(rule.validator(value))

        if (!isValid) {
          this.errors.push({
            field: rule.field,
            message: rule.message,
          })
        }
      } catch (error) {
        this.errors.push({
          field: rule.field,
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        })
      }
    })

    await Promise.all(promises)

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
    }
  }

  /**
   * Verificar se dados são válidos (síncrono)
   */
  isValid(data: Partial<T>): boolean {
    this.errors = []

    this.rules.forEach((rule) => {
      const value = (data as any)[rule.field]

      // Pular validações assíncronas em isValid
      if (rule.validator.constructor.name === 'AsyncFunction') {
        return
      }

      try {
        const isValid = rule.validator(value)

        if (!isValid) {
          this.errors.push({
            field: rule.field,
            message: rule.message,
          })
        }
      } catch (error) {
        this.errors.push({
          field: rule.field,
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        })
      }
    })

    return this.errors.length === 0
  }

  /**
   * Obter erros
   */
  getErrors(): ValidationError[] {
    return this.errors
  }

  /**
   * Obter erros por campo
   */
  getFieldError(field: string): string | null {
    const error = this.errors.find((e) => e.field === field)
    return error?.message || null
  }

  /**
   * Limpar erros
   */
  clearErrors(): void {
    this.errors = []
  }

  /**
   * Regras comuns - helpers
   */

  protected isRequired(value: any): boolean {
    if (typeof value === 'string') {
      return value.trim().length > 0
    }
    return value !== null && value !== undefined
  }

  protected isEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  protected isUrl(value: string): boolean {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }

  protected minLength(value: string, min: number): boolean {
    return value && value.length >= min
  }

  protected maxLength(value: string, max: number): boolean {
    return !value || value.length <= max
  }

  protected isNumber(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value)
  }

  protected isPositive(value: number): boolean {
    return value > 0
  }

  protected isValidDate(value: string): boolean {
    const date = new Date(value)
    return date instanceof Date && !isNaN(date.getTime())
  }

  protected matches(value: string, pattern: RegExp): boolean {
    return pattern.test(value)
  }

  protected isIn(value: any, list: any[]): boolean {
    return list.includes(value)
  }

  protected isUnique(value: string, existingValues: string[]): boolean {
    return !existingValues.includes(value)
  }
}
