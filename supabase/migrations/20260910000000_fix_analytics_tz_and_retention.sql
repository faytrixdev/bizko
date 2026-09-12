-- ============================================================
-- Fix analytics: timezone-correct day bucketing + rolling raw-event retention.
--
-- 1) Dashboard (freelance) & admin queries bucket events by LOCAL day.
--    The database session runs in UTC, so `current_date` / `p_start::date`
--    misattribute early-morning events and drop the local "today" for any
--    profile/admin east of UTC (the Bizko target market: UTC+0..+4).
--    A p_tz_offset parameter (JS `new Date().getTimezoneOffset()`, i.e.
--    minutes to go from UTC to local) is added; local = utc - offset.
-- 2) record_event keeps a rolling window of the 50k most recent raw events
--    per profile instead of freezing inserts at the cap (which made the
--    7-day trend and click breakdown go permanently stale).
-- 3) get_admin_top_pages counts distinct sessions (incl. anonymous
--    visitors) instead of distinct user_id.
-- 4) get_admin_overview_kpis computes real previous-period
--    new/returning users instead of hardcoding 0.
-- ============================================================

-- ------------------------------------------------------------
-- record_event — rolling window instead of hard cap
-- ------------------------------------------------------------
create or replace function public.record_event(
  p_profile_id uuid,
  p_type text,
  p_service_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_view boolean;
begin
  if not (p_type ~ '^(view|click_.+)$') then
    raise exception 'invalid event type';
  end if;

  if not exists (
    select 1 from public.profiles where id = p_profile_id and is_public = true
  ) then
    raise exception 'profile not found or not public';
  end if;

  if p_service_id is not null and not exists (
    select 1 from public.services where id = p_service_id and profile_id = p_profile_id
  ) then
    raise exception 'service does not belong to profile';
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
  values (p_profile_id, p_type, p_service_id);

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

-- ------------------------------------------------------------
-- Dashboard (freelance): get_daily_events — local-day series
-- ------------------------------------------------------------
create or replace function public.get_daily_events(
  p_profile_id uuid,
  p_days int default 7,
  p_tz_offset int default 0
)
returns table (day date, views bigint, clicks bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tz int;
  v_today date;
begin
  if auth.uid() <> p_profile_id then
    raise exception 'forbidden';
  end if;

  v_tz := greatest(-840, least(840, coalesce(p_tz_offset, 0)));
  v_today := (now() - make_interval(mins => v_tz))::date;

  return query
  select g.dt::date as day,
    count(e.id) filter (where e.type = 'view')::bigint as views,
    count(e.id) filter (where e.type <> 'view')::bigint as clicks
  from generate_series(
    v_today - (p_days - 1),
    v_today,
    '1 day'::interval
  ) as g(dt)
  left join public.events e
    on e.profile_id = p_profile_id
    and (e.created_at - make_interval(mins => v_tz)) >= g.dt
    and (e.created_at - make_interval(mins => v_tz)) < g.dt + interval '1 day'
  group by g.dt
  order by g.dt;
end;
$$;

-- ------------------------------------------------------------
-- Dashboard (freelance): get_profile_clicks_breakdown — local window
-- ------------------------------------------------------------
create or replace function public.get_profile_clicks_breakdown(
  p_profile_id uuid,
  p_days int default 7,
  p_tz_offset int default 0
)
returns table (bucket text, count bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tz int;
  v_start date;
begin
  if auth.uid() <> p_profile_id then
    raise exception 'forbidden';
  end if;

  v_tz := greatest(-840, least(840, coalesce(p_tz_offset, 0)));
  v_start := (now() - make_interval(mins => v_tz))::date - (p_days - 1);

  return query
  select t.bucket, count(*)::bigint
  from (
    select case
      when type = 'click_main' then 'main'
      when type = 'click_sticky' then 'sticky'
      when type = 'click_floating' then 'floating'
      when type = 'click_tel' then 'tel'
      when type like 'click_service_%' then 'service'
      else 'other'
    end as bucket
    from public.events
    where profile_id = p_profile_id
      and type <> 'view'
      and (created_at - make_interval(mins => v_tz)) >= v_start
  ) t
  group by t.bucket
  order by count desc;
end;
$$;

-- ------------------------------------------------------------
-- Admin: get_admin_daily_stats — local-day series + better new-users
-- ------------------------------------------------------------
create or replace function public.get_admin_daily_stats(
  p_start timestamptz,
  p_end timestamptz,
  p_tz_offset int default 0
)
returns table (
  day date,
  active_users bigint,
  new_users bigint,
  sessions bigint,
  page_views bigint,
  profile_views bigint,
  service_views bigint,
  whatsapp_clicks bigint,
  external_clicks bigint,
  signups bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tz int;
begin
  PERFORM public._require_admin();

  v_tz := greatest(-840, least(840, coalesce(p_tz_offset, 0)));

  RETURN QUERY
  SELECT
    gs.dt::date AS day,
    count(DISTINCT ae.user_id) AS active_users,
    count(DISTINCT CASE
      WHEN ae.user_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.analytics_events ae2
        WHERE ae2.user_id = ae.user_id
          AND (ae2.created_at - make_interval(mins => v_tz)) < gs.dt
      ) THEN ae.user_id
    END) AS new_users,
    count(DISTINCT CASE WHEN ae.event_name = 'session_start' THEN ae.session_id END) AS sessions,
    count(*) FILTER (WHERE ae.event_name = 'page_view') AS page_views,
    count(*) FILTER (WHERE ae.event_name = 'profile_viewed') AS profile_views,
    count(*) FILTER (WHERE ae.event_name = 'service_viewed') AS service_views,
    count(*) FILTER (WHERE ae.event_name = 'whatsapp_clicked') AS whatsapp_clicks,
    count(*) FILTER (WHERE ae.event_name = 'external_link_clicked') AS external_clicks,
    count(*) FILTER (WHERE ae.event_name = 'user_signed_up') AS signups
  FROM generate_series(
    (p_start - make_interval(mins => v_tz))::date,
    (p_end - make_interval(mins => v_tz))::date,
    '1 day'::interval
  ) AS gs(dt)
  LEFT JOIN public.analytics_events ae
    ON ae.created_at >= p_start AND ae.created_at < p_end
    AND (ae.created_at - make_interval(mins => v_tz)) >= gs.dt
    AND (ae.created_at - make_interval(mins => v_tz)) < gs.dt + interval '1 day'
  GROUP BY gs.dt
  ORDER BY gs.dt;
END;
$$;

-- ------------------------------------------------------------
-- Admin: get_admin_overview_kpis — real previous new/returning users
-- ------------------------------------------------------------
create or replace function public.get_admin_overview_kpis(
  p_start timestamptz,
  p_end timestamptz,
  p_prev_start timestamptz,
  p_prev_end timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  PERFORM public._require_admin();

  WITH current_period AS (
    SELECT
      count(DISTINCT user_id) AS active_users,
      count(DISTINCT CASE WHEN event_name = 'session_start' THEN session_id END) AS sessions,
      count(*) FILTER (WHERE event_name = 'page_view') AS page_views,
      count(DISTINCT CASE WHEN event_name = 'user_signed_up' THEN user_id END) AS signups,
      count(DISTINCT CASE WHEN event_name = 'profile_completed' THEN user_id END) AS profile_completed,
      count(DISTINCT CASE WHEN event_name = 'service_created' THEN user_id END) AS services_created,
      count(*) FILTER (WHERE event_name = 'profile_viewed') AS profile_views,
      count(*) FILTER (WHERE event_name = 'service_viewed') AS service_views,
      count(*) FILTER (WHERE event_name = 'whatsapp_clicked') AS whatsapp_clicks,
      count(*) FILTER (WHERE event_name = 'external_link_clicked') AS external_clicks,
      count(*) FILTER (WHERE event_name = 'profile_link_copied') AS link_copies
    FROM public.analytics_events
    WHERE created_at >= p_start AND created_at < p_end
  ),
  previous_period AS (
    SELECT
      count(DISTINCT user_id) AS active_users,
      count(DISTINCT CASE WHEN event_name = 'session_start' THEN session_id END) AS sessions,
      count(*) FILTER (WHERE event_name = 'page_view') AS page_views,
      count(DISTINCT CASE WHEN event_name = 'user_signed_up' THEN user_id END) AS signups,
      count(DISTINCT CASE WHEN event_name = 'profile_completed' THEN user_id END) AS profile_completed,
      count(DISTINCT CASE WHEN event_name = 'service_created' THEN user_id END) AS services_created,
      count(*) FILTER (WHERE event_name = 'profile_viewed') AS profile_views,
      count(*) FILTER (WHERE event_name = 'service_viewed') AS service_views,
      count(*) FILTER (WHERE event_name = 'whatsapp_clicked') AS whatsapp_clicks,
      count(*) FILTER (WHERE event_name = 'external_link_clicked') AS external_clicks,
      count(*) FILTER (WHERE event_name = 'profile_link_copied') AS link_copies
    FROM public.analytics_events
    WHERE created_at >= p_prev_start AND created_at < p_prev_end
  ),
  new_users AS (
    SELECT count(DISTINCT ae.user_id) AS cnt
    FROM public.analytics_events ae
    WHERE ae.created_at >= p_start AND ae.created_at < p_end
      AND ae.user_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.analytics_events ae2
        WHERE ae2.user_id = ae.user_id AND ae2.created_at < p_start
      )
  ),
  returning_users AS (
    SELECT count(DISTINCT ae.user_id) AS cnt
    FROM public.analytics_events ae
    WHERE ae.created_at >= p_start AND ae.created_at < p_end
      AND ae.user_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.analytics_events ae2
        WHERE ae2.user_id = ae.user_id AND ae2.created_at < p_start
      )
  ),
  prev_new_users AS (
    SELECT count(DISTINCT ae.user_id) AS cnt
    FROM public.analytics_events ae
    WHERE ae.created_at >= p_prev_start AND ae.created_at < p_prev_end
      AND ae.user_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.analytics_events ae2
        WHERE ae2.user_id = ae.user_id AND ae2.created_at < p_prev_start
      )
  ),
  prev_returning_users AS (
    SELECT count(DISTINCT ae.user_id) AS cnt
    FROM public.analytics_events ae
    WHERE ae.created_at >= p_prev_start AND ae.created_at < p_prev_end
      AND ae.user_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.analytics_events ae2
        WHERE ae2.user_id = ae.user_id AND ae2.created_at < p_prev_start
      )
  )
  SELECT jsonb_build_object(
    'active_users', jsonb_build_object('current', cp.active_users, 'previous', pp.active_users),
    'new_users', jsonb_build_object('current', nu.cnt, 'previous', pnu.cnt),
    'returning_users', jsonb_build_object('current', ru.cnt, 'previous', pru.cnt),
    'sessions', jsonb_build_object('current', cp.sessions, 'previous', pp.sessions),
    'page_views', jsonb_build_object('current', cp.page_views, 'previous', pp.page_views),
    'signups', jsonb_build_object('current', cp.signups, 'previous', pp.signups),
    'profile_completed', jsonb_build_object('current', cp.profile_completed, 'previous', pp.profile_completed),
    'services_created', jsonb_build_object('current', cp.services_created, 'previous', pp.services_created),
    'profile_views', jsonb_build_object('current', cp.profile_views, 'previous', pp.profile_views),
    'service_views', jsonb_build_object('current', cp.service_views, 'previous', pp.service_views),
    'whatsapp_clicks', jsonb_build_object('current', cp.whatsapp_clicks, 'previous', pp.whatsapp_clicks),
    'external_clicks', jsonb_build_object('current', cp.external_clicks, 'previous', pp.external_clicks),
    'link_copies', jsonb_build_object('current', cp.link_copies, 'previous', pp.link_copies)
  ) INTO result
  FROM current_period cp, previous_period pp, new_users nu, returning_users ru, prev_new_users pnu, prev_returning_users pru;

  RETURN result;
