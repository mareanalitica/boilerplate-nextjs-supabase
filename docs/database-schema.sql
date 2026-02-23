/**
 * Database Schema — SaaS Minimal
 *
 * Execute no Supabase SQL Editor (em ordem).
 * Para desfazer tudo: execute database-reset.sql primeiro.
 *
 * Seções:
 *  1. Tabelas
 *  2. Índices
 *  3. Row Level Security (habilitar)
 *  4. Funções auxiliares de RLS
 *  5. Políticas RLS (SELECT / INSERT / UPDATE / DELETE)
 *  6. Funções de negócio
 *  7. Triggers
 *  8. Storage (bucket avatars)
 *  9. Seed data
 */


-- ============================================================================
-- 1. TABELAS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- user_profiles
-- Dados de perfil editáveis (complementa auth.users)
-- Criado automaticamente pelo trigger handle_new_user
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id         uuid         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  varchar(255),
  avatar_url text,
  bio        text,
  created_at timestamptz  DEFAULT now(),
  updated_at timestamptz  DEFAULT now()
);

COMMENT ON TABLE public.user_profiles IS 'Perfil público de cada usuário autenticado';


-- ----------------------------------------------------------------------------
-- roles  (RBAC — estática)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar(50) NOT NULL UNIQUE,
  description text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

COMMENT ON TABLE public.roles IS 'Roles do sistema (admin, member, viewer)';


-- ----------------------------------------------------------------------------
-- permissions  (RBAC — estática)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.permissions (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar(100) NOT NULL UNIQUE,
  description text,
  category    varchar(50)  NOT NULL,
  created_at  timestamptz  DEFAULT now(),
  updated_at  timestamptz  DEFAULT now()
);

COMMENT ON TABLE public.permissions IS 'Permissões granulares do sistema';


-- ----------------------------------------------------------------------------
-- role_permissions  (junction)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id       uuid NOT NULL REFERENCES public.roles(id)       ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at    timestamptz DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

COMMENT ON TABLE public.role_permissions IS 'Relacionamento roles ↔ permissões';


-- ----------------------------------------------------------------------------
-- user_roles  (RBAC — atribuição global de role ao usuário)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id     uuid NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
  role_id     uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid        REFERENCES auth.users(id),
  PRIMARY KEY (user_id, role_id)
);

COMMENT ON TABLE public.user_roles IS 'Atribuição de roles globais aos usuários';


-- ----------------------------------------------------------------------------
-- organizations  (multi-tenant)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
  id         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       varchar(255) NOT NULL,
  slug       varchar(100) UNIQUE,
  logo_url   text,
  plan       varchar(50)  NOT NULL DEFAULT 'free'
             CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  created_at timestamptz  DEFAULT now(),
  updated_at timestamptz  DEFAULT now()
);

COMMENT ON TABLE public.organizations IS 'Organizações dos usuários (multi-tenant)';


