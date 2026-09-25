-- ============================================================
-- Audit de sécurité #5 — record_event : plus appelable depuis le
-- navigateur, et rate-limité en base.
--
-- Vulnérabilité corrigée :
--   record_event était GRANTed à `anon` et exposé tel quel sur PostgREST.
--   Le rate-limit de /api/track-click (30/min, en mémoire) était donc
--   contournable : un anonyme pouvait appeler la RPC en boucle pour
--   gonfler profle_stats (compteurs de vues/clics NON bornés) et
--   `events` de n'importe quel profil public :
--     for i in {1..1000}; do
--       curl -X POST .../rest/v1/rpc/record_event \
--         -d '{"p_profile_id":"<cible>","p_type":"view"}'; done
--
-- Correction :
--   1) le tracking passe par les routes serveur /api/track-click et
--      /api/track-view (rate-limitées, IP réelle) qui appellent la RPC
--      avec le service role + une clé de throttle dérivée de l'IP ;
--   2) un throttle DB (30 events/min par profil+type+client) empêche
--      tout flood même si la route est contournée ;
--   3) EXECUTE est réservé au service role.
--
-- La logique métier existante est conservée à l'identique : validation du
-- type, profil public obligatoire, attribution du service depuis
-- `click_service_<uuid>` (voir 20260910000001), compteurs agrégés et
-- fenêtre glissante de 50k events bruts.
-- ============================================================

drop function if exists public.record_event(uuid, text, uuid);

create or replace function public.record_event(
  p_profile_id uuid,
  p_type text,
  p_service_id uuid default null,
  p_throttle_key text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_view boolean;
  v_service_id uuid;
begin
  -- `click_service_<uuid>` est légitime : le motif autorise les tirets et
  -- une longueur suffisante (14 + 36 caractères).
  if p_type is null or not (p_type ~ '^(view|click_[a-z0-9_-]{1,64})$') then
    raise exception 'invalid event type';
  end if;

  if not exists (
    select 1 from public.profiles where id = p_profile_id and is_public = true
  ) then
    raise exception 'profile not found or not public';
  end if;

  -- click_service_<uuid> encodes the service id: extract and validate it so
  -- events stay attributable to a service (digest top-service, breakdown).
  if p_type like 'click_service_%' then
    begin
      v_service_id := substring(
        p_type from '^click_service_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$'
      )::uuid;
    exception when others then
      v_service_id := null;
    end;
    if v_service_id is null then
      raise exception 'invalid service id in type';
    end if;
    if p_service_id is not null and p_service_id <> v_service_id then
      raise exception 'service id mismatch';
    end if;
    if not exists (
      select 1 from public.services where id = v_service_id and profile_id = p_profile_id
    ) then
      raise exception 'service does not belong to profile';
    end if;
  end if;

  -- Explicit p_service_id must still belong to the profile
  if p_service_id is not null and p_type not like 'click_service_%' and not exists (
    select 1 from public.services where id = p_service_id and profile_id = p_profile_id
  ) then
    raise exception 'service does not belong to profile';
  end if;

  -- Anti-flood : 30 events / minute / (profil, type, client). Les events
  -- throttlés sont silencieusement ignorés (aucun compteur incrémenté).
  if not public.bump_rpc_throttle(
    'event',
    p_throttle_key,
    p_profile_id::text || ':' || p_type,
    30,
    60
  ) then
    return;
  end if;

  v_is_view := (p_type = 'view');

  -- Aggregate counters (always counted, even past the raw-event window)
  insert into public.profile_stats (profile_id, views, clicks)
  values (
    p_profile_id,
    case when v_is_view then 1 else 0 end,
    case when v_is_view then 0 else 1 end
  )
  on conflict (profile_id) do update set
    views = public.profile_stats.views + excluded.views,
    clicks = public.profile_stats.clicks + excluded.clicks,
    updated_at = now();

  insert into public.events (profile_id, type, service_id)
  values (p_profile_id, p_type, coalesce(p_service_id, v_service_id));

  -- Rolling window: keep the 50k most recent raw events per profile so the
  -- 7-day trend and click breakdown stay live instead of freezing at the cap.
  delete from public.events e
  where e.profile_id = p_profile_id
    and e.id in (
      select e2.id from public.events e2
      where e2.profile_id = p_profile_id
      order by e2.created_at, e2.id
      offset 50000
    );
end;
$$;

-- Plus aucun accès navigateur : les routes serveur utilisent le service role.
revoke all on function public.record_event(uuid, text, uuid, text)
  from public, anon, authenticated;
grant execute on function public.record_event(uuid, text, uuid, text)
  to service_role;

notify pgrst, 'reload schema';
