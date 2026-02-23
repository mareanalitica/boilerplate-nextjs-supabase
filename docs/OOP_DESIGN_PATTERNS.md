# POO & Design Patterns em React - Guia de Implementação

## Visão Geral

Este documento detalha como implementar Programação Orientada a Objetos (POO) e Design Patterns no contexto de um aplicativo React com Next.js, focando em:

- Princípios SOLID
- Design Patterns (GoF - Gang of Four)
- Estrutura de Services, Repositories, Validators
- Composição vs Herança
- Dependency Injection
- Type Safety com TypeScript

---

## 1. PRINCÍPIOS SOLID EM REACT

### 1.1 Single Responsibility Principle (SRP)

**Conceito**: Uma classe/módulo deve ter apenas uma razão para mudar.

```
❌ ERRADO - Uma classe com múltiplas responsabilidades:

UserManager class:
├─ authenticate()           (auth)
├─ updateProfile()          (database)
├─ sendEmail()              (email)
├─ logActivity()            (logging)
├─ validatePermissions()    (RBAC)
└─ calculateSubscription()  (billing)

→ Mudanças em auth afetam toda classe
→ Difícil de testar
→ Difícil de reutilizar

✅ CORRETO - Responsabilidades separadas:

AuthService:
├─ authenticate()
├─ refreshToken()
└─ validateToken()

UserService:
├─ updateProfile()
├─ getProfile()
└─ deleteProfile()

EmailService:
├─ sendWelcomeEmail()
├─ sendResetPasswordEmail()
└─ sendNotification()

PermissionsService:
├─ validateUserRole()
├─ validatePermission()
└─ getAvailableActions()

→ Cada classe tem um propósito claro
→ Fácil de testar isoladamente
→ Fácil de reutilizar em diferentes contextos
```

### 1.2 Open/Closed Principle (OCP)

**Conceito**: Classes devem ser abertas para extensão, fechadas para modificação.

```
❌ ERRADO - Modificar classe base para cada novo tipo:

class BillingCalculator {
  calculate(plan: 'free' | 'pro' | 'enterprise'): number {
    if (plan === 'free') return 0
    if (plan === 'pro') return 29
    if (plan === 'enterprise') return 99

    // A cada novo plano, modifica essa classe
  }
}

✅ CORRETO - Extensão via subclasses/implementações:

interface BillingStrategy {
  calculate(basePrice: number): number
  getName(): string
}

class FreePlanStrategy implements BillingStrategy {
  calculate(): number { return 0 }
  getName(): string { return 'free' }
}

class ProPlanStrategy implements BillingStrategy {
  calculate(basePrice: number): number { return basePrice }
  getName(): string { return 'pro' }
}

class EnterprisePlanStrategy implements BillingStrategy {
  calculate(basePrice: number): number { return basePrice * 1.5 }
  getName(): string { return 'enterprise' }
}

// Novo plano? Cria nova classe, não modifica existentes
class CustomPlanStrategy implements BillingStrategy {
  // ...
}

→ Classe base nunca muda
→ Fácil adicionar novos planos
→ Cada plano é isolado
```

### 1.3 Liskov Substitution Principle (LSP)

**Conceito**: Subclasses podem substituir superclasses sem quebrar funcionamento.

```
❌ ERRADO - Subclasse quebra contrato:

interface User {
  getFullName(): string
}

class RegularUser implements User {
  getFullName(): string { return 'John Doe' }
}

class AdminUser implements User {
  getFullName(): string { return null } // ❌ Viola contrato!
}

// Código que usa User quebra:
const name: string = user.getFullName() // Pode ser null!

✅ CORRETO - Subclasses honram o contrato:

class AdminUser implements User {
  getFullName(): string { return 'Admin John Doe' }
  // Sempre retorna string, como prometido
}

// Código pode confiar:
const name: string = user.getFullName() // Sempre string
```

### 1.4 Interface Segregation Principle (ISP)

