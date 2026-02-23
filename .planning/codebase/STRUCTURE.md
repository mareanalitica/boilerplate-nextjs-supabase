# STRUCTURE.md

## Estrutura do Projeto

Este documento descreve a estrutura de diretórios e a organização do código-fonte do projeto.

### Raiz do Projeto
- `apps/`: Contém as aplicações principais (e.g., `web` para o frontend, `api` para o backend).
- `packages/`: Contém pacotes internos reutilizáveis (e.g., `ui` para componentes de UI, `config` para configurações compartilhadas, `db` para o cliente Prisma e definições de schema).
- `docs/`: Documentação do projeto.
- `.github/`: Configurações de CI/CD (GitHub Actions).
- `.vscode/`: Configurações do VS Code.
- `.env.example`: Exemplo de variáveis de ambiente.
- `package.json`: Metadados do projeto e scripts.
- `tsconfig.json`: Configurações globais do TypeScript.
- `turbo.json`: Configurações do Turborepo.

### Estrutura de `apps/web` (Frontend - Next.js)
- `app/`: Rotas e páginas do Next.js (App Router).
    - `(auth)/`: Rotas relacionadas à autenticação.
    - `(dashboard)/`: Rotas do dashboard principal.
    - `api/`: Rotas de API do Next.js (API Routes).
- `components/`: Componentes React reutilizáveis.
    - `ui/`: Componentes Shadcn UI customizados ou estendidos.
    - `common/`: Componentes genéricos.
    - `layout/`: Componentes de layout.
- `lib/`: Funções utilitárias e helpers.
- `hooks/`: Custom React Hooks.
- `styles/`: Estilos globais e configurações do Tailwind CSS.
- `types/`: Definições de tipos TypeScript.

### Estrutura de `apps/api` (Backend - Supabase Edge Functions/APIs)
- `src/`: Código fonte das Edge Functions/APIs.
- `functions/`: Diretório para as Supabase Edge Functions.
- `api/`: Diretório para API Routes do Next.js (se aplicável para lógica de backend).
- `services/`: Lógica de negócio.
- `repositories/`: Interação com o banco de dados (via Prisma e/ou cliente Supabase).
- `utils/`: Funções utilitárias.
- `config/`: Configurações específicas.
- `types/`: Definições de tipos TypeScript.
- `middleware.ts`: Middleware para Next.js (se aplicável).
- `supabase/`: Configurações e scripts relacionados ao Supabase.

### Estrutura de `packages/db`
- `prisma/`: Arquivos do Prisma.
    - `schema.prisma`: Definição do schema do banco de dados.
    - `migrations/`: Migrações do banco de dados.
- `index.ts`: Exporta o cliente Prisma configurado.

### Estrutura de `packages/ui`
- `components/`: Componentes de UI reutilizáveis (Shadcn UI, etc.).
- `lib/`: Funções utilitárias para UI.

---
