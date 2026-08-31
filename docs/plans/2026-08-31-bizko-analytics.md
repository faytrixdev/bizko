# Bizko Analytics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a private admin analytics dashboard (`/admin`) with real Supabase data, server-side admin protection, and interactive Recharts visualizations.

**Architecture:** New `analytics_events` + `analytics_sessions` tables in Supabase. SQL RPC functions for server-side aggregation. Next.js `(admin)` route group with layout, sidebar, and 9 pages. Recharts for charts. `date-fns` for date formatting. All data via RPC — frontend never fetches raw events.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase (Auth + PostgreSQL), Recharts, date-fns, Lucide React icons.

**Key existing files to modify:**
- `middleware.ts` — add admin route protection
- `src/lib/supabase/middleware.ts` — admin check logic
- `src/app/(auth)/actions.ts` — track `user_signed_up`
- `src/app/onboarding/actions.ts` — track `profile_completed`
- `src/app/api/track-click/route.ts` — track `whatsapp_clicked`
- `src/components/ViewTracker.tsx` — track `profile_viewed`
- `src/app/[username]/page.tsx` — pass service_id for `service_viewed`

---

## Phase 1: Database + Admin Auth + Layout

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install recharts and date-fns**

```bash
npm install recharts date-fns
npm install -D @types/recharts
```

**Step 2: Verify install**

```bash
npm ls recharts date-fns
```

Expected: both listed without errors.

---

### Task 2: Database migration — analytics tables + admin role

**Files:**
- Create: `supabase/migrations/20250831000010_analytics_admin.sql`

**Step 1: Create the migration file**

```sql
-- ============================================================
-- Bizko Analytics: admin role + analytics_events + analytics_sessions
-- ============================================================

-- 1) Add is_admin to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean not null default false;

-- 2) analytics_events — platform-wide events (not per-profile)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  event_name text NOT NULL,
  page_path text,
  referrer text,
  country text,
  device_type text,  -- mobile | desktop | tablet
  browser text,
  os text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_ae_event_created ON public.analytics_events(event_name, created_at);
CREATE INDEX IF NOT EXISTS idx_ae_user_created ON public.analytics_events(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ae_session ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_ae_page_created ON public.analytics_events(page_path, created_at);

-- 3) analytics_sessions — one row per user session
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  landing_page text,
  referrer text,
  country text,
  device_type text,
  browser text,
  os text,
  is_new_user boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_as_started ON public.analytics_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_as_user ON public.analytics_sessions(user_id, started_at);

-- 4) RLS — analytics tables are admin-only
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

-- Admin can read everything
CREATE POLICY "Admins can read analytics_events"
  ON public.analytics_events FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can read analytics_sessions"
  ON public.analytics_sessions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Service role inserts (via RPC) — no user insert policy needed
-- RLS bypassed by SECURITY DEFINER functions below.

-- 5) SECURITY DEFINER: insert analytics event (bypasses RLS)
CREATE OR REPLACE FUNCTION public.track_analytics_event(
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
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_session_id text;
BEGIN
  v_user_id := auth.uid();
  v_session_id := current_setting('request.headers', true)::jsonb->>'x-analytics-session';

  IF v_session_id IS NULL OR v_session_id = '' THEN
    v_session_id := 'anon-' || replace(gen_random_uuid()::text, '-', '');
  END IF;

  INSERT INTO public.analytics_events (
    user_id, session_id, event_name, page_path, referrer,
    country, device_type, browser, os,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    metadata
  ) VALUES (
    v_user_id, v_session_id, p_event_name, p_page_path, p_referrer,
    p_country, p_device_type, p_browser, p_os,
    p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content, p_utm_term,
    p_metadata
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_analytics_event(
  text, text, text, text, text, text, text, text, text, text, text, text, jsonb
) TO anon, authenticated;

-- 6) SECURITY DEFINER: upsert session
CREATE OR REPLACE FUNCTION public.upsert_analytics_session(
  p_session_id text,
  p_landing_page text default null,
  p_referrer text default null,
  p_country text default null,
  p_device_type text default null,
  p_browser text default null,
  p_os text default null
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_is_new boolean;
BEGIN
  v_user_id := auth.uid();
  v_is_new := NOT EXISTS (
    SELECT 1 FROM public.analytics_events
    WHERE session_id = p_session_id AND event_name = 'session_start'
  );

  INSERT INTO public.analytics_sessions (
    id, user_id, landing_page, referrer, country,
    device_type, browser, os, is_new_user
  ) VALUES (
    p_session_id, v_user_id, p_landing_page, p_referrer, p_country,
    p_device_type, p_browser, p_os, v_is_new
  )
  ON CONFLICT (id) DO UPDATE SET
    ended_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_analytics_session(
  text, text, text, text, text, text, text
) TO anon, authenticated;
```

**Step 2: Verify migration has no syntax errors**

Read the file and verify all SQL statements are well-formed.

---

### Task 3: Admin RPC functions for dashboard queries

