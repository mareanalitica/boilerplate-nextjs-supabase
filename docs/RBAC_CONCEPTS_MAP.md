# Mapa Conceitual de RBAC

## Visão Geral

Este documento mapeia os conceitos de RBAC para o contexto específico do projeto SaaS Minimal com Supabase, sem incluir exemplos de código. Serve como referência rápida para entender relações e fluxos.

---

## 1. PIRÂMIDE DE CAMADAS DE PROTEÇÃO

```
┌─────────────────────────────────────┐
│  Client (Browser)                   │ ← UX: ocultar botões, mostrar mensagens
│  - Componentes condicionais         │
│  - Hooks de verificação             │
│  - Feedback visual                  │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Server (App Router)                │ ← Rendering: gerar ou redirecionar
│  - Layouts de rotas                 │
│  - Server components                │
│  - Redirecionamento                 │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Server Actions / API Routes        │ ← Logic: executar ou rejeitar
│  - Validações reais                 │
│  - Modificação de dados             │
│  - Respostas HTTP                   │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Database (RLS)                     │ ← Guarantee: impossível contornar
│  - Row Level Security               │
│  - Políticas de acesso              │
│  - Filtros automáticos              │
└─────────────────────────────────────┘
```

**Princípio**: Cada camada é independente. Não confiar na anterior.

---

## 2. MAPEAMENTO DE DECISÕES

### Decisão: Usuário pode acessar rota?

```
Pergunta: Usuário está autenticado?
         ├─ NÃO → Não é um usuário válido
         │        └─ Ação: Redirecionar para /auth/login
         │           (Middleware)
         │
         └─ SIM → É um usuário válido
                  ├─ Pergunta: Rota precisa de role específico?
                  │           ├─ NÃO → Permissão garantida
                  │           │        └─ Ação: Renderizar página
                  │           │           (Layout autenticado)
                  │           │
                  │           └─ SIM → Precisa de role específico
                  │                    ├─ Pergunta: Usuário tem esse role?
                  │                    │           ├─ NÃO → Sem permissão
                  │                    │           │        └─ Ação: Redirecionar /access-denied
                  │                    │           │           (Layout RBAC)
                  │                    │           │
                  │                    │           └─ SIM → Tem o role
                  │                    │                    └─ Ação: Renderizar página
                  │                    │                       (Layout role-específico)
```

---

## 3. MAPEAMENTO DE USUÁRIOS

### Tipo 1: Anônimo (Não autenticado)

```
┌─────────────────────────────────────┐
│ USUÁRIO ANÔNIMO                     │
├─────────────────────────────────────┤
│ JWT Token:           NÃO HÁ         │
│ Autenticação:        Falhou         │
│ User ID:             null           │
│ Roles:               []             │
│ Permissões:          []             │
├─────────────────────────────────────┤
│ Pode acessar:        ✓ / (home)     │
│                      ✓ /pricing     │
│                      ✓ /about       │
│                      ✓ /auth/login  │
│                      ✓ /auth/signup │
│                                     │
│ Não pode acessar:    ✗ /dashboard   │
│                      ✗ /profile     │
│                      ✗ /admin       │
│                      ✗ /moderator   │
│                                     │
│ Redireção:           → /auth/login  │
└─────────────────────────────────────┘
```

### Tipo 2: Autenticado (Usuário comum)

```
┌─────────────────────────────────────┐
│ USUÁRIO AUTENTICADO (Comum)         │
├─────────────────────────────────────┤
│ JWT Token:           Válido         │
│ Autenticação:        Sucesso        │
│ User ID:             uuid           │
│ Roles:               [user]         │
│ Permissões:          [ler_próprio]  │
├─────────────────────────────────────┤
│ Pode acessar:        ✓ / (home)     │
│                      ✓ /auth/login  │
│                      ✓ /dashboard   │
│                      ✓ /profile     │
│                      ✓ /profile/..  │
│                                     │
│ Não pode acessar:    ✗ /admin       │
│                      ✗ /moderator   │
│                      ✗ /editor      │
│                                     │
│ Redireção:           → /dashboard   │
│ (se tentar /admin)                  │
└─────────────────────────────────────┘
```

### Tipo 3: Admin

