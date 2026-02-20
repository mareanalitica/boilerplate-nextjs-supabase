# Estrutura de Pastas Recomendada para RBAC

## Visão Geral

Este documento detalha a estrutura de pastas e arquivos recomendada para implementar RBAC no projeto SaaS Minimal. A estrutura foi pensada para:

- Separação clara entre rotas públicas, autenticadas e protegidas por role
- Fácil localização de código relacionado a RBAC
- Reutilização de componentes e hooks
- Escalabilidade conforme novas roles são adicionadas

---

## Estrutura Completa Recomendada

```
projeto-root/
│
├── app/                                    # Next.js App Router
│   │
│   ├── (auth)/                            # Grupo de rotas: NÃO autenticadas
│   │   ├── login/
│   │   │   ├── page.tsx                   # Página de login
│   │   │   └── loading.tsx                # Skeleton de loading
│   │   ├── sign-up/
│   │   │   ├── page.tsx                   # Página de signup
│   │   │   └── loading.tsx
│   │   ├── forgot-password/
│   │   │   ├── page.tsx                   # Página de reset de senha
│   │   │   └── loading.tsx
│   │   ├── update-password/
│   │   │   └── page.tsx                   # Atualizar senha (token válido)
│   │   ├── error/
│   │   │   └── page.tsx                   # Página de erro de auth
│   │   ├── confirm/
│   │   │   └── route.ts                   # Handler de confirmação OTP
│   │   └── layout.tsx                     # Layout compartilhado (sem navbar)
│   │
│   ├── (public)/                          # Grupo de rotas: Públicas
│   │   ├── page.tsx                       # Home pública
│   │   ├── pricing/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── about/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx                   # Lista de posts
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx               # Post específico
│   │   │   └── loading.tsx
│   │   └── layout.tsx                     # Layout com header público
│   │
│   ├── (authenticated)/                   # Grupo de rotas: REQUER AUTENTICAÇÃO
│   │   ├── layout.tsx                     # Middleware + layout autenticado
│   │   │                                  # Verifica: token válido no JWT
│   │   │                                  # Renderiza: NavBar, atualiza sessão
│   │   │
│   │   ├── dashboard/                     # Rota para TODO usuário autenticado
│   │   │   ├── page.tsx                   # Dashboard geral
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   │
│   │   ├── profile/                       # Rota para TODO usuário autenticado
│   │   │   ├── page.tsx                   # Editar perfil próprio
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx               # Configurações (notificações, privacidade)
│   │   │   │   ├── security/
│   │   │   │   │   └── page.tsx           # Segurança (2FA, sessions)
│   │   │   │   └── loading.tsx
│   │   │   └── loading.tsx
│   │   │
│   │   ├── (rbac)/                        # Sub-grupo com proteção RBAC
│   │   │   │                              # Middleware adicional: valida role
│   │   │   │                              # Se role inválido: redirect /access-denied
│   │   │   │
│   │   │   ├── admin/                     # Requer role: "admin"
│   │   │   │   ├── layout.tsx             # Sidebar admin, verificação de role
│   │   │   │   ├── page.tsx               # Dashboard admin (overview)
│   │   │   │   ├── loading.tsx
│   │   │   │   │
│   │   │   │   ├── users/
│   │   │   │   │   ├── page.tsx           # Lista de usuários
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── page.tsx       # Detalhes do usuário
│   │   │   │   │   │   └── loading.tsx
│   │   │   │   │   └── loading.tsx
│   │   │   │   │
│   │   │   │   ├── roles/
│   │   │   │   │   ├── page.tsx           # Gerenciar roles
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── page.tsx       # Editar role específica
│   │   │   │   │   │   └── loading.tsx
│   │   │   │   │   └── loading.tsx
│   │   │   │   │
│   │   │   │   ├── permissions/
│   │   │   │   │   ├── page.tsx           # Gerenciar permissions
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── page.tsx       # Editar permission específica
│   │   │   │   │   │   └── loading.tsx
│   │   │   │   │   └── loading.tsx
│   │   │   │   │
│   │   │   │   ├── audit-logs/
│   │   │   │   │   ├── page.tsx           # Visualizar audit logs
│   │   │   │   │   └── loading.tsx
│   │   │   │   │
│   │   │   │   └── settings/
│   │   │   │       ├── page.tsx           # Configurações do sistema
│   │   │   │       └── loading.tsx
│   │   │   │
│   │   │   ├── moderator/                 # Requer role: "moderator"
│   │   │   │   ├── layout.tsx             # Sidebar moderator
│   │   │   │   ├── page.tsx               # Dashboard moderator
│   │   │   │   ├── reports/
│   │   │   │   │   ├── page.tsx           # Lista de relatórios
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── page.tsx       # Detalhes do relatório
│   │   │   │   │   │   └── loading.tsx
│   │   │   │   │   └── loading.tsx
│   │   │   │   ├── actions/
│   │   │   │   │   ├── page.tsx           # Ações tomadas
│   │   │   │   │   └── loading.tsx
│   │   │   │   └── loading.tsx
│   │   │   │
│   │   │   ├── editor/                    # Requer role: "editor"
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx               # Dashboard editor
│   │   │   │   ├── posts/
│   │   │   │   │   ├── page.tsx           # Meus posts
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── edit/
│   │   │   │   │   │   │   └── page.tsx   # Editar post
│   │   │   │   │   │   └── page.tsx       # Detalhes
│   │   │   │   │   └── new/
│   │   │   │   │       └── page.tsx       # Novo post
│   │   │   │   └── loading.tsx
│   │   │   │
│   │   │   └── [role]/                    # Rota dinâmica (custom roles)
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       └── loading.tsx
│   │   │
│   │   └── error/                         # Erro de RBAC
│   │       └── access-denied/
│   │           └── page.tsx               # Acesso negado por falta de role
│   │
│   ├── api/                               # API Routes
│   │   ├── auth/
│   │   │   ├── sign-up/
│   │   │   │   └── route.ts               # POST /api/auth/sign-up
│   │   │   ├── sign-in/
│   │   │   │   └── route.ts               # POST /api/auth/sign-in
│   │   │   ├── sign-out/
│   │   │   │   └── route.ts               # POST /api/auth/sign-out
│   │   │   ├── refresh/
│   │   │   │   └── route.ts               # POST /api/auth/refresh
│   │   │   └── profile/
│   │   │       └── route.ts               # GET /api/auth/profile (usuário atual)
│   │   │
│   │   ├── admin/                         # Rotas admin (requer role admin)
│   │   │   ├── users/
│   │   │   │   ├── route.ts               # GET/POST /api/admin/users
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts           # GET/PUT/DELETE /api/admin/users/[id]
│   │   │   │
│   │   │   ├── roles/
│   │   │   │   ├── route.ts               # GET/POST /api/admin/roles
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts           # GET/PUT/DELETE /api/admin/roles/[id]
│   │   │   │
│   │   │   └── permissions/
│   │   │       ├── route.ts               # GET/POST /api/admin/permissions
│   │   │       └── [id]/
│   │   │           └── route.ts           # GET/PUT/DELETE /api/admin/permissions/[id]
│   │   │
│   │   ├── moderator/                     # Rotas moderator (requer role moderator)
│   │   │   ├── reports/
│   │   │   │   ├── route.ts               # GET/POST /api/moderator/reports
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts           # GET/PUT /api/moderator/reports/[id]
│   │   │   │
│   │   │   └── actions/
│   │   │       └── route.ts               # POST /api/moderator/actions
│   │   │
│   │   └── user/                          # Rotas de usuário (autenticado)
│   │       ├── profile/
│   │       │   └── route.ts               # GET/PUT /api/user/profile
│   │       ├── settings/
│   │       │   └── route.ts               # GET/PUT /api/user/settings
│   │       └── permissions/
│   │           └── route.ts               # GET /api/user/permissions (minhas perms)
│   │
│   ├── globals.css
│   └── layout.tsx                         # Layout raiz (ThemeProvider)
│
├── components/                            # Componentes React
│   │
│   ├── auth/                              # Novo: Componentes de Auth
│   │   ├── auth-guard.tsx                 # HOC: Protege componente se autenticado
│   │   ├── role-guard.tsx                 # HOC: Protege componente se tem role
│   │   ├── permission-guard.tsx           # HOC: Protege componente se tem permissão
│   │   ├── access-denied.tsx              # Componente: Mensagem de acesso negado
│   │   ├── login-required.tsx             # Componente: Prompt para fazer login
│   │   └── loading-auth.tsx               # Componente: Skeleton enquanto verifica auth
│   │
│   ├── forms/                             # Componentes de formulários
│   │   ├── login-form.tsx                 # Existente: Formulário de login
│   │   ├── sign-up-form.tsx               # Existente: Formulário de signup
│   │   ├── logout-button.tsx              # Existente: Botão de logout
│   │   └── forgot-password-form.tsx       # Existente: Formulário reset senha
│   │
│   ├── layout/                            # Novo: Componentes de layout
│   │   ├── navbar.tsx                     # NavBar para usuários autenticados
│   │   ├── admin-sidebar.tsx              # Sidebar para admin
│   │   ├── moderator-sidebar.tsx          # Sidebar para moderator
│   │   ├── breadcrumb.tsx                 # Navegação breadcrumb
│   │   ├── user-menu.tsx                  # Menu dropdown do usuário
│   │   └── footer.tsx                     # Footer comum
│   │
│   ├── dashboard/                         # Novo: Componentes de dashboard
│   │   ├── welcome-card.tsx               # Card de bem-vindo
│   │   ├── stats-card.tsx                 # Card de estatísticas
│   │   ├── quick-actions.tsx              # Ações rápidas
│   │   └── activity-feed.tsx              # Feed de atividade
│   │
│   ├── admin/                             # Novo: Componentes admin
│   │   ├── users-table.tsx                # Tabela de usuários
│   │   ├── user-form.tsx                  # Formulário para editar usuário
│   │   ├── roles-table.tsx                # Tabela de roles
│   │   ├── role-form.tsx                  # Formulário para editar role
│   │   ├── permissions-table.tsx          # Tabela de permissões
│   │   ├── permission-form.tsx            # Formulário para editar permission
│   │   ├── assign-role-modal.tsx          # Modal para atribuir role a usuário
│   │   ├── audit-logs-table.tsx           # Tabela de audit logs
│   │   └── system-settings.tsx            # Painel de configurações do sistema
│   │
│   ├── moderator/                         # Novo: Componentes moderator
│   │   ├── reports-table.tsx              # Tabela de relatórios
│   │   ├── report-detail.tsx              # Detalhes de um relatório
│   │   ├── report-actions.tsx             # Ações para resolver relatório
│   │   └── actions-log.tsx                # Log de ações tomadas
│   │
│   ├── ui/                                # Existentes: shadcn/ui (50+ componentes)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── table.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── sidebar.tsx
│   │   └── [outros...]
│   │
│   └── tutorial/                          # Existentes: Componentes de tutorial
│       └── [components]
│
├── lib/                                   # Bibliotecas e utilitários
│   │
│   ├── supabase/                          # Integração Supabase
│   │   ├── client.ts                      # Cliente browser
│   │   ├── server.ts                      # Cliente servidor
│   │   ├── proxy.ts                       # Middleware de autenticação
│   │   │
│   │   └── auth/                          # Novo: Funções de RBAC
│   │       ├── queries.ts                 # Queries de roles/permissions
│   │       ├── rbac.ts                    # Lógica centralizada de RBAC
│   │       ├── validate.ts                # Validações de autorização
│   │       ├── cache.ts                   # Cache de roles/permissions
│   │       └── types.ts                   # Tipos de RBAC
│   │
│   ├── hooks/                             # Novo: Diretório de hooks
│   │   ├── use-mobile.ts                  # Existente: Detecta mobile
│   │   │
│   │   └── use-auth/                      # Novo: Hooks de autenticação
│   │       ├── use-user.ts                # Hook: Obter usuário atual
│   │       ├── use-roles.ts               # Hook: Obter roles do usuário
│   │       ├── use-permission.ts          # Hook: Verificar permissão específica
│   │       ├── use-has-role.ts            # Hook: Verificar se tem role
│   │       ├── use-has-permission.ts      # Hook: Verificar se tem permissão
│   │       └── use-auth-context.ts        # Hook: Auth context
│   │
│   ├── middleware/                        # Novo: Middleware customizado
│   │   ├── auth.ts                        # Middleware de autenticação
│   │   ├── rbac.ts                        # Middleware de autorização
│   │   └── ratelimit.ts                   # Middleware de rate limiting
│   │
│   ├── utils/                             # Novo: Utilitários RBAC
│   │   ├── rbac.ts                        # Funções utilitárias de RBAC
│   │   ├── permissions.ts                 # Helper de permissões
│   │   └── roles.ts                       # Helper de roles
│   │
│   ├── constants/                         # Novo: Constantes
│   │   ├── roles.ts                       # Nomes de roles
│   │   ├── permissions.ts                 # Nomes de permissões
│   │   └── routes.ts                      # Rotas protegidas
│   │
│   ├── types/                             # Novo: Tipos TypeScript
│   │   ├── auth.ts                        # Tipos de autenticação
│   │   ├── rbac.ts                        # Tipos de RBAC
│   │   ├── database.ts                    # Tipos de banco de dados
│   │   └── api.ts                         # Tipos de API
│   │
│   └── utils.ts                           # Existente: Utilitários gerais
│
├── middleware.ts                          # Existente: Next.js middleware
│
├── hooks/                                 # Existente: Hooks raiz
│   └── use-mobile.ts
│
├── public/                                # Existente: Arquivos estáticos
│
├── docs/                                  # Novo: Documentação
│   ├── RBAC_ARCHITECTURE.md               # Documentação de RBAC
│   ├── FOLDER_STRUCTURE_RBAC.md           # Este arquivo
│   ├── API_ENDPOINTS.md                   # Documentação de endpoints
│   ├── DATABASE_SCHEMA.md                 # Schema do banco
│   ├── AUTHENTICATION_FLOW.md             # Fluxo de autenticação
│   └── AUTHORIZATION_FLOW.md              # Fluxo de autorização
│
├── migrations/                            # Novo: Migrações Supabase
│   ├── 001_create_roles.sql               # Criar tabela roles
│   ├── 002_create_permissions.sql         # Criar tabela permissions
│   ├── 003_create_role_permissions.sql    # Criar junction table
│   ├── 004_create_user_roles.sql          # Criar user_roles
│   ├── 005_create_organizations.sql       # Criar organizations (opcional)
│   ├── 006_create_audit_logs.sql          # Criar audit logs
│   ├── 007_enable_rls.sql                 # Habilitar RLS em tabelas
│   └── 008_create_policies.sql            # Criar políticas RLS
│
├── .env.example                           # Existente: Variáveis de exemplo
├── .env.local                             # Existente: Variáveis locais (gitignore)
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
│
├── RBAC_ARCHITECTURE.md                   # Documentação principal
├── FOLDER_STRUCTURE_RBAC.md               # Este arquivo
└── README.md                              # README do projeto
```

