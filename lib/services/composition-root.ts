/**
 * Composition Root
 * Factory pattern para injetar dependências
 * Local central de instanciação de services
 */

import { UserService } from './user-service'
import { OrganizationService } from './organization-service'
import { BillingService } from './billing-service'
import { OnboardingService } from './onboarding-service'
import { PermissionsService } from './permissions-service'

import { UserRepository } from '../repositories/user-repository'
import { OrganizationRepository } from '../repositories/organization-repository'
import {
  SubscriptionRepository,
  InvoiceRepository,
  UsageLogRepository,
} from '../repositories/billing-repository'
import { OnboardingRepository } from '../repositories/onboarding-repository'
import { BaseRepository } from '../repositories/base-repository'

/**
 * Simple logger
 */
export class Logger {
  log(message: string, data?: any): void {
    console.log(`[${new Date().toISOString()}] ${message}`, data)
  }

  error(message: string, error?: any): void {
    console.error(`[${new Date().toISOString()}] ${message}`, error)
  }

  warn(message: string, data?: any): void {
    console.warn(`[${new Date().toISOString()}] ${message}`, data)
  }

  debug(message: string, data?: any): void {
    console.debug(`[${new Date().toISOString()}] ${message}`, data)
  }
}

/**
 * Simple cache
 */
export class Cache {
  private store: Map<string, { value: any; expiry: number }> = new Map()

  get(key: string): any {
    const item = this.store.get(key)
    if (!item) return null

    if (item.expiry < Date.now()) {
      this.store.delete(key)
      return null
    }

    return item.value
  }

  set(key: string, value: any, ttl: number = 3600): void {
    this.store.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
    })
  }

  invalidate(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'))
    const keys = Array.from(this.store.keys())
    keys.forEach((key) => {
      if (regex.test(key)) {
        this.store.delete(key)
      }
    })
  }

  clear(): void {
    this.store.clear()
  }
}

/**
 * Service Container - Composition Root
 */
export class ServiceContainer {
  private static instance: ServiceContainer
  private logger: Logger
  private cache: Cache

  // Services
  private userService: UserService | null = null
  private organizationService: OrganizationService | null = null
  private billingService: BillingService | null = null
  private onboardingService: OnboardingService | null = null
  private permissionsService: PermissionsService | null = null

  // Repositories
  private userRepository: UserRepository | null = null
  private organizationRepository: OrganizationRepository | null = null
  private subscriptionRepository: SubscriptionRepository | null = null
  private invoiceRepository: InvoiceRepository | null = null
  private usageLogRepository: UsageLogRepository | null = null
  private onboardingRepository: OnboardingRepository | null = null

  private constructor() {
    this.logger = new Logger()
    this.cache = new Cache()
  }

  /**
   * Singleton pattern
   */
  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer()
    }
    return ServiceContainer.instance
  }

  /**
   * Reset instance (útil para testes)
   */
  static reset(): void {
    ServiceContainer.instance = new ServiceContainer()
  }

  /**
   * User Service
   */
  getUserService(): UserService {
    if (!this.userService) {
      this.userService = new UserService(
        this.getUserRepository(),
        this.logger,
        this.cache
      )
    }
    return this.userService
  }

  /**
   * Organization Service
   */
  getOrganizationService(): OrganizationService {
    if (!this.organizationService) {
      this.organizationService = new OrganizationService(
        this.getOrganizationRepository(),
        this.logger,
        this.cache
      )
    }
    return this.organizationService
  }

  /**
   * Billing Service
   */
  getBillingService(): BillingService {
    if (!this.billingService) {
      this.billingService = new BillingService(
        this.getSubscriptionRepository(),
        this.getInvoiceRepository(),
        this.getUsageLogRepository(),
        this.logger,
        this.cache
      )
    }
    return this.billingService
  }

  /**
   * Onboarding Service
   */
  getOnboardingService(): OnboardingService {
    if (!this.onboardingService) {
      this.onboardingService = new OnboardingService(
        this.getOnboardingRepository(),
        this.logger,
        this.cache
      )
    }
    return this.onboardingService
  }

  /**
   * Permissions Service
   */
  getPermissionsService(): PermissionsService {
    if (!this.permissionsService) {
      const repo = new BaseRepository<any>()
      repo['tableName'] = 'public.roles'
      this.permissionsService = new PermissionsService(repo, this.logger, this.cache)
    }
    return this.permissionsService
  }

  /**
   * User Repository
   */
  getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new UserRepository()
    }
    return this.userRepository
  }

  /**
   * Organization Repository
   */
  getOrganizationRepository(): OrganizationRepository {
    if (!this.organizationRepository) {
      this.organizationRepository = new OrganizationRepository()
    }
    return this.organizationRepository
  }

  /**
   * Subscription Repository
   */
  getSubscriptionRepository(): SubscriptionRepository {
    if (!this.subscriptionRepository) {
      this.subscriptionRepository = new SubscriptionRepository()
    }
    return this.subscriptionRepository
  }

  /**
   * Invoice Repository
   */
  getInvoiceRepository(): InvoiceRepository {
    if (!this.invoiceRepository) {
      this.invoiceRepository = new InvoiceRepository()
    }
    return this.invoiceRepository
  }

  /**
   * Usage Log Repository
   */
  getUsageLogRepository(): UsageLogRepository {
    if (!this.usageLogRepository) {
      this.usageLogRepository = new UsageLogRepository()
    }
    return this.usageLogRepository
  }

  /**
   * Onboarding Repository
   */
  getOnboardingRepository(): OnboardingRepository {
    if (!this.onboardingRepository) {
      this.onboardingRepository = new OnboardingRepository()
    }
    return this.onboardingRepository
  }

  /**
   * Get Logger
   */
  getLogger(): Logger {
    return this.logger
  }

  /**
   * Get Cache
   */
  getCache(): Cache {
    return this.cache
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear()
  }
}

/**
 * Convenience factory functions
 */
export function getUserService(): UserService {
  return ServiceContainer.getInstance().getUserService()
}

export function getOrganizationService(): OrganizationService {
  return ServiceContainer.getInstance().getOrganizationService()
}

export function getBillingService(): BillingService {
  return ServiceContainer.getInstance().getBillingService()
}

export function getOnboardingService(): OnboardingService {
  return ServiceContainer.getInstance().getOnboardingService()
}

export function getPermissionsService(): PermissionsService {
  return ServiceContainer.getInstance().getPermissionsService()
}
