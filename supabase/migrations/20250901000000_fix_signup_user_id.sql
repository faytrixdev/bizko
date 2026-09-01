-- ============================================================
-- Bizko: Fix `user_signed_up` events being recorded with user_id = NULL.
--
-- The `user_signed_up` event is tracked from the signup server action, which
-- runs BEFORE an auth session exists for the new user, so `auth.uid()` is NULL
-- and the event row stored user_id = NULL. As a result the "Inscriptions"
-- KPI (count(DISTINCT user_id) WHERE event_name='user_signed_up') counted 0.
--
-- This adds an optional `p_user_id` to `track_analytics_event` so the signup
-- server action can pass the new user's id explicitly. All other call sites
-- keep relying on `auth.uid()` (unchanged behaviour).
-- ============================================================

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
  p_metadata jsonb default '{}',
  p_user_id uuid default null
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
  v_user_id := COALESCE(p_user_id, auth.uid());
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
  text, text, text, text, text, text, text, text, text, text, text, text, jsonb, uuid
) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
