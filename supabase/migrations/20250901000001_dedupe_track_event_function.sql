-- ============================================================
-- Bizko: Fix duplicate `track_analytics_event` overloads.
--
-- The earlier migration (20250901000000) added `p_user_id` to
-- `track_analytics_event` via CREATE OR REPLACE, which *created a second
-- overload* (14 args) instead of replacing the original 13-arg version.
-- PostgREST then could not choose between the two when called with 13 args.
--
-- OAuth signups are now tracked in `auth/callback` where a real auth session
-- exists, so `auth.uid()` is valid and the explicit `p_user_id` is NOT needed.
-- We drop BOTH overloads and recreate a single canonical 13-arg version.
-- ============================================================

DROP FUNCTION IF EXISTS public.track_analytics_event(
  text, text, text, text, text, text, text, text, text, text, text, text, jsonb
);

DROP FUNCTION IF EXISTS public.track_analytics_event(
  text, text, text, text, text, text, text, text, text, text, text, text, jsonb, uuid
);

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

NOTIFY pgrst, 'reload schema';