```
┌─────────────────────────────────────┐
│ USUÁRIO ADMINISTRADOR               │
├─────────────────────────────────────┤
│ JWT Token:           Válido         │
│ Autenticação:        Sucesso        │
│ User ID:             uuid           │
│ Roles:               [admin, user]  │
│ Permissões:          [todas]        │
├─────────────────────────────────────┤
│ Pode acessar:        ✓ Tudo         │
│                      ✓ /admin       │
│                      ✓ /admin/users │
│                      ✓ /admin/roles │
│                      ✓ /admin/..    │
│                      ✓ /dashboard   │
│                      ✓ /profile     │
│                                     │
│ Não pode acessar:    ✗ Nada         │
│                                     │
│ Redireção:           Nenhuma        │
│ (acesso irrestrito)                 │
└─────────────────────────────────────┘
```

### Tipo 4: Especificado (ex: Editor, Moderator)

```
┌─────────────────────────────────────┐
│ USUÁRIO EDITOR / MODERATOR          │
├─────────────────────────────────────┤
│ JWT Token:           Válido         │
│ Autenticação:        Sucesso        │
│ User ID:             uuid           │
│ Roles:               [editor, user] │
│ Permissões:          [editar, ..] │
├─────────────────────────────────────┤
│ Pode acessar:        ✓ / (home)     │
│                      ✓ /dashboard   │
│                      ✓ /profile     │
│                      ✓ /editor      │
│                      ✓ /editor/..   │
│                                     │
│ Não pode acessar:    ✗ /admin       │
│                      ✗ /moderator   │
│                                     │
│ Redireção:           → /access-..   │
│ (se tentar /admin)                  │
└─────────────────────────────────────┘
```

---

## 4. MAPEAMENTO DE ENTIDADES

### Entidade: USER (auth.users)

```
┌─────────────────────────────────────┐
│ USER (Supabase Auth)                │
├─────────────────────────────────────┤
│ id:                 uuid             │
│ email:              string           │
│ email_confirmed:    boolean          │
│ created_at:         timestamp        │
│ last_sign_in_at:    timestamp        │
│ role:               'authenticated' │ ← Sempre 'authenticated'
│                     (padrão Supabase)│
│                                     │
│ Relação:                            │
│ ├─ 1 user : N user_roles           │ ← Atribui roles
│ └─ 1 user : N audit_logs           │ ← Rastreia ações
└─────────────────────────────────────┘
```

### Entidade: ROLE

```
┌─────────────────────────────────────┐
│ ROLE (Tabela no banco)              │
├─────────────────────────────────────┤
│ id:                 uuid             │
│ name:               string           │ ← 'admin', 'editor', etc
│ description:        text             │ ← Descrição legível
│ created_at:         timestamp        │
│ updated_at:         timestamp        │
│                                     │
│ Relação:                            │
│ ├─ 1 role : N user_roles           │ ← Usado por usuários
│ └─ 1 role : N role_permissions     │ ← Tem permissões
└─────────────────────────────────────┘
```

### Entidade: PERMISSION

```
┌─────────────────────────────────────┐
│ PERMISSION (Tabela no banco)        │
├─────────────────────────────────────┤
│ id:                 uuid             │
│ name:               string           │ ← 'users:read', etc
│ description:        text             │ ← Descrição legível
│ category:           string           │ ← 'users', 'content'
│ created_at:         timestamp        │
│ updated_at:         timestamp        │
│                                     │
│ Relação:                            │
│ └─ 1 permission : N role_permissions│ ← Atribuída a roles
└─────────────────────────────────────┘
```

### Entidade: USER_ROLE (Junction)

```
┌─────────────────────────────────────┐
│ USER_ROLE (Tabela no banco)         │
├─────────────────────────────────────┤
│ user_id:            uuid             │ ← Referencia user
│ role_id:            uuid             │ ← Referencia role
│ assigned_at:        timestamp        │
│ assigned_by:        uuid             │ ← Quem atribuiu
│                                     │
│ Chave primária: (user_id, role_id) │
│                                     │
│ Relação:                            │
│ ├─ N : 1 com users                 │
│ └─ N : 1 com roles                 │
└─────────────────────────────────────┘
```

### Entidade: ROLE_PERMISSION (Junction)

```
┌─────────────────────────────────────┐
│ ROLE_PERMISSION (Tabela no banco)   │
├─────────────────────────────────────┤
│ role_id:            uuid             │ ← Referencia role
│ permission_id:      uuid             │ ← Referencia permission
│ created_at:         timestamp        │
│                                     │
│ Chave primária: (role_id, permission_id)
│                                     │
│ Relação:                            │
│ ├─ N : 1 com roles                 │
│ └─ N : 1 com permissions           │
└─────────────────────────────────────┘
```

---

## 5. FLUXOS VISUAIS

### Fluxo de Login

