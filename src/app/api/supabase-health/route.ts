import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  const { allowed, retryAfterSeconds } = rateLimit(request, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.json(
      { ok: false },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    );
  }

  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    if (error) {
      console.error("supabase-health: query failed", error.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    return NextResponse.json({ ok: true, profiles: count ?? 0 });
  } catch (e) {
    console.error("supabase-health: exception", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
