# Implementação de Features do App - Onboarding, Estado, Mobile-first, POO & Multi-tenant

## Visão Geral

Este documento descreve como integrar as features principais do SaaS Minimal com a arquitetura RBAC existente:

- **Onboarding**: Fluxo de boas-vindas para novos usuários
- **Gestão de Estado**: Centralização de dados da aplicação
- **Mobile-first**: Navegação e layout otimizados para mobile
- **POO & Design Patterns**: Arquitetura orientada a objetos com padrões
- **Multi-tenant**: Suporte para múltiplas organizações por usuário
- **Planos/Billing**: Gestão de assinaturas e permissões por plano

---

## 1. ONBOARDING

### 1.1 Conceito

Onboarding é o fluxo de boas-vindas que guia o usuário desde a criação da conta até estar pronto para usar o app.

**Propósito**:
- Coletar informações essenciais
- Criar organização inicial (tenant)
- Configurar preferências básicas
- Treinar usuário com tutorial
- Reduzir tempo até primeira ação

### 1.2 Estrutura do Fluxo de Onboarding

```
Usuário faz signup
       │
       ▼
┌─────────────────────────────────┐
│ 1. VERIFY EMAIL                 │
├─────────────────────────────────┤
│ Ação: Confirmar email           │
│ Obrigatório: SIM                │
│ Dados coletados: (nenhum)       │
│ Próximo passo: Automático       │
│ Duração: 5-10 minutos           │
└────┬────────────────────────────┘
     │ Email confirmado
     ▼
┌─────────────────────────────────┐
│ 2. CREATE PROFILE               │
├─────────────────────────────────┤
│ Ação: Preencher dados pessoais  │
│ Obrigatório: Nome, Foto         │
│ Opcional: Bio, Telefone         │
│ Próximo passo: Manual (Skip OK) │
│ Duração: 2-5 minutos            │
└────┬────────────────────────────┘
     │ Perfil criado
     ▼
┌─────────────────────────────────┐
│ 3. CREATE ORGANIZATION          │
├─────────────────────────────────┤
│ Ação: Criar organização (tenant)│
│ Obrigatório: Nome da org        │
│ Opcional: Logo, Descrição       │
│ Próximo passo: Manual           │
│ Duração: 2-3 minutos            │
└────┬────────────────────────────┘
     │ Organização criada
     ▼
┌─────────────────────────────────┐
│ 4. SELECT PLAN                  │
├─────────────────────────────────┤
│ Ação: Escolher plano            │
│ Obrigatório: SIM                │
│ Padrão: Free/Trial              │
│ Próximo passo: Manual           │
│ Duração: 2-5 minutos            │
└────┬────────────────────────────┘
     │ Plano selecionado
     ▼
┌─────────────────────────────────┐
│ 5. CONFIGURE BASICS             │
├─────────────────────────────────┤
│ Ação: Configurar preferências   │
│ Obrigatório: Nenhum             │
│ Opcional: Timezone, Notifs      │
│ Próximo passo: Manual (Skip OK) │
│ Duração: 2-3 minutos            │
└────┬────────────────────────────┘
     │ Configurações salvas
     ▼
┌─────────────────────────────────┐
│ 6. TUTORIAL / WELCOME           │
├─────────────────────────────────┤
│ Ação: Introduzir features       │
│ Obrigatório: Não                │
│ Formato: Tour interativo        │
│ Próximo passo: Manual (Skip OK) │
│ Duração: 5-10 minutos           │
└────┬────────────────────────────┘
     │ Tour completo
     ▼
   DASHBOARD (Onboarding finalizado)
```

### 1.3 Estados do Onboarding

Cada usuário tem um estado de onboarding:

```
ESTADOS:
├─ "not_started"         → Acabou de criar conta
├─ "email_verifying"     → Aguardando confirmação de email
├─ "email_verified"      → Email confirmado, pronto para perfil
├─ "profile_created"     → Perfil preenchido
├─ "organization_created" → Organização criada
├─ "plan_selected"       → Plano escolhido
├─ "configured"          → Configurações básicas feitas
├─ "tutorial_completed"  → Tutorial visto
└─ "completed"           → Onboarding finalizado, pode usar app

TRANSIÇÕES:
"not_started" → "email_verifying" → "email_verified" → "profile_created" →
"organization_created" → "plan_selected" → "configured" → "tutorial_completed" → "completed"
```

### 1.4 Proteção de Rotas - Onboarding

```
Usuário autenticado tenta acessar /dashboard
       │
       ▼
Verifica: onboarding_status == "completed"?
       │
       ├─ NÃO (em qualquer estado intermediário)
       │   │
       │   ▼
       │ Redireciona para próximo passo
       │   - Estado "email_verified" → /onboarding/profile
       │   - Estado "profile_created" → /onboarding/organization
       │   - Estado "organization_created" → /onboarding/plan
       │   - Etc.
       │
       └─ SIM
           │
           ▼
       Acessa dashboard normalmente
```

### 1.5 Dados de Onboarding

Tabela no banco: `onboarding_state`