**Conceito**: Clientes não devem depender de interfaces que não usam.

```
❌ ERRADO - Interface grande, força implementar tudo:

interface UserService {
  authenticate(email, password): Promise<User>
  updateProfile(userId, data): Promise<User>
  deleteUser(userId): Promise<void>
  sendEmail(userId, message): Promise<void>
  generateReport(userId): Promise<Report>
  calculateBilling(userId): Promise<Billing>
  // ...10 mais métodos
}

class BasicUserManager implements UserService {
  authenticate() { ... }
  updateProfile() { ... }
  deleteUser() { ... }
  sendEmail() { ... }
  // Precisa implementar tudo, mesmo não usando generateReport
}

✅ CORRETO - Interfaces pequenas e focadas:

interface AuthService {
  authenticate(email, password): Promise<User>
  refreshToken(token): Promise<string>
  logout(): Promise<void>
}

interface ProfileService {
  updateProfile(userId, data): Promise<User>
  deleteUser(userId): Promise<void>
}

interface NotificationService {
  sendEmail(userId, message): Promise<void>
}

interface ReportingService {
  generateReport(userId): Promise<Report>
}

class BasicUserManager implements AuthService, ProfileService {
  // Implementa apenas o que precisa
}

→ Cada classe implementa o que usa
→ Interfaces menores e focadas
→ Melhor composição
```

### 1.5 Dependency Inversion Principle (DIP)

**Conceito**: Depender de abstrações, não de concretizações.

```
❌ ERRADO - Acoplamento direto a implementação:

class UserService {
  constructor() {
    this.database = new SupabaseClient() // Acoplado!
    this.email = new GmailSender()        // Acoplado!
  }

  async updateUser(id, data) {
    await this.database.update(...)
    await this.email.send(...)
  }
}

// Problema: Trocar Gmail por SendGrid requer mudar UserService

✅ CORRETO - Injetar dependências:

interface DatabaseClient {
  update(table, id, data): Promise<void>
  query(sql): Promise<any[]>
}

interface EmailSender {
  send(to, subject, body): Promise<void>
}

class UserService {
  constructor(
    private database: DatabaseClient,
    private email: EmailSender
  ) {}

  async updateUser(id, data) {
    await this.database.update(...)
    await this.email.send(...)
  }
}

// Uso:
const db = new SupabaseClient()
const email = new GmailSender()
const service = new UserService(db, email)

// Trocar email sender é fácil:
const newEmail = new SendGridSender() // Implementa interface
const newService = new UserService(db, newEmail)

→ Desacoplado
→ Fácil de testar (usar mocks)
→ Fácil de trocar implementações
```

---

## 2. DESIGN PATTERNS EM REACT

### Pattern 1: Singleton

**Objetivo**: Garantir apenas uma instância de uma classe

**Caso de Uso**: Supabase Client, Logger, Configuration

```
❌ ERRADO - Múltiplas instâncias:

// file1.ts
const client = new SupabaseClient()
export client

// file2.ts
const client = new SupabaseClient() // Outra instância!
export client

→ Dois clientes diferentes
→ Estados desincronizados

✅ CORRETO - Singleton:

class SupabaseClientSingleton {
  private static instance: SupabaseClient

  static getInstance(): SupabaseClient {
    if (!SupabaseClientSingleton.instance) {
      SupabaseClientSingleton.instance = new SupabaseClient()
    }
    return SupabaseClientSingleton.instance
  }
}

// Uso:
const client1 = SupabaseClientSingleton.getInstance()
const client2 = SupabaseClientSingleton.getInstance()

// client1 === client2 (mesma instância)
```

### Pattern 2: Factory

**Objetivo**: Criar objetos sem especificar classes concretas

**Caso de Uso**: Criar validadores, strategies, handlers por tipo