-- ----------------------------------------------------------------------------
-- organization_members
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organization_members (
  organization_id uuid        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES auth.users(id)           ON DELETE CASCADE,
  role            varchar(50) NOT NULL DEFAULT 'member'
                  CHECK (role IN ('admin', 'member', 'viewer')),
  permissions     text[]      DEFAULT '{}',
  joined_at       timestamptz DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

COMMENT ON TABLE public.organization_members IS 'Membros de cada organização com seus roles';


-- ----------------------------------------------------------------------------
-- organization_invites
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organization_invites (
  id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid         NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email           varchar(255) NOT NULL,
  role            varchar(50)  NOT NULL DEFAULT 'member',
  token           varchar(255) NOT NULL UNIQUE,
  expires_at      timestamptz  NOT NULL,
  accepted_at     timestamptz,
  invited_by      uuid         REFERENCES auth.users(id),
  created_at      timestamptz  DEFAULT now()
);

COMMENT ON TABLE public.organization_invites IS 'Convites para novos membros';


-- ----------------------------------------------------------------------------
-- organization_settings
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organization_settings (
  organization_id       uuid        PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  branding_color        varchar(7),
  timezone              varchar(50) DEFAULT 'UTC',
  language              varchar(10) DEFAULT 'pt',
  notification_settings jsonb       NOT NULL DEFAULT '{
    "email_notifications": true,
    "push_notifications": true,
    "daily_digest": false
  }',
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

COMMENT ON TABLE public.organization_settings IS 'Configurações da organização';


-- ----------------------------------------------------------------------------
-- onboarding_state
-- Criado automaticamente pelo trigger handle_new_user
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.onboarding_state (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step    varchar(50) NOT NULL DEFAULT 'verify_email',
  completed_steps text[]      DEFAULT '{}',
  status          varchar(50) NOT NULL DEFAULT 'not_started'
                  CHECK (status IN (
                    'not_started', 'email_verifying', 'email_verified',
                    'profile_created', 'organization_created', 'plan_selected',
                    'configured', 'tutorial_completed', 'completed'
                  )),
  organization_id uuid        REFERENCES public.organizations(id),
  plan_selected   varchar(50),
  metadata        jsonb       DEFAULT '{}',
  started_at      timestamptz DEFAULT now(),
  completed_at    timestamptz,
  expires_at      timestamptz DEFAULT (now() + interval '30 days'),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

COMMENT ON TABLE public.onboarding_state IS 'Estado do fluxo de onboarding por usuário';


-- ----------------------------------------------------------------------------
-- subscriptions  (billing)
-- Criado automaticamente via trigger ao criar uma org
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id      uuid        NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan                 varchar(50) NOT NULL DEFAULT 'free'
                       CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  status               varchar(50) NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active', 'canceled', 'expired', 'past_due')),
  billing_cycle        varchar(20) NOT NULL DEFAULT 'monthly'
                       CHECK (billing_cycle IN ('monthly', 'annual')),
  payment_method_id    varchar(255),
  current_period_start date        NOT NULL DEFAULT CURRENT_DATE,
  current_period_end   date        NOT NULL DEFAULT CURRENT_DATE + interval '1 month',
  canceled_at          timestamptz,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

COMMENT ON TABLE public.subscriptions IS 'Assinatura de cada organização';


-- ----------------------------------------------------------------------------
-- invoices  (billing)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
  id              uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid           NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  organization_id uuid           NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  amount          numeric(10, 2) NOT NULL,
  currency        varchar(3)     NOT NULL DEFAULT 'BRL',
  status          varchar(50)    NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('paid', 'pending', 'failed')),
  issued_at       date           NOT NULL,
  due_at          date           NOT NULL,
  paid_at         timestamptz,
  payment_id      varchar(255),
  created_at      timestamptz    DEFAULT now(),
  updated_at      timestamptz    DEFAULT now()
);

COMMENT ON TABLE public.invoices IS 'Faturas de cada assinatura';


-- ----------------------------------------------------------------------------
-- usage_logs  (billing — rastreio de uso por feature)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid         NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id         uuid         REFERENCES auth.users(id) ON DELETE SET NULL,
  feature         varchar(100) NOT NULL,
  amount          integer      NOT NULL DEFAULT 1,
  period          date         NOT NULL DEFAULT CURRENT_DATE,
  created_at      timestamptz  DEFAULT now()
);

COMMENT ON TABLE public.usage_logs IS 'Log de uso de features por organização';


-- ----------------------------------------------------------------------------
-- audit_logs
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type      varchar(100) NOT NULL,
  user_id         uuid         REFERENCES auth.users(id)          ON DELETE SET NULL,
  organization_id uuid         REFERENCES public.organizations(id) ON DELETE SET NULL,
  resource_type   varchar(100),
  resource_id     varchar(255),
  action          varchar(100),
  changes         jsonb,
  ip_address      inet,
  user_agent      text,
  created_at      timestamptz  DEFAULT now()
);

COMMENT ON TABLE public.audit_logs IS 'Log de auditoria de ações importantes';