**Files:**
- Create: `supabase/migrations/20250831000011_analytics_rpc.sql`

**Step 1: Create the RPC functions migration**

```sql
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
  -- New vs returning users (current period)
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
        WHERE ae2.user_id = ae.user_id AND ae2.created_at < p_start
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
    0::numeric AS avg_duration_ms  -- placeholder, duration tracking is Phase 5
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

  WITH first_seen AS (
    SELECT user_id, date_trunc('week', min(created_at))::date AS cohort_week
    FROM public.analytics_events
    WHERE user_id IS NOT NULL
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
    GROUP BY fs.cohort_week, date_trunc('week', ae.created_at)
  )
  SELECT jsonb_build_object(
    'cohorts', (SELECT jsonb_agg(jsonb_build_object(
      'cohort_week', r.cohort_week,
      'size', cs.size,
      'retention', (SELECT jsonb_agg(jsonb_build_object(
        'week_offset', EXTRACT(WEEK FROM r2.activity_week) - EXTRACT(WEEK FROM r.cohort_week),
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
```

**Step 2: Verify SQL syntax**

---

### Task 4: Type definitions

**Files:**
- Modify: `src/types/analytics.ts`

**Step 1: Rewrite the analytics types file**

```typescript
// ─── Period & comparison ───────────────────────────────────────

export type PeriodPreset = "today" | "yesterday" | "7d" | "30d" | "90d" | "custom";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface PeriodState {
  preset: PeriodPreset;
  range: DateRange;
  compare: boolean;
}

// ─── KPI ───────────────────────────────────────────────────────

export interface KPIValue {
  current: number;
  previous: number;
}

export interface OverviewKPIs {
  active_users: KPIValue;
  new_users: KPIValue;
  returning_users: KPIValue;
  sessions: KPIValue;
  page_views: KPIValue;
  signups: KPIValue;
  profile_completed: KPIValue;
  services_created: KPIValue;
  profile_views: KPIValue;
  service_views: KPIValue;
  whatsapp_clicks: KPIValue;
  external_clicks: KPIValue;
  link_copies: KPIValue;
}

// ─── Daily chart data ──────────────────────────────────────────

export interface DailyStats {
  day: string;
  active_users: number;
  new_users: number;
  sessions: number;
  page_views: number;
  profile_views: number;
  service_views: number;
  whatsapp_clicks: number;
  external_clicks: number;
  signups: number;
}

// ─── Realtime ──────────────────────────────────────────────────

export interface RealtimeStats {
  active_sessions: number;
  active_users: number;
  pages: { page_path: string; views: number }[];
  recent_events: { event_name: string; page_path: string; created_at: string }[];
  devices: { device_type: string; cnt: number }[];
  countries: { country: string; cnt: number }[];
}

// ─── Pages ─────────────────────────────────────────────────────

export interface TopPage {
  page_path: string;
  views: number;
  unique_visitors: number;
  avg_duration_ms: number;
}

// ─── Acquisition ───────────────────────────────────────────────

export interface AcquisitionSource {
  source: string;
  sessions: number;
  users: number;
  signups: number;
}

export interface UTMCampaign {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  sessions: number;
  users: number;
}

export interface AcquisitionStats {
  by_source: AcquisitionSource[];
  utm_campaigns: UTMCampaign[];
}

// ─── Events ────────────────────────────────────────────────────

export interface EventStat {
  event_name: string;
  total: number;
  unique_users: number;
  sessions: number;
}

export interface EventDetail {
  total: number;
  unique_users: number;
  sessions: number;
  daily: { day: string; count: number }[];
}

// ─── Devices ───────────────────────────────────────────────────

export interface DeviceStats {
  devices: { device_type: string; cnt: number }[];
  browsers: { browser: string; cnt: number }[];
  os_list: { os: string; cnt: number }[];
}

// ─── Countries ─────────────────────────────────────────────────

export interface CountryStat {
  country: string;
  users: number;
  sessions: number;
  signups: number;
}

// ─── Funnel ────────────────────────────────────────────────────

export interface FunnelStep {
  name: string;
  count: number;
}

// ─── Retention ─────────────────────────────────────────────────

export interface RetentionCohort {
  cohort_week: string;
  size: number;
  retention: { week_offset: number; retained: number; rate: number }[];
}

// ─── Search ────────────────────────────────────────────────────

export interface SearchStats {
  total_searches: number;
  unique_users: number;
  top_queries: { query: string; cnt: number }[];
}

// ─── Legacy types (kept for backward compat) ───────────────────

export interface DailyEvent {
  day: string;
  views: number;
  clicks: number;
}

export interface ClickBucket {
  bucket: string;
  count: number;
}
```

---

### Task 5: Analytics helper library

**Files:**
- Create: `src/lib/analytics.ts`

**Step 1: Create the analytics helper**

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Track an analytics event server-side.
 * Called from server actions and route handlers.
 */