END;
$$;

-- ------------------------------------------------------------
-- Admin: get_admin_top_pages — distinct sessions as visitors
-- (user_id misses the anonymous majority of profile visitors)
-- ------------------------------------------------------------
create or replace function public.get_admin_top_pages(
  p_start timestamptz,
  p_end timestamptz,
  p_limit int default 50
)
returns table (
  page_path text,
  views bigint,
  unique_visitors bigint,
  avg_duration_ms numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  PERFORM public._require_admin();

  RETURN QUERY
  SELECT
    ae.page_path,
    count(*)::bigint AS views,
    count(DISTINCT ae.session_id)::bigint AS unique_visitors,
    0::numeric AS avg_duration_ms
  FROM public.analytics_events ae
  WHERE ae.event_name = 'page_view'
    AND ae.created_at >= p_start AND ae.created_at < p_end
    AND ae.page_path IS NOT NULL
  GROUP BY ae.page_path
  ORDER BY views DESC
  LIMIT p_limit;
END;
$$;

-- ------------------------------------------------------------
-- Admin: get_admin_event_stats — local-day series
-- ------------------------------------------------------------
create or replace function public.get_admin_event_stats(
  p_event_name text,
  p_start timestamptz,
  p_end timestamptz,
  p_tz_offset int default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
  v_tz int;
begin
  PERFORM public._require_admin();

  v_tz := greatest(-840, least(840, coalesce(p_tz_offset, 0)));

  WITH event_data AS (
    SELECT
      count(*)::bigint AS total,
      count(DISTINCT user_id)::bigint AS unique_users,
      count(DISTINCT session_id)::bigint AS sessions
    FROM public.analytics_events
    WHERE event_name = p_event_name
      AND created_at >= p_start AND created_at < p_end
  ),
  daily AS (
    SELECT
      gs.dt::date AS day,
      count(ae.id)::bigint AS count
    FROM generate_series(
      (p_start - make_interval(mins => v_tz))::date,
      (p_end - make_interval(mins => v_tz))::date,
      '1 day'::interval
    ) gs(dt)
    LEFT JOIN public.analytics_events ae
      ON ae.event_name = p_event_name
      AND ae.created_at >= p_start AND ae.created_at < p_end
      AND (ae.created_at - make_interval(mins => v_tz)) >= gs.dt
      AND (ae.created_at - make_interval(mins => v_tz)) < gs.dt + interval '1 day'
    GROUP BY gs.dt
    ORDER BY gs.dt
  )
  SELECT jsonb_build_object(
    'total', ed.total,
    'unique_users', ed.unique_users,
    'sessions', ed.sessions,
    'daily', (SELECT jsonb_agg(jsonb_build_object('day', d.day, 'count', d.count)) FROM daily d)
  ) INTO result
  FROM event_data ed;

  RETURN result;
END;
$$;

-- ------------------------------------------------------------
-- Grants (updated signatures)
-- ------------------------------------------------------------
grant execute on function public.record_event(uuid, text, uuid) to anon, authenticated;

grant execute on function public.get_daily_events(uuid, int, int) to authenticated;
grant execute on function public.get_profile_clicks_breakdown(uuid, int, int) to authenticated;

grant execute on function public.get_admin_daily_stats(timestamptz, timestamptz, int) to authenticated;
grant execute on function public.get_admin_overview_kpis(timestamptz, timestamptz, timestamptz, timestamptz) to authenticated;
grant execute on function public.get_admin_top_pages(timestamptz, timestamptz, int) to authenticated;
grant execute on function public.get_admin_event_stats(text, timestamptz, timestamptz, int) to authenticated;

-- Refresh PostgREST's schema cache so the updated functions are callable.
NOTIFY pgrst, 'reload schema';