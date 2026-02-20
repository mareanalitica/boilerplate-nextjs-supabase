# Arquitetura RBAC com Supabase

## Visão Geral

Este documento descreve a estrutura conceitual para implementar Role-Based Access Control (RBAC) no projeto SaaS Minimal usando Supabase como provider de autenticação e autorização.

---

## 1. CONCEITOS FUNDAMENTAIS

### 1.1 Estrutura de Segurança

O RBAC no contexto deste projeto é dividido em três camadas:

**Camada de Autenticação (Authentication)**
- Responsabilidade: Verificar identidade do usuário
- Local: Supabase Auth (tabela `auth.users`)
- Mecanismo: JWT token armazenado em cookies via middleware
- Escopo: Quem é o usuário

**Camada de Autorização (Authorization)**
- Responsabilidade: Verificar permissões do usuário
- Local: Database custom (`public.user_roles`, `public.roles`, `public.permissions`)
- Mecanismo: Consulta ao banco antes de executar ações
- Escopo: O que o usuário pode fazer

**Camada de Contexto (Context)**
- Responsabilidade: Determinar qual ambiente o usuário acessa
- Local: URL, query params, ou contexto da aplicação
- Mecanismo: Validação de escopo (ex: organização, workspace)
- Escopo: Onde o usuário pode fazer coisas

### 1.2 Tipos de Usuários no Sistema

O projeto suporta três tipos principais de usuários:

**Usuário Público**
- Sem autenticação no Supabase
- Acesso: Páginas públicas apenas
- Validação: Ausência de JWT token
- Comportamento: Redirecionado para login ao tentar acessar áreas protegidas

**Usuário Autenticado**
- Autenticado no Supabase (tem `auth.users` entry)
- Acesso: Rotas `/protected/*` e conteúdo geral do app
- Validação: JWT token válido em cookies
- Comportamento: Pode ter roles e permissions variadas

**Usuário Administrador**
- Tipo especial de usuário autenticado
- Acesso: Todas as rotas, todas as permissões, painel admin
- Validação: JWT token válido + role `admin` no banco
- Comportamento: Acesso irrestrito com logs de auditoria

---

## 2. ESTRUTURA DE BANCO DE DADOS

### 2.1 Tabelas de Autorização

**Tabela: `roles`**
- Armazena definições de papéis do sistema
- Colunas: `id`, `name`, `description`, `created_at`
- Papel: Catalogar todos os tipos de role possíveis
- Cardinalidade: Estática (poucas linhas, ex: admin, user, moderator)
- Atualização: Raramente alterada

**Tabela: `permissions`**
- Armazena definições de permissões granulares
- Colunas: `id`, `name`, `description`, `category`, `created_at`
- Papel: Catalogar todas as ações possíveis no sistema
- Cardinalidade: Estática (dezenas a centenas de permissões)
- Estrutura: Organizada por categoria (users, posts, billing, etc)
- Atualização: Alterada quando novas funcionalidades são adicionadas

**Tabela: `role_permissions` (Junction)**
- Relacionamento muitos-para-muitos entre roles e permissions
- Colunas: `role_id`, `permission_id`, `created_at`
- Papel: Mapear quais permissões cada role possui
- Cardinalidade: Dinâmica conforme roles são configuradas
- Índices: Compostos em ambas as chaves estrangeiras

**Tabela: `user_roles`**
- Relacionamento entre usuários autenticados e roles
- Colunas: `user_id` (referencia `auth.users.id`), `role_id`, `assigned_at`, `assigned_by`
- Papel: Atribuir roles aos usuários
- Cardinalidade: Dinâmica, um usuário pode ter múltiplos roles
- Auditoria: Rastreia quem atribuiu cada role

**Tabela: `organizations` (Opcional)**
- Para sistemas multi-tenant ou multi-organização
- Colunas: `id`, `name`, `owner_id`, `created_at`
- Papel: Criar escopos separados de dados
- Relação: Um usuário pode pertencer a múltiplas organizações com roles diferentes

