import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyUnsubToken } from "@/lib/digest/signature";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");
  const profileId = searchParams.get("profileId");

  const secret = process.env.DIGEST_SECRET;
  if (!secret) {
    console.error("[digest-unsubscribe] DIGEST_SECRET not configured");
    return NextResponse.redirect(new URL("/digest/unsubscribed?error=server", req.url));
  }

  if (!token || !profileId) {
    return NextResponse.redirect(new URL("/digest/unsubscribed?error=invalid", req.url));
  }

  const valid = verifyUnsubToken(token, profileId, secret);
  if (!valid) {
    return NextResponse.redirect(new URL("/digest/unsubscribed?error=invalid", req.url));
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("digest_prefs")
    .upsert({ profile_id: profileId, unsubscribed_at: now }, { onConflict: "profile_id" });

  if (error) {
    console.error("[digest-unsubscribe] DB error:", error.message);
    return NextResponse.redirect(new URL("/digest/unsubscribed?error=server", req.url));
  }

  return NextResponse.redirect(new URL("/digest/unsubscribed?ok=1", req.url));
}