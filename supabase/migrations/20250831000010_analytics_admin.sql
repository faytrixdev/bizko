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