**Tabela: `organization_members` (Opcional)**
- Relacionamento entre usuários e organizações
- Colunas: `organization_id`, `user_id`, `role_id`, `joined_at`
- Papel: Controlar acesso por organização
- Permissões: Podem variar por organização (ex: admin em uma, user em outra)

### 2.2 Fluxo de Dados de Autorização

O fluxo de verificação de permissões segue este padrão:

1. Usuário faz requisição com JWT token
2. Middleware valida token e extrai `user_id`
3. Sistema consulta `user_roles` para encontrar roles do usuário
4. Sistema consulta `role_permissions` para encontrar permissões
5. Ação é verificada contra permissões permitidas
6. Acesso é concedido ou negado

Este fluxo ocorre:
- Em middleware (antes de rotear)
- Em componentes (durante renderização)
- Em server actions (antes de executar)
- Em API routes (antes de processar)

---

## 3. ESTRUTURA DE PASTAS E ARQUIVOS

### 3.1 Organização Hierárquica

```
app/
├── (auth)/                    # Grupo de rotas não autenticadas
│   ├── login/
│   ├── sign-up/
│   ├── forgot-password/
│   └── layout.tsx
│
├── (public)/                  # Grupo de rotas públicas
│   ├── page.tsx              # Home pública
│   ├── pricing/
│   ├── about/
│   └── layout.tsx
│
├── (authenticated)/           # Grupo de rotas autenticadas (middleware)
│   ├── dashboard/            # Dashboard geral (qualquer usuário autenticado)
│   │   └── page.tsx
│   │
│   ├── profile/              # Perfil do usuário
│   │   ├── page.tsx
│   │   └── settings/
│   │
│   ├── (rbac)/               # Sub-grupo com proteção RBAC adicional
│   │   ├── admin/            # Requer role "admin"
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── permissions/
│   │   │   └── layout.tsx    # Layout admin com sidebar
│   │   │
│   │   ├── moderator/        # Requer role "moderator"
│   │   │   ├── reports/
│   │   │   └── layout.tsx
│   │   │
│   │   └── editor/           # Requer role "editor"
│   │       ├── content/
│   │       └── layout.tsx
│   │
│   └── layout.tsx            # Layout autenticado com NavBar

lib/
├── supabase/
│   ├── client.ts             # Cliente Supabase (browser)
│   ├── server.ts             # Cliente Supabase (servidor)
│   ├── proxy.ts              # Middleware de autenticação
│   └── auth/                 # Novo: Funções de autorização
│       ├── roles.ts          # Queries de roles
│       ├── permissions.ts    # Queries de permissões
│       ├── rbac.ts           # Lógica centralizada de RBAC
│       └── types.ts          # Tipos de autorização
│
├── hooks/
│   ├── use-mobile.ts
│   └── use-auth/             # Novo: Hooks de autenticação
│       ├── use-user.ts       # Hook para obter dados do usuário
│       ├── use-roles.ts      # Hook para obter roles do usuário
│       └── use-permission.ts # Hook para verificar permissões

components/
├── auth/                      # Novo: Componentes de autenticação
│   ├── auth-guard.tsx        # HOC para proteção de componentes
│   ├── role-guard.tsx        # Componente para validar roles
│   ├── permission-guard.tsx  # Componente para validar permissões
│   └── access-denied.tsx     # Componente de acesso negado
│
├── layout/
│   ├── admin-sidebar.tsx      # Sidebar para admin
│   ├── user-navbar.tsx        # NavBar para usuários autenticados
│   └── public-header.tsx      # Header para áreas públicas
│
├── ui/                        # Existentes (shadcn/ui)
└── [outros componentes]

middleware/
├── auth.ts                    # Novo: Validações de autenticação
├── rbac.ts                    # Novo: Validações de RBAC
└── ratelimit.ts              # Novo: Proteção contra abuso

utils/
├── rbac.ts                    # Novo: Utilitários de RBAC
└── [outros utils]

types/
├── auth.ts                    # Novo: Tipos de autenticação
├── rbac.ts                    # Novo: Tipos de RBAC
└── database.ts               # Novo: Tipos do banco
```

### 3.2 Padrão de Layout com Grupo de Rotas

