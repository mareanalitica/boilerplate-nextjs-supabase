# Guia de Configuração — SaaS Minimal

Stack: **Next.js + Supabase + Stripe Wrapper + Coolify (VPS)**

> Objetivo: ter o SaaS rodando em produção com 3 planos de assinatura, auth completo e pagamentos integrados.

---

## Índice

1. [O que você precisa coletar](#1-o-que-você-precisa-coletar)
2. [Supabase — configuração](#2-supabase--configuração)
3. [Stripe — configuração](#3-stripe--configuração)
4. [Stripe Wrapper no Supabase](#4-stripe-wrapper-no-supabase)
5. [Os 3 Planos](#5-os-3-planos)
6. [VPS + Coolify — deploy](#6-vps--coolify--deploy)
7. [Variáveis de ambiente finais](#7-variáveis-de-ambiente-finais)
8. [Estimativa de horas](#8-estimativa-de-horas)

---

## 1. O que você precisa coletar

Antes de começar, abra uma aba para cada serviço e cole os valores abaixo no seu `.env.local`.

### Supabase
| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings → API → anon / public |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role ⚠️ nunca expor no client |
| `SUPABASE_JWT_SECRET` | Project Settings → API → JWT Secret |

### Stripe
| Variável | Onde encontrar |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys → Secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API Keys → Publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks → Signing secret |

### Aplicação
| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_APP_URL` | URL de produção, ex: `https://seuapp.com` |
| `NEXT_PUBLIC_APP_NAME` | Nome do produto |

---

## 2. Supabase — configuração

### 2.1 Recursos já ativos no seu projeto
Confirme que estão habilitados em **Project Settings → Integrations**:

- ✅ **Data API** — expõe o banco via REST (PostgREST)
- ✅ **Database Webhooks** — dispara HTTP ao ocorrer eventos no banco
- ✅ **Cron** — pg_cron para tarefas agendadas
- ✅ **Queues** — pgmq para processamento assíncrono

### 2.2 Tabelas essenciais para criar

Execute no **SQL Editor** do Supabase:

```sql
-- Planos disponíveis
create table public.plans (
  id          text primary key,         -- 'free' | 'pro' | 'enterprise'
  name        text not null,
  price_usd   numeric(10,2) not null,
  stripe_price_id text,                  -- preenchido após criar no Stripe
  features    jsonb default '[]',
  created_at  timestamptz default now()
);

-- Assinaturas dos usuários
create table public.subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade,
  plan_id             text references public.plans(id),
  stripe_customer_id  text,
  stripe_subscription_id text,
  status              text default 'active', -- active | canceled | past_due | trialing
  current_period_end  timestamptz,
  cancel_at_period_end boolean default false,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- RLS: cada usuário vê apenas sua assinatura
alter table public.subscriptions enable row level security;

create policy "user vê sua assinatura"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "service role gerencia assinaturas"
  on public.subscriptions for all
  using (auth.role() = 'service_role');
```

### 2.3 Database Webhook — sincronizar Stripe

No dashboard: **Database → Webhooks → Create webhook**

| Campo | Valor |
|---|---|
| Name | `on-new-user-create-stripe-customer` |
| Table | `auth.users` |
| Events | `INSERT` |
| URL | `https://seuapp.com/api/webhooks/supabase` |
| HTTP Headers | `Authorization: Bearer {SUPABASE_WEBHOOK_SECRET}` |

### 2.4 Cron — verificar assinaturas vencidas

```sql
-- Roda toda madrugada às 2h para marcar assinaturas vencidas
select cron.schedule(
  'check-expired-subscriptions',
  '0 2 * * *',
  $$
    update public.subscriptions
    set status = 'canceled'
    where current_period_end < now()
      and status = 'active'
      and cancel_at_period_end = true;
  $$
);
```

### 2.5 Queue — processar emails assíncronos

```sql
-- Cria a fila de emails (pgmq)
select pgmq.create('emails');

-- Exemplo: enfileirar email de boas-vindas (chamado do webhook/api)
select pgmq.send('emails', '{"type": "welcome", "user_id": "..."}');
```

---

## 3. Stripe — configuração

### 3.1 Criar os produtos

No **Stripe Dashboard → Products → Add product**, crie 3 produtos:

| Produto | Preço | Período | Copie o `price_id` |
|---|---|---|---|
| Free | $0 | — | `price_xxx_free` |
| Pro | $29 | Mensal | `price_xxx_pro` |
| Enterprise | $99 | Mensal | `price_xxx_enterprise` |

Após criar, atualize a tabela `plans` no Supabase com os `price_id`s.

### 3.2 Configurar Webhook no Stripe

Stripe Dashboard → **Developers → Webhooks → Add endpoint**

| Campo | Valor |
|---|---|
| Endpoint URL | `https://seuapp.com/api/webhooks/stripe` |
| Events to listen | `customer.subscription.created` `customer.subscription.updated` `customer.subscription.deleted` `invoice.payment_succeeded` `invoice.payment_failed` |

Copie o **Signing secret** e salve como `STRIPE_WEBHOOK_SECRET`.

---

## 4. Stripe Wrapper no Supabase

O Stripe Wrapper permite **consultar dados do Stripe direto via SQL**, sem precisar chamar a API no backend.

### 4.1 Ativar o wrapper

No SQL Editor:

```sql
-- Habilitar extensão wrappers (caso ainda não esteja)
create extension if not exists wrappers with schema extensions;

-- Criar o servidor Stripe
create server stripe_server
  foreign data wrapper stripe_wrapper
  options (
    api_key 'sua_stripe_secret_key_aqui'
  );

-- Criar schema para as tabelas do Stripe
create schema stripe;
```

### 4.2 Tabelas úteis para mapear

```sql
-- Clientes
create foreign table stripe.customers (
  id text,
  email text,
  name text,
  created timestamp
) server stripe_server
options (object 'customers');

-- Assinaturas
create foreign table stripe.subscriptions (
  id text,
  customer text,
  status text,
  current_period_end timestamp,
  cancel_at_period_end boolean,
  items jsonb
) server stripe_server
options (object 'subscriptions');

-- Faturas
create foreign table stripe.invoices (
  id text,
  customer text,
  status text,
  amount_paid bigint,
  amount_due bigint,
  created timestamp
) server stripe_server
options (object 'invoices');
```

### 4.3 Exemplo de uso

```sql
-- Ver status de assinatura de um cliente diretamente do Stripe
select
  s.id,
  s.status,
  s.current_period_end,
  c.email
from stripe.subscriptions s
join stripe.customers c on c.id = s.customer
where s.status = 'active';
```

> **Quando usar:** dashboards admin, relatórios, auditoria. Para operações em tempo real no app, use a tabela `public.subscriptions` local (já sincronizada via webhook).

---

## 5. Os 3 Planos

```
┌─────────────────┬──────────────┬──────────────────┬────────────────────┐
│ Feature          │ Free ($0)    │ Pro ($29/mês)    │ Enterprise ($99/mês│
├─────────────────┼──────────────┼──────────────────┼────────────────────┤
│ Usuários         │ 1            │ 10               │ Ilimitado          │
│ Projetos/Tenants │ 1            │ 5                │ Ilimitado          │
│ Storage          │ 500 MB       │ 10 GB            │ 100 GB             │
│ API Requests/mês │ 1.000        │ 50.000           │ Ilimitado          │
│ Suporte          │ Comunidade   │ Email            │ Email + Prioridade │
│ Custom Domain    │ ✗            │ ✗                │ ✓                  │
│ Audit Log        │ 7 dias       │ 30 dias          │ 1 ano              │
│ API Keys         │ ✗            │ ✓                │ ✓                  │
│ SSO/SAML         │ ✗            │ ✗                │ ✓                  │
└─────────────────┴──────────────┴──────────────────┴────────────────────┘
```

### Inserir planos no banco

```sql
insert into public.plans (id, name, price_usd, stripe_price_id, features) values
('free', 'Free', 0, null, '["1 usuário","1 projeto","500 MB storage"]'),
('pro', 'Pro', 29, 'price_xxx_pro', '["10 usuários","5 projetos","10 GB storage","API Keys"]'),
('enterprise', 'Enterprise', 99, 'price_xxx_enterprise', '["Ilimitado","100 GB storage","SSO","Suporte prioritário"]');
```

---

## 6. VPS + Coolify — deploy

### 6.1 Pré-requisitos no servidor

- VPS com Ubuntu 22.04+ (mínimo 2 vCPU, 4 GB RAM)
- [Coolify](https://coolify.io) instalado: `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`
- Domínio apontando para o IP da VPS (registro A)

### 6.2 Adicionar o projeto no Coolify

1. **New Resource → Application → GitHub** — conecte o repositório
2. **Build Pack:** Dockerfile (o projeto já tem `Dockerfile` e `next.config.ts` com `output: 'standalone'`)
3. **Port:** `3000`
4. **Domain:** `seuapp.com` (o Coolify provisiona SSL via Let's Encrypt automaticamente)

### 6.3 Variáveis de ambiente no Coolify

Na aba **Environment Variables** do projeto, adicione todas as variáveis da seção 7.

### 6.4 Health check

O Coolify usa automaticamente. Confirme que a rota `/api/health` retorna `200`:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', ts: Date.now() });
}
```

---

## 7. Variáveis de ambiente finais

Arquivo `.env.local` completo:

```bash
# ─── Supabase ────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # nunca exponha no client
SUPABASE_JWT_SECRET=seu-jwt-secret

# ─── Stripe ──────────────────────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (copiar após criar os produtos)
STRIPE_PRICE_PRO=price_xxx_pro
STRIPE_PRICE_ENTERPRISE=price_xxx_enterprise

# ─── App ─────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://seuapp.com
NEXT_PUBLIC_APP_NAME=Meu SaaS
```

---

## 8. Estimativa de horas

> Contexto: desenvolvedor solo com familiaridade em Next.js e Supabase.

| Etapa | O que envolve | Horas |
|---|---|---|
| **Setup inicial** | Clonar repo, configurar .env, conectar Supabase e Stripe | 1–2h |
| **Schema do banco** | Criar tabelas, RLS, indexes, policies | 3–5h |
| **Stripe Wrapper** | Configurar FDW, mapear tabelas, testar queries | 2–3h |
| **Webhook Stripe** | Endpoint `/api/webhooks/stripe`, sync de status | 3–4h |
| **Webhook Supabase** | Criar cliente Stripe ao cadastrar usuário | 2–3h |
| **Auth flows** | Login, cadastro, recuperação de senha (já base existe) | 2–4h |
| **Billing UI** | Página de planos, checkout Stripe, portal de faturamento | 6–10h |
| **Controle de plano** | Feature flags, limites por plano, guard de rotas | 4–6h |
| **Cron + Queues** | Verificação de assinaturas, fila de emails | 3–4h |
| **Deploy Coolify** | Configurar VPS, domínio, SSL, variáveis | 2–3h |
| **Testes e ajustes** | Testar fluxo completo dev → produção | 4–6h |
| **Total estimado** | | **32–50h** |

### Distribuição realista

```
Semana 1 (16–20h): Schema + Auth + Stripe básico
Semana 2 (10–16h): Billing UI + Webhooks + Planos
Semana 3 (6–14h): Deploy + Testes + Ajustes finais
```

> Para um time de 2 devs com pair programming nos pontos críticos, divida por ~1.6x.

---

## Checklist de go-live

- [ ] Variáveis de produção configuradas no Coolify
- [ ] Stripe em modo **Live** (não test)
- [ ] Webhook Stripe apontando para URL de produção
- [ ] Webhook Supabase apontando para URL de produção
- [ ] RLS testado com usuário comum (não service role)
- [ ] Planos inseridos na tabela `plans` com `stripe_price_id` corretos
- [ ] Stripe Wrapper com `api_key` de produção
- [ ] Health check `/api/health` respondendo 200
- [ ] SSL ativo no domínio (Coolify faz automaticamente)
- [ ] Email de transação configurado no Supabase (Auth → SMTP)