export async function trackEvent(
  eventName: string,
  opts: {
    pagePath?: string;
    referrer?: string;
    country?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
    metadata?: Record<string, unknown>;
  } = {}
) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("track_analytics_event", {
      p_event_name: eventName,
      p_page_path: opts.pagePath ?? null,
      p_referrer: opts.referrer ?? null,
      p_country: opts.country ?? null,
      p_device_type: opts.deviceType ?? null,
      p_browser: opts.browser ?? null,
      p_os: opts.os ?? null,
      p_utm_source: opts.utmSource ?? null,
      p_utm_medium: opts.utmMedium ?? null,
      p_utm_campaign: opts.utmCampaign ?? null,
      p_utm_content: opts.utmContent ?? null,
      p_utm_term: opts.utmTerm ?? null,
      p_metadata: opts.metadata ? JSON.stringify(opts.metadata) : "{}",
    });
    if (error) console.error("trackEvent error:", error.message);
  } catch (e) {
    console.error("trackEvent exception:", e);
  }
}
```

---

### Task 6: Admin middleware protection

**Files:**
- Modify: `src/lib/supabase/middleware.ts`

**Step 1: Add admin route protection**

After the existing user auth checks (around line 106-139), add admin protection. The key change is: when the pathname starts with `/admin`, fetch the profile and check `is_admin`. If not admin, return 403.

Add to the `reservedRootPrefixes` array: `"/admin"`

Add after the profile check for `/dashboard` and `/account` (around line 139):

```typescript
// Admin protection
if (pathname.startsWith("/admin")) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_admin) {
    return new NextResponse("Forbidden", { status: 403 });
  }
}
```

---

### Task 7: Admin layout — sidebar + header

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/AdminSidebar.tsx`
- Create: `src/app/admin/AdminHeader.tsx`
- Create: `src/app/admin/PeriodContext.tsx`

**Step 1: Create PeriodContext**

```typescript
"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { subDays, startOfDay, endOfDay, subMonths } from "date-fns";
import type { PeriodState, DateRange } from "@/types/analytics";

function getPresetRange(preset: PeriodState["preset"]): DateRange {
  const now = new Date();
  const today = endOfDay(now);
  switch (preset) {
    case "today":
      return { start: startOfDay(now), end: today };
    case "yesterday":
      return { start: startOfDay(subDays(now, 1)), end: endOfDay(subDays(now, 1)) };
    case "7d":
      return { start: startOfDay(subDays(now, 6)), end: today };
    case "30d":
      return { start: startOfDay(subDays(now, 29)), end: today };
    case "90d":
      return { start: startOfDay(subDays(now, 89)), end: today };
    case "custom":
      return { start: startOfDay(subMonths(now, 1)), end: today };
  }
}

function getPrevRange(range: DateRange): DateRange {
  const diff = range.end.getTime() - range.start.getTime();
  return {
    start: new Date(range.start.getTime() - diff),
    end: new Date(range.end.getTime() - diff),
  };
}

interface PeriodContextValue {
  state: PeriodState;
  setPreset: (preset: PeriodState["preset"]) => void;
  setCustomRange: (range: DateRange) => void;
  toggleCompare: () => void;
  prevRange: DateRange;
  fmt: (d: Date) => string;
  toISO: (d: Date) => string;
}

const PeriodContext = createContext<PeriodContextValue | null>(null);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PeriodState>({
    preset: "30d",
    range: getPresetRange("30d"),
    compare: true,
  });

  const setPreset = useCallback((preset: PeriodState["preset"]) => {
    setState((s) => ({ ...s, preset, range: getPresetRange(preset) }));
  }, []);

  const setCustomRange = useCallback((range: DateRange) => {
    setState((s) => ({ ...s, preset: "custom", range }));
  }, []);

  const toggleCompare = useCallback(() => {
    setState((s) => ({ ...s, compare: !s.compare }));
  }, []);

  const prevRange = getPrevRange(state.range);

  const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  const toISO = (d: Date) => d.toISOString();

  return (
    <PeriodContext.Provider value={{ state, setPreset, setCustomRange, toggleCompare, prevRange, fmt, toISO }}>
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod() {
  const ctx = useContext(PeriodContext);
  if (!ctx) throw new Error("usePeriod must be used within PeriodProvider");
  return ctx;
}
```

**Step 2: Create AdminSidebar**

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/realtime", label: "Temps réel", icon: "⚡" },
  { href: "/admin/acquisition", label: "Acquisition", icon: "📈" },
  { href: "/admin/pages", label: "Pages & contenu", icon: "📄" },
  { href: "/admin/events", label: "Événements", icon: "🎯" },
  { href: "/admin/funnels", label: "Funnel", icon: "🔄" },
  { href: "/admin/retention", label: "Rétention", icon: "👥" },
  { href: "/admin/audience", label: "Audience", icon: "🌍" },
  { href: "/admin/technology", label: "Technologie", icon: "💻" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:border-r border-gray-200 bg-gray-50/50">
      <div className="p-4 border-b border-gray-200">
        <Link href="/admin">
          <Logo size="sm" />
        </Link>
        <span className="ml-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Analytics</span>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/60"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white/60"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          Retour à Bizko
        </Link>
      </div>
    </aside>
  );
}
```

**Step 3: Create AdminHeader**

```typescript
"use client";