```
Colunas:
├─ user_id (uuid)              → Quem está fazendo onboarding
├─ current_step (string)       → Passo atual (verify_email, create_profile, etc)
├─ completed_steps (array)     → Passos já completados
├─ status (string)             → not_started, in_progress, completed
├─ organization_id (uuid)      → Organização criada durante onboarding
├─ plan_selected (string)      → Plano escolhido (free, pro, enterprise)
├─ metadata (json)             → Dados temporários (nome inserido, etc)
├─ started_at (timestamp)      → Quando iniciou
├─ completed_at (timestamp)    → Quando finalizou
└─ expires_at (timestamp)      → Quando expira (abandonado)
```

### 1.6 Padrão: State Machine

O onboarding é um **State Machine** (máquina de estados):

```
Estados:
├─ Initial State: "not_started"
├─ Transitions: Regras de mudança entre estados
├─ Final State: "completed"
└─ Triggers: Ações do usuário que causam transições

Exemplo:
State "email_verifying" + Action "user confirms email" → State "email_verified"
State "email_verified" + Action "user fills profile" → State "profile_created"
```

Implementação: Usar padrão State Pattern (GoF)

---

## 2. GESTÃO DE ESTADO

### 2.1 Necessidade de Estado Global

A aplicação precisa gerenciar:

```
DADOS QUE PRECISAM SER COMPARTILHADOS:

1. AUTENTICAÇÃO
   ├─ user_id
   ├─ email
   ├─ is_authenticated
   ├─ roles
   └─ claims (JWT)

2. ORGANIZAÇÃO (TENANT)
   ├─ current_organization_id
   ├─ organization_name
   ├─ organization_logo
   ├─ organization_role (admin, member, viewer)
   └─ organization_plan

3. PERMISSÕES
   ├─ user_roles
   ├─ user_permissions
   ├─ organization_permissions
   └─ feature_flags

4. ONBOARDING
   ├─ onboarding_status
   ├─ completed_steps
   └─ current_step

5. PREFERÊNCIAS
   ├─ theme (light/dark)
   ├─ language
   ├─ timezone
   ├─ notifications_enabled
   └─ sidebar_collapsed

6. DADOS DO USUÁRIO
   ├─ profile_data
   ├─ organizations_list
   └─ subscription_info
```

### 2.2 Padrão de Gestão de Estado

**Arquitetura Recomendada: Context + Reducer + Hooks**

```
CAMADAS:

1. STORE LAYER (Centralized State)
   ├─ Auth Context
   ├─ Organization Context
   ├─ Permissions Context
   └─ Preferences Context

2. REDUCER LAYER (State Logic)
   ├─ Auth Reducer
   ├─ Organization Reducer
   ├─ Permissions Reducer
   └─ Preferences Reducer

3. HOOK LAYER (Custom Hooks)
   ├─ useAuth()
   ├─ useOrganization()
   ├─ usePermissions()
   └─ usePreferences()

4. COMPONENT LAYER (Consumers)
   ├─ Componentes client
   └─ Server components (não usam context)
```

### 2.3 Estrutura de um Context

Cada contexto segue padrão:

```
PADRÃO DE CONTEXTO:

1. TYPES
   ├─ State interface
   ├─ Action types (enums)
   ├─ Action payloads
   └─ Context interface

2. INITIAL STATE
   └─ Valores padrão

3. REDUCER
   └─ Função que processa actions

4. PROVIDER COMPONENT
   ├─ useReducer hook
   ├─ Fetch inicial de dados
   ├─ Memorização de valor
   └─ Render children

5. CUSTOM HOOK
   ├─ useContext
   ├─ Validação de contexto
   └─ Retorna state + dispatch

FLUXO:
Component → Hook (useAuth) → Context → Reducer → State Update → Re-render
```

### 2.4 Sincronização com Servidor

Estado local deve estar sincronizado com servidor:

```
PADRÃO:

1. ESTADO OTIMISTA (Optimistic Update)
   ├─ Usuário faz ação
   ├─ Estado local é atualizado imediatamente
   ├─ Server action é chamado em background
   ├─ Se sucesso: mantém estado local
   └─ Se erro: reverte para estado anterior

2. ESTADO BASEADO EM DADOS (Data-driven)
   ├─ Apenas servidor é source of truth
   ├─ Local armazena cópia
   ├─ Mudanças são sempre revalidadas
   └─ Cache com TTL (time-to-live)

3. ESTADO PERSISTENTE (Persisted State)
   ├─ Salvo em localStorage (após confirmação do servidor)
   ├─ Restaurado ao recarregar página
   ├─ Validado ao inicializar
   └─ Limpo no logout
```

### 2.5 Padrão: Observer Pattern

Contextos funcionam como **Observers** (GoF):

```
Múltiplos componentes observam o mesmo estado:

Component A ──┐
Component B ──├──→ Context ──→ [State Change] ──→ Notifica observers
Component C ──┤                  └─ Component A re-render
              └─ [Dispatch Action]  └─ Component B re-render
                                     └─ Component C re-render
```

---

## 3. MOBILE-FIRST & NAVEGAÇÃO

### 3.1 Princípios Mobile-first

A aplicação é desenvolvida primeiramente para mobile, depois adaptada para desktop.

