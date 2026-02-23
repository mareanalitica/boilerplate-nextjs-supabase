/**
 * Migration: Auto-create organization on user sign-up
 *
 * Atualiza a função handle_new_user() para criar automaticamente uma
 * organização quando o usuário se cadastra com um company_name.
 *
 * Executar no Supabase SQL Editor
 */

-- Atualizar a função para criar organização automaticamente
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

-- Confirmar que a função foi atualizada
SELECT 'Migration: Auto-create organization on sign-up completed!' as status;