```
PADRÃO:

interface PlanValidator {
  validate(data: any): ValidationResult
  getPlanType(): string
}

class FreePlanValidator implements PlanValidator {
  validate(data): ValidationResult {
    // Validação específica para free
  }
  getPlanType(): string { return 'free' }
}

class ProPlanValidator implements PlanValidator {
  validate(data): ValidationResult {
    // Validação específica para pro
  }
  getPlanType(): string { return 'pro' }
}

// Factory
class PlanValidatorFactory {
  static createValidator(planType: 'free' | 'pro' | 'enterprise'): PlanValidator {
    switch (planType) {
      case 'free':
        return new FreePlanValidator()
      case 'pro':
        return new ProPlanValidator()
      default:
        return new EnterprisePlanValidator()
    }
  }
}

// Uso:
const validator = PlanValidatorFactory.createValidator(userPlan)
const result = validator.validate(userData)

→ Código cliente não precisa conhecer classes concretas
→ Fácil adicionar novos tipos
→ Lógica de criação centralizada
```

### Pattern 3: Strategy

**Objetivo**: Encapsular diferentes algoritmos intercambiáveis

**Caso de Uso**: Diferentes estratégias de billing, cálculo de preço, ordenação

```
PADRÃO:

interface BillingStrategy {
  calculatePrice(basePrice: number, quantity: number): number
  getName(): string
}

class MonthlyBillingStrategy implements BillingStrategy {
  calculatePrice(basePrice, quantity): number {
    return basePrice * quantity // Sem desconto
  }
  getName(): string { return 'monthly' }
}

class AnnualBillingStrategy implements BillingStrategy {
  calculatePrice(basePrice, quantity): number {
    const annual = basePrice * quantity * 12
    return annual * 0.9 // 10% desconto anual
  }
  getName(): string { return 'annual' }
}

class EnterpriseBillingStrategy implements BillingStrategy {
  calculatePrice(basePrice, quantity): number {
    // Custom pricing logic
    return basePrice * quantity * customMultiplier
  }
  getName(): string { return 'enterprise' }
}

// Client que usa strategy
class Subscription {
  constructor(private strategy: BillingStrategy) {}

  setStrategy(strategy: BillingStrategy) {
    this.strategy = strategy
  }

  calculateFinalPrice(basePrice, quantity): number {
    return this.strategy.calculatePrice(basePrice, quantity)
  }
}

// Uso:
const subscription = new Subscription(new MonthlyBillingStrategy())
let price = subscription.calculateFinalPrice(100, 1) // $100

subscription.setStrategy(new AnnualBillingStrategy())
price = subscription.calculateFinalPrice(100, 1) // $1080

→ Fácil trocar estratégia em runtime
→ Cada estratégia é independente
→ Evita if/else gigantes
```

### Pattern 4: Observer

**Objetivo**: Notificar múltiplos objetos sobre mudanças

**Caso de Uso**: Context React, Event emitters, real-time updates

```
PADRÃO:

interface Observer {
  update(event: Event): void
}

class EventEmitter {
  private observers: Observer[] = []

  subscribe(observer: Observer) {
    this.observers.push(observer)
  }

  unsubscribe(observer: Observer) {
    this.observers = this.observers.filter(o => o !== observer)
  }

  emit(event: Event) {
    this.observers.forEach(observer => observer.update(event))
  }
}

// Observers concretos
class NotificationObserver implements Observer {
  update(event: Event) {
    if (event.type === 'subscription_changed') {
      showNotification('Plano atualizado!')
    }
  }
}

class AnalyticsObserver implements Observer {
  update(event: Event) {
    if (event.type === 'subscription_changed') {
      trackEvent('subscription_upgraded')
    }
  }
}

class UIObserver implements Observer {
  update(event: Event) {
    if (event.type === 'subscription_changed') {
      updateUI()
    }
  }
}

// Uso:
const eventEmitter = new EventEmitter()
eventEmitter.subscribe(new NotificationObserver())
eventEmitter.subscribe(new AnalyticsObserver())
eventEmitter.subscribe(new UIObserver())

// Quando algo acontece:
eventEmitter.emit({ type: 'subscription_changed', data: {...} })
// Todos os observers são notificados automaticamente

→ Desacoplamento entre componentes
→ Múltiplos subscribers da mesma ação
→ Fácil adicionar novos observers
```

