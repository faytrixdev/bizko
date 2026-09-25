import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rateLimit";
import { requestThrottleKey } from "@/lib/clientKey";
import { trackEvent } from "@/lib/analytics";

const SAFE_FALLBACK = "https://wa.me";

function isSafeWaLink(to: string | null): to is string {
  if (!to) return false;
  try {
    const url = new URL(to);
    return url.protocol === "https:" && url.hostname === "wa.me";
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const { allowed, retryAfterSeconds } = rateLimit(request, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.redirect(SAFE_FALLBACK, {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    });
  }
  const profileId = searchParams.get("pid");
  const type = searchParams.get("type");
  const to = searchParams.get("to");
  const sid = searchParams.get("sid") ?? undefined;

  if (profileId && type && isSafeWaLink(to)) {
    // `record_event` n'est plus exécutable avec la clé anon (migration
    // 20260923000005) : l'événement est enregistré ici, côté serveur, avec le
    // service role et une clé de throttle dérivée de l'IP réelle. Le type
    // reste validé par la RPC (^view|click_…$).
    const admin = createAdminClient();
    const { error } = await admin.rpc("record_event", {
      p_profile_id: profileId,
      p_type: type,
      p_throttle_key: requestThrottleKey(request.headers),
    });
    if (error) console.error("track-click: failed to record event", error.message);

    await trackEvent("whatsapp_clicked", {
      pagePath: `/api/track-click`,
      sessionId: sid,
      metadata: { profile_id: profileId, type },
    });
  }

  return NextResponse.redirect(isSafeWaLink(to) ? to! : SAFE_FALLBACK, { status: 302 });
}
