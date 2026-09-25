-- ============================================================
-- Audit de sécurité #2 — get_profile_weekly_digest : garde d'ownership.
--
-- Vulnérabilité corrigée :
--   la fonction SECURITY DEFINER acceptait un p_profile_id arbitraire
--   et était GRANTed à `authenticated`. N'importe quel utilisateur
--   connecté pouvait donc lire les statistiques hebdomadaires (vues,
--   clics, service le plus cliqué) de n'importe quel profil, y compris
--   `is_public = false` :
--     POST /rest/v1/rpc/get_profile_weekly_digest {"p_profile_id":"<uuid>"}
--
--   Seul le cron digest l'utilise, avec le service role (auth.uid() nul).
--   La garde autorise donc : le service role, et un utilisateur qui
--   demande SON propre digest. Le GRANT à `authenticated` est supprimé.
-- ============================================================

create or replace function public.get_profile_weekly_digest(p_profile_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  result jsonb;
begin
  -- Un appelant « utilisateur » ne peut lire que son propre digest.
  -- Le service role (cron) a auth.uid() = null et reste autorisé.
  if auth.uid() is not null and auth.uid() <> p_profile_id then
    raise exception 'forbidden';
  end if;

  with cur as (
    select
      count(*) filter (where type = 'view') as views,
      count(*) filter (where type like 'click%') as clicks
    from public.events
    where profile_id = p_profile_id
      and created_at >= now() - interval '7 days'
      and created_at <= now()
  ),
  prev as (
    select
      count(*) filter (where type = 'view') as views,
      count(*) filter (where type like 'click%') as clicks
    from public.events
    where profile_id = p_profile_id
      and created_at >= now() - interval '14 days'
      and created_at < now() - interval '7 days'
  ),
  top as (
    select s.title as service_name, count(e.id) as seen
    from public.events e
    join public.services s on s.id = e.service_id
    where e.profile_id = p_profile_id
      and e.type ilike 'click%'
      and e.service_id is not null
      and e.created_at >= now() - interval '7 days'
      and e.created_at <= now()
    group by s.title
    order by seen desc
    limit 1
  )
  select jsonb_build_object(
    'views', (select views from cur),
    'clicks', (select clicks from cur),
    'prev_views', (select views from prev),
    'prev_clicks', (select clicks from prev),
    'top_service_name', (select service_name from top),
    'top_service_count', coalesce((select seen from top), 0),
    'has_activity', ((select views from cur) + (select clicks from cur) > 0)
  )
  into result;

  return result;
end;
$$;

revoke all on function public.get_profile_weekly_digest(uuid) from public, anon, authenticated;
grant execute on function public.get_profile_weekly_digest(uuid) to service_role;

notify pgrst, 'reload schema';
