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
