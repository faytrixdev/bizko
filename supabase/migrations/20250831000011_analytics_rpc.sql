-- ============================================================
-- Bizko Analytics: RPC functions for admin dashboard
-- All functions are SECURITY DEFINER and check is_admin.
-- ============================================================

-- Helper: verify caller is admin
CREATE OR REPLACE FUNCTION public._require_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'forbidden: admin access required';
  END IF;
END;
$$;

-- 1) Overview KPIs with period comparison
CREATE OR REPLACE FUNCTION public.get_admin_overview_kpis(
  p_start timestamptz,
  p_end timestamptz,
  p_prev_start timestamptz,
  p_prev_end timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
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
  )
  SELECT jsonb_build_object(
    'active_users', jsonb_build_object('current', cp.active_users, 'previous', pp.active_users),
    'new_users', jsonb_build_object('current', nu.cnt, 'previous', 0),
    'returning_users', jsonb_build_object('current', ru.cnt, 'previous', 0),
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
  FROM current_period cp, previous_period pp, new_users nu, returning_users ru;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_overview_kpis(timestamptz, timestamptz, timestamptz, timestamptz) TO authenticated;

-- 2) Daily stats for charts
CREATE OR REPLACE FUNCTION public.get_admin_daily_stats(
  p_start timestamptz,
  p_end timestamptz
)
RETURNS TABLE (
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
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._require_admin();

  RETURN QUERY
  SELECT
    gs.dt::date AS day,
    count(DISTINCT ae.user_id) AS active_users,
    count(DISTINCT CASE
      WHEN ae.user_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.analytics_events ae2
        WHERE ae2.user_id = ae.user_id AND ae2.created_at < gs.dt
      ) THEN ae.user_id
    END) AS new_users,
    count(DISTINCT CASE WHEN ae.event_name = 'session_start' THEN ae.session_id END) AS sessions,
    count(*) FILTER (WHERE ae.event_name = 'page_view') AS page_views,
    count(*) FILTER (WHERE ae.event_name = 'profile_viewed') AS profile_views,
    count(*) FILTER (WHERE ae.event_name = 'service_viewed') AS service_views,
    count(*) FILTER (WHERE ae.event_name = 'whatsapp_clicked') AS whatsapp_clicks,
    count(*) FILTER (WHERE ae.event_name = 'external_link_clicked') AS external_clicks,
    count(*) FILTER (WHERE ae.event_name = 'user_signed_up') AS signups
  FROM generate_series(p_start::date, (p_end - interval '1 day')::date, '1 day'::interval) AS gs(dt)
  LEFT JOIN public.analytics_events ae
    ON ae.created_at >= gs.dt AND ae.created_at < gs.dt + interval '1 day'
  GROUP BY gs.dt
  ORDER BY gs.dt;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_daily_stats(timestamptz, timestamptz) TO authenticated;