```
BREAKPOINTS (Tailwind):
├─ sm: 640px
├─ md: 768px
├─ lg: 1024px
├─ xl: 1280px
└─ 2xl: 1536px

FILOSOFIA:
- Mobile: 100% width, single column
- Tablet: 2 columns, responsive
- Desktop: 3+ columns, sidebar
```

### 3.2 Navegação Estilo App (Bottom Navigation)

Padrão de aplicativos móveis: navegação em barra inferior.

```
ESTRUTURA VISUAL:

Desktop:
┌─────────────────────────────────┐
│  Logo    │  Nav Menu            │  Navbar
├─────────────────────────────────┤
│          │                       │
│ Sidebar  │   Main Content        │  Layout
│ (menu)   │                       │
│          │                       │
├─────────────────────────────────┤

Mobile:
┌──────────────────────┐
│  Logo / Page Title   │  Header (colapsado)
├──────────────────────┤
│                      │
│   Main Content       │  Main (full width)
│   (full width)       │
│                      │
│                      │
├──────────────────────┤
│ 🏠 📊 ⚙️ 👤 ☰        │  Bottom Navigation (5 itens)
└──────────────────────┘

ITENS COMUNS:
├─ Home (Dashboard)
├─ Explore/Search
├─ Create/Actions
├─ Notifications
├─ Profile/Settings
└─ Menu (mais opções)
```

### 3.3 Componentes Mobile-first

Cada componente é responsivo:

```
PADRÃO:

md: (Tailwind breakpoint)
├─ sm: < 768px (mobile view)
├─ md: >= 768px (tablet view)
└─ lg: >= 1024px (desktop view)

EXEMPLO DE COMPONENTE:
┌─────────────────────────────────┐
│ Card Mobile:                    │
│ ├─ w-full (full width)          │
│ ├─ p-4 (small padding)          │
│ └─ No sidebar                   │
│                                 │
│ Card Desktop:                   │
│ ├─ w-[calc(100%-256px)] (com sidebar)
│ ├─ p-6 (generous padding)       │
│ └─ Sidebar visível              │
└─────────────────────────────────┘
```

### 3.4 Padrão: Responsive Layout Component

```
PADRÃO:

ResponsiveLayout Component:
├─ Header
│  ├─ Mobile: Logo + hambúrguer
│  ├─ Desktop: Logo + navbar
│  └─ Sempre visível
│
├─ Sidebar (Desktop) / Drawer (Mobile)
│  ├─ Mobile: Hidden, abre com hambúrguer
│  ├─ Desktop: Sempre visível
│  └─ Sticky ou overlay
│
├─ Main Content
│  ├─ Mobile: Full width
│  ├─ Desktop: Flex 1, com margin para sidebar
│  └─ Scrollable
│
└─ Bottom Navigation (Mobile) / Top Menu (Desktop)
   ├─ Mobile: Fixed na base
   ├─ Desktop: Integrada no header/sidebar
   └─ Sempre acessível
```

### 3.5 Touch & Interaction

Mobile-first requer diferentes interações:

```
TOQUES:
├─ Tap (clique): > 44x44px (Apple standard)
├─ Long press: Ações secundárias
├─ Swipe: Navegação ou delete
└─ Pull: Refresh

DIFERENÇAS:
├─ Hover: Não existe em touch
│  └─ Usar `:active` ou `focus` em vez disso
├─ Click: Funciona em touch (com 300ms delay)
│  └─ Use `onTouchEnd` para resposta imediata
└─ Gestures: Swipe, pinch, rotate (opcional)
```

---

## 4. POO & DESIGN PATTERNS

### 4.1 Princípios SOLID

```
S - Single Responsibility Principle (SRP)
    └─ Cada classe/componente tem uma única responsabilidade
    └─ Exemplo: UserService (gestão de usuários), OrganizationService (gestão de org)

O - Open/Closed Principle (OCP)
    └─ Aberto para extensão, fechado para modificação
    └─ Exemplo: BaseService com métodos genéricos, subclasses especializam

L - Liskov Substitution Principle (LSP)
    └─ Subclasses podem substituir superclasses
    └─ Exemplo: AllPermissionsValidator, RolePermissionsValidator (ambas implementam interface)

I - Interface Segregation Principle (ISP)
    └─ Clientes não devem depender de interfaces que não usam
    └─ Exemplo: AuthService (apenas métodos de auth), não um "megaservice"

D - Dependency Inversion Principle (DIP)
    └─ Depender de abstrações, não de concretizações
    └─ Exemplo: Injetar repositórios no service, não instanciar dentro
```

### 4.2 Design Patterns Recomendados

#### Pattern 1: Factory Pattern

**Objetivo**: Criar objetos sem especificar suas classes concretas

```
Caso de uso: Criar diferentes tipos de validadores

PlanValidatorFactory:
├─ createValidator(planType: 'free' | 'pro' | 'enterprise')
├─ Retorna: PlanValidator interface
│
└─ Subclasses:
   ├─ FreeplanValidator
   ├─ ProplanValidator
   └─ EnterprisePlanValidator
```

#### Pattern 2: Strategy Pattern

**Objetivo**: Encapsular diferentes algoritmos