```
Usuário acessa app
       │
       ▼
┌─────────────┐
│ Middleware  │ ← Verifica JWT em cookies
│ (edge)      │
└──┬─────┬────┘
   │     │
   │ Válido?
   │
   ├─ SIM ──────────────────────┐
   │                            │
   └─ NÃO ─────────────┐        │
                       │        │
                       ▼        │
                  /auth/login   │
                       │        │
                       ▼        ▼
                   Credenciais  Claims extraído
                       │        │
                       ▼        │
                  Supabase auth │
                       │        │
                       ├─ Sucesso ──────────────┐
                       │                        │
                       ├─ Falha ───────┐        │
                       │                │        │
                       ▼                ▼        ▼
                    /error         /dashboard   /protected/*
                                   (qualquer rota autenticada)
```

### Fluxo de Verificação de Role

```
Usuário acessa /admin
       │
       ▼
Middleware verifica autenticação
       │
       ├─ Falhou ──────────────────► /auth/login
       │
       └─ Passou
             │
             ▼
       Layout (admin) verifica role
             │
             ├─ user_roles.find(role = 'admin')
             │
             ├─ Encontrou ────────────────────► Renderizar página /admin
             │
             └─ Não encontrou
                   │
                   ▼
            Usuário não tem role admin
                   │
                   ▼
            /access-denied
```

### Fluxo de Server Action Protegido

```
Usuário clica "Atribuir Role a Usuário"
       │
       ▼
   Formulário
       │
       ▼
Server Action (backend)
       │
       ├─ Revalida: Usuário autenticado?
       │   ├─ NÃO ────────────────────► Erro: Não autenticado
       │   └─ SIM ────┐
       │              │
       │              ▼
       │         Verifica: User tem role 'admin'?
       │              │
       │              ├─ NÃO ────────────────────► Erro: Sem permissão
       │              │
       │              └─ SIM
       │                   │
       │                   ▼
       │            Valida dados do formulário
       │                   │
       │                   ├─ Inválido ───────────► Erro: Dados inválidos
       │                   │
       │                   └─ Válido
       │                       │
       │                       ▼
       │                Insere em user_roles
       │                       │
       │                       ├─ RLS Permite? ───┐
       │                       │ SIM              │
       │                       ▼                  │
       │                   Sucesso ◄──────────────┘
       │                       │
       └──────────────────────►│
                               ▼
                        Revalidar dados
                               │
                               ▼
                        Mostrar sucesso
```

---

## 6. MATRIZ DE ACESSO

### Por Tipo de Usuário e Rota

```
┌──────────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Rota         │ Anônimo  │ User     │ Admin    │ Editor   │ Moderator│
├──────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ /            │ ✓        │ ✓        │ ✓        │ ✓        │ ✓        │
│ /auth/login  │ ✓        │ →dash    │ →dash    │ →dash    │ →dash    │
│ /dashboard   │ ✗        │ ✓        │ ✓        │ ✓        │ ✓        │
│ /profile     │ ✗        │ ✓        │ ✓        │ ✓        │ ✓        │
│ /admin       │ ✗        │ ✗        │ ✓        │ ✗        │ ✗        │
│ /admin/users │ ✗        │ ✗        │ ✓        │ ✗        │ ✗        │
│ /editor      │ ✗        │ ✗        │ ✓        │ ✓        │ ✗        │
│ /moderator   │ ✗        │ ✗        │ ✓        │ ✗        │ ✓        │
└──────────────┴──────────┴──────────┴──────────┴──────────┴──────────┘

Legend:
✓ = Acesso permitido
✗ = Acesso negado (redireciona)
→dash = Redireciona para /dashboard (já autenticado)
```

---

## 7. MAPEAMENTO DE DECISÕES EM CÓDIGO

### Onde validar em cada contexto?

