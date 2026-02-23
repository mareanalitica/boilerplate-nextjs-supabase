# v1 Base de SaaS Open Source

## O Que É Isso

Uma base de código minimalista e modular para a construção de aplicações SaaS, focada em escalabilidade, manutenibilidade e extensibilidade. Destinado a desenvolvedores que buscam um ponto de partida robusto para seus projetos SaaS.

## Valor Central

Fornecer uma fundação sólida e flexível para o desenvolvimento rápido de aplicações SaaS.

## Requisitos

### Validados

<!-- Entregues e confirmados como valiosos. -->

(Nenhum ainda — entregar para validar)

### Ativos

<!-- Escopo atual. Construindo em direção a estes. -->

- [ ] Implementação de autenticação e autorização de usuários (Supabase Auth)
- [ ] Estrutura de monorepo com Turborepo para frontend (Next.js) e backend (Edge Functions/APIs com Supabase)
- [ ] Integração com banco de dados PostgreSQL via Supabase e Prisma
- [ ] Componentes de UI reutilizáveis com Shadcn UI e Tailwind CSS
- [ ] Configuração de CI/CD básica com GitHub Actions
- [ ] Suporte a multi-tenancy (inicial)

### Fora do Escopo

<!-- Limites explícitos. Inclui justificativa para evitar re-adição. -->

- Funcionalidades de pagamento complexas (assinaturas, faturamento recorrente) — Foco na base, não em funcionalidades específicas de negócio.
- Integrações com múltiplos provedores de cloud (AWS, Azure, GCP) — Foco inicial em Vercel e Supabase.
- Suporte a bancos de dados NoSQL — Foco em PostgreSQL (via Supabase).

## Contexto

- Base de código recém-mapeada (ver `.planning/codebase/`)
- Necessidade de uma estrutura modular e escalável para futuras funcionalidades SaaS.
- Prioridade em experiência de desenvolvedor e facilidade de manutenção.

## Restrições

- **Pilha Tecnológica**: TypeScript, React/Next.js, Supabase (Auth, Database, Edge Functions), PostgreSQL, Prisma.
- **Prazo**: Lançamento da v1 como base open source em [Data Alvo].
- **Recursos**: Equipe pequena de desenvolvimento.

## Decisões Chave

<!-- Decisões que restringem o trabalho futuro. Adicionar ao longo do ciclo de vida do projeto. -->

| Decisão | Justificativa | Resultado |
|----------|-----------|---------|
| Escolha de Monorepo (Turborepo) | Facilita o gerenciamento de múltiplos pacotes e aplicações, compartilhamento de código e otimização de builds. | ✓ Bom |
| Escolha de ORM (TypeORM) | Oferece tipagem segura, migrações e um cliente de banco de dados moderno. | ✓ Bom |

---
*Última atualização: 23/02/2026 após inicialização do marco v1 Base de SaaS Open Source*