```
Caso de uso: Diferentes estratégias de billing

BillingStrategy interface:
├─ calculatePrice(basePrice: number): number
│
├─ Implementations:
│  ├─ MonthlybillingStrategy (sem desconto)
│  ├─ AnnualbillingStrategy (desconto anual)
│  └─ EnterpriseBillingStrategy (custom)
│
└─ Uso:
   subscription.strategy = new AnnualBillingStrategy()
   finalPrice = subscription.calculatePrice(99)
```

#### Pattern 3: Observer Pattern

**Objetivo**: Notificar múltiplos objetos sobre mudanças

```
Caso de uso: Contextos React com múltiplos subscribers

Subject: OrganizationContext
├─ Observers: Múltiplos componentes
│
└─ Quando organização muda:
   ├─ Notifica Header
   ├─ Notifica Sidebar
   ├─ Notifica Dashboard
   └─ Etc.
```

#### Pattern 4: Dependency Injection

**Objetivo**: Desacoplar classes, facilitar testes

```
Caso de uso: AuthService com dependências

AuthService(
  supabaseClient: SupabaseClient,
  userRepository: UserRepository,
  tokenService: TokenService
)

Benefícios:
├─ Fácil de testar (pode fazer mock)
├─ Desacoplado de implementações
└─ Flexível para mudanças
```

#### Pattern 5: Decorator Pattern

**Objetivo**: Adicionar funcionalidade a objetos dinamicamente

```
Caso de uso: Adicionar logging, caching, permissões a métodos

@RequiresAuth()
@RequiresRole('admin')
@CacheFor(5minutes)
getUsersList(): Promise<User[]>
└─ Stacks de responsabilidades: auth → role → cache → executa
```

#### Pattern 6: Command Pattern

**Objetivo**: Encapsular requisições como objetos

```
Caso de uso: Fila de ações, undo/redo, auditoria

UpdateUserCommand:
├─ execute(): void
├─ undo(): void
└─ Auditável e rastreável
```

### 4.3 Estrutura Orientada a Objetos em React

```
PADRÃO:

1. SERVICES (Lógica de negócio)
   ├─ BaseService (abstrato)
   │  ├─ constructor(repository)
   │  ├─ getAll(): Promise<T[]>
   │  └─ create(data): Promise<T>
   │
   ├─ UserService extends BaseService
   ├─ OrganizationService extends BaseService
   └─ BillingService extends BaseService

2. REPOSITORIES (Acesso a dados)
   ├─ BaseRepository (abstrato)
   │  ├─ find(id): Promise<T>
   │  ├─ findAll(): Promise<T[]>
   │  ├─ create(data): Promise<T>
   │  └─ update(id, data): Promise<T>
   │
   ├─ UserRepository extends BaseRepository
   ├─ OrganizationRepository extends BaseRepository
   └─ BillingRepository extends BaseRepository

3. VALIDATORS (Validações)
   ├─ BaseValidator (abstrato)
   │  ├─ validate(data): ValidationResult
   │
   ├─ UserValidator extends BaseValidator
   ├─ OrganizationValidator extends BaseValidator
   └─ PlanValidator extends BaseValidator

4. CONTEXTS (Estado global)
   ├─ AuthContext
   ├─ OrganizationContext
   ├─ PermissionsContext
   └─ PreferencesContext

5. COMPONENTS (Apresentação)
   ├─ Functional components
   ├─ Utilizam hooks
   └─ Consomem contexts/services
```

### 4.4 Padrão de Componentes

```
ESTRUTURA DE COMPONENTE:

type ComponentProps = {
  // Props obrigatórias
  title: string
  onAction: (data: T) => void

  // Props opcionais
  subtitle?: string
  variant?: 'primary' | 'secondary'
}

export default function Component({ title, onAction, ... }: ComponentProps) {
  // 1. Hooks (useState, useContext, useEffect)
  const context = useContext(SomeContext)
  const [state, setState] = useState(initial)

  // 2. Event handlers
  const handleClick = () => { ... }

  // 3. Render logic
  return <div>...</div>
}
```

---

## 5. MULTI-TENANT (ORGANIZAÇÕES)

### 5.1 Conceito

Multi-tenant: Um usuário pode ter múltiplas organizações.

```
RELAÇÃO:

User (1) ──→ (N) Organization
  │
  ├─ Organization A
  │  ├─ Dados isolados
  │  ├─ Usuários/Membros próprios
  │  ├─ Permissões próprias
  │  └─ Plano próprio
  │
  ├─ Organization B
  │  ├─ Dados isolados
  │  ├─ Usuários/Membros próprios
  │  ├─ Permissões próprias
  │  └─ Plano próprio
  │
  └─ Organization C
     ├─ Dados isolados
     ├─ Usuários/Membros próprios
     ├─ Permissões próprias
     └─ Plano próprio

ISOLAMENTO:
└─ Dados de Org A nunca são acessíveis por Org B
   (via RLS no banco de dados)
```

### 5.2 Tabelas Multi-tenant