import Link from "next/link";
import { usePeriod } from "./PeriodContext";
import type { PeriodPreset } from "@/types/analytics";

const PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: "today", label: "Aujourd'hui" },
  { value: "yesterday", label: "Hier" },
  { value: "7d", label: "7 derniers jours" },
  { value: "30d", label: "30 derniers jours" },
  { value: "90d", label: "90 derniers jours" },
];

export function AdminHeader() {
  const { state, setPreset, toggleCompare } = usePeriod();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-3">
          <Link href="/" className="lg:hidden">
            <span className="font-display font-bold text-lg text-gray-900">bizko</span>
          </Link>
          <span className="text-sm font-semibold text-gray-900 hidden lg:inline">Bizko Analytics</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPreset(p.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  state.preset === p.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Compare toggle */}
          <button
            onClick={toggleCompare}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              state.compare
                ? "bg-accent text-white border-accent"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            Comparer
          </button>
        </div>
      </div>
    </header>
  );
}
```

**Step 4: Create the admin layout**

```typescript
import type { Metadata } from "next";
import { PeriodProvider } from "./PeriodContext";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export const metadata: Metadata = {
  title: "Bizko Analytics",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PeriodProvider>
      <div className="min-h-screen flex flex-col bg-white">
        <AdminHeader />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </PeriodProvider>
  );
}
```

---

### Task 8: Shared UI components

**Files:**
- Create: `src/components/admin/KPICard.tsx`
- Create: `src/components/admin/EmptyState.tsx`
- Create: `src/components/admin/DataTable.tsx`
- Create: `src/components/admin/ComparisonBadge.tsx`
- Create: `src/components/admin/PeriodSetter.tsx`

**Step 1: Create ComparisonBadge**

```typescript
import { cn } from "@/lib/utils";

export function ComparisonBadge({ current, previous, className }: { current: number; previous: number; className?: string }) {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) {
    return <span className={cn("text-xs font-medium text-green-600", className)}>Nouveau</span>;
  }
  const pct = ((current - previous) / previous) * 100;
  const positive = pct >= 0;
  return (
    <span className={cn("text-xs font-medium", positive ? "text-green-600" : "text-red-500", className)}>
      {positive ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
}
```

**Step 2: Create KPICard**

```typescript
import { ComparisonBadge } from "./ComparisonBadge";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: number;
  previous: number;
  format?: "number" | "duration" | "percent";
  className?: string;
}

function formatValue(v: number, format: string): string {
  if (format === "duration") {
    const s = Math.round(v / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  }
  if (format === "percent") return `${v.toFixed(1)}%`;
  return v.toLocaleString("fr-FR");
}

export function KPICard({ label, value, previous, format = "number", className }: KPICardProps) {
  return (
    <div className={cn("bg-white border border-gray-200 rounded-xl p-4", className)}>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">{formatValue(value, format)}</span>
        <ComparisonBadge current={value} previous={previous} />
      </div>
    </div>
  );
}
```

**Step 3: Create EmptyState**

```typescript
export function EmptyState({ title = "Pas encore de données", description }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-900">{title}</p>
      {description && <p className="text-xs text-gray-500 mt-1 max-w-xs">{description}</p>}
    </div>
  );
}
```

**Step 4: Create DataTable**

```typescript
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  label: string;
  align?: "left" | "right";
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  defaultSort?: string;
  limit?: number;
}

export function DataTable<T extends Record<string, unknown>>({ columns, data, defaultSort, limit = 20 }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState(defaultSort || columns[0]?.key);
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...data]
    .sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      if (typeof av === "number" && typeof bv === "number") return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    })
    .slice(0, limit);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-900 transition-colors",
                  col.align === "right" ? "text-right" : "text-left"
                )}
                onClick={() => {
                  if (sortKey === col.key) setSortAsc(!sortAsc);
                  else { setSortKey(col.key); setSortAsc(false); }
                }}
              >
                {col.label}
                {sortKey === col.key && <span className="ml-1">{sortAsc ? "↑" : "↓"}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3", col.align === "right" ? "text-right" : "text-left")}>
                  {col.render ? col.render(row) : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400 text-sm">
                Aucune donnée
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
```

**Step 5: Create PeriodSetter (client hook for pages)**

```typescript
"use client";

import { usePeriod } from "@/app/admin/PeriodContext";

/**
 * Hook for admin pages to get period dates as ISO strings for RPC calls.
 */
export function useAdminPeriod() {
  const { state, prevRange, fmt, toISO } = usePeriod();
  return {
    start: toISO(state.range.start),
    end: toISO(state.range.end),
    prevStart: toISO(prevRange.start),
    prevEnd: toISO(prevRange.end),
    compare: state.compare,
    preset: state.preset,
    label: fmt(state.range.start) + " — " + fmt(state.range.end),
  };
}
```

---

### Task 9: Overview page

**Files:**
- Create: `src/app/admin/page.tsx`

**Step 1: Create the overview page (Server Component)**

```typescript
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OverviewContent } from "./OverviewContent";

export default async function AdminOverview() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/");

  return <OverviewContent />;
}
```

**Step 2: Create OverviewContent (client component with data fetching)**

This is a client component that uses `useAdminPeriod` and fetches data from Supabase RPC. Create `src/app/admin/OverviewContent.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminPeriod } from "@/components/admin/PeriodSetter";
import { KPICard } from "@/components/admin/KPICard";
import { EmptyState } from "@/components/admin/EmptyState";
import { OverviewCharts } from "./OverviewCharts";
import type { OverviewKPIs } from "@/types/analytics";

