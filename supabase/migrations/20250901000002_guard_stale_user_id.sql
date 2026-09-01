-- ============================================================
-- Bizko: Make `track_analytics_event` resilient to stale/invalid sessions.
--
-- A stale/expired Supabase access token can carry a user_id claim that no
-- longer exists in `auth.users` (e.g. the refresh_token 400 case). Inserting
-- that UID fails the FK `analytics_events_user_id_fkey` and drops the event.
--
-- This validates the UID against `auth.users` and falls back to NULL when it
-- doesn't exist, so tracking keeps working (event recorded with user_id = NULL)
-- instead of failing loudly.
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
  v_exists boolean;
BEGIN
  v_user_id := auth.uid();
  v_session_id := current_setting('request.headers', true)::jsonb->>'x-analytics-session';

  IF v_session_id IS NULL OR v_session_id = '' THEN
    v_session_id := 'anon-' || replace(gen_random_uuid()::text, '-', '');
  END IF;

  -- A stale/invalid token can carry a user_id that no longer exists in
  -- auth.users; don't fail the whole insert for that.
  IF v_user_id IS NOT NULL THEN
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = v_user_id) INTO v_exists;
    IF NOT v_exists THEN
      v_user_id := NULL;
    END IF;
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