-- 3) Realtime stats (last 5 minutes)
CREATE OR REPLACE FUNCTION public.get_admin_realtime_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  PERFORM public._require_admin();

  WITH active AS (
    SELECT
      count(DISTINCT session_id) AS active_sessions,
      count(DISTINCT user_id) AS active_users
    FROM public.analytics_events
    WHERE created_at > now() - interval '5 minutes'
  ),
  pages AS (
    SELECT page_path, count(*) AS views
    FROM public.analytics_events
    WHERE event_name = 'page_view'
      AND created_at > now() - interval '5 minutes'
      AND page_path IS NOT NULL
    GROUP BY page_path
    ORDER BY views DESC
    LIMIT 20
  ),
  recent_events AS (
    SELECT event_name, page_path, created_at
    FROM public.analytics_events
    WHERE created_at > now() - interval '5 minutes'
    ORDER BY created_at DESC
    LIMIT 50
  ),
  devices AS (
    SELECT device_type, count(*) AS cnt
    FROM public.analytics_events
    WHERE created_at > now() - interval '5 minutes'
      AND device_type IS NOT NULL
    GROUP BY device_type
  ),
  countries AS (
    SELECT country, count(*) AS cnt
    FROM public.analytics_events
    WHERE created_at > now() - interval '5 minutes'
      AND country IS NOT NULL
    GROUP BY country
    ORDER BY cnt DESC
    LIMIT 10
  )
  SELECT jsonb_build_object(
    'active_sessions', (SELECT active_sessions FROM active),
    'active_users', (SELECT active_users FROM active),
    'pages', (SELECT jsonb_agg(jsonb_build_object('page_path', page_path, 'views', views)) FROM pages),
    'recent_events', (SELECT jsonb_agg(jsonb_build_object('event_name', event_name, 'page_path', page_path, 'created_at', created_at)) FROM recent_events),
    'devices', (SELECT jsonb_agg(jsonb_build_object('device_type', device_type, 'cnt', cnt)) FROM devices),
    'countries', (SELECT jsonb_agg(jsonb_build_object('country', country, 'cnt', cnt)) FROM countries)
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_realtime_stats() TO authenticated;

-- 4) Top pages
CREATE OR REPLACE FUNCTION public.get_admin_top_pages(
  p_start timestamptz,
  p_end timestamptz,
  p_limit int default 50
)
RETURNS TABLE (
  page_path text,
  views bigint,
  unique_visitors bigint,
  avg_duration_ms numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._require_admin();

  RETURN QUERY
  SELECT
    ae.page_path,
    count(*)::bigint AS views,
    count(DISTINCT ae.user_id)::bigint AS unique_visitors,
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

GRANT EXECUTE ON FUNCTION public.get_admin_top_pages(timestamptz, timestamptz, int) TO authenticated;

-- 5) Acquisition stats
CREATE OR REPLACE FUNCTION public.get_admin_acquisition_stats(
  p_start timestamptz,
  p_end timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  PERFORM public._require_admin();

  WITH sources AS (
    SELECT
      COALESCE(
        CASE
          WHEN referrer ILIKE '%google%' THEN 'Google'
          WHEN referrer ILIKE '%tiktok%' THEN 'TikTok'
          WHEN referrer ILIKE '%instagram%' THEN 'Instagram'
          WHEN referrer ILIKE '%facebook%' THEN 'Facebook'
          WHEN referrer ILIKE '%x.com%' OR referrer ILIKE '%twitter%' THEN 'X'
          WHEN referrer ILIKE '%whatsapp%' THEN 'WhatsApp'
          WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
          WHEN referrer ILIKE '%bing%' THEN 'Bing'
          WHEN referrer ILIKE '%linkedin%' THEN 'LinkedIn'
          ELSE 'Referral'
        END,
        'Direct'
      ) AS source_category,
      session_id,
      user_id,
      event_name
    FROM public.analytics_events
    WHERE created_at >= p_start AND created_at < p_end
  ),
  source_agg AS (
    SELECT
      source_category,
      count(DISTINCT session_id) AS sessions,
      count(DISTINCT user_id) AS users,
      count(DISTINCT CASE WHEN event_name = 'user_signed_up' THEN user_id END) AS signups
    FROM sources
    GROUP BY source_category
  ),
  utm_sources AS (
    SELECT
      utm_source,
      utm_medium,
      utm_campaign,
      count(DISTINCT session_id) AS sessions,
      count(DISTINCT user_id) AS users
    FROM public.analytics_events
    WHERE created_at >= p_start AND created_at < p_end
      AND utm_source IS NOT NULL
    GROUP BY utm_source, utm_medium, utm_campaign
    ORDER BY sessions DESC
    LIMIT 50
  )
  SELECT jsonb_build_object(
    'by_source', (SELECT jsonb_agg(jsonb_build_object(
      'source', source_category,
      'sessions', sessions,
      'users', users,
      'signups', signups
    )) FROM source_agg ORDER BY sessions DESC),
    'utm_campaigns', (SELECT jsonb_agg(jsonb_build_object(
      'utm_source', utm_source,
      'utm_medium', utm_medium,
      'utm_campaign', utm_campaign,
      'sessions', sessions,
      'users', users
    )) FROM utm_sources)
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_acquisition_stats(timestamptz, timestamptz) TO authenticated;

-- 6) Event stats
CREATE OR REPLACE FUNCTION public.get_admin_event_stats(
  p_event_name text,
  p_start timestamptz,
  p_end timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  PERFORM public._require_admin();

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
    FROM generate_series(p_start::date, (p_end - interval '1 day')::date, '1 day'::interval) gs(dt)
    LEFT JOIN public.analytics_events ae
      ON ae.event_name = p_event_name
      AND ae.created_at >= gs.dt AND ae.created_at < gs.dt + interval '1 day'
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

GRANT EXECUTE ON FUNCTION public.get_admin_event_stats(text, timestamptz, timestamptz) TO authenticated;

-- 7) Device stats
CREATE OR REPLACE FUNCTION public.get_admin_device_stats(
  p_start timestamptz,
  p_end timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  PERFORM public._require_admin();

  SELECT jsonb_build_object(
    'devices', (SELECT jsonb_agg(jsonb_build_object('device_type', device_type, 'cnt', cnt)) FROM (
      SELECT device_type, count(*)::bigint AS cnt
      FROM public.analytics_events
      WHERE created_at >= p_start AND created_at < p_end AND device_type IS NOT NULL
      GROUP BY device_type ORDER BY cnt DESC
    ) d),
    'browsers', (SELECT jsonb_agg(jsonb_build_object('browser', browser, 'cnt', cnt)) FROM (
      SELECT browser, count(*)::bigint AS cnt
      FROM public.analytics_events
      WHERE created_at >= p_start AND created_at < p_end AND browser IS NOT NULL
      GROUP BY browser ORDER BY cnt DESC
    ) b),
    'os_list', (SELECT jsonb_agg(jsonb_build_object('os', os, 'cnt', cnt)) FROM (
      SELECT os, count(*)::bigint AS cnt
      FROM public.analytics_events
      WHERE created_at >= p_start AND created_at < p_end AND os IS NOT NULL
      GROUP BY os ORDER BY cnt DESC
    ) o)
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_device_stats(timestamptz, timestamptz) TO authenticated;

-- 8) Country stats
CREATE OR REPLACE FUNCTION public.get_admin_country_stats(
  p_start timestamptz,
  p_end timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  PERFORM public._require_admin();

  SELECT jsonb_build_object(
    'countries', (SELECT jsonb_agg(jsonb_build_object(
      'country', country,
      'users', users,
      'sessions', sessions,
      'signups', signups
    )) FROM (
      SELECT
        country,
        count(DISTINCT user_id)::bigint AS users,
        count(DISTINCT session_id)::bigint AS sessions,
        count(DISTINCT CASE WHEN event_name = 'user_signed_up' THEN user_id END)::bigint AS signups
      FROM public.analytics_events
      WHERE created_at >= p_start AND created_at < p_end AND country IS NOT NULL
      GROUP BY country ORDER BY users DESC
    ) c)
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_country_stats(timestamptz, timestamptz) TO authenticated;

-- 9) Funnel stats
CREATE OR REPLACE FUNCTION public.get_admin_funnel_stats(
  p_start timestamptz,
  p_end timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  PERFORM public._require_admin();

  WITH visitors AS (
    SELECT count(DISTINCT session_id)::bigint AS cnt
    FROM public.analytics_events
    WHERE created_at >= p_start AND created_at < p_end
  ),
  profile_viewers AS (
    SELECT count(DISTINCT session_id)::bigint AS cnt
    FROM public.analytics_events
    WHERE event_name = 'profile_viewed'
      AND created_at >= p_start AND created_at < p_end
  ),
  signups AS (
    SELECT count(DISTINCT user_id)::bigint AS cnt
    FROM public.analytics_events
    WHERE event_name = 'user_signed_up'
      AND created_at >= p_start AND created_at < p_end
  ),
  profile_completed AS (
    SELECT count(DISTINCT user_id)::bigint AS cnt
    FROM public.analytics_events
    WHERE event_name = 'profile_completed'
      AND created_at >= p_start AND created_at < p_end
  ),
  service_created AS (
    SELECT count(DISTINCT user_id)::bigint AS cnt
    FROM public.analytics_events
    WHERE event_name = 'service_created'
      AND created_at >= p_start AND created_at < p_end
  ),
  interaction_received AS (
    SELECT count(DISTINCT session_id)::bigint AS cnt
    FROM public.analytics_events
    WHERE event_name IN ('whatsapp_clicked', 'external_link_clicked')
      AND created_at >= p_start AND created_at < p_end
  )
  SELECT jsonb_build_object(
    'steps', jsonb_build_array(
      jsonb_build_object('name', 'Visiteurs', 'count', v.cnt),
      jsonb_build_object('name', 'Profil consulté', 'count', pv.cnt),
      jsonb_build_object('name', 'Inscrit', 'count', s.cnt),
      jsonb_build_object('name', 'Profil complété', 'count', pc.cnt),
      jsonb_build_object('name', 'Service publié', 'count', sc.cnt),
      jsonb_build_object('name', 'Interaction reçue', 'count', ir.cnt)
    )
  ) INTO result
  FROM visitors v, profile_viewers pv, signups s, profile_completed pc, service_created sc, interaction_received ir;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_funnel_stats(timestamptz, timestamptz) TO authenticated;

-- 10) Retention cohorts
CREATE OR REPLACE FUNCTION public.get_admin_retention_cohorts()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  PERFORM public._require_admin();

  WITH   first_seen AS (
    SELECT user_id, date_trunc('week', min(created_at))::date AS cohort_week
    FROM public.analytics_events
    WHERE user_id IS NOT NULL
      AND created_at >= now() - interval '6 months'
    GROUP BY user_id
  ),
  cohort_sizes AS (
    SELECT cohort_week, count(*)::bigint AS size
    FROM first_seen
    GROUP BY cohort_week
  ),
  retention AS (
    SELECT
      fs.cohort_week,
      date_trunc('week', ae.created_at)::date AS activity_week,
      count(DISTINCT ae.user_id)::bigint AS retained
    FROM first_seen fs
    JOIN public.analytics_events ae ON ae.user_id = fs.user_id
      AND ae.created_at >= now() - interval '6 months'
    GROUP BY fs.cohort_week, date_trunc('week', ae.created_at)
  )
  SELECT jsonb_build_object(
    'cohorts', (SELECT jsonb_agg(jsonb_build_object(
      'cohort_week', r.cohort_week,
      'size', cs.size,
      'retention', (SELECT jsonb_agg(jsonb_build_object(
        'week_offset', ((r2.activity_week - r.cohort_week) / 7)::int,
        'retained', r2.retained,
        'rate', ROUND(r2.retained::numeric / cs.size * 100, 1)
      )) FROM retention r2
      WHERE r2.cohort_week = r.cohort_week
        AND r2.activity_week >= r.cohort_week
        AND r2.activity_week <= r.cohort_week + interval '30 days'
      ORDER BY r2.activity_week)
    )) FROM retention r
    JOIN cohort_sizes cs ON cs.cohort_week = r.cohort_week
    WHERE r.activity_week = r.cohort_week
    ORDER BY r.cohort_week DESC
    LIMIT 12)
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_retention_cohorts() TO authenticated;

-- 11) All events list for events page
CREATE OR REPLACE FUNCTION public.get_admin_events_list(
  p_start timestamptz,
  p_end timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  PERFORM public._require_admin();

  SELECT jsonb_agg(jsonb_build_object(
    'event_name', event_name,
    'total', total,
    'unique_users', unique_users,
    'sessions', sessions
  ))
  INTO result
  FROM (
    SELECT
      event_name,
      count(*)::bigint AS total,
      count(DISTINCT user_id)::bigint AS unique_users,
      count(DISTINCT session_id)::bigint AS sessions
    FROM public.analytics_events
    WHERE created_at >= p_start AND created_at < p_end
    GROUP BY event_name
    ORDER BY total DESC
  ) e;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_events_list(timestamptz, timestamptz) TO authenticated;

-- 12) Search stats
CREATE OR REPLACE FUNCTION public.get_admin_search_stats(
  p_start timestamptz,
  p_end timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  PERFORM public._require_admin();

  SELECT jsonb_build_object(
    'total_searches', count(*)::bigint,
    'unique_users', count(DISTINCT user_id)::bigint,
    'top_queries', (SELECT jsonb_agg(jsonb_build_object('query', q, 'cnt', cnt)) FROM (
      SELECT metadata->>'query' AS q, count(*)::bigint AS cnt
      FROM public.analytics_events
      WHERE event_name = 'search_performed'
        AND created_at >= p_start AND created_at < p_end
        AND metadata->>'query' IS NOT NULL
      GROUP BY metadata->>'query'
      ORDER BY cnt DESC
      LIMIT 20
    ) t)
  ) INTO result
  FROM public.analytics_events
  WHERE event_name = 'search_performed'
    AND created_at >= p_start AND created_at < p_end;

  RETURN COALESCE(result, jsonb_build_object('total_searches', 0, 'unique_users', 0, 'top_queries', '[]'::jsonb));
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_search_stats(timestamptz, timestamptz) TO authenticated;

-- Refresh PostgREST's schema cache so the new/changed admin functions are immediately
-- callable via the REST/RPC endpoint.
NOTIFY pgrst, 'reload schema';