```
TABELAS BASE:

organizations:
├─ id (uuid) ← Primary key
├─ owner_id (uuid) ← Quem criou
├─ name (string)
├─ logo_url (string)
├─ plan (string) ← free, pro, enterprise
├─ created_at (timestamp)
└─ updated_at (timestamp)

organization_members:
├─ organization_id (uuid)
├─ user_id (uuid)
├─ role (string) ← admin, member, viewer
├─ joined_at (timestamp)
├─ permissions (array) ← Permissões específicas da org
└─ PRIMARY KEY: (organization_id, user_id)

user_organization_invites:
├─ id (uuid)
├─ organization_id (uuid)
├─ email (string)
├─ role (string)
├─ token (string) ← Token único para aceitar convite
├─ expires_at (timestamp)
└─ created_at (timestamp)

organization_settings:
├─ organization_id (uuid)
├─ branding_color (string)
├─ timezone (string)
├─ language (string)
├─ notification_settings (json)
└─ PRIMARY KEY: organization_id
```

### 5.3 Contexto Atual de Organização

Usuário está sempre em uma organização:

```
FLUXO:

Usuário login
│
├─ Supabase Auth (global)
│
└─ App Context (organização)
   │
   ├─ Se primeira vez: criar organização padrão
   │
   ├─ Salvar: current_organization_id em contexto
   │
   └─ Usar em:
      ├─ Queries (filtradas por org_id)
      ├─ Permissões (validadas por org)
      ├─ URL (opcional: /org/[org_id]/dashboard)
      └─ RLS (automaticamente filtrados)

MUDANÇA DE ORGANIZAÇÃO:
│
├─ User clica "Mudar org"
├─ Seleciona nova organização
├─ Context atualiza current_organization_id
├─ Página redireciona para dashboard
└─ Todos os dados são re-carregados (novo contexto)
```

### 5.4 RLS para Multi-tenant

```
POLÍTICA RLS:

SELECT policy on data_table:
  User pode ler:
  ├─ data.organization_id == auth.uid() (?) [se for owner]
  └─ OR data.organization_id IN (select org_id from organization_members
     where user_id = auth.uid())

  └─ Resultado: Usuário vê apenas dados de suas organizações

UPDATE policy on data_table:
  User pode atualizar se:
  └─ É admin da organização
     (organization_members.role = 'admin' AND
      organization_members.organization_id = data.organization_id)

DELETE policy on data_table:
  User pode deletar se:
  └─ É owner da organização ou admin
```

### 5.5 Padrão: Tenant Isolation

```
PADRÃO:

Toda operação começa verificando:

1. User está autenticado?
   └─ Middleware (JWT)

2. User tem acesso à organização?
   └─ organization_members check

3. User tem permissão para a ação?
   └─ role/permissions check

4. Dados pertencem à organização?
   └─ RLS filtra automaticamente

CAMADAS:
Middleware → Context → Service → Repository → RLS (banco)
```

---

## 6. PLANOS & BILLING

### 6.1 Modelos de Plano

```
PLANOS SUPORTADOS:

Free:
├─ Preço: $0
├─ Limite de usuários: 3
├─ Limite de features: Básicas
├─ Storage: 1GB
├─ Suporte: Community
└─ Ciclo: Não expira

Pro:
├─ Preço: $29/mês
├─ Limite de usuários: 20
├─ Limite de features: Todas
├─ Storage: 100GB
├─ Suporte: Email
└─ Ciclo: Mensal ou Anual (-20%)

Enterprise:
├─ Preço: Custom
├─ Limite de usuários: Ilimitados
├─ Limite de features: Tudo + Custom
├─ Storage: Ilimitado
├─ Suporte: 24/7 + Dedicated
└─ Ciclo: Anual + contrato
```

### 6.2 Tabelas de Billing

```
subscriptions:
├─ id (uuid)
├─ organization_id (uuid)
├─ plan (string) ← free, pro, enterprise
├─ status (string) ← active, canceled, expired
├─ billing_cycle (string) ← monthly, annual
├─ payment_method_id (string) ← Stripe/Paddle
├─ current_period_start (date)
├─ current_period_end (date)
├─ canceled_at (timestamp)
└─ created_at (timestamp)

invoices:
├─ id (uuid)
├─ subscription_id (uuid)
├─ organization_id (uuid)
├─ amount (decimal)
├─ currency (string)
├─ status (string) ← paid, pending, failed
├─ issued_at (date)
├─ due_at (date)
├─ paid_at (date)
└─ payment_id (string) ← Stripe/Paddle

usage_logs:
├─ id (uuid)
├─ organization_id (uuid)
├─ feature (string) ← "api_calls", "storage", "users"
├─ amount (integer)
├─ period (date)
└─ timestamp (timestamp)
```

### 6.3 Feature Flags por Plano

```
PADRÃO:

Cada feature é gateada por plano:

isFeatureEnabled(feature: string, plan: Plan): boolean

MAPEAMENTO:
├─ 'advanced_analytics'   → Pro, Enterprise
├─ 'api_access'           → Pro, Enterprise
├─ 'custom_branding'      → Enterprise
├─ 'team_collaboration'   → Pro, Enterprise
├─ 'sso'                  → Enterprise
└─ 'api_webhooks'         → Enterprise

VERIFICAÇÃO:
User tenta acessar feature
  │
  ├─ Qual é o plano da organização?
  ├─ Feature está disponível neste plano?
  │
  ├─ SIM → Mostra feature
  └─ NÃO → Mostra "Upgrade required"
```