---

## Descrição Detalhada por Diretório

### `/app` - App Router Next.js

#### Grupo de Rotas: `(auth)`
**Propósito**: Rotas de autenticação
**Proteção**: Nenhuma (públicas)
**Acesso**: Qualquer pessoa
**Redirecionamento**: Se autenticado, redireciona para `/dashboard`

Contém: login, signup, password reset, email confirmation

#### Grupo de Rotas: `(public)`
**Propósito**: Rotas públicas do marketing
**Proteção**: Nenhuma
**Acesso**: Qualquer pessoa
**Exemplo**: Home, pricing, about, blog

#### Grupo de Rotas: `(authenticated)`
**Propósito**: Rotas que requerem autenticação
**Proteção**: Middleware valida JWT token
**Acesso**: Usuários autenticados apenas
**Redirecionamento**: Se não autenticado → `/auth/login`

Layout renderiza:
- Validação de sessão (revalidar token)
- NavBar com menu de usuário
- Atualização de user context

#### Sub-grupo: `(rbac)`
**Propósito**: Rotas que requerem role específico
**Proteção**: Layout verifica `user_roles` no banco
**Acesso**: Usuários com role específica
**Redirecionamento**: Se role inválido → `/access-denied`

Cada role (admin, moderator, editor) é uma sub-pasta:
- Seu próprio layout com sidebar customizado
- Seu próprio conjunto de rotas
- Validação de role ocorre no layout