O projeto usa `(authenticated)` como grupo de rotas entre parênteses, permitindo:

- Layout compartilhado para todas as rotas autenticadas
- Middleware único para validar autenticação
- Dentro, sub-grupos `(rbac)` para rotas específicas de roles

Cada grupo de rotas tem seu próprio `layout.tsx` que pode:
- Verificar autenticação
- Renderizar componentes comuns (navbar, sidebar)
- Aplicar proteções específicas
- Gerenciar estado global do grupo

---

## 4. FLUXO DE VALIDAÇÃO E PROTEÇÃO

### 4.1 Camadas de Validação

**Camada 1: Middleware (Edge)**
- Local: `middleware.ts` (Next.js 13+)
- Timing: Antes da requisição chegar ao servidor
- Responsabilidade: Validar JWT token e atualizar sessão
- Escopo: Todas as rotas exceto públicas
- Performance: Rápido (edge computing)
- Ação: Redireciona para login se token inválido

**Camada 2: Layout Component (Server)**
- Local: Layout.tsx dos grupos de rotas protegidos
- Timing: Durante renderização server-side
- Responsabilidade: Validar se usuário tem role necessário
- Escopo: Rotas específicas (ex: `/admin/*`)
- Performance: Usa dados já validados do middleware
- Ação: Redireciona ou mostra erro de acesso

**Camada 3: Server Action (Server)**
- Local: Funções server-side dentro de componentes client
- Timing: Quando ação é executada
- Responsabilidade: Validar permissão específica antes de modificar dados
- Escopo: Operações de escrita/atualização
- Performance: Valida no momento de execução
- Ação: Retorna erro ao cliente

**Camada 4: API Route (Server)**
- Local: Rotas em `/app/api/*`
- Timing: Quando requisição HTTP chega
- Responsabilidade: Validar autenticação e permissão
- Escopo: Endpoints HTTP para clientes externos
- Performance: Camada adicional de segurança
- Ação: Retorna HTTP 401/403

**Camada 5: Component/Hook (Client)**
- Local: Hooks customizados e componentes
- Timing: Durante renderização client-side
- Responsabilidade: Mostrar/ocultar UI baseado em permissões
- Escopo: UX (não segurança)
- Performance: Usa dados já carregados
- Ação: Oculta elemento ou mostra aviso

### 4.2 Verificação em Cada Contexto

**Componentes Server**
- Chamam `getUser()` diretamente no Supabase server
- Verificam roles na mesma requisição
- Redirect se falhar validação

**Componentes Client**
- Usam hooks como `useUser()` e `usePermission()`
- Dados já foram validados no servidor
- UX responsível por mostrar/ocultar elementos

**Server Actions**
- Primeiro validam autenticação (revalidação)
- Depois validam permissão específica
- Retornam erro se falhar

**API Routes**
- Validam JWT token manual (ou via middleware)
- Consultam database para verificar permissões
- Retornam código HTTP apropriado

---

## 5. CLAIMS JWT E EXTENSÕES

### 5.1 Claims Padrão do Supabase

O JWT token do Supabase contém:
- `sub` (subject): user_id
- `email`: email do usuário
- `email_verified`: boolean
- `aud` (audience): nome do projeto
- `iat` (issued at): timestamp
- `exp` (expires): timestamp
- `iss` (issuer): URL do Supabase

### 5.2 Extensão com Claims Customizados

Para melhorar performance, é possível adicionar informações de RBAC ao JWT:

**Opção 1: JWT Custom Claims**
- Adicionar role do usuário diretamente ao JWT
- Feito via database triggers no Supabase
- Disponível imediatamente em middleware
- Reduz queries ao banco

**Opção 2: Session Object Enhancement**
- Armazenar roles em cache da sessão
- Atualizado a cada login ou mudança de role
- Evita verificação a cada requisição

**Opção 3: Cached Permissions**
- Guardar permissões em Redis ou memória
- Validado periodicamente
- Melhor performance para sistemas com muitas permissões

### 5.3 Validação de Claims