```
┌─────────────────────────────────────────┐
│ MIDDLEWARE (middleware.ts)              │
├─────────────────────────────────────────┤
│ Valida:    Autenticação (JWT)           │
│ Método:    getClaims(), validação token │
│ Ação:      Redireciona ou passa         │
│ Return:    Permissão ou 401             │
│ Timing:    Antes de requisição chegar   │
│ Cache:     JWT em cookies               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ LAYOUT (app/layout.tsx, groups)         │
├─────────────────────────────────────────┤
│ Valida:    Autenticação + Role          │
│ Método:    getUser() + Query de roles   │
│ Ação:      Redireciona ou renderiza     │
│ Return:    Componentes ou redirect()    │
│ Timing:    Durante renderização server  │
│ Cache:     Roles em contexto            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ SERVER ACTION (component.tsx)           │
├─────────────────────────────────────────┤
│ Valida:    Autenticação + Permissão     │
│ Método:    Revalida + Query permissão   │
│ Ação:      Executa ou retorna erro      │
│ Return:    Resultado ou error object    │
│ Timing:    Quando ação é executada      │
│ Cache:     N/A (sempre valida)          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ API ROUTE (app/api/route.ts)            │
├─────────────────────────────────────────┤
│ Valida:    Autenticação + Permissão     │
│ Método:    Extrai token + Query         │
│ Ação:      Executa ou retorna 403       │
│ Return:    JSON ou HTTP status          │
│ Timing:    Quando requisição HTTP chega │
│ Cache:     Headers de cache             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ COMPONENT HOOK (useRole, usePermission) │
├─────────────────────────────────────────┤
│ Valida:    Role/Permissão (UX)          │
│ Método:    Dados já carregados          │
│ Ação:      Renderiza ou oculta          │
│ Return:    Boolean ou dados             │
│ Timing:    Durante renderização client  │
│ Cache:     Estado local                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ DATABASE RLS (policies)                 │
├─────────────────────────────────────────┤
│ Valida:    Propriedade de dados         │
│ Método:    Comparação de user_id        │
│ Ação:      Filtra ou rejeita query      │
│ Return:    Linhas ou erro               │
│ Timing:    Quando query chega ao banco  │
│ Cache:     N/A (sempre executa)         │
└─────────────────────────────────────────┘
```

---

## 8. CICLO DE VIDA DE UM USUÁRIO

### Login → Uso → Logout

```
1. ANTES DE LOGIN
   ├─ Usuário: Anônimo
   ├─ Token: Nenhum
   ├─ Roles: Nenhum
   └─ Acesso: Apenas /auth/*, /public/*

2. DURANTE LOGIN
   ├─ Usuário submete email/senha
   ├─ Supabase Auth valida
   ├─ JWT token é gerado
   ├─ Token é armazenado em cookie (secure)
   └─ Middleware atualiza sessão

3. PÓS LOGIN
   ├─ Usuário: Autenticado
   ├─ Token: JWT válido em cookie
   ├─ Roles: Consultadas de user_roles
   ├─ Contexto: Auth context preenchido
   └─ Acesso: Conforme roles atribuídas

4. DURANTE USO
   ├─ User acessa /dashboard
   │   └─ Middleware valida token (passa)
   │   └─ Layout renderiza (autenticado)
   │   └─ Componentes usam hooks (carregam dados)
   │
   ├─ User acessa /admin
   │   └─ Middleware valida token (passa)
   │   └─ Layout valida role admin
   │   └─ Se tem: renderiza /admin
   │   └─ Se não: redireciona /access-denied
   │
   ├─ User clica em "Enviar relatório"
   │   └─ Server action valida
   │   └─ Insere em database (com RLS)
   │   └─ Audit log é criado automaticamente
   │
   └─ Operações periódicas
       └─ Token expirado? Refresh automático
       └─ Mudança de role? Requer reload (ou refresh token)

5. LOGOUT
   ├─ User clica "Logout"
   ├─ Client chama logOut()
   ├─ Cookie de sessão é deletado
   ├─ Middleware detecta ausência de token
   ├─ Próxima requisição é redirecionada para /auth/login
   └─ User volta a ser anônimo

6. APÓS LOGOUT
   ├─ Usuário: Anônimo novamente
   ├─ Token: Nenhum
   ├─ Roles: Nenhum
   └─ Acesso: Apenas /auth/*, /public/*
```

---

## 9. MATRIX DE CAMADAS vs RESPONSABILIDADE

```
┌──────────────────┬─────────────┬──────────────┬──────────────┐
│ O que validar?   │ Middleware? │ Layout?      │ Server Act?  │
├──────────────────┼─────────────┼──────────────┼──────────────┤
│ Autenticação     │ SIM (JWT)   │ SIM (re)     │ SIM (re)     │
│ Role             │ NÃO         │ SIM          │ SIM (se req) │
│ Permissão Esp.   │ NÃO         │ NÃO          │ SIM          │
│ Propriedade      │ NÃO         │ NÃO          │ SIM (query)  │
│ Dados            │ NÃO         │ NÃO          │ SIM (RLS)    │
├──────────────────┼─────────────┼──────────────┼──────────────┤
│ Timing           │ Edge        │ Server       │ Server       │
│ Performance      │ Rápido      │ Médio        │ Médio        │
│ Contornável?     │ Não         │ Sim (cache)  │ Não (RLS)    │
└──────────────────┴─────────────┴──────────────┴──────────────┘
```

