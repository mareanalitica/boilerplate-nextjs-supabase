# ARCHITECTURE.md

## Visão Geral da Arquitetura

Este documento descreve a arquitetura geral do sistema, os padrões de design aplicados e os princípios arquiteturais que guiam o desenvolvimento.

### Padrões Arquiteturais
- **Arquitetura em Camadas (Layered Architecture):** O sistema é dividido em camadas distintas para separar responsabilidades e promover o baixo acoplamento.
    - **Apresentação (Frontend):** Responsável pela interface do usuário e interação.
    - **Aplicação (Backend/Edge Functions):** Contém a lógica de negócio, orquestra operações e interage com os serviços Supabase.
    - **Domínio:** Representa as entidades e regras de negócio centrais.
    - **Infraestrutura:** Lida com detalhes técnicos como persistência de dados, comunicação externa e serviços.
- **Micro-frontend (Opcional/Futuro):** Considerado para modularizar grandes aplicações frontend, permitindo equipes independentes e implantações autônomas.
- **Supabase como Backend as a Service (BaaS):** Atua como um gateway unificado para autenticação, banco de dados, armazenamento e Edge Functions, simplificando a gestão de APIs e segurança.

### Princípios de Design
- **SOLID:**
    - **SRP (Single Responsibility Principle):** Cada módulo, classe ou função tem uma única responsabilidade bem definida.
    - **OCP (Open/Closed Principle):** Entidades de software (classes, módulos, funções, etc.) devem ser abertas para extensão, mas fechadas para modificação.
    - **LSP (Liskov Substitution Principle):** Objetos em um programa devem ser substituíveis por instâncias de seus subtipos sem alterar a correção do programa.
    - **ISP (Interface Segregation Principle):** Clientes não devem ser forçados a depender de interfaces que não utilizam.
    - **DIP (Dependency Inversion Principle):** Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações.
- **DRY (Don't Repeat Yourself):** Evitar duplicação de código e lógica.
- **KISS (Keep It Simple, Stupid):** Priorizar a simplicidade e clareza no design e implementação.
- **YAGNI (You Ain't Gonna Need It):** Não implementar funcionalidades que não são estritamente necessárias no momento.

### Estrutura de Módulos
O projeto é organizado em módulos lógicos, cada um encapsulando uma funcionalidade específica (e.g., `auth`, `billing`, `dashboard`, `users`). Cada módulo segue uma estrutura interna consistente, geralmente com separação de concerns (controllers, services, repositories, models).

### Comunicação entre Componentes
- **Supabase APIs (RESTful e GraphQL):** Para comunicação síncrona entre frontend e backend (Edge Functions), e para interação direta com o banco de dados e outros serviços Supabase.
- **Message Queues (Opcional/Futuro):** Para comunicação assíncrona e desacoplamento entre serviços, melhorando a resiliência e escalabilidade.

---
