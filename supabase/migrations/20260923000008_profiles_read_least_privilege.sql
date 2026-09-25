-- ============================================================
-- Audit de sécurité #8 — profiles : least privilege en lecture.
--
-- Vulnérabilité corrigée :
--   la policy SELECT « Public can view public profiles » (is_public = true)
--   combinée aux privilèges de table par défaut exposait TOUTES les
--   colonnes de tous les profils publics via PostgREST, y compris
--   `is_admin` (identification nominative de l'administrateur) et
--   `commission_rate`. Un simple GET suffisait, sans même un compte :
--     GET /rest/v1/profiles?select=username,phone_e164,email_public,
--         is_admin,partner_code&is_public=eq.true
--
-- Correction :
--   1) privilèges de table remplacés par une liste blanche de colonnes
--      pour anon/authenticated (is_admin et commission_rate deviennent
--      illisibles via PostgREST) ;
--   2) ces deux valeurs ne sont plus lues par l'application via un SELECT
--      mais via des RPC dédiées, non énumérables :
--        - public.is_admin()               → l'appelant est-il admin ?
--        - public.get_my_partner_profile() → infos partenaire du demandeur
--   3) les policies RLS analytics qui lisaient `profiles.is_admin` en
--      sous-requête sont réécrites avec public.is_admin() : sans cela,
--      l'évaluation de la policy par l'utilisateur échouerait sur le
--      privilège colonne révoqué.
--
-- NON impacté : le service role (webhooks, back-office admin, cron) garde
-- l'accès complet ; les fonctions SECURITY DEFINER existantes
-- (_require_admin, is_pro, is_active_partner, get_active_partner_by_code,
-- search_public_profiles, get_profile_weekly_digest) s'exécutent en tant
-- que propriétaire et continuent de lire/écrire toutes les colonnes.
-- ============================================================

-- ------------------------------------------------------------
-- 1) RPC d'autorisation (jamais énumérables)
-- ------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.get_my_partner_profile()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', p.id,
    'username', p.username,
    'display_name', p.display_name,
    'is_partner', p.is_partner,
    'partner_code', p.partner_code,
    'commission_rate', p.commission_rate
  )
  from public.profiles p
  where p.id = auth.uid();
$$;

revoke all on function public.get_my_partner_profile() from public, anon;
grant execute on function public.get_my_partner_profile() to authenticated;

-- ------------------------------------------------------------
-- 2) Policies RLS analytics : ne plus lire profiles.is_admin en direct
-- ------------------------------------------------------------

drop policy if exists "Admins can read analytics_events" on public.analytics_events;
create policy "Admins can read analytics_events"
  on public.analytics_events for select
  using (public.is_admin());

drop policy if exists "Admins can read analytics_sessions" on public.analytics_sessions;
create policy "Admins can read analytics_sessions"
  on public.analytics_sessions for select
  using (public.is_admin());

-- ------------------------------------------------------------
-- 3) Liste blanche des colonnes lisibles par anon/authenticated
--    (les privilèges de table impliquent TOUTES les colonnes : il faut
--    donc révoquer le SELECT de table avant de regranter colonne par
--    colonne, une révocation colonne seule étant sans effet.)
-- ------------------------------------------------------------

revoke select on public.profiles from anon, authenticated;

grant select (
  id,
  username,
  display_name,
  tagline,
  bio,
  avatar_url,
  city,
  country,
  phone_e164,
  email_public,
  template,
  locale,
  is_public,
  category,
  is_partner,
  partner_code,
  created_at,
  updated_at
) on public.profiles to anon, authenticated;

notify pgrst, 'reload schema';