### 6.4 Validação de Limites

```
PADRÃO:

Organization tem limites baseados no plano:

getOrganizationLimits(plan: Plan):
├─ max_users
├─ max_storage_gb
├─ max_api_calls_per_month
├─ max_projects
├─ max_custom_domains
└─ Etc.

VERIFICAÇÃO:
Admin tenta adicionar usuário 21
  │
  ├─ Plano Pro tem max_users = 20?
  ├─ Usuários atuais: 20
  │
  ├─ SIM, atingiu limite
  │  └─ Mostra: "Upgrade to Enterprise"
  │
  └─ NÃO, espaço disponível
     └─ Adiciona usuário
```

---

## 7. INTEGRAÇÃO: COMO TUDO FUNCIONA JUNTO

### 7.1 Fluxo Completo: Novo Usuário

```
1. SIGNUP (Anônimo)
   ├─ Supabase Auth: Cria auth.users
   ├─ Email confirmado
   └─ User pode acessar /onboarding

2. ONBOARDING (Estado Machine)
   ├─ Step 1: Verify Email (automático)
   │  └─ Supabase envia email com token
   │
   ├─ Step 2: Create Profile
   │  ├─ Cria ou atualiza auth.users metadata
   │  └─ Salva em onboarding_state
   │
   ├─ Step 3: Create Organization
   │  ├─ Cria row em organizations
   │  ├─ Adiciona user em organization_members (role=owner)
   │  ├─ Salva organization_id em onboarding_state
   │  └─ Atualiza context (current_organization_id)
   │
   ├─ Step 4: Select Plan
   │  ├─ Cria row em subscriptions (plan=free)
   │  └─ Salva em onboarding_state
   │
   ├─ Step 5: Configure Basics
   │  ├─ Cria row em organization_settings
   │  └─ Salva em onboarding_state
   │
   └─ Step 6: Tutorial
      └─ Completa onboarding_state (status=completed)

3. CONTEXTO INICIALIZADO
   ├─ AuthContext
   │  ├─ user_id
   │  ├─ email
   │  ├─ roles
   │  └─ is_authenticated: true
   │
   ├─ OrganizationContext
   │  ├─ current_organization_id
   │  ├─ organizations_list
   │  └─ current_role: "owner"
   │
   ├─ PermissionsContext
   │  ├─ user_permissions (todas, por ser owner)
   │  └─ feature_flags (todos para Free)
   │
   └─ PreferencesContext
      ├─ theme: "light"
      ├─ timezone: "UTC"
      └─ notifications: true

4. DASHBOARD ACESSÍVEL
   ├─ Middleware: JWT válido ✓
   ├─ Layout: onboarding_status == "completed" ✓
   ├─ Componentes: Renderizam com contextos
   └─ RLS: Filtra dados apenas dessa organização
```

### 7.2 Fluxo: Admin Convida Membro

```
1. ADMIN ACESSA /org/[org_id]/settings/members
   ├─ Verifica: role == 'admin' ✓
   ├─ Renderiza: Página de membros
   └─ Dados: Usa RLS para filtrar

2. ADMIN CLICA "CONVIDAR"
   ├─ Form: Email + Role
   │
   ├─ Server Action: createInvite
   │  ├─ Revalida: autenticado ✓
   │  ├─ Revalida: admin ✓
   │  ├─ Cria row em user_organization_invites
   │  ├─ Token único gerado
   │  └─ Email enviado (com token)
   │
   └─ Toast: "Convite enviado"

3. NOVO USUÁRIO RECEBE EMAIL
   ├─ Clica em link (com token)
   ├─ App detecta: accept_invite?
   │
   ├─ Se não autenticado:
   │  └─ Redireciona para /signup?token=xxx
   │
   └─ Se autenticado:
      └─ Redireciona para /accept-invite?token=xxx

4. NOVO USUÁRIO ACEITA CONVITE
   ├─ Server Action: acceptInvite
   │  ├─ Valida: token válido ✓
   │  ├─ Valida: não expirado ✓
   │  ├─ Insere em organization_members
   │  │  └─ user_id, organization_id, role, joined_at
   │  ├─ Deleta row de user_organization_invites
   │  └─ RLS: Novo usuário pode ler dados da org
   │
   └─ Toast: "Bem-vindo à organização!"

5. NOVO USUÁRIO ACESSA ORG
   ├─ Atualiza OrganizationContext
   │  └─ organizations_list inclui nova org
   │
   ├─ Pode selecionar a organização
   ├─ RLS filtra: Vê apenas dados dessa org
   └─ Permissões: Baseado em role ("member")
```

### 7.3 Fluxo: Usuário Muda de Plano