export function OverviewContent() {
  const { start, end, prevStart, prevEnd, compare } = useAdminPeriod();
  const [kpis, setKpis] = useState<OverviewKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const supabase = createClient();
    supabase.rpc("get_admin_overview_kpis", {
      p_start: start,
      p_end: end,
      p_prev_start: prevStart,
      p_prev_end: prevEnd,
    }).then(({ data }) => {
      setKpis(data as OverviewKPIs);
      setLoading(false);
    });
  }, [start, end, prevStart, prevEnd]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>;
  }

  if (!kpis) return <EmptyState />;

  const hasData = kpis.sessions.current > 0 || kpis.active_users.current > 0;

  if (!hasData) return <EmptyState description="Commence à.track des événements pour voir les données ici." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Vue d&apos;ensemble de l&apos;activité Bizko</p>
      </div>

      {/* Users section */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Utilisateurs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <KPICard label="Utilisateurs actifs" value={kpis.active_users.current} previous={kpis.active_users.previous} />
          <KPICard label="Nouveaux utilisateurs" value={kpis.new_users.current} previous={kpis.new_users.previous} />
          <KPICard label="Utilisateurs récurrents" value={kpis.returning_users.current} previous={kpis.returning_users.previous} />
        </div>
      </section>

      {/* Traffic section */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Trafic</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <KPICard label="Sessions" value={kpis.sessions.current} previous={kpis.sessions.previous} />
          <KPICard label="Vues de pages" value={kpis.page_views.current} previous={kpis.page_views.previous} />
        </div>
      </section>

      {/* Engagement section */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Engagement Bizko</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard label="Profils consultés" value={kpis.profile_views.current} previous={kpis.profile_views.previous} />
          <KPICard label="Services consultés" value={kpis.service_views.current} previous={kpis.service_views.previous} />
          <KPICard label="Clics WhatsApp" value={kpis.whatsapp_clicks.current} previous={kpis.whatsapp_clicks.previous} />
          <KPICard label="Clics externes" value={kpis.external_clicks.current} previous={kpis.external_clicks.previous} />
        </div>
      </section>

      {/* Conversion section */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Conversion</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <KPICard label="Inscriptions" value={kpis.signups.current} previous={kpis.signups.previous} />
          <KPICard label="Profils complétés" value={kpis.profile_completed.current} previous={kpis.profile_completed.previous} />
          <KPICard label="Services créés" value={kpis.services_created.current} previous={kpis.services_created.previous} />
        </div>
      </section>

      {/* Charts */}
      <OverviewCharts />
    </div>
  );
}
```

**Step 3: Create OverviewCharts**

Create `src/app/admin/OverviewCharts.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminPeriod } from "@/components/admin/PeriodSetter";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DailyStats } from "@/types/analytics";

