/**
 * Database Reset Script — SaaS Minimal
 *
 * Desfaz tudo que foi criado pelo database-schema.sql.
 * Execute no Supabase SQL Editor com cautela.
 * ATENÇÃO: apaga todos os dados permanentemente.
 */

-- ============================================================================
-- 1. STORAGE — remover policies e bucket
-- ============================================================================
-- ATENÇÃO: Supabase bloqueia DELETE direto em storage.objects via trigger.
-- Para remover o bucket 'avatars', use UMA das opções abaixo ANTES de rodar o resto:
--
-- Opção A — Dashboard:
--   Supabase Dashboard → Storage → Buckets → avatars → "Delete bucket"
--
-- Opção B — Supabase CLI (terminal local):
--   supabase storage rm 'avatars' --recursive --project-ref <seu-ref>
--
-- Opção C — JavaScript/curl (service role):
--   await supabase.storage.emptyBucket('avatars')
--   await supabase.storage.deleteBucket('avatars')
--
-- As policies de storage são removidas automaticamente com o bucket.
-- As policies em storage.objects abaixo ficam órfãs mas não causam erro.


-- ============================================================================
-- 2. TRIGGERS — remover antes de dropar funções
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created           ON auth.users;
DROP TRIGGER IF EXISTS on_organization_created_sub    ON public.organizations;
DROP TRIGGER IF EXISTS on_organization_created_cfg    ON public.organizations;
DROP TRIGGER IF EXISTS on_organization_created_member ON public.organizations;
DROP TRIGGER IF EXISTS set_updated_at_user_profiles   ON public.user_profiles;
DROP TRIGGER IF EXISTS set_updated_at_organizations   ON public.organizations;
DROP TRIGGER IF EXISTS set_updated_at_org_settings    ON public.organization_settings;
DROP TRIGGER IF EXISTS set_updated_at_subscriptions   ON public.subscriptions;
DROP TRIGGER IF EXISTS set_updated_at_invoices        ON public.invoices;
DROP TRIGGER IF EXISTS set_updated_at_onboarding      ON public.onboarding_state;


-- ============================================================================
-- 3. FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_subscription_on_org_create();
DROP FUNCTION IF EXISTS public.create_settings_on_org_create();
DROP FUNCTION IF EXISTS public.add_owner_as_admin_on_org_create();
DROP FUNCTION IF EXISTS public.set_updated_at();
DROP FUNCTION IF EXISTS public.record_audit_log();

DROP FUNCTION IF EXISTS public.auth_is_org_member(uuid);
DROP FUNCTION IF EXISTS public.auth_is_org_admin(uuid);
DROP FUNCTION IF EXISTS public.get_user_permissions(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_organization_admin(uuid, uuid);
DROP FUNCTION IF EXISTS public.get_feature_usage(uuid, varchar);
DROP FUNCTION IF EXISTS public.get_user_organizations(uuid);


-- ============================================================================
-- 4. TABELAS — ordem reversa de dependências FK
-- ============================================================================

DROP TABLE IF EXISTS public.audit_logs              CASCADE;
DROP TABLE IF EXISTS public.usage_logs              CASCADE;
DROP TABLE IF EXISTS public.invoices                CASCADE;
DROP TABLE IF EXISTS public.subscriptions           CASCADE;
DROP TABLE IF EXISTS public.onboarding_state        CASCADE;
DROP TABLE IF EXISTS public.organization_settings   CASCADE;
DROP TABLE IF EXISTS public.organization_invites    CASCADE;
DROP TABLE IF EXISTS public.organization_members    CASCADE;
DROP TABLE IF EXISTS public.organizations           CASCADE;
DROP TABLE IF EXISTS public.user_roles              CASCADE;
DROP TABLE IF EXISTS public.role_permissions        CASCADE;
DROP TABLE IF EXISTS public.permissions             CASCADE;
DROP TABLE IF EXISTS public.roles                   CASCADE;
DROP TABLE IF EXISTS public.user_profiles           CASCADE;