-- ============================================================================
-- 2. ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_permissions_category   ON public.permissions(category);

CREATE INDEX IF NOT EXISTS idx_user_roles_user        ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role        ON public.user_roles(role_id);

CREATE INDEX IF NOT EXISTS idx_organizations_owner    ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug     ON public.organizations(slug);

CREATE INDEX IF NOT EXISTS idx_org_members_org        ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user       ON public.organization_members(user_id);

CREATE INDEX IF NOT EXISTS idx_org_invites_org        ON public.organization_invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invites_email      ON public.organization_invites(email);
CREATE INDEX IF NOT EXISTS idx_org_invites_token      ON public.organization_invites(token);

CREATE INDEX IF NOT EXISTS idx_onboarding_user        ON public.onboarding_state(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_status      ON public.onboarding_state(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_expires     ON public.onboarding_state(expires_at);

CREATE INDEX IF NOT EXISTS idx_subscriptions_org      ON public.subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status   ON public.subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_invoices_subscription  ON public.invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org           ON public.invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status        ON public.invoices(status);

CREATE INDEX IF NOT EXISTS idx_usage_logs_org         ON public.usage_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_feature     ON public.usage_logs(feature);
CREATE INDEX IF NOT EXISTS idx_usage_logs_period      ON public.usage_logs(period);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user        ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org         ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event       ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created     ON public.audit_logs(created_at);


-- ============================================================================
-- 3. ROW LEVEL SECURITY — habilitar
-- ============================================================================

ALTER TABLE public.user_profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invites  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_state      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs            ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 4. FUNÇÕES AUXILIARES DE RLS
-- SECURITY DEFINER evita recursão quando policies consultam outras tabelas
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auth_is_org_member(org_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT
    EXISTS (SELECT 1 FROM public.organizations      WHERE id = org_id AND owner_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = org_id AND user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.auth_is_org_admin(org_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT
    EXISTS (SELECT 1 FROM public.organizations      WHERE id = org_id AND owner_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.organization_members
            WHERE organization_id = org_id AND user_id = auth.uid() AND role = 'admin');
$$;


-- ============================================================================
-- 5. POLÍTICAS RLS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- user_profiles
-- ----------------------------------------------------------------------------
CREATE POLICY "profiles_select"
  ON public.user_profiles FOR SELECT
  USING (
    -- próprio perfil
    id = auth.uid()
    -- ou colega de alguma org em comum
    OR id IN (
      SELECT om2.user_id
      FROM public.organization_members om1
      JOIN public.organization_members om2 USING (organization_id)
      WHERE om1.user_id = auth.uid()
    )
  );

CREATE POLICY "profiles_insert"
  ON public.user_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update"
  ON public.user_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());


-- ----------------------------------------------------------------------------
-- roles / permissions / role_permissions  (read-only para autenticados)
-- ----------------------------------------------------------------------------
CREATE POLICY "roles_select"
  ON public.roles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "permissions_select"
  ON public.permissions FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "role_permissions_select"
  ON public.role_permissions FOR SELECT USING (auth.role() = 'authenticated');


-- ----------------------------------------------------------------------------
-- user_roles
-- ----------------------------------------------------------------------------
CREATE POLICY "user_roles_select"
  ON public.user_roles FOR SELECT USING (user_id = auth.uid());


-- ----------------------------------------------------------------------------
-- organizations
-- ----------------------------------------------------------------------------
CREATE POLICY "orgs_select"
  ON public.organizations FOR SELECT
  USING (owner_id = auth.uid() OR public.auth_is_org_member(id));

CREATE POLICY "orgs_insert"
  ON public.organizations FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "orgs_update"
  ON public.organizations FOR UPDATE
  USING (owner_id = auth.uid() OR public.auth_is_org_admin(id))
  WITH CHECK (owner_id = auth.uid() OR public.auth_is_org_admin(id));

CREATE POLICY "orgs_delete"
  ON public.organizations FOR DELETE
  USING (owner_id = auth.uid());


-- ----------------------------------------------------------------------------
-- organization_members
-- ----------------------------------------------------------------------------
CREATE POLICY "org_members_select"
  ON public.organization_members FOR SELECT
  USING (public.auth_is_org_member(organization_id));

-- Admin insere; owner também pode (INSERT via trigger usa SECURITY DEFINER)
CREATE POLICY "org_members_insert"
  ON public.organization_members FOR INSERT
  WITH CHECK (public.auth_is_org_admin(organization_id));

CREATE POLICY "org_members_update"
  ON public.organization_members FOR UPDATE
  USING (public.auth_is_org_admin(organization_id))
  WITH CHECK (public.auth_is_org_admin(organization_id));

-- Admin remove qualquer membro; usuário pode sair sozinho
CREATE POLICY "org_members_delete"
  ON public.organization_members FOR DELETE
  USING (user_id = auth.uid() OR public.auth_is_org_admin(organization_id));


-- ----------------------------------------------------------------------------
-- organization_invites
-- ----------------------------------------------------------------------------
CREATE POLICY "org_invites_select"
  ON public.organization_invites FOR SELECT
  USING (public.auth_is_org_admin(organization_id));

CREATE POLICY "org_invites_insert"
  ON public.organization_invites FOR INSERT
  WITH CHECK (public.auth_is_org_admin(organization_id));

CREATE POLICY "org_invites_delete"
  ON public.organization_invites FOR DELETE
  USING (public.auth_is_org_admin(organization_id));


-- ----------------------------------------------------------------------------
-- organization_settings
-- ----------------------------------------------------------------------------
CREATE POLICY "org_settings_select"
  ON public.organization_settings FOR SELECT
  USING (public.auth_is_org_member(organization_id));

CREATE POLICY "org_settings_update"
  ON public.organization_settings FOR UPDATE
  USING (public.auth_is_org_admin(organization_id))
  WITH CHECK (public.auth_is_org_admin(organization_id));


-- ----------------------------------------------------------------------------
-- onboarding_state
-- ----------------------------------------------------------------------------
CREATE POLICY "onboarding_select"
  ON public.onboarding_state FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "onboarding_insert"
  ON public.onboarding_state FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "onboarding_update"
  ON public.onboarding_state FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "onboarding_delete"
  ON public.onboarding_state FOR DELETE
  USING (user_id = auth.uid());


-- ----------------------------------------------------------------------------
-- subscriptions
-- ----------------------------------------------------------------------------
CREATE POLICY "subscriptions_select"
  ON public.subscriptions FOR SELECT
  USING (public.auth_is_org_member(organization_id));

-- Admin pode alterar plano diretamente (billing externo atualiza via service role)
CREATE POLICY "subscriptions_update"
  ON public.subscriptions FOR UPDATE
  USING (public.auth_is_org_admin(organization_id))
  WITH CHECK (public.auth_is_org_admin(organization_id));


-- ----------------------------------------------------------------------------
-- invoices
-- ----------------------------------------------------------------------------
CREATE POLICY "invoices_select"
  ON public.invoices FOR SELECT
  USING (public.auth_is_org_member(organization_id));


-- ----------------------------------------------------------------------------
-- usage_logs
-- ----------------------------------------------------------------------------
CREATE POLICY "usage_logs_select"
  ON public.usage_logs FOR SELECT
  USING (public.auth_is_org_admin(organization_id));

CREATE POLICY "usage_logs_insert"
  ON public.usage_logs FOR INSERT
  WITH CHECK (public.auth_is_org_member(organization_id));


-- ----------------------------------------------------------------------------
-- audit_logs
-- ----------------------------------------------------------------------------
CREATE POLICY "audit_logs_select"
  ON public.audit_logs FOR SELECT
  USING (public.auth_is_org_admin(organization_id));

CREATE POLICY "audit_logs_insert"
  ON public.audit_logs FOR INSERT
  WITH CHECK (
    organization_id IS NULL
    OR public.auth_is_org_member(organization_id)
  );


-- ============================================================================
-- 6. FUNÇÕES DE NEGÓCIO
-- ============================================================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- Criar user_profile + onboarding_state ao registrar novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.onboarding_state (user_id, current_step, status)
  VALUES (NEW.id, 'verify_email', 'not_started')
  ON CONFLICT (user_id) DO NOTHING;

  -- Criar organização padrão se company_name foi fornecido no sign-up
  IF NEW.raw_user_meta_data->>'company_name' IS NOT NULL
     AND NEW.raw_user_meta_data->>'company_name' != '' THEN
    INSERT INTO public.organizations (owner_id, name, plan)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'company_name',
      'free'
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;


-- Criar subscription ao criar organização
CREATE OR REPLACE FUNCTION public.create_subscription_on_org_create()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.subscriptions (organization_id, plan, status)
  VALUES (NEW.id, NEW.plan, 'active')
  ON CONFLICT (organization_id) DO NOTHING;
  RETURN NEW;
END;
$$;


-- Criar organization_settings ao criar organização
CREATE OR REPLACE FUNCTION public.create_settings_on_org_create()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.organization_settings (organization_id)
  VALUES (NEW.id)
  ON CONFLICT (organization_id) DO NOTHING;
  RETURN NEW;
END;
$$;


-- Adicionar owner como admin ao criar organização
CREATE OR REPLACE FUNCTION public.add_owner_as_admin_on_org_create()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'admin')
  ON CONFLICT (organization_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;


-- Obter permissões de um usuário em uma organização
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id uuid, p_org_id uuid)
RETURNS TABLE(permission_id uuid, permission_name varchar)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT rp.permission_id, p.name
  FROM public.role_permissions rp
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE rp.role_id IN (
    SELECT ur.role_id FROM public.user_roles ur WHERE ur.user_id = p_user_id
  );
END;
$$;


-- Verificar se usuário é admin de uma organização (chamável externamente)
CREATE OR REPLACE FUNCTION public.is_organization_admin(p_user_id uuid, p_org_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organizations
    WHERE id = p_org_id AND owner_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = p_user_id AND organization_id = p_org_id AND role = 'admin'
  );
END;
$$;


-- Contar uso de feature no mês atual
CREATE OR REPLACE FUNCTION public.get_feature_usage(p_org_id uuid, p_feature varchar)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(amount)::integer
     FROM public.usage_logs
     WHERE organization_id = p_org_id
       AND feature = p_feature
       AND DATE_TRUNC('month', period) = DATE_TRUNC('month', CURRENT_DATE)),
    0
  );
END;
$$;


-- Retornar todas as organizações do usuário com role e subscription
-- Chamada pelo StoreInitializer para popular useOrganizationStore
CREATE OR REPLACE FUNCTION public.get_user_organizations(p_user_id uuid)
RETURNS TABLE (
  id                  uuid,
  owner_id            uuid,
  name                varchar,
  slug                varchar,
  logo_url            text,
  plan                varchar,
  created_at          timestamptz,
  updated_at          timestamptz,
  member_role         varchar,
  member_count        bigint,
  subscription_status varchar
)
LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.owner_id,
    o.name,
    o.slug,
    o.logo_url,
    o.plan,
    o.created_at,
    o.updated_at,
    COALESCE(om.role, 'admin')::varchar                                     AS member_role,
    (SELECT COUNT(*) FROM public.organization_members WHERE organization_id = o.id) AS member_count,
    COALESCE(s.status, 'active')::varchar                                   AS subscription_status
  FROM public.organizations o
  LEFT JOIN public.organization_members om
    ON om.organization_id = o.id AND om.user_id = p_user_id
  LEFT JOIN public.subscriptions s
    ON s.organization_id = o.id
  WHERE o.owner_id = p_user_id OR om.user_id = p_user_id;
END;
$$;


-- ============================================================================
-- 7. TRIGGERS
-- ============================================================================

-- Criar perfil + onboarding quando usuário se registra
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ao criar organização: subscription + settings + owner como admin
DROP TRIGGER IF EXISTS on_organization_created_sub ON public.organizations;
CREATE TRIGGER on_organization_created_sub
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.create_subscription_on_org_create();

DROP TRIGGER IF EXISTS on_organization_created_cfg ON public.organizations;
CREATE TRIGGER on_organization_created_cfg
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.create_settings_on_org_create();

DROP TRIGGER IF EXISTS on_organization_created_member ON public.organizations;
CREATE TRIGGER on_organization_created_member
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.add_owner_as_admin_on_org_create();

-- updated_at automático
DROP TRIGGER IF EXISTS set_updated_at_user_profiles ON public.user_profiles;
CREATE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_organizations ON public.organizations;
CREATE TRIGGER set_updated_at_organizations
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_org_settings ON public.organization_settings;
CREATE TRIGGER set_updated_at_org_settings
  BEFORE UPDATE ON public.organization_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_subscriptions ON public.subscriptions;
CREATE TRIGGER set_updated_at_subscriptions
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_invoices ON public.invoices;
CREATE TRIGGER set_updated_at_invoices
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_onboarding ON public.onboarding_state;
CREATE TRIGGER set_updated_at_onboarding
  BEFORE UPDATE ON public.onboarding_state
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================================
-- 8. STORAGE — bucket para avatares de usuários
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,  -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública (bucket público — qualquer um pode ver avatares)
CREATE POLICY "avatars_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Upload apenas na própria pasta: {userId}/{filename}
CREATE POLICY "avatars_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Atualizar apenas os próprios arquivos
CREATE POLICY "avatars_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Deletar apenas os próprios arquivos
CREATE POLICY "avatars_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );


-- ============================================================================
-- 9. SEED DATA
-- ============================================================================

-- Roles padrão
INSERT INTO public.roles (name, description) VALUES
  ('admin',  'Administrador com acesso total'),
  ('member', 'Membro com acesso padrão'),
  ('viewer', 'Acesso somente leitura')
ON CONFLICT (name) DO NOTHING;

-- Permissões base
INSERT INTO public.permissions (name, description, category) VALUES
  ('org:read',        'Ver detalhes da organização',         'organization'),
  ('org:update',      'Editar organização',                  'organization'),
  ('org:delete',      'Excluir organização',                 'organization'),
  ('members:read',    'Ver membros',                         'members'),
  ('members:invite',  'Convidar novos membros',              'members'),
  ('members:remove',  'Remover membros',                     'members'),
  ('billing:read',    'Ver assinatura e faturas',            'billing'),
  ('billing:update',  'Alterar plano ou pagamento',          'billing'),
  ('settings:read',   'Ver configurações',                   'settings'),
  ('settings:update', 'Editar configurações',                'settings'),
  ('audit:read',      'Ver log de auditoria',                'audit')
ON CONFLICT (name) DO NOTHING;

-- admin → todas as permissões
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- member → leitura geral (sem billing e audit)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'member'
  AND p.name IN ('org:read', 'members:read', 'settings:read')
ON CONFLICT DO NOTHING;

-- viewer → somente leitura básica
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'viewer'
  AND p.name IN ('org:read', 'members:read')
ON CONFLICT DO NOTHING;


-- ============================================================================
-- VERIFICAÇÃO (rode após executar o script)
-- ============================================================================
/*
-- Tabelas criadas:
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Políticas RLS por tabela:
SELECT tablename, policyname, cmd
FROM pg_policies WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Triggers:
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema IN ('public', 'auth')
ORDER BY event_object_table;

-- Funções criadas:
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' ORDER BY routine_name;

-- Bucket storage:
SELECT id, name, public FROM storage.buckets;

-- Teste get_user_organizations (substituir UUID):
SELECT * FROM public.get_user_organizations('seu-user-id'::uuid);
*/