#### API Routes: `/api`
**Propósito**: Endpoints HTTP para operações
**Proteção**: Middleware + validação manual em cada rota
**Estrutura**: Agrupa por feature (auth, admin, moderator, user)

Cada rota API:
- Valida token JWT
- Verifica role/permissão
- Consulta banco com RLS
- Retorna JSON ou erro HTTP apropriado

---

### `/components` - Componentes React

#### `auth/` - Novo
**Responsabilidade**: Componentes de proteção e estado de auth

Fornece:
- HOCs para proteger componentes
- Guardas para rotas específicas
- Feedback visual de autenticação

#### `forms/` - Existente
**Responsabilidade**: Formulários de autenticação

Contém:
- Login, signup, password reset
- Já implementados e testados

#### `layout/` - Novo
**Responsabilidade**: Componentes estruturais

Fornece:
- NavBar (header)
- Sidebars (admin, moderator, editor)
- Breadcrumb, user menu, footer

#### `dashboard/`, `admin/`, `moderator/` - Novo
**Responsabilidade**: Componentes específicos de domínio

Contém:
- Componentes reutilizáveis para cada área
- Tabelas, formulários, cards
- Lógica visual específica

#### `ui/` - Existente
**Responsabilidade**: Primitivos shadcn/ui

50+ componentes base reutilizáveis