### Pattern 5: Decorator

**Objetivo**: Adicionar responsabilidades a objetos dinamicamente

**Caso de Uso**: Adicionar logging, cache, autenticação a métodos

```
PADRÃO (usando Decorators do TypeScript):

// Decorator para requerer autenticação
function RequiresAuth(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = async function(...args: any[]) {
    if (!this.isAuthenticated()) {
      throw new Error('Não autenticado')
    }
    return originalMethod.apply(this, args)
  }

  return descriptor
}

// Decorator para cache
function CacheFor(minutes: number) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const cache = new Map()

    descriptor.value = async function(...args: any[]) {
      const key = JSON.stringify(args)

      if (cache.has(key)) {
        return cache.get(key)
      }

      const result = await originalMethod.apply(this, args)
      cache.set(key, result)

      // Limpar cache após X minutos
      setTimeout(() => cache.delete(key), minutes * 60 * 1000)

      return result
    }

    return descriptor
  }
}

// Decorator para logging
function Logged(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = async function(...args: any[]) {
    console.log(`Iniciando ${propertyKey} com args:`, args)
    const result = await originalMethod.apply(this, args)
    console.log(`${propertyKey} completado:`, result)
    return result
  }

  return descriptor
}

// Uso:
class UserService {
  @RequiresAuth()
  @CacheFor(5) // Cache por 5 minutos
  @Logged()
  async getUsers(): Promise<User[]> {
    return db.query('SELECT * FROM users')
  }
}

→ Adiciona funcionalidade sem modificar método
→ Composição limpa de responsabilidades
→ Reutilizável em múltiplos métodos
```

### Pattern 6: Command

**Objetivo**: Encapsular requisições como objetos

**Caso de Uso**: Fila de ações, undo/redo, auditoria

```
PADRÃO:

interface Command {
  execute(): Promise<void>
  undo(): Promise<void>
  getName(): string
}

class UpdateUserCommand implements Command {
  constructor(
    private userId: string,
    private newData: any,
    private userService: UserService
  ) {}

  async execute(): Promise<void> {
    await this.userService.updateUser(this.userId, this.newData)
  }

  async undo(): Promise<void> {
    // Restaurar dados anteriores
    await this.userService.updateUser(this.userId, this.previousData)
  }

  getName(): string { return 'Update User' }
}

class CommandInvoker {
  private history: Command[] = []
  private index: number = -1

  async execute(command: Command) {
    // Remover qualquer "future" após current index
    this.history = this.history.slice(0, this.index + 1)

    await command.execute()
    this.history.push(command)
    this.index++
  }

  async undo() {
    if (this.index >= 0) {
      await this.history[this.index].undo()
      this.index--
    }
  }

  async redo() {
    if (this.index < this.history.length - 1) {
      this.index++
      await this.history[this.index].execute()
    }
  }
}

// Uso:
const invoker = new CommandInvoker()
const command = new UpdateUserCommand(userId, newData, userService)

await invoker.execute(command)
await invoker.undo()  // Volta ao estado anterior
await invoker.redo()  // Refaz

→ Cada ação é um objeto reutilizável
→ Fácil implementar undo/redo
→ Auditável (log de commands)
```

---

## 3. ARQUITETURA EM CAMADAS

### 3.1 Estrutura Padrão