```
1. ADMIN ACESSA /org/[org_id]/settings/billing
   ├─ Verifica: role == 'admin' ✓
   ├─ Renderiza: Planos disponíveis
   └─ Mostra: Plano atual (Free)

2. ADMIN CLICA "UPGRADE TO PRO"
   ├─ Redirect: /checkout?plan=pro
   │
   ├─ Stripe/Paddle modal
   │  ├─ Mostra preço: $29/mês
   │  ├─ Pede método de pagamento
   │  └─ Usuário completa pagamento

3. PAGAMENTO PROCESSADO
   ├─ Webhook de Stripe/Paddle
   │  ├─ Status: "payment.success"
   │  ├─ Atualiza subscriptions
   │  │  └─ plan: "pro", status: "active"
   │  ├─ Atualiza organization_settings
   │  │  └─ plan_upgraded_at: timestamp
   │  └─ Cria invoice
   │
   ├─ Event dispatch: SubscriptionUpgraded
   │  ├─ OrganizationContext revalidado
   │  ├─ PermissionsContext atualizado
   │  └─ feature_flags renovados

4. INTERFACE ATUALIZADA
   ├─ Toast: "Upgrade bem-sucedido!"
   ├─ Dashboard mostra novos recursos
   ├─ Componentes gateados por plano aparecem
   └─ RLS permite novas operações
```

---

## 8. ESTRUTURA DE PASTAS ATUALIZADA

### 8.1 Novas Pastas

```
app/
├── (onboarding)/
│   ├── page.tsx                 # Onboarding entry
│   ├── [step]/
│   │   ├── page.tsx             # Cada passo
│   │   ├── verify-email/
│   │   ├── create-profile/
│   │   ├── create-organization/
│   │   ├── select-plan/
│   │   ├── configure-basics/
│   │   └── tutorial/
│   └── layout.tsx
│
├── (authenticated)/
│   ├── (rbac)/
│   │   └── [org_id]/            # Novo: org context na URL
│   │       ├── dashboard/
│   │       ├── [outros...]
│   │       └── layout.tsx
│   │
│   └── org-switcher/            # Componente para trocar org
│       └── page.tsx
│
lib/
├── state/                       # Novo: Gestão de estado
│   ├── context/
│   │   ├── auth-context.tsx
│   │   ├── organization-context.tsx
│   │   ├── permissions-context.tsx
│   │   ├── preferences-context.tsx
│   │   └── app-provider.tsx (combina todos)
│   │
│   ├── reducer/
│   │   ├── auth-reducer.ts
│   │   ├── organization-reducer.ts
│   │   ├── permissions-reducer.ts
│   │   └── preferences-reducer.ts
│   │
│   └── types/
│       ├── auth-state.ts
│       ├── organization-state.ts
│       ├── permissions-state.ts
│       └── preferences-state.ts
│
├── services/                    # Novo: Lógica de negócio
│   ├── base-service.ts          # Classe abstrata
│   ├── user-service.ts
│   ├── organization-service.ts
│   ├── billing-service.ts
│   ├── onboarding-service.ts
│   └── permissions-service.ts
│
├── repositories/                # Novo: Acesso a dados
│   ├── base-repository.ts
│   ├── user-repository.ts
│   ├── organization-repository.ts
│   ├── billing-repository.ts
│   └── onboarding-repository.ts
│
├── validators/                  # Novo: Validações
│   ├── base-validator.ts
│   ├── user-validator.ts
│   ├── organization-validator.ts
│   ├── plan-validator.ts
│   └── email-validator.ts
│
├── hooks/                       # Atualizado
│   ├── use-auth/
│   │   ├── use-auth.ts
│   │   ├── use-organization.ts  # Novo
│   │   ├── use-permissions.ts
│   │   ├── use-preferences.ts   # Novo
│   │   └── use-onboarding.ts    # Novo
│   │
│   └── use-mobile.ts
│
├── patterns/                    # Novo: Design patterns
│   ├── factory/
│   │   ├── plan-validator-factory.ts
│   │   └── strategy-factory.ts
│   │
│   ├── strategy/
│   │   ├── billing-strategy.ts
│   │   ├── monthly-billing.ts
│   │   ├── annual-billing.ts
│   │   └── enterprise-billing.ts
│   │
│   ├── observer/
│   │   └── event-emitter.ts
│   │
│   └── state/
│       ├── state-machine.ts
│       └── onboarding-state-machine.ts
│
└── mobile/                      # Novo: Utilitários mobile
    ├── responsive.ts
    ├── navigation.ts
    └── touch-handlers.ts

components/
├── layout/
│   ├── app-layout.tsx           # Novo: Layout com org + nav
│   ├── bottom-navigation.tsx    # Novo: Bottom nav mobile
│   ├── org-switcher.tsx         # Novo: Seletor de org
│   ├── mobile-header.tsx        # Novo: Header responsivo
│   └── [existentes...]
│
├── onboarding/                  # Novo
│   ├── onboarding-step.tsx      # Base para todos os steps
│   ├── verify-email-step.tsx
│   ├── profile-step.tsx
│   ├── organization-step.tsx
│   ├── plan-step.tsx
│   ├── settings-step.tsx
│   ├── tutorial-step.tsx
│   └── progress-indicator.tsx
│
├── billing/                     # Novo
│   ├── plan-selector.tsx
│   ├── plan-card.tsx
│   ├── billing-summary.tsx
│   ├── invoice-list.tsx
│   └── upgrade-cta.tsx
│
├── organization/                # Novo
│   ├── org-settings.tsx
│   ├── members-list.tsx
│   ├── invite-member-form.tsx
│   └── org-details-form.tsx
│
├── mobile/                      # Novo
│   ├── mobile-menu.tsx
│   ├── mobile-drawer.tsx
│   └── touch-card.tsx
│
└── [existentes...]

types/
├── onboarding.ts                # Novo
├── organization.ts              # Novo
├── billing.ts                   # Novo
├── mobile.ts                    # Novo
└── [existentes...]
```