---

### `/lib` - Biblioteca e Utilitários

#### `supabase/` - Integração
**Propósito**: Comunicação com Supabase

**Subpasta: `auth/`** - Novo
- `queries.ts`: SELECT roles, permissions, user_roles
- `rbac.ts`: Lógica de verificação de RBAC
- `validate.ts`: Validar user, role, permission
- `cache.ts`: Cachear roles/permissions
- `types.ts`: Tipos TypeScript

#### `hooks/` - Novo
**Propósito**: React hooks reutilizáveis

**Subpasta: `use-auth/`**
- `use-user.ts`: Obter user atual (server/client)
- `use-roles.ts`: Obter lista de roles do user
- `use-permission.ts`: Verificar permissão
- `use-has-role.ts`: Verificar role
- `use-has-permission.ts`: Verificar permissão (wrapper)
- `use-auth-context.ts`: Acessar auth context

#### `middleware/` - Novo
**Propósito**: Middleware customizado

- `auth.ts`: Validações de autenticação
- `rbac.ts`: Validações de autorização
- `ratelimit.ts`: Rate limiting

#### `utils/` - Novo
**Propósito**: Funções utilitárias RBAC

- `rbac.ts`: `canUser()`, `requireRole()`, `requirePermission()`
- `permissions.ts`: Helpers de permissões
- `roles.ts`: Helpers de roles