```
CAMADA 1: PRESENTATION (React Components)
├─ Componentes funcionais
├─ Hooks (useContext, useState)
├─ Propsem validação
└─ Responsivo a eventos

      ↓ (Chama)

CAMADA 2: STATE MANAGEMENT (Context + Reducers)
├─ Contextos globais
├─ Reducers para lógica de estado
├─ Sincronização com servidor
└─ Persistência (localStorage)

      ↓ (Usa)

CAMADA 3: BUSINESS LOGIC (Services)
├─ Lógica de negócio
├─ Orquestração de operações
├─ Validações complexas
└─ Transformações de dados

      ↓ (Usa)

CAMADA 4: DATA ACCESS (Repositories)
├─ Queries ao banco/API
├─ CRUD operations
├─ Filtros e paginação
└─ Cache local

      ↓ (Query)

CAMADA 5: EXTERNAL SERVICES
├─ Supabase
├─ Stripe/Paddle
├─ Email service
├─ Analytics
└─ 3rd party APIs

      ↓ (Database/API)

CAMADA 6: DATABASE / BACKEND
├─ Supabase database
├─ RLS policies
├─ Triggers
└─ Views
```

### 3.2 Fluxo de Dados

```
USER ACTION
   │
   ▼
Component (onClick)
   │
   ├─ Dispatch context action
   │
   ▼
Context Reducer
   │
   ├─ Validation (local state)
   ├─ Update state (optimistic)
   │
   ▼
Service (chamar backend)
   │
   ├─ Business logic
   ├─ Data transformation
   │
   ▼
Repository (acesso a dados)
   │
   ├─ Query builder
   ├─ API call
   │
   ▼
Supabase Client
   │
   ├─ HTTP request
   ├─ RLS validation
   │
   ▼
Database
   │
   ├─ Execute query
   ├─ Apply policies
   │
   ▼
Response
   │
   ├─ Return data
   ├─ Update context
   │
   ▼
Component re-renders
```

---

## 4. ESTRUTURA DE CLASSES

### 4.1 Base Service

```
CONCEITO:

Toda service herda de BaseService para funcionalidades comuns:

BaseService<T>:
├─ Propriedades:
│  ├─ repository: BaseRepository<T>
│  └─ logger: Logger
│
├─ Métodos comuns:
│  ├─ getAll(): Promise<T[]>
│  ├─ getById(id): Promise<T>
│  ├─ create(data): Promise<T>
│  ├─ update(id, data): Promise<T>
│  ├─ delete(id): Promise<void>
│  └─ search(query): Promise<T[]>
│
└─ Métodos abstratos:
   ├─ validate(data): ValidationResult
   └─ transform(data): T
```

### 4.2 Base Repository

```
CONCEITO:

Toda repository herda de BaseRepository para CRUD padrão:

BaseRepository<T>:
├─ Propriedades:
│  ├─ table: string
│  └─ client: SupabaseClient
│
├─ Métodos:
│  ├─ find(id): Promise<T | null>
│  ├─ findAll(options): Promise<T[]>
│  ├─ create(data): Promise<T>
│  ├─ update(id, data): Promise<T>
│  ├─ delete(id): Promise<void>
│  ├─ query(filter): Promise<T[]>
│  └─ count(filter): Promise<number>
│
└─ Métodos especializados por subclass:
   ├─ UserRepository.findByEmail(email)
   ├─ OrganizationRepository.findByOwnerId(ownerId)
   └─ BillingRepository.findActiveSubscriptions()
```

### 4.3 Base Validator

```
CONCEITO:

Toda validator herda de BaseValidator:

BaseValidator:
├─ Propriedades:
│  ├─ errors: ValidationError[]
│  └─ rules: ValidationRule[]
│
├─ Métodos:
│  ├─ validate(data): ValidationResult
│  ├─ isValid(data): boolean
│  ├─ addRule(rule): void
│  └─ getErrors(): ValidationError[]
│
└─ Métodos abstratos:
   └─ defineRules(): void

SUBCLASSES:

UserValidator:
├─ defineRules():
│  ├─ email válido
│  ├─ senha forte
│  └─ nome não vazio

OrganizationValidator:
├─ defineRules():
│  ├─ nome único
│  ├─ owner existe
│  └─ plan válido

PlanValidator:
├─ defineRules():
│  ├─ plan existe
│  ├─ payment method válido
│  └─ não em trial
```