O processo de validação usa:
- `getClaims()` do Supabase para extrair dados do JWT
- Verificação de expiração automática pelo Next.js
- Revalidação periódica via RLS (Row Level Security)

---

## 6. ROW LEVEL SECURITY (RLS)

### 6.1 Conceito

RLS é o mecanismo de segurança no banco de dados que implementa RBAC no nível de dados:

**Propósito**: Garantir que usuários só acessem dados que têm permissão

**Funcionamento**:
- Cada query ao banco é interceptada antes de retornar dados
- Regras verificam se o usuário tem permissão
- Dados não permitidos são filtrados automaticamente
- Impossível contornar (acontece no banco)

### 6.2 Tipos de Regras RLS

**Regras SELECT**
- Controla quais linhas um usuário pode ler
- Baseado em: user_id, role, organização, etc
- Exemplo: Usuário vê apenas dados de sua organização

**Regras INSERT**
- Controla quais dados um usuário pode inserir
- Valida: tipo de dados, valores, propriedades
- Exemplo: User não pode criar usuários com role admin

**Regras UPDATE**
- Controla quais campos um usuário pode modificar
- Valida: campos permitidos, valores, escopo
- Exemplo: User só pode atualizar seu próprio perfil

**Regras DELETE**
- Controla quais linhas um usuário pode deletar
- Valida: propriedade de dados, permissões
- Exemplo: Admin pode deletar qualquer coisa, user não

### 6.3 Habilitação de RLS

**Processo**:
1. Criar política para cada tabela
2. Definir condições (usuário, role, etc)
3. Aplicar a operação (SELECT, INSERT, UPDATE, DELETE)
4. Testar com diferentes usuários
5. Habilitar RLS na tabela

**Tabelas que precisam RLS**:
- `user_roles` - Apenas usuários admin podem ver/modificar
- `permissions` - Todos podem ler, apenas admin pode modificar
- `roles` - Todos podem ler, apenas admin pode modificar
- `organizations` - Usuários veem apenas suas organizações
- `organization_members` - Filtrado por organização
- Qualquer tabela com dados sensíveis

**Tabelas sem RLS**:
- `roles`, `permissions` (dados públicos, leitura apenas)

---

## 7. FLUXOS DE AUTORIZAÇÃO

### 7.1 Fluxo de Login

1. Usuário submete credenciais
2. Supabase valida e retorna JWT
3. JWT é armazenado em cookie (secure, httpOnly)
4. Middleware extrai JWT em próxima requisição
5. Claims são validados
6. User é redirecionado para dashboard

### 7.2 Fluxo de Verificação de Permissão

1. Usuário acessa rota protegida
2. Middleware valida token
3. Layout/page verifica role necessário
4. Se rol não encontrado: redirect para página não autorizada
5. Se role encontrado: renderiza componente

### 7.3 Fluxo de Mudança de Role

1. Admin navega para página de atribuição de roles
2. Admin seleciona usuário e novo role
3. Server action recebe requisição
4. Server action valida se requester é admin
5. Se válido: insere em `user_roles`
6. Se RLS implementado: dados são atualizados apenas se permissão
7. JWT não é revalidado até próximo login (considerar refresh)
8. Usuário precisa fazer logout/login ou page refresh para aplicar

### 7.4 Fluxo de Acesso Negado

1. Usuário acessa rota sem permissão
2. Layout verifica role via `getUser()` e banco
3. Role não correspondente ao required
4. Usuário é redirecionado para:
   - `/access-denied` (página informativa) OU
   - `/dashboard` (página anterior) OU
   - `/auth/login` (se não autenticado)

---

## 8. TIPOS E INTERFACES

### 8.1 Tipos de Autenticação

**User Type**
- Contém: id, email, email_verified, created_at, last_sign_in_at
- Origem: `auth.users` do Supabase
- Ciclo de vida: Criado no signup, persiste até deletado

**Session Type**
- Contém: user, access_token, refresh_token, expires_at
- Origem: Supabase Auth
- Ciclo de vida: Criado no login, renovado se expirado

**Claims Type**
- Contém: sub, email, email_verified, aud, iat, exp
- Origem: JWT token
- Ciclo de vida: Válido até `exp`