#### `constants/` - Novo
**Propósito**: Valores hardcoded

- `roles.ts`: `ROLE_ADMIN`, `ROLE_USER`, etc
- `permissions.ts`: `PERM_READ_USERS`, `PERM_DELETE_USER`, etc
- `routes.ts`: Rotas protegidas

#### `types/` - Novo
**Propósito**: Definições TypeScript

- `auth.ts`: User, Claims, Session
- `rbac.ts`: Role, Permission, UserRole
- `database.ts`: Tipos de banco
- `api.ts`: Tipos de responses HTTP

---

### `/middleware.ts` - Existente
**Propósito**: Edge middleware do Next.js

Funcionamento:
1. Verifica se rota precisa autenticação
2. Valida JWT token em cookies
3. Atualiza sessão se necessário
4. Redireciona se token inválido

Não verifica roles (apenas autenticação)

---

### `/docs` - Novo
**Propósito**: Documentação do projeto

Conterá:
- `RBAC_ARCHITECTURE.md` - Visão geral
- `API_ENDPOINTS.md` - Lista de endpoints
- `DATABASE_SCHEMA.md` - Schema SQL
- `AUTHENTICATION_FLOW.md` - Fluxo de auth
- `AUTHORIZATION_FLOW.md` - Fluxo de authz

---

### `/migrations` - Novo
**Propósito**: Migrações de banco de dados

Arquivos SQL:
1. `001_create_roles.sql` - Tabela de roles
2. `002_create_permissions.sql` - Tabela de permissões
3. `003_create_role_permissions.sql` - Junction table
4. `004_create_user_roles.sql` - Atribuição de roles
5. `005_create_organizations.sql` - Multi-tenant (opcional)
6. `006_create_audit_logs.sql` - Logs de auditoria
7. `007_enable_rls.sql` - Habilitar RLS
8. `008_create_policies.sql` - Políticas RLS