---

## 5. COMPOSIÇÃO vs HERANÇA

### 5.1 Preferir Composição

```
❌ HERANÇA PROFUNDA (Evitar):

User
├─ RegularUser
│  ├─ FreeUser
│  │  └─ TrialUser
│  └─ PaidUser
│     ├─ ProUser
│     │  └─ EnterprisePaidUser
│     └─ AnnualUser
└─ AdminUser

→ Hierarquia complexa
→ Difícil de mudar
→ Muito acoplamento
→ Mudanças em User afetam tudo

✅ COMPOSIÇÃO (Preferir):

User class:
├─ id: string
├─ email: string
├─ subscription: Subscription (composição)
├─ organization: Organization (composição)
└─ preferences: UserPreferences (composição)

Subscription class:
├─ plan: Plan
├─ billingStrategy: BillingStrategy
└─ status: SubscriptionStatus

→ Simples
→ Flexível
→ Fácil de estender
→ Mudanças são isoladas
```

### 5.2 Padrão: Composition Root

```
CONCEITO:

Criar objeto raiz que compõe todas as dependências:

class AppComposition {
  // Singletons
  private supabase = new SupabaseClient()
  private logger = new Logger()
  private cache = new CacheService()

  // Repositories
  getUserRepository() {
    return new UserRepository(this.supabase)
  }

  getOrganizationRepository() {
    return new OrganizationRepository(this.supabase)
  }

  // Services
  getUserService() {
    return new UserService(
      this.getUserRepository(),
      this.logger,
      this.cache
    )
  }

  getOrganizationService() {
    return new OrganizationService(
      this.getOrganizationRepository(),
      this.getUserService(),
      this.logger
    )
  }

  // Export todo pronto
  export() {
    return {
      userService: this.getUserService(),
      organizationService: this.getOrganizationService(),
      supabase: this.supabase,
      logger: this.logger
    }
  }
}

// Uso:
const composition = new AppComposition()
const services = composition.export()

// Todo pronto com dependências injetadas
services.userService.getAll()
```

---

## 6. PADRÕES EM REACT ESPECÍFICOS

### 6.1 Custom Hooks Pattern

```
CONCEITO:

Custom hooks encapsulam lógica reutilizável:

Hook = Lógica + Estado + Effects

useUser hook:
├─ Estado: user, loading, error
├─ Effect: Carregar usuário ao montar
├─ Cleanup: Cancelar requisição ao desmontar
└─ Return: { user, loading, error, refetch }

Uso:
const { user, loading } = useUser(userId)

→ Lógica reutilizável
→ Simples de usar
→ Fácil testar
```

### 6.2 Render Props Pattern

```
CONCEITO:

Componente que renderiza prop passada:

<RoleGuard
  requiredRole="admin"
  fallback={<AccessDenied />}
>
  {(hasRole) => (
    <div>
      {hasRole ? <AdminPanel /> : null}
    </div>
  )}
</RoleGuard>

IMPLEMENTAÇÃO:

type RoleGuardProps = {
  requiredRole: string
  children: (hasRole: boolean) => React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ requiredRole, children, fallback }: RoleGuardProps) {
  const { roles } = useAuth()
  const hasRole = roles.includes(requiredRole)

  return hasRole ? children(true) : (fallback || null)
}

→ Flexibilidade máxima
→ Acesso a estado do guard
→ Composição poderosa
```

### 6.3 Higher-Order Component (HOC) Pattern

```
CONCEITO:

Função que pega componente e retorna versão melhorada:

function withAuth<P>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth()

    if (loading) return <Loading />
    if (!isAuthenticated) return <Redirect to="/login" />

    return <Component {...props} />
  }
}

// Uso:
const ProtectedDashboard = withAuth(Dashboard)

<ProtectedDashboard />

→ Reutilizável em múltiplos componentes
→ Lógica centralizada
→ Type-safe com TypeScript
```

