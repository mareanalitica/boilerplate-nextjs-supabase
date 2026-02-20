/**
 * Database Schema para SaaS Minimal
 * Tabelas adicionais necessárias para multi-tenant, onboarding, RBAC e billing
 *
 * Executar no Supabase SQL Editor
 */

-- ============================================================================
-- TABELA: roles (RBAC - estática)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(50) NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.roles IS 'Roles do sistema (admin, member, viewer, etc)';

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES
  ('admin', 'Administrator with full access'),
  ('member', 'Regular member with standard access'),
  ('viewer', 'Read-only access')
ON CONFLICT (name) DO NOTHING;


-- ============================================================================
-- TABELA: permissions (RBAC - estática)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL UNIQUE,
  description text,
  category varchar(50) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.permissions IS 'Permissions granulares no sistema';

CREATE INDEX IF NOT EXISTS idx_permissions_category ON public.permissions(category);


-- ============================================================================
-- TABELA: role_permissions (RBAC - junction table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

COMMENT ON TABLE public.role_permissions IS 'Relacionamento entre roles e permissions';


-- ============================================================================
-- TABELA: user_roles (RBAC - atribuição de roles a usuários)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at timestamp with time zone DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  PRIMARY KEY (user_id, role_id)
);

COMMENT ON TABLE public.user_roles IS 'Atribuição de roles aos usuários';

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role_id);


-- ============================================================================
-- TABELA: organizations (Multi-tenant)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  logo_url text,
  plan varchar(50) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.organizations IS 'Organizações dos usuários (multi-tenant)';

CREATE INDEX IF NOT EXISTS idx_organizations_owner ON public.organizations(owner_id);


-- ============================================================================
-- TABELA: organization_members (Multi-tenant - membros da org)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.organization_members (
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role varchar(50) NOT NULL CHECK (role IN ('admin', 'member', 'viewer')) DEFAULT 'member',
  permissions text[] DEFAULT '{}',
  joined_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

COMMENT ON TABLE public.organization_members IS 'Membros de cada organização com seus roles';

CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);


-- ============================================================================
-- TABELA: organization_invites (Multi-tenant - convites)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.organization_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email varchar(255) NOT NULL,
  role varchar(50) NOT NULL DEFAULT 'member',
  token varchar(255) NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.organization_invites IS 'Convites para novos membros da organização';

CREATE INDEX IF NOT EXISTS idx_org_invites_org ON public.organization_invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invites_email ON public.organization_invites(email);
CREATE INDEX IF NOT EXISTS idx_org_invites_token ON public.organization_invites(token);


-- ============================================================================
-- TABELA: organization_settings (Multi-tenant - configurações)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.organization_settings (
  organization_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  branding_color varchar(7),
  timezone varchar(50) DEFAULT 'UTC',
  language varchar(10) DEFAULT 'en',
  notification_settings jsonb DEFAULT '{
    "email_notifications": true,
    "push_notifications": true,
    "daily_digest": false
  }',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.organization_settings IS 'Configurações específicas da organização';


-- ============================================================================
-- TABELA: onboarding_state (Onboarding flow)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.onboarding_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step varchar(50) NOT NULL DEFAULT 'verify_email',
  completed_steps text[] DEFAULT '{}',
  status varchar(50) NOT NULL DEFAULT 'not_started' CHECK (
    status IN (
      'not_started',
      'email_verifying',
      'email_verified',
      'profile_created',
      'organization_created',
      'plan_selected',
      'configured',
      'tutorial_completed',
      'completed'
    )
  ),
  organization_id uuid REFERENCES public.organizations(id),
  plan_selected varchar(50),
  metadata jsonb DEFAULT '{}',
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  expires_at timestamp with time zone DEFAULT (now() + interval '30 days'),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.onboarding_state IS 'Estado do fluxo de onboarding de cada usuário';

CREATE INDEX IF NOT EXISTS idx_onboarding_user ON public.onboarding_state(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON public.onboarding_state(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_expires ON public.onboarding_state(expires_at);


-- ============================================================================
-- TABELA: subscriptions (Billing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan varchar(50) NOT NULL CHECK (plan IN ('free', 'pro', 'enterprise')) DEFAULT 'free',
  status varchar(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'past_due')),
  billing_cycle varchar(20) NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  payment_method_id varchar(255),
  current_period_start date NOT NULL DEFAULT CURRENT_DATE,
  current_period_end date NOT NULL DEFAULT CURRENT_DATE + interval '1 month',
  canceled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.subscriptions IS 'Assinaturas de cada organização';

CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON public.subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);


-- ============================================================================
-- TABELA: invoices (Billing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL,
  currency varchar(3) NOT NULL DEFAULT 'USD',
  status varchar(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'failed')),
  issued_at date NOT NULL,
  due_at date NOT NULL,
  paid_at timestamp with time zone,
  payment_id varchar(255),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.invoices IS 'Invoices/faturas de cada assinatura';

CREATE INDEX IF NOT EXISTS idx_invoices_subscription ON public.invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org ON public.invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);