---

## 9. FLUXO DE INICIALIZAÇÃO

### 9.1 Bootstrap da Aplicação

```
app/layout.tsx (Root)
  │
  ├─ 1. Load Environment
  │  └─ Validar NEXT_PUBLIC_SUPABASE_URL, etc
  │
  ├─ 2. Create Supabase Client
  │  └─ Browser client
  │
  ├─ 3. Render AppProvider
  │  ├─ ThemeProvider (dark mode)
  │  ├─ AuthProvider (autenticação)
  │  ├─ OrganizationProvider (tenant)
  │  ├─ PermissionsProvider (RBAC)
  │  └─ PreferencesProvider (user prefs)
  │
  └─ 4. Render children
     └─ App router (rotas)
```

### 9.2 AppProvider Component

```
AppProvider component:
├─ 1. Obter JWT do cookie
├─ 2. Validar token
│
├─ 3. Se válido:
│  ├─ getUser() para obter user_id
│  ├─ Carregar organizations_list
│  ├─ Selecionar organização padrão
│  ├─ Carregar roles e permissões
│  ├─ Carregar preferences
│  └─ Atualizar contextos
│
├─ 4. Se inválido:
│  ├─ Limpar contextos
│  └─ Redirecionar para /auth/login
│
└─ 5. Render children com contextos
```

### 9.3 Revalidação de Dados

```
ESTRATÉGIA:

1. INITIAL LOAD (App startup)
   └─ Carrega todos os dados

2. PERIODIC REFRESH (Background)
   └─ A cada 5 minutos: revalidate permissões

3. EVENT-BASED REFRESH (Mudanças)
   ├─ Usuário faz login: revalidate
   ├─ Muda de organização: revalidate
   ├─ Role é modificado: revalidate
   └─ Plano é modificado: revalidate

4. MANUAL REFRESH
   └─ User clica "Refresh"
```

---

## 10. PADRÃO DE COMPONENTES MOBILE-FIRST

### 10.1 Template de Componente Responsivo

```
Padrão:

Component Mobile (sm):
├─ w-full (100% width)
├─ p-4 (padding 1rem)
├─ single column
├─ bottom nav
└─ touch-friendly (44px+ targets)

Component Tablet (md):
├─ w-[calc(100%-256px)] (com sidebar)
├─ p-6 (padding 1.5rem)
├─ 2 columns
├─ top nav
└─ Híbrido

Component Desktop (lg):
├─ w-[calc(100%-256px)]
├─ p-8 (padding 2rem)
├─ 3+ columns
├─ top nav + sidebar
└─ Hover states ativos
```

### 10.2 Bottom Navigation Padrão

```
ITENS COMUNS:

┌──────────────────────────────────┐
│ 🏠 Home | 📊 Analytics | ⚙️ + | 🔔 | 👤 │
├──────────────────────────────────┤

FUNCIONALIDADES:
├─ Home (Dashboard)
├─ Analytics (se plano permite)
├─ Create/Actions (botão principal)
├─ Notifications
├─ Profile/Settings
└─ Mais opções (hambúrguer)

COMPORTAMENTO:
├─ Sempre visível em mobile
├─ Sticky na base
├─ Ativa com underline
├─ Icons + Labels em mobile
└─ Icons apenas em desktop
```

---

## 11. ROADMAP DE IMPLEMENTAÇÃO (5 FASES)

### Fase 1: Autenticação e Estado Base
- ✅ Existente: Supabase Auth (login/signup)
- Setup: Contextos de estado (Auth, Organization)
- Setup: Estado machine de onboarding

### Fase 2: Onboarding Completo
- Implementar 6 steps de onboarding
- Database schema de onboarding_state
- Proteção de rotas (bloqueia sem onboarding)

### Fase 3: Multi-tenant e RBAC
- Database schema de organizations
- RLS policies para isolamento
- Componentes: org switcher, org settings
- Sistema de convites

### Fase 4: Billing e Planos
- Database schema de subscriptions/invoices
- Integration com Stripe/Paddle
- Feature flags por plano
- Painel de billing

### Fase 5: Mobile-first & Polish
- Bottom navigation
- Componentes responsivos
- Touch-friendly interactions
- Performance otimização

---

## RESUMO

Esta documentação integra:

✅ **Onboarding**: State machine com 6 steps
✅ **Gestão de Estado**: Context + Reducer + Hooks
✅ **Mobile-first**: Bottom nav, responsive layout
✅ **POO**: Services, Repositories, Validators
✅ **Design Patterns**: Factory, Strategy, Observer, DI, Decorator, Command
✅ **Multi-tenant**: Isolamento via RLS, org switcher
✅ **Planos**: Feature flags, limites por plano
✅ **Integração**: Fluxos completos de novo usuário, membros, planos

Tudo isto sem exemplos de código, focando em arquitetura e conceitos.