### 6.4 Compound Components Pattern

```
CONCEITO:

Múltiplos componentes que trabalham juntos, compartilhando contexto:

EXEMPLO: Form Compound

<Form onSubmit={handleSubmit}>
  <Form.Field name="email">
    <Form.Label>Email</Form.Label>
    <Form.Input type="email" />
    <Form.Error />
  </Form.Field>

  <Form.Field name="password">
    <Form.Label>Senha</Form.Label>
    <Form.Input type="password" />
    <Form.Error />
  </Form.Field>

  <Form.Submit>Enviar</Form.Submit>
</Form>

IMPLEMENTAÇÃO:

export const Form = Object.assign(
  function Form({ onSubmit, children }: FormProps) {
    const [values, setValues] = useState({})
    const [errors, setErrors] = useState({})

    return (
      <FormContext.Provider value={{ values, setValues, errors, setErrors }}>
        <form onSubmit={onSubmit}>
          {children}
        </form>
      </FormContext.Provider>
    )
  },
  {
    Field: FormField,
    Label: FormLabel,
    Input: FormInput,
    Error: FormError,
    Submit: FormSubmit
  }
)

→ API clara e legível
→ Componentes compartilham estado via contexto
→ Flexibilidade máxima
→ Tudo junto e protegido
```

---

## 7. TESTABILIDADE COM POO

### 7.1 Estrutura Testável

```
PADRÃO:

Injetar dependências permite mocks fáceis:

// Service a testar
class UserService {
  constructor(
    private repository: UserRepository,
    private emailService: EmailService,
    private logger: Logger
  ) {}

  async createUser(email: string): Promise<User> {
    const user = await this.repository.create({ email })
    await this.emailService.send(email, 'Welcome!')
    this.logger.info(`User created: ${user.id}`)
    return user
  }
}

// Teste
describe('UserService', () => {
  it('should create user and send email', async () => {
    // Mock das dependências
    const mockRepository = {
      create: jest.fn().mockResolvedValue({ id: '123', email: 'test@example.com' })
    }
    const mockEmailService = {
      send: jest.fn().mockResolvedValue(undefined)
    }
    const mockLogger = {
      info: jest.fn()
    }

    // Injetar mocks
    const service = new UserService(
      mockRepository,
      mockEmailService,
      mockLogger
    )

    // Executar
    const user = await service.createUser('test@example.com')

    // Validar
    expect(mockRepository.create).toHaveBeenCalledWith({ email: 'test@example.com' })
    expect(mockEmailService.send).toHaveBeenCalledWith('test@example.com', 'Welcome!')
    expect(user.id).toBe('123')
  })
})

→ Fácil criar mocks
→ Teste isolado
→ Sem dependências reais
```

---

## 8. PADRÃO: RESULTADO/RESPOSTA

### 8.1 Pattern: Result Type

```
CONCEITO:

Em vez de lançar exceções, retornar objeto com resultado:

❌ ERRADO - Exceções:

async function createUser(email: string): Promise<User> {
  if (!isValidEmail(email)) {
    throw new ValidationError('Email inválido')
  }
  return db.create(...)
}

// Uso requer try/catch
try {
  const user = await createUser(email)
} catch (error) {
  // Erro de rede? Erro de validação? Erro do banco?
  // Não fica claro
}

✅ CORRETO - Result type:

type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }

type CreateUserError = 'InvalidEmail' | 'EmailExists' | 'ServerError'

async function createUser(email: string): Promise<Result<User, CreateUserError>> {
  if (!isValidEmail(email)) {
    return { ok: false, error: 'InvalidEmail' }
  }

  const exists = await db.findByEmail(email)
  if (exists) {
    return { ok: false, error: 'EmailExists' }
  }

  const user = await db.create({ email })
  return { ok: true, value: user }
}

// Uso:
const result = await createUser(email)

if (result.ok) {
  console.log('Usuário criado:', result.value)
} else {
  switch (result.error) {
    case 'InvalidEmail':
      showError('Email inválido')
      break
    case 'EmailExists':
      showError('Email já existe')
      break
    case 'ServerError':
      showError('Erro no servidor')
  }
}

→ Type-safe
→ Explícito sobre possíveis erros
→ Sem exceções (mais performance)
→ Código mais legível
```

