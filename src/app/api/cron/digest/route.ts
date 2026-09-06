import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildDigestEmail, type DigestEmailInput } from "@/lib/digest/renderEmail";
import { getMessages } from "@/lib/i18n/messages";
import { currentWeekKey } from "@/lib/digest/week";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM;
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("x-cron-secret");
  if (!CRON_SECRET || authHeader !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const week = currentWeekKey();

  const { data: profiles, error: profilesError } = await supabase
    .from("digest_prefs")
    .select("profile_id, profiles!inner(id, display_name, locale, template)")
    .is("unsubscribed_at", null)
    .eq("profiles.is_public", true);

  if (profilesError) {
    console.error("[cron-digest] Failed to fetch profiles:", profilesError.message);
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ week, sent: 0, skipped: 0, errors: 0 });
  }

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of profiles) {
    const profile = (row.profiles as { id: string; display_name: string; locale: string; template: string }[])[0];
    const profileId = profile.id;

    const { data: digestData, error: rpcError } = await supabase.rpc("get_profile_weekly_digest", {
      p_profile_id: profileId,
    });

    if (rpcError) {
      console.error(`[cron-digest] RPC error for ${profileId}:`, rpcError.message);
      errors++;
      continue;
    }

    const digest = digestData as {
      views: number;
      clicks: number;
      prev_views: number;
      prev_clicks: number;
      top_service_name: string | null;
      top_service_count: number;
      has_activity: boolean;
    };

    if (!digest.has_activity) {
      skipped++;
      continue;
    }

    const messages = getMessages(profile.locale as "fr" | "en");
    const d = messages.digest;

    const unsubUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/digest/unsubscribe?profile=${profileId}&sig=${""}`;

    const emailInput: DigestEmailInput = {
      displayName: profile.display_name,
      views: digest.views,
      clicks: digest.clicks,
      prevViews: digest.prev_views,
      prevClicks: digest.prev_clicks,
      topServiceName: digest.top_service_name || undefined,
      suggestion: !digest.has_activity ? null : { type: "pro_cta", label: d.proCtaLabel, url: d.proCtaUrl },
      unsubUrl,
      isPro: false,
      messages,
    };

    const { subject, html } = buildDigestEmail(emailInput);

    if (!RESEND_API_KEY || !RESEND_FROM) {
      console.error("[cron-digest] Resend not configured");
      errors++;
      continue;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [profileId],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[cron-digest] Resend error for ${profileId}:`, err);
      errors++;
      continue;
    }

    const { error: insertError } = await supabase.from("digest_sends").insert({
      profile_id: profileId,
      week,
      sent_at: new Date().toISOString(),
      email: profileId,
    });

    if (insertError) {
      console.error(`[cron-digest] Failed to log send for ${profileId}:`, insertError.message);
      errors++;
      continue;
    }

    sent++;
  }

  return NextResponse.json({ week, sent, skipped, errors });
}