### 8.2 Tipos de RBAC

**Role Type**
- Contém: id (uuid), name (string), description (text)
- Representa um papel no sistema
- Pode ter múltiplas permissões

**Permission Type**
- Contém: id (uuid), name (string), description (text), category (string)
- Representa uma ação específica
- Pode ser atribuída a múltiplos roles

**UserRole Type**
- Contém: user_id (uuid), role_id (uuid), assigned_at, assigned_by
- Relacionamento: usuário tem um ou mais roles
- Ciclo de vida: Criado quando role é atribuída, deletado quando removida

**PermissionCheck Type**
- Contém: user_id, required_permission, has_permission (boolean)
- Resultado de uma verificação
- Usado em validações

### 8.3 Tipos de Contexto

**OrganizationContext Type**
- Contém: organization_id, user_role_in_org, organization_name
- Representa o contexto atual do usuário
- Muda conforme usuário navega entre organizações

**AccessContext Type**
- Contém: user_id, roles, organization_id, timestamp
- Snapshot de autorização em um momento
- Usado para audit logs

---

## 9. ESTRATÉGIAS DE CACHE

### 9.1 Cache de Roles

**Tipo**: Memory/Session Cache

**O que cachear**:
- Lista de roles do usuário
- Permissões associadas aos roles

**Duration**:
- Até fim da sessão ou logout
- Refresh em mudanças de role

**Invaliding**:
- Quando role é atribuída/removida
- Quando usuário faz logout
- Quando usuário atualiza perfil

### 9.2 Cache de Permissões

**Tipo**: Application-level Cache (Redis opcional)

**O que cachear**:
- Mapeamento role -> permissões
- Lista de permissões disponíveis

**Duration**:
- 1-24 horas (configurável)
- Invalidado quando novo role/permission é criado

**Invaliding**:
- Quando novo permission é criado
- Quando role_permissions é alterado
- Via explicit invalidation em admin panel

### 9.3 Cache de User Data

**Tipo**: Session Cookie + Memory

**O que cachear**:
- Email do usuário
- Status de verificação de email
- Roles (para UX rápida)

**Duration**:
- Duração do JWT (ex: 1 hora)
- Refresh automático se expirado

---

## 10. AUDITORIA E LOGGING

### 10.1 Eventos a Rastrear

**Eventos de Autenticação**:
- Login bem-sucedido
- Login falhado
- Logout
- Troca de senha
- Reset de senha solicitado

**Eventos de RBAC**:
- Role atribuída a usuário
- Role removida de usuário
- Permissão criada/modificada/deletada
- Mudança de role (permissões)

**Eventos de Acesso**:
- Tentativa de acesso a rota protegida (aceito/negado)
- Execução de server action protegido
- Modificação de dados sensíveis

### 10.2 Estrutura de Audit Log

**Tabela: `audit_logs`**
- Colunas: id, event_type, user_id, resource, action, metadata, timestamp
- Evento: Tipo do evento (login, role_assigned, etc)
- Usuário: Quem executou a ação
- Recurso: O que foi afetado
- Metadata: Dados adicionais (ex: qual role foi atribuído)
- Timestamp: Quando ocorreu

### 10.3 Implementação

**Trigger de Database**:
- Tabelas monitoradas criam automaticamente audit logs
- Não é possível contornar
- Registro imediato

**Logging de Aplicação**:
- Eventos adicionais não capturados por triggers
- Complementa audit logs do banco
- Exemplo: Tentativas de acesso negado

---

## 11. SEGURANÇA E BOAS PRÁTICAS

### 11.1 Validação em Múltiplas Camadas

**Princípio**: Nunca confiar em dados do cliente

**Implementação**:
1. Validar autenticação em middleware (token)
2. Validar autorização no servidor (roles/permissions)
3. Validar novamente em server actions (revalidation)
4. Validar no banco (RLS)

Cada camada é independente e não confia na anterior.

### 11.2 Segregação de Dados

**Conceito**: Cada usuário vê apenas dados que tem permissão