---

## 9. INTEGRAÇÃO COM REACT

### 9.1 Arquitetura Completa

```
APLICAÇÃO FUNCIONAL:

Components (React)
     │
     ├─ useAuth() hook
     ├─ useOrganization() hook
     ├─ usePermissions() hook
     └─ usePreferences() hook
            │
            ▼
Context Providers (State Management)
     │
     ├─ AuthContext (usuário, autenticação)
     ├─ OrganizationContext (tenant, org atual)
     ├─ PermissionsContext (roles, permissions)
     └─ PreferencesContext (tema, idioma)
            │
            ▼
Services (Business Logic)
     │
     ├─ UserService
     ├─ OrganizationService
     ├─ BillingService
     ├─ PermissionsService
     └─ OnboardingService
            │
            ▼
Repositories (Data Access)
     │
     ├─ UserRepository
     ├─ OrganizationRepository
     ├─ BillingRepository
     └─ OnboardingRepository
            │
            ▼
Validators (Validation)
     │
     ├─ UserValidator
     ├─ OrganizationValidator
     └─ PlanValidator
            │
            ▼
Supabase Client (API)
     │
     ├─ Auth
     ├─ Database
     ├─ RLS Policies
     └─ Webhooks
            │
            ▼
Supabase Backend
     │
     ├─ PostgreSQL Database
     ├─ Real-time Updates
     └─ Webhooks/Functions
```

### 9.2 Data Flow Concreto

```
USER CLICA "UPGRADE TO PRO"
│
▼
Component <UpgradeButton />
  – onClick={() => handleUpgrade()}
│
▼
Handler chaama Service
  – organizationService.upgradePlan('pro')
│
▼
Service (Business Logic)
  – validatePlan()
  – checkPaymentMethod()
  – calculatePrice()
  – repository.updateSubscription()
│
▼
Repository (Data Access)
  – supabase.from('subscriptions').update(...)
│
▼
Supabase Backend
  – Validate RLS (admin check)
  – Update database
  – Trigger payment processing
│
▼
Webhook (Success)
  – Send to EventEmitter
  – PermissionsContext updates
  – FeatureFlags recalculated
│
▼
Component re-renders
  – Mostra novo plano
  – Ativa novos recursos
```

---

## RESUMO: CHECKLIST POO

### Design Principles
- ☐ Single Responsibility: Cada classe tem um propósito
- ☐ Open/Closed: Aberto para extensão, fechado para modificação
- ☐ Liskov Substitution: Subclasses honram contrato
- ☐ Interface Segregation: Interfaces pequenas e focadas
- ☐ Dependency Inversion: Depender de abstrações

### Design Patterns
- ☐ Singleton: Uma instância
- ☐ Factory: Criar sem especificar classe
- ☐ Strategy: Algoritmos intercambiáveis
- ☐ Observer: Notificar múltiplos
- ☐ Decorator: Adicionar funcionalidade
- ☐ Command: Encapsular requisições

### Estrutura em Camadas
- ☐ Services: Lógica de negócio
- ☐ Repositories: Acesso a dados
- ☐ Validators: Validações
- ☐ Contexts: Estado global
- ☐ Components: Apresentação

### Testabilidade
- ☐ Injetar dependências
- ☐ Interfaces para mocks
- ☐ Resultado types (não exceções)
- ☐ Componentes isoláveis

### React Patterns
- ☐ Custom Hooks
- ☐ HOCs
- ☐ Render Props
- ☐ Compound Components
- ☐ Context + Reducer

Este guia fornece base sólida para código profissional, escalável e testável.
