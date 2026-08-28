import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rateLimit";

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

  if (profileId && type && isSafeWaLink(to)) {
    const supabase = await createClient();
    const { error } = await supabase
      .rpc("record_event", { p_profile_id: profileId, p_type: type });
    if (error) console.error("track-click: failed to record event", error.message);
  }

  return NextResponse.redirect(isSafeWaLink(to) ? to! : SAFE_FALLBACK, { status: 302 });
}
