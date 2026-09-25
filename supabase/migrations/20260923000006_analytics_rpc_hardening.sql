-- ============================================================
-- Audit de sécurité #6 — RPC analytics : validation des entrées,
-- rate-limit, et suppression d'une fonction morte exposée.
--
-- Vulnérabilités corrigées :
--   1) track_analytics_event acceptait des valeurs libres écrites
--      directement dans la table analytics_events (event_name, page_path,
--      referrer, metadata, utm_*). Un anonyme pouvait donc :
--        - inventer des événements et fausser les KPI admin
--          (ex: "user_signed_up" en boucle) ;
--        - écrire des charges volumineuses (metadata non bornée) ;
--      et il n'existait aucun plafond de volume.
--   2) upsert_analytics_session n'était appelée nulle part dans src/ :
--      surface d'attaque gratuite permettant d'écraser le `ended_at`
--      de n'importe quelle session (`ON CONFLICT (id) DO UPDATE`).
--      Elle est supprimée.
--
-- L'attribution `p_user_id` (forgeable) avait déjà été retirée par
-- 20250901000001 : les événements restent attribués à auth.uid().
-- ============================================================

create or replace function public.track_analytics_event(
  p_event_name text,
  p_page_path text default null,
  p_referrer text default null,
  p_country text default null,
  p_device_type text default null,
  p_browser text default null,
  p_os text default null,
  p_utm_source text default null,
  p_utm_medium text default null,
  p_utm_campaign text default null,
  p_utm_content text default null,
  p_utm_term text default null,
  p_metadata jsonb default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_session_id text;
  v_throttle_key text;
  v_headers jsonb;
begin
  -- Nom d'événement borné (snake_case, 2..61 caractères) : impossible de
  -- fabriquer des noms arbitraires ou des payloads dans la clé.
  if p_event_name is null or not (p_event_name ~ '^[a-z][a-z0-9_]{1,60}$') then
    raise exception 'invalid event name';
  end if;

  -- Bornage des champs texte libres.
  if p_page_path is not null and (
       length(p_page_path) > 512 or p_page_path !~ '^/'
     ) then
    raise exception 'invalid page path';
  end if;
  if p_referrer is not null and length(p_referrer) > 512 then
    raise exception 'referrer too long';
  end if;
  if length(coalesce(p_country, '')) > 40
     or length(coalesce(p_device_type, '')) > 40
     or length(coalesce(p_browser, '')) > 40
     or length(coalesce(p_os, '')) > 40 then
    raise exception 'invalid device data';
  end if;
  if length(coalesce(p_utm_source, '')) > 200
     or length(coalesce(p_utm_medium, '')) > 200
     or length(coalesce(p_utm_campaign, '')) > 200
     or length(coalesce(p_utm_content, '')) > 200
     or length(coalesce(p_utm_term, '')) > 200 then
    raise exception 'utm too long';
  end if;

  -- metadata : objet JSON uniquement, taille bornée (4 Ko).
  if p_metadata is not null then
    if jsonb_typeof(p_metadata) <> 'object' then
      raise exception 'invalid metadata';
    end if;
    if pg_column_size(p_metadata) > 4096 then
      raise exception 'metadata too large';
    end if;
  end if;

  v_user_id := auth.uid();

  -- Clé de throttle : IP réelle vue par Supabase, sinon id de session.
  begin
    v_headers := coalesce(current_setting('request.headers', true)::jsonb, '{}'::jsonb);
  exception when others then
    v_headers := '{}'::jsonb;
  end;

  v_session_id := nullif(btrim(coalesce(v_headers->>'x-analytics-session', '')), '');
  if v_session_id is null then
    v_session_id := 'anon-' || replace(gen_random_uuid()::text, '-', '');
  elsif v_session_id !~ '^[a-zA-Z0-9_-]{1,64}$' then
    -- Identifiant de session non conforme : on ne l'utilise ni ne le stocke.
    v_session_id := 'anon-' || replace(gen_random_uuid()::text, '-', '');
  end if;

  v_throttle_key := left(coalesce(
    nullif(btrim(coalesce(v_headers->>'x-forwarded-for', '')), ''),
    nullif(btrim(coalesce(v_headers->>'x-real-ip', '')), ''),
    v_session_id
  ), 128);

  -- 240 événements / minute / client : au-delà, drop silencieux.
  if not public.bump_rpc_throttle('analytics', v_throttle_key, '', 240, 60) then
    return;
  end if;

  insert into public.analytics_events (
    user_id, session_id, event_name, page_path, referrer,
    country, device_type, browser, os,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    metadata
  ) VALUES (
    v_user_id, v_session_id, p_event_name, p_page_path, p_referrer,
    p_country, p_device_type, p_browser, p_os,
    p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content, p_utm_term,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.track_analytics_event(
  text, text, text, text, text, text, text, text, text, text, text, text, jsonb
) from public;
grant execute on function public.track_analytics_event(
  text, text, text, text, text, text, text, text, text, text, text, text, jsonb
) to anon, authenticated;

-- Fonction morte (aucun appelant) supprimée : elle permettait d'écraser
-- le `ended_at` de n'importe quelle session analytics.
drop function if exists public.upsert_analytics_session(
  text, text, text, text, text, text, text
);

notify pgrst, 'reload schema';