**Implementação**:
- Queries filtradas por user_id ou organização_id
- RLS garante filtro no banco
- Client não tenta contornar (dados não existem)

### 11.3 Princípio do Menor Privilégio

**Conceito**: Usuário tem apenas permissões necessárias

**Implementação**:
- Roles são específicos (não "superuser")
- Permissões são granulares (não "all access")
- Admin é exception, não regra

### 11.4 Invalidação de Cache

**Conceito**: Permissões old não continuam sendo usadas

**Implementação**:
- Cache tem TTL (time to live) curto
- Cache é invalidado explicitamente em mudanças
- JWT é renovado em mudanças de role

### 11.5 HTTPS e Cookies Seguros

**Cookies de Sessão**:
- Flag `HttpOnly` (não acessível via JavaScript)
- Flag `Secure` (apenas HTTPS)
- Flag `SameSite=Strict` (CSRF protection)

**Token Handling**:
- Nunca armazenar token em localStorage
- Usar cookies gerenciados automaticamente
- Refresh token em background se necessário

### 11.6 Rate Limiting

**Onde aplicar**:
- Endpoints de autenticação (login, signup)
- Endpoints de mudança de dados
- Operações sensíveis (deletar usuário, atribuir role admin)

**Implementação**:
- Middleware ou API routes
- Por IP ou por usuário
- Retornar 429 se excedido

### 11.7 Monitoramento de Segurança

**O que monitorar**:
- Múltiplas tentativas de login falhadas
- Tentativas de acesso a rotas não autorizadas
- Mudanças rápidas de roles
- Acessos de localizações incomuns

**Ação**:
- Alerta ao admin/segurança
- Bloqueio temporário de conta
- Exigir re-autenticação

---

## 12. FLUXOS ESPECÍFICOS DE ROLE

### 12.1 Fluxo Admin

1. Admin autentica-se
2. Middleware valida token
3. Admin navega para `/admin/*`
4. Layout verifica se tem role `admin`
5. Admin acessa painel com sidebar
6. Admin pode:
   - Visualizar todos os usuários
   - Atribuir/remover roles
   - Gerenciar permissões
   - Ver audit logs
   - Acessar estatísticas

### 12.2 Fluxo User Comum

1. Usuário autentica-se
2. Middleware valida token
3. Usuário navega para `/dashboard`
4. Layout verifica se autenticado (role não importa)
5. Usuário vê conteúdo e dados pessoais
6. Usuário não pode:
   - Acessar `/admin/*`
   - Mudar roles de outros usuários
   - Ver dados de outros usuários (fora organização)
   - Acessar painel de segurança

### 12.3 Fluxo Moderator

1. Moderator autentica-se
2. Middleware valida token
3. Moderator navega para `/moderator/*`
4. Layout verifica se tem role `moderator`
5. Moderator acessa painel com ferramentas de moderação
6. Moderator pode:
   - Ver relatórios de usuários
   - Remover conteúdo flagged
   - Banir usuários (talvez)
   - Comentar em relatórios

---

## 13. VARIAÇÕES E EXTENSÕES

### 13.1 RBAC com Multi-Tenancy

**Conceito**: Um usuário pode ter roles diferentes em organizações diferentes

**Estrutura**:
- Tabela `organizations` para separar dados
- Tabela `organization_members` com `(organization_id, user_id, role_id)`
- RLS filtra por organização
- Contexto de organização na sessão

**Implicações**:
- User pode ser admin em Org A e viewer em Org B
- Queries sempre filtram por organização
- Dados não se misturam entre orgs

### 13.2 RBAC Dinâmico

**Conceito**: Roles e permissões podem ser criadas em runtime

**Implementação**:
- Painel de admin para criar roles
- Painel de admin para criar/editar permissões
- Atribuição dinâmica de permissões a roles
- Cache regenerado quando mudanças ocorrem

**Vs Estático**:
- Estático: Roles hardcoded no código
- Dinâmico: Roles no banco, definidas em runtime

### 13.3 RBAC com Atributos

**Conceito**: Permissões baseadas em atributos do usuário, não só role