---

## 10. FLUXOS DE ERRO

### Erro: Não autenticado

```
User tenta acessar /dashboard
       │
       ▼
Middleware: verifica token
       │
       ├─ Token ausente ou inválido
       │
       ▼
Middleware redireciona para /auth/login
       │
       ▼
User vê página de login
```

### Erro: Autenticado mas sem role

```
Admin atribui role 'editor' a usuário
       │
       ▼
Usuário tenta acessar /editor
       │
       ▼
Middleware: verifica token (SIM, válido)
       │
       ▼
Layout (editor): verifica role 'editor'
       │
       ├─ User tem? Sim
       │
       ▼
Renderiza página /editor
```

vs

```
Usuário SEM role tenta acessar /admin
       │
       ▼
Middleware: verifica token (SIM, válido)
       │
       ▼
Layout (admin): verifica role 'admin'
       │
       ├─ User tem? NÃO
       │
       ▼
Layout redireciona para /access-denied
       │
       ▼
User vê página de acesso negado
```

### Erro: Server action sem permissão

```
User clica "Deletar usuário" (sem ser admin)
       │
       ▼
Server action: revalida autenticação (SIM)
       │
       ▼
Server action: verifica role 'admin'
       │
       ├─ User tem? NÃO
       │
       ▼
Server action retorna erro
       │
       ▼
Client mostra mensagem de erro
```

---

## 11. MAPEAMENTO: CONCEITO → IMPLEMENTAÇÃO

```
CONCEITO                    ONDE?                 TIPO
────────────────────────────────────────────────────────
Autenticação de JWT         middleware.ts         Validação
Sessão de usuário           lib/supabase/         Context
Obter dados de usuário      lib/supabase/server   Function
Listar todos os roles       Banco (roles)         Table
Listar permissions          Banco (permissions)   Table
Atribuir role               Banco (user_roles)    Insert
Verificar se tem role       Server action         Query
Proteger rota               (rbac)/layout         Validação
Ocultar elemento            useRole() hook        Hook
Auditoria                   Banco (audit_logs)    Trigger
Segurança RLS               Banco (policies)      SQL
```

---

## 12. CHECKLIST DE SEGURANÇA

```
Antes de considerar implementação segura:

AUTENTICAÇÃO
☐ JWT token em cookies (HttpOnly, Secure, SameSite)
☐ Middleware valida token em cada requisição
☐ Token expiração configurado (recomendado: 1h)
☐ Refresh token para renovação (recomendado: 7 dias)

AUTORIZAÇÃO
☐ Roles definidas e documentadas
☐ Permissões granulares (não super-poderes)
☐ Validação em múltiplas camadas
☐ Nenhuma confiança no client

BANCO DE DADOS
☐ RLS habilitado em todas tabelas sensíveis
☐ Políticas RLS por usuário/role
☐ Nenhuma permissão ALL ou Public
☐ Foreign keys com ON DELETE apropriado

AUDITORIA
☐ Audit logs para mudanças de role
☐ Audit logs para operações sensíveis
☐ Timestamp e user_id em cada log
☐ Logs não podem ser editados (apenas append)

DADOS
☐ Senhas nunca em logs
☐ Tokens nunca em logs
☐ Dados sensíveis não em localStorage
☐ Rate limiting em endpoints críticos

TESTES
☐ Testar acesso com usuários diferentes
☐ Testar expiração de token
☐ Testar mudança de role
☐ Testar RLS (tentar contornar via SQL)
```

---

## RESUMO RÁPIDO

| Conceito | Significa | Onde | Como |
|----------|-----------|------|------|
| **Autenticação** | Verificar identidade | Middleware | JWT token |
| **Autorização** | Verificar permissão | Múltiplas camadas | Role + Permission |
| **Role** | Papel do usuário | Banco de dados | Tabela roles |
| **Permission** | Ação permitida | Banco de dados | Tabela permissions |
| **RBAC** | Controle por role | Sistema inteiro | Queries + Validações |
| **RLS** | Segurança no banco | Database | SQL policies |
| **JWT** | Token de autenticação | Cookie | Middleware |
| **Claim** | Informação no JWT | Token | Extrai em middleware |
| **User Context** | Dados do usuário | Session | Passa para componentes |
| **Audit Log** | Rastreamento | Database trigger | Registra mudanças |

Este mapa serve como referência para entender como os conceitos de RBAC se conectam e funcionam juntos no contexto do projeto.
