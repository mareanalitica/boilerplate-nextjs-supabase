# Requisitos: v1 Base de SaaS Open Source

**Definido:** 23/02/2026
**Valor Central:** Fornecer uma fundação sólida e flexível para o desenvolvimento rápido de aplicações SaaS.

## Requisitos v1

Requisitos para o lançamento inicial. Cada um mapeia para fases do roadmap.

### Autenticação e Autorização

- [ ] **AUTH-01**: Usuário pode se registrar com e-mail e senha.
- [ ] **AUTH-02**: Usuário pode fazer login com e-mail e senha.
- [ ] **AUTH-03**: Usuário pode fazer login com provedores sociais (e.g., Google, GitHub).
- [ ] **AUTH-04**: Usuário pode redefinir a senha via link de e-mail.
- [ ] **AUTH-05**: A sessão do usuário persiste após a atualização do navegador.
- [ ] **AUTH-06**: Usuário pode gerenciar sua conta (e.g., alterar senha, atualizar perfil).

### Plataforma Core

- [ ] **PLAT-01**: A aplicação utiliza uma estrutura de monorepo (frontend, backend, pacotes compartilhados).
- [ ] **PLAT-02**: O frontend é construído com Next.js.
- [ ] **PLAT-03**: O backend é construído com Supabase Edge Functions/APIs.
- [ ] **PLAT-04**: A persistência de dados utiliza PostgreSQL via Supabase e Prisma ORM.
- [ ] **PLAT-05**: Componentes de UI são construídos com Shadcn UI e Tailwind CSS.
- [ ] **PLAT-06**: Pipeline de CI/CD básico é configurado para builds e deployments automatizados.

### Multi-tenancy (Inicial)

- [ ] **MT-01**: A aplicação suporta isolamento básico de dados por tenant.
- [ ] **MT-02**: Usuários são associados a um tenant específico.
- [ ] **MT-03**: O contexto do tenant está disponível em toda a aplicação.

## Requisitos v2

Adiados para futuras versões. Acompanhados, mas não no roadmap atual.

### Multi-tenancy Avançado

- **MT-04**: Branding e customização específicos por tenant.
- **MT-05**: Controle de acesso baseado em funções (RBAC) dentro dos tenants.

### Faturamento

- **BILL-01**: Integração com gateway de pagamento (e.g., Stripe).
- **BILL-02**: Gerenciamento de assinaturas para tenants.

## Fora do Escopo

Explicitamente excluídos. Documentado para evitar o aumento do escopo.

| Funcionalidade | Razão |
|----------------|-------|
| Funcionalidades de pagamento complexas (assinaturas, faturamento recorrente) | Foco na base, não em funcionalidades específicas de negócio. |
| Integrações com múltiplos provedores de cloud (AWS, Azure, GCP) | Foco inicial em Vercel e Supabase. |
| Suporte a bancos de dados NoSQL | Foco em PostgreSQL. |

## Rastreabilidade

Qual fase cobre quais requisitos. Atualizado durante a criação do roadmap.

| Requisito | Fase | Status |
|-----------|------|--------|
|           |      |        |

**Cobertura:**
- Requisitos v1: [X] total
- Mapeados para fases: [Y]
- Não mapeados: [Z] ⚠️

---
*Requisitos definidos: 23/02/2026*
*Última atualização: 23/02/2026 após definição do marco v1 Base de SaaS Open Source*
