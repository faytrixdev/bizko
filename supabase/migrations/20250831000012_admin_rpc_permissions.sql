-- ============================================================
-- Bizko: Harden admin RPC permissions.
--
-- The admin RPCs were only GRANTed to `authenticated`, but PostgreSQL
-- grants `EXECUTE` to `PUBLIC` by default on new functions. That meant the
-- `anon` role (and every other role) could still *invoke* them, even though
-- `_require_admin()` raises `forbidden` before any data is read.
--
-- This migration removes the public/anon EXECUTE right so that only the
-- `authenticated` role (the role carried by a logged-in user's JWT — the role
-- the admin frontend uses) can call them. The real authorization barrier is
-- still `_require_admin()` inside each function; this removes the cheap
-- anonymous invocation vector.
--
-- The admin frontend runs in the browser with the anon key + the user's
-- access token (role = `authenticated`), so keeping `authenticated` EXECUTE
-- preserves the current behaviour. `anon` is only used on public pages, which
-- never call these functions.
-- ============================================================

-- _require_admin() helper (harmless on its own, but no reason to expose it)
REVOKE EXECUTE ON FUNCTION public._require_admin() FROM PUBLIC, anon;

-- Admin analytics RPCs
REVOKE EXECUTE ON FUNCTION public.get_admin_overview_kpis(timestamptz, timestamptz, timestamptz, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_daily_stats(timestamptz, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_realtime_stats() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_top_pages(timestamptz, timestamptz, int) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_acquisition_stats(timestamptz, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_event_stats(text, timestamptz, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_device_stats(timestamptz, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_country_stats(timestamptz, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_funnel_stats(timestamptz, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_retention_cohorts() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_events_list(timestamptz, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_search_stats(timestamptz, timestamptz) FROM PUBLIC, anon;

-- `authenticated` keeps EXECUTE (registered in 00011) — the role the admin
-- frontend authenticates as. Re-stating it here is idempotent and explicit.
GRANT EXECUTE ON FUNCTION public._require_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_overview_kpis(timestamptz, timestamptz, timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_daily_stats(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_realtime_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_top_pages(timestamptz, timestamptz, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_acquisition_stats(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_event_stats(text, timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_device_stats(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_country_stats(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_funnel_stats(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_retention_cohorts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_events_list(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_search_stats(timestamptz, timestamptz) TO authenticated;

NOTIFY pgrst, 'reload schema';
