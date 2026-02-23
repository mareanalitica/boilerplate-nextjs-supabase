# ROADMAP: v1 Base de SaaS Open Source

## Visão Geral

Este roadmap descreve as fases de desenvolvimento para o marco "v1 Base de SaaS Open Source", alinhando-se aos requisitos definidos em `.planning/REQUIREMENTS.md`.

## Fases do Projeto

### Fase 1: Configuração da Plataforma e Autenticação Básica

- **Objetivo:** Estabelecer a estrutura fundamental do monorepo e implementar a autenticação de usuários.
- **Requisitos Cobertos:**
    - [ ] **PLAT-01**: A aplicação utiliza uma estrutura de monorepo (frontend, backend, pacotes compartilhados).
    - [ ] **PLAT-02**: O frontend é construído com Next.js.
    - [ ] **PLAT-03**: O backend é construído com Supabase Edge Functions/APIs.
    - [ ] **PLAT-04**: A persistência de dados utiliza PostgreSQL via Supabase e Prisma ORM.
    - [ ] **AUTH-01**: Usuário pode se registrar com e-mail e senha.
    - [ ] **AUTH-02**: Usuário pode fazer login com e-mail e senha.
    - [ ] **AUTH-05**: A sessão do usuário persiste após a atualização do navegador.
- **Entregáveis:**
    - Monorepo configurado com Next.js e Supabase Edge Functions/APIs.
    - Banco de dados PostgreSQL provisionado via Supabase e schema inicial com Prisma.
    - Funcionalidade de registro e login com e-mail/senha (via Supabase Auth).
    - Gerenciamento de sessão de usuário (via Supabase Auth).

### Fase 2: Componentes UI, CI/CD e Autenticação Avançada

- **Objetivo:** Desenvolver a biblioteca de componentes UI, configurar o pipeline de CI/CD e expandir as opções de autenticação.
- **Requisitos Cobertos:**
    - [ ] **PLAT-05**: Componentes de UI são construídos com Shadcn UI e Tailwind CSS.
    - [ ] **PLAT-06**: Pipeline de CI/CD básico é configurado para builds e deployments automatizados.
    - [ ] **AUTH-03**: Usuário pode fazer login com provedores sociais (e.g., Google, GitHub).
    - [ ] **AUTH-04**: Usuário pode redefinir a senha via link de e-mail.
    - [ ] **AUTH-06**: Usuário pode gerenciar sua conta (e.g., alterar senha, atualizar perfil).
- **Entregáveis:**
    - Biblioteca de componentes UI básica.
    - Pipeline de CI/CD funcional para frontend e backend.
    - Integração de login social (Google, GitHub).
    - Funcionalidade de recuperação de senha.
    - Páginas de gerenciamento de perfil de usuário.

### Fase 3: Multi-tenancy Inicial

- **Objetivo:** Implementar o suporte básico a multi-tenancy.
- **Requisitos Cobertos:**
    - [ ] **MT-01**: A aplicação suporta isolamento básico de dados por tenant.
    - [ ] **MT-02**: Usuários são associados a um tenant específico.
    - [ ] **MT-03**: O contexto do tenant está disponível em toda a aplicação.
- **Entregáveis:**
    - Mecanismo de identificação de tenant.
    - Filtro de dados por tenant em queries de banco de dados.
    - Contexto de tenant acessível no frontend e backend.

## Próximos Passos

Após a conclusão deste roadmap, o projeto estará pronto para a próxima fase de desenvolvimento, que pode incluir funcionalidades mais avançadas de multi-tenancy, faturamento ou outras funcionalidades específicas de SaaS.

---
*Roadmap definido: 23/02/2026*
*Última atualização: 23/02/2026 após definição do marco v1 Base de SaaS Open Source*
