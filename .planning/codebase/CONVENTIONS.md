# CONVENTIONS.md

## Convenções de Código e Padrões de Desenvolvimento

Este documento descreve as convenções de código, padrões de nomenclatura e outras diretrizes de desenvolvimento para garantir consistência e legibilidade em todo o projeto.

### Linguagem
- **Inglês:** Preferencialmente para nomes de variáveis, funções, classes, comentários e mensagens de commit.

### Formatação de Código
- **Prettier:** Utilizado para formatação automática de código. As configurações estão definidas no `.prettierrc`.
- **ESLint:** Utilizado para análise estática de código e identificação de problemas. As regras estão definidas no `.eslintrc.json`.

### Nomenclatura
- **Variáveis e Funções:** `camelCase` (ex: `userName`, `getUserData`).
- **Classes e Componentes:** `PascalCase` (ex: `UserComponent`, `UserService`).
- **Constantes Globais:** `SCREAMING_SNAKE_CASE` (ex: `API_BASE_URL`).
- **Arquivos:** `kebab-case` para componentes e módulos (ex: `user-card.tsx`, `auth-service.ts`).

### Comentários
- Comentários devem ser usados para explicar o "porquê" de uma decisão complexa, e não o "o quê" (que deve ser evidente pelo código).
- Usar JSDoc para documentar funções, classes e interfaces públicas.

### Git
- **Branches:** Seguir o padrão Gitflow (e.g., `feature/nome-da-feature`, `bugfix/descricao-do-bug`, `release/versao`).
- **Mensagens de Commit:** Devem ser claras, concisas e seguir o padrão Conventional Commits (e.g., `feat: adicionar funcionalidade X`, `fix: corrigir bug Y`, `chore: atualizar dependências`).

### TypeScript
- Usar tipagem explícita sempre que possível para melhorar a clareza e a segurança do tipo.
- Evitar `any` a todo custo.
- Definir interfaces e tipos para estruturas de dados complexas.
- **Interação com Supabase/Prisma:** Aproveitar a tipagem gerada pelo Prisma e pelo cliente Supabase para garantir segurança de tipo nas operações de banco de dados e APIs.

### Testes
- Seguir as convenções de nomenclatura de arquivos de teste (e.g., `*.test.ts`, `*.spec.ts`).
- Organizar testes na mesma estrutura de diretórios do código que estão testando, ou em uma pasta `__tests__`.

---