**Exemplo**:
- Permissão: Usuário pode editar post se (role = editor) OU (é autor do post)
- Atributo: Propriedade do recurso
- Regra: Combinação lógica de role + atributo

**Implementação**:
- Adicionar coluna `owner_id` em tabelas de dados
- RLS usa `current_user_id() = owner_id` em addition to role check

---

## 14. DOCUMENTAÇÃO DE CONFIGURAÇÃO

### 14.1 Variáveis de Ambiente Necessárias

**Existentes**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

**Novas (Opcional)**:
- `SUPABASE_SERVICE_KEY` (para operações admin server-side)
- `JWT_SECRET` (se validando tokens fora do Supabase)
- `RBAC_CACHE_TTL` (duração de cache de permissões)
- `RATE_LIMIT_LOGIN_ATTEMPTS` (máximo de tentativas)

### 14.2 Configuração do Supabase

**Necessário**:
1. Habilitar Supabase Auth (email/password)
2. Configurar template de email para confirmação
3. Criar tabelas de RBAC (roles, permissions, user_roles, etc)
4. Habilitar RLS em tabelas
5. Criar políticas RLS

**Recomendado**:
1. Configurar custom JWT claims
2. Habilitar logging/audit
3. Configurar backup automático
4. Definir retenção de logs

### 14.3 Configuração de Roles Iniciais

**Padrão do Sistema**:
- `admin` - Acesso irrestrito
- `user` - Acesso padrão
- `guest` - Acesso limitado (se aplicável)

**Processo**:
1. Inserir roles em `roles` table via Supabase UI ou migration
2. Inserir permissões em `permissions` table
3. Criar relacionamentos em `role_permissions`
4. Atribuir roles aos usuários via `user_roles`

---

## 15. TESTES

### 15.1 Testes de Autenticação

**Casos**:
- Login com credenciais válidas
- Login com credenciais inválidas
- Logout
- Token expirado (renovação)
- Email não verificado

### 15.2 Testes de Autorização

**Casos**:
- Acesso com role correto (permitido)
- Acesso com role incorreto (negado)
- Acesso sem role (negado)
- Múltiplos roles (permitido se um é válido)

### 15.3 Testes de Segurança

**Casos**:
- RLS previne acesso a dados não autorizados
- JWT expirado não funciona
- Token forjado é rejeitado
- Rate limiting funciona
- SQL injection em queries é prevenido

### 15.4 Testes de Performance

**Casos**:
- Cache de permissões reduz queries
- Middleware não é lento
- Verificação de RBAC é instantânea

---

## 16. ROADMAP DE IMPLEMENTAÇÃO

### Fase 1: Autenticação (Existente)
- ✅ Login/logout
- ✅ Email verification
- ✅ Password reset
- ✅ Middleware de validação

### Fase 2: Estrutura RBAC (Próxima)
- Criar tabelas no banco
- Habilitar RLS
- Implementar helper functions
- Criar hooks de autorização
- Implementar middleware RBAC

### Fase 3: Proteção de Rotas
- Proteger rotas `/admin/*`
- Proteger rotas `/moderator/*`
- Redirecionar não autorizados
- Mostrar mensagens de erro apropriadas

### Fase 4: Painel Admin
- Interface para gerenciar usuários
- Interface para atribuir roles
- Interface para gerenciar permissões
- Audit logs viewer

### Fase 5: Otimizações
- Implementar cache de permissões
- Adicionar JWT custom claims
- Rate limiting
- Monitoramento de segurança

---

## CONCLUSÃO

A arquitetura RBAC descrita neste documento fornece:

1. **Segurança em Profundidade**: Múltiplas camadas de validação
2. **Escalabilidade**: Suporta crescimento de usuários e roles
3. **Flexibilidade**: Permite customizações conforme necessário
4. **Maintainabilidade**: Padrões claros e reutilizáveis
5. **Performance**: Cache e otimizações no banco de dados
6. **Auditoria**: Rastreamento completo de mudanças

Seguindo este documento, é possível implementar um sistema de RBAC robusto, seguro e eficiente usando Supabase e Next.js.