export function OverviewCharts() {
  const { start, end } = useAdminPeriod();
  const [data, setData] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const supabase = createClient();
    supabase.rpc("get_admin_daily_stats", { p_start: start, p_end: end }).then(({ data: rows }) => {
      setData((rows as DailyStats[]) ?? []);
      setLoading(false);
    });
  }, [start, end]);

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>;
  if (data.length === 0) return <EmptyState title="Pas encore de données graphiques" />;

  const chartData = data.map((d) => ({
    ...d,
    label: format(new Date(d.day), "dd MMM", { locale: fr }),
  }));

  return (
    <div className="space-y-6">
      {/* Users chart */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Utilisateurs actifs</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="active_users" name="Actifs" stroke="#111827" fill="#111827" fillOpacity={0.1} strokeWidth={2} />
            <Area type="monotone" dataKey="new_users" name="Nouveaux" stroke="#ff6b35" fill="#ff6b35" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* Sessions chart */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Sessions</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
            <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* Engagement chart */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Engagement</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="profile_views" name="Profils" stroke="#111827" fill="#111827" fillOpacity={0.05} strokeWidth={2} />
            <Area type="monotone" dataKey="service_views" name="Services" stroke="#ff6b35" fill="#ff6b35" fillOpacity={0.05} strokeWidth={2} />
            <Area type="monotone" dataKey="whatsapp_clicks" name="WhatsApp" stroke="#25d366" fill="#25d366" fillOpacity={0.05} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* Signups chart */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Inscriptions</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
            <Area type="monotone" dataKey="signups" name="Inscriptions" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
```

---

### Task 10: Verify Phase 1

**Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

**Step 2: Run lint**

```bash
npm run lint
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat(analytics): Phase 1 — admin auth, layout, overview, database schema"
```

---

## Phase 2: Event Tracking + Realtime + Charts

### Task 11: Client-side analytics tracking

**Files:**
- Create: `src/components/AnalyticsTracker.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create the client-side analytics tracker**

```typescript
"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function getSessionId(): string {
  let id = sessionStorage.getItem("bizko_analytics_sid");
  if (!id) {
    id = "s-" + crypto.randomUUID().replace(/-/g, "").slice(0, 24);
    sessionStorage.setItem("bizko_analytics_sid", id);
  }
  return id;
}

function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobile|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Other";
}

function detectOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Other";
}

function parseUTM(search: string) {
  const params = new URLSearchParams(search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term"),
  };
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    const sid = getSessionId();
    const utm = parseUTM(searchParams.toString());
    const device = detectDevice();
    const browser = detectBrowser();
    const os = detectOS();

    // Session start (once per page load)
    if (!initRef.current) {
      initRef.current = true;
      void supabase.rpc("track_analytics_event", {
        p_event_name: "session_start",
        p_page_path: pathname,
        p_referrer: document.referrer || null,
        p_device_type: device,
        p_browser: browser,
        p_os: os,
        ...utm,
      });
    }

    // Page view on every navigation
    void supabase.rpc("track_analytics_event", {
      p_event_name: "page_view",
      p_page_path: pathname,
      p_referrer: document.referrer || null,
      p_device_type: device,
      p_browser: browser,
      p_os: os,
      ...utm,
    });
  }, [pathname, searchParams]);

  return null;
}
```

**Step 2: Add AnalyticsTracker to root layout**

In `src/app/layout.tsx`, add the `AnalyticsTracker` component inside the body, after `SessionHeartbeat`:

```tsx
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
// ... in the body:
<AnalyticsTracker />
```

---

### Task 12: Track events in existing flows

**Files:**
- Modify: `src/app/(auth)/actions.ts` — track `user_signed_up` in signup
- Modify: `src/app/onboarding/actions.ts` — track `profile_completed` in onboarding
- Modify: `src/components/ViewTracker.tsx` — track `profile_viewed` and `service_viewed`
- Modify: `src/app/api/track-click/route.ts` — track `whatsapp_clicked`

**Step 1: Add tracking to signup**

In `src/app/(auth)/actions.ts`, after successful `supabase.auth.signUp()` (before the redirect), add:

```typescript
import { trackEvent } from "@/lib/analytics";
// ... in the signup function, after the signUp call succeeds:
await trackEvent("user_signed_up", { pagePath: "/signup" });
```

**Step 2: Add tracking to onboarding**

In `src/app/onboarding/actions.ts`, after successful profile insert, add:

```typescript
import { trackEvent } from "@/lib/analytics";
// ... after the profile is created:
await trackEvent("profile_completed", { pagePath: "/onboarding" });
```

Also track `service_created` if a service was added:

```typescript
if (service_title && !serviceError) {
  await trackEvent("service_created", { pagePath: "/onboarding" });
}
```

**Step 3: Enhance ViewTracker to track profile_viewed and service_viewed**

In `src/components/ViewTracker.tsx`, enhance to also call `track_analytics_event` for `profile_viewed`:

```typescript
"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function ViewTracker({ profileId }: { profileId: string }) {
  const tracked = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (tracked.current[profileId]) return;
    tracked.current[profileId] = true;

    const supabase = createClient();

    // Legacy event tracking
    void supabase
      .rpc("record_event", { p_profile_id: profileId, p_type: "view" })
      .then(() => {}, (err: unknown) => { console.error("view tracking failed:", err); });

    // Analytics platform tracking
    void supabase.rpc("track_analytics_event", {
      p_event_name: "profile_viewed",
      p_page_path: window.location.pathname,
      p_metadata: JSON.stringify({ profile_id: profileId }),
    });
  }, [profileId]);

  return null;
}
```

**Step 4: Track whatsapp_clicked in track-click route**

In `src/app/api/track-click/route.ts`, after recording the legacy event, add analytics tracking:

```typescript
import { trackEvent } from "@/lib/analytics";
// ... after the existing record_event call:
await trackEvent("whatsapp_clicked", {
  pagePath: `/api/track-click`,
  metadata: { profile_id: profileId, type },
});
```

---

### Task 13: Realtime page

**Files:**
- Create: `src/app/admin/realtime/page.tsx`
- Create: `src/app/admin/realtime/RealtimeContent.tsx`

**Step 1: Create the realtime page**

```typescript
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RealtimeContent } from "./RealtimeContent";

export default async function AdminRealtime() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <RealtimeContent />;
}
```

**Step 2: Create RealtimeContent**

```typescript
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/admin/EmptyState";
import type { RealtimeStats } from "@/types/analytics";

export function RealtimeContent() {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();
      const { data } = await supabase.rpc("get_admin_realtime_stats");
      setStats(data as RealtimeStats);
      setLoading(false);
    }
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>;
  }

  if (!stats || (stats.active_sessions === 0 && stats.active_users === 0)) {
    return <EmptyState title="Aucun utilisateur actif" description="Aucun visiteur en ce moment. Reviens dans quelques instants." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Temps réel</h1>
        <p className="text-sm text-gray-500 mt-1">Mise à jour toutes les 30 secondes</p>
      </div>

      {/* Active users */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-500 mb-1">Sessions actives</p>
          <p className="text-4xl font-bold text-gray-900">{stats.active_sessions}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-500 mb-1">Utilisateurs actifs</p>
          <p className="text-4xl font-bold text-gray-900">{stats.active_users}</p>
        </div>
      </div>

      {/* Pages being viewed */}
      {stats.pages && stats.pages.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Pages consultées</h2>
          <div className="space-y-2">
            {stats.pages.map((p) => (
              <div key={p.page_path} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700 font-mono truncate">{p.page_path}</span>
                <span className="text-sm font-semibold text-gray-900 ml-4">{p.views}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent events */}
      {stats.recent_events && stats.recent_events.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Événements récents</h2>
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {stats.recent_events.map((e, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 text-xs">
                <span className="font-mono text-gray-500">{new Date(e.created_at).toLocaleTimeString("fr-FR")}</span>
                <span className="font-medium text-gray-900">{e.event_name}</span>
                {e.page_path && <span className="text-gray-400 truncate">{e.page_path}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Devices & Countries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.devices && stats.devices.length > 0 && (
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Appareils</h2>
            {stats.devices.map((d) => (
              <div key={d.device_type} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700 capitalize">{d.device_type}</span>
                <span className="text-sm font-semibold text-gray-900">{d.cnt}</span>
              </div>
            ))}
          </section>
        )}
        {stats.countries && stats.countries.length > 0 && (
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Pays</h2>
            {stats.countries.map((c) => (
              <div key={c.country} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">{c.country}</span>
                <span className="text-sm font-semibold text-gray-900">{c.cnt}</span>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
```

---

### Task 14: Verify Phase 2

**Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

**Step 2: Run lint**

```bash
npm run lint
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat(analytics): Phase 2 — event tracking, realtime page, client analytics"
```

---

## Phase 3: Acquisition + Pages + Events

### Task 15: Acquisition page

**Files:**
- Create: `src/app/admin/acquisition/page.tsx`
- Create: `src/app/admin/acquisition/AcquisitionContent.tsx`

**Step 1: Create the page + client component**

```typescript
// page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AcquisitionContent } from "./AcquisitionContent";

export default async function AdminAcquisition() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <AcquisitionContent />;
}
```

```typescript
// AcquisitionContent.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminPeriod } from "@/components/admin/PeriodSetter";
import { EmptyState } from "@/components/admin/EmptyState";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { AcquisitionStats } from "@/types/analytics";

const COLORS = ["#111827", "#ff6b35", "#6366f1", "#25d366", "#eab308", "#ec4899", "#06b6d4", "#84cc16"];

export function AcquisitionContent() {
  const { start, end } = useAdminPeriod();
  const [stats, setStats] = useState<AcquisitionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const supabase = createClient();
    supabase.rpc("get_admin_acquisition_stats", { p_start: start, p_end: end }).then(({ data }) => {
      setStats(data as AcquisitionStats);
      setLoading(false);
    });
  }, [start, end]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>;
  if (!stats || !stats.by_source || stats.by_source.length === 0) return <EmptyState description="Les sources de trafic apparaîtront ici." />;

  const pieData = stats.by_source.map((s) => ({ name: s.source, value: s.sessions }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Acquisition</h1>
        <p className="text-sm text-gray-500 mt-1">D&apos;où viennent tes visiteurs</p>
      </div>

      {/* Source breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Sources de trafic</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Détail par source</h2>
          <div className="space-y-3">
            {stats.by_source.map((s) => (
              <div key={s.source} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <span className="text-sm font-medium text-gray-900">{s.source}</span>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-xs text-gray-500">{s.sessions} sessions</span>
                    <span className="text-xs text-gray-500">{s.users} utilisateurs</span>
                    {s.signups > 0 && <span className="text-xs text-green-600">{s.signups} inscriptions</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* UTM campaigns */}
      {stats.utm_campaigns && stats.utm_campaigns.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Campagnes UTM</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Source</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Medium</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Campagne</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Sessions</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Utilisateurs</th>
                </tr>
              </thead>
              <tbody>
                {stats.utm_campaigns.map((c, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-4 py-2 text-gray-700">{c.utm_source}</td>
                    <td className="px-4 py-2 text-gray-700">{c.utm_medium || "—"}</td>
                    <td className="px-4 py-2 text-gray-700">{c.utm_campaign || "—"}</td>
                    <td className="px-4 py-2 text-right font-medium">{c.sessions}</td>
                    <td className="px-4 py-2 text-right font-medium">{c.users}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
```

---

### Task 16: Pages & contenu page

**Files:**
- Create: `src/app/admin/pages/page.tsx`
- Create: `src/app/admin/pages/PagesContent.tsx`

**Step 1: Create the page**

Same pattern as acquisition: server component checks auth, renders client component.

```typescript
// page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PagesContent } from "./PagesContent";

export default async function AdminPages() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <PagesContent />;
}
```

```typescript
// PagesContent.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminPeriod } from "@/components/admin/PeriodSetter";
import { EmptyState } from "@/components/admin/EmptyState";
import { DataTable } from "@/components/admin/DataTable";
import type { TopPage } from "@/types/analytics";

export function PagesContent() {
  const { start, end } = useAdminPeriod();
  const [pages, setPages] = useState<TopPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const supabase = createClient();
    supabase.rpc("get_admin_top_pages", { p_start: start, p_end: end, p_limit: 50 }).then(({ data }) => {
      setPages((data as TopPage[]) ?? []);
      setLoading(false);
    });
  }, [start, end]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>;
  if (pages.length === 0) return <EmptyState description="Les pages consultées apparaîtront ici." />;

  const columns = [
    { key: "page_path", label: "Page", render: (row: TopPage) => <span className="font-mono text-xs">{row.page_path}</span> },
    { key: "views", label: "Vues", align: "right" as const },
    { key: "unique_visitors", label: "Visiteurs uniques", align: "right" as const },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pages & contenu</h1>
        <p className="text-sm text-gray-500 mt-1">Les pages les plus consultées</p>
      </div>

      <section className="bg-white border border-gray-200 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Toutes les pages</h2>
        </div>
        <DataTable columns={columns} data={pages as unknown as Record<string, unknown>[]} defaultSort="views" />
      </section>
    </div>
  );
}
```

---

### Task 17: Events page

**Files:**
- Create: `src/app/admin/events/page.tsx`
- Create: `src/app/admin/events/EventsContent.tsx`

Same pattern. Fetch `get_admin_events_list` and display in a DataTable. Each event row links to a detail view.

---

### Task 18: Verify Phase 3

```bash
npx tsc --noEmit && npm run lint && npm run build
git add -A && git commit -m "feat(analytics): Phase 3 — acquisition, pages, events"
```

---

## Phase 4: Funnel + Retention + Audience + Technology

### Task 19: Funnels page

**Files:**
- Create: `src/app/admin/funnels/page.tsx`
- Create: `src/app/admin/funnels/FunnelsContent.tsx`

Fetch `get_admin_funnel_stats` and render a funnel visualization using horizontal bars. Calculate conversion rates between steps.

---

### Task 20: Retention page

**Files:**
- Create: `src/app/admin/retention/page.tsx`
- Create: `src/app/admin/retention/RetentionContent.tsx`

Fetch `get_admin_retention_cohorts`. If no data, show "Pas encore assez de données." If data exists, render a cohort table.

---

### Task 21: Audience page

**Files:**
- Create: `src/app/admin/audience/page.tsx`
- Create: `src/app/admin/audience/AudienceContent.tsx`

Fetch `get_admin_country_stats` for country breakdown. Compute DAU/WAU/MAU from daily stats.

---

### Task 22: Technology page

**Files:**
- Create: `src/app/admin/technology/page.tsx`
- Create: `src/app/admin/technology/TechnologyContent.tsx`

Fetch `get_admin_device_stats`. Display device types, browsers, OS in bar charts using Recharts `BarChart`.

---

### Task 23: Verify Phase 4

```bash
npx tsc --noEmit && npm run lint && npm run build
git add -A && git commit -m "feat(analytics): Phase 4 — funnel, retention, audience, technology"
```

---

## Phase 5: Polish + Optimization

### Task 24: Admin layout mobile responsive

Add a mobile hamburger menu to `AdminSidebar` and `AdminHeader` so the sidebar is accessible on small screens.

---

### Task 25: Loading states and error boundaries

Add `loading.tsx` and `error.tsx` files in each admin route for proper loading skeletons and error handling.

---

### Task 26: Final verification

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run test:run
```

Verify:
- TypeScript: zero errors
- Lint: zero warnings
- Build: succeeds
- Tests: all pass
- `/admin` redirects to `/login` for non-admin users
- `/admin` shows 403 for logged-in non-admin users
- All charts render with real data
- No mock data anywhere

```bash
git add -A && git commit -m "feat(analytics): Phase 5 — polish, mobile, loading states"
```