-- ============================================================================
-- TABELA: usage_logs (Billing - para rastrear uso de features)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  feature varchar(100) NOT NULL,
  amount integer NOT NULL DEFAULT 1,
  period date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.usage_logs IS 'Log de uso de features para rastrear limites por plano';

CREATE INDEX IF NOT EXISTS idx_usage_logs_org ON public.usage_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_feature ON public.usage_logs(feature);
CREATE INDEX IF NOT EXISTS idx_usage_logs_period ON public.usage_logs(period);


-- ============================================================================
-- TABELA: audit_logs (Auditoria - log de todas as ações)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type varchar(100) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  resource_type varchar(100),
  resource_id varchar(255),
  action varchar(100),
  changes jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.audit_logs IS 'Log de auditoria de todas as ações importantes';

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at);


-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - SEGURANÇA
-- ============================================================================

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;


-- Policy: organizations - usuário vê suas organizações
CREATE POLICY org_select_policy ON public.organizations
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Policy: organization_members - usuário vê membros de suas organizações
CREATE POLICY org_members_select_policy ON public.organization_members
  FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM public.organizations
      WHERE owner_id = auth.uid()
      OR id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: organization_settings - usuário vê settings de suas organizações
CREATE POLICY org_settings_select_policy ON public.organization_settings
  FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM public.organizations
      WHERE owner_id = auth.uid()
      OR id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: subscriptions - usuário vê subscriptions de suas organizações
CREATE POLICY subscriptions_select_policy ON public.subscriptions
  FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM public.organizations
      WHERE owner_id = auth.uid()
      OR id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );


-- ============================================================================
-- FUNCTIONS - Helpers para operações comuns
-- ============================================================================

-- Função para obter todas as permissões de um usuário em uma organização
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id uuid, p_org_id uuid)
RETURNS TABLE(permission_id uuid, permission_name varchar) AS $$
BEGIN
  RETURN QUERY
  SELECT rp.permission_id, p.name
  FROM public.role_permissions rp
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE rp.role_id IN (
    SELECT role_id FROM public.organization_members
    WHERE user_id = p_user_id AND organization_id = p_org_id
  );
END;
$$ LANGUAGE plpgsql;


-- Função para verificar se usuário é admin de uma organização
CREATE OR REPLACE FUNCTION is_organization_admin(p_user_id uuid, p_org_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.organization_members
    WHERE user_id = p_user_id
    AND organization_id = p_org_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;


-- Função para contar uso de um feature neste mês
CREATE OR REPLACE FUNCTION get_feature_usage(p_org_id uuid, p_feature varchar)
RETURNS integer AS $$
BEGIN
  RETURN COALESCE(
    SUM(amount)::integer,
    0
  ) FROM public.usage_logs
  WHERE organization_id = p_org_id
  AND feature = p_feature
  AND DATE_TRUNC('month', period) = DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- TRIGGERS - Automação
-- ============================================================================

-- Trigger: Criar subscription automaticamente ao criar organização
CREATE OR REPLACE FUNCTION create_subscription_on_org_create()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (
    organization_id,
    plan,
    status
  ) VALUES (
    NEW.id,
    NEW.plan,
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_organization_created ON public.organizations;
CREATE TRIGGER on_organization_created
  AFTER INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_subscription_on_org_create();


-- Trigger: Criar organization_settings automaticamente
CREATE OR REPLACE FUNCTION create_settings_on_org_create()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.organization_settings (organization_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_organization_settings_created ON public.organizations;
CREATE TRIGGER on_organization_settings_created
  AFTER INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_settings_on_org_create();


-- Trigger: Registrar mudanças em audit_logs
CREATE OR REPLACE FUNCTION record_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    event_type,
    user_id,
    resource_type,
    resource_id,
    action,
    changes
  ) VALUES (
    TG_TABLE_NAME,
    auth.uid(),
    TG_TABLE_NAME,
    (CASE
      WHEN TG_OP = 'DELETE' THEN OLD.id::varchar
      ELSE NEW.id::varchar
    END),
    TG_OP,
    (CASE
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object(
        'old', row_to_json(OLD),
        'new', row_to_json(NEW)
      )
      WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
      ELSE row_to_json(NEW)
    END)
  );
  RETURN (CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END);
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- NOTES
-- ============================================================================
/*
Para usar este schema:

1. Executar todo este arquivo no Supabase SQL Editor
2. Verificar se todas as tabelas foram criadas:
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';

3. Testar RLS:
   - Fazer login como um usuário
   - Executar: SELECT * FROM public.organizations;
   - Deve retornar apenas as organizações do usuário

4. Próximas etapas:
   - Implementar Fase 2: Services & Repositories
   - Implementar Fase 3: Onboarding
   - Implementar Fase 5: Multi-tenant
   - Implementar Fase 6: Billing
*/