---

## Princípios de Organização

### 1. Por Feature (Não por Tipo)

❌ ERRADO:
```
components/
├── forms/
├── buttons/
├── modals/
pages/
├── admin/
├── user/
```

✅ CORRETO:
```
(authenticated)/
├── (rbac)/
│   ├── admin/
│   │   └── [todos componentes admin]
│   └── moderator/
│       └── [todos componentes moderator]
```

### 2. Co-localização de Dependências

Componentes, hooks, tipos relacionados ficam próximos:

```
(authenticated)/
├── admin/
│   ├── users/
│   │   ├── page.tsx
│   │   ├── user-table.tsx (componente local)
│   │   └── useUsers.ts (hook local se necessário)
```

### 3. Reutilização Global vs Local

**Global** (em `/lib` ou `/components`):
- Componentes usados em múltiplas rotas
- Hooks reutilizáveis
- Utilitários gerais

**Local** (ao lado da rota):
- Componentes específicos de uma rota
- Hooks usados apenas ali
- Tipos locais

### 4. Separação de Responsabilidades

**UI Components**:
- Só renderizam
- Recebem props
- Não fazem queries

**Container Components**:
- Fazem queries
- Passam dados para UI
- Gerenciam estado

**Hooks**:
- Reutilizam lógica
- Encapsulam queries
- Fornecem dados

---

## Convenções de Nomenclatura

### Pastas
- **Grupos de rotas**: Entre parênteses `(auth)`, `(authenticated)`, `(rbac)`
- **Rotas dinâmicas**: Entre colchetes `[id]`, `[slug]`
- **Recursos**: Plural `users`, `roles`, `permissions`
- **Contextos**: Direto `admin`, `dashboard`, `profile`

### Arquivos
- **Pages**: `page.tsx`
- **Layouts**: `layout.tsx`
- **Componentes**: PascalCase `AdminSidebar.tsx`, `UserTable.tsx`
- **Hooks**: camelCase com `use` prefixo `useUser.ts`, `useRoles.ts`
- **Utilitários**: camelCase `rbac.ts`, `permissions.ts`
- **Tipos**: `types.ts` ou `[feature].types.ts`

### Componentes
- **Guards/HOCs**: `*Guard.tsx` ex: `RoleGuard.tsx`
- **Forms**: `*Form.tsx` ex: `LoginForm.tsx`
- **Tables**: `*Table.tsx` ex: `UsersTable.tsx`
- **Cards**: `*Card.tsx` ex: `StatsCard.tsx`

---

## Fluxo de Dados

### Autenticação
```
Middleware → Valida JWT → Extrai claims → Próxima requisição tem user_id
```

### Autorização de Rota
```
Layout → Consulta user_roles → Verifica role necessário →
Renderiza conteúdo OU redireciona
```

### Autorização de Ação
```
Server Action → Revalida autenticação → Valida permissão →
Executa OU retorna erro
```

### Autorização de API
```
API Route → Valida token → Consulta user_roles → Verifica permissão →
Retorna dados OU HTTP 403
```

---

## Implementação Faseada

### Fase 1: Estrutura Base (Já existe)
- App router com (auth) e (public)
- Autenticação Supabase
- Middleware de token

### Fase 2: Preparar para RBAC
1. Criar pastas de estrutura
2. Criar tabelas no banco
3. Inserir roles iniciais
4. Criar hooks de auth
5. Criar componentes guard

### Fase 3: Proteger Rotas
1. Criar `(authenticated)` layout
2. Criar `(rbac)` sub-grupo
3. Criar layouts por role
4. Proteger rotas /admin, /moderator, etc

### Fase 4: Expandir Funcionalidade
1. Criar API routes protegidas
2. Criar componentes admin
3. Implementar audit logs
4. Adicionar RLS em banco

---

## Resumo

Esta estrutura de pastas foi projetada para:

✅ **Escalabilidade**: Fácil adicionar novos roles
✅ **Manutenibilidade**: Código organizado por feature
✅ **Segurança**: Proteção em múltiplas camadas
✅ **Performance**: Cache e otimizações integradas
✅ **Reutilização**: Componentes e hooks compartilhados

Seguindo esta estrutura, o projeto crescerá de forma ordenada e segura.
