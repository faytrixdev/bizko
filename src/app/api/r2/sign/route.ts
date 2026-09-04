import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPresignedPut, buildPublicUrl, R2_CONFIG, isValidR2Config } from "@/lib/r2";
import { getLimits, videoSizeLimitBytes } from "@/lib/plans";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!isValidR2Config()) return NextResponse.json({ error: "r2_not_configured" }, { status: 500 });

  const { data: isPro } = await supabase.rpc("is_pro", { p_profile_id: user.id });
  const plan = isPro ? "pro" : "free";
  const limits = getLimits(plan);

  // Enforce video count limit server-side (closes UI-only counting gap).
  const { count: videoCount, error: videoCountError } = await supabase
    .from("portfolio_items")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", user.id)
    .eq("media_type", "video");
  if (!videoCountError && (videoCount ?? 0) >= limits.videos) {
    return NextResponse.json({ error: "videos_limit" }, { status: 403 });
  }

  // A video is also a portfolio item; enforce the total portfolio cap too.
  const { count: portfolioCount, error: portfolioCountError } = await supabase
    .from("portfolio_items")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", user.id);
  if (!portfolioCountError && (portfolioCount ?? 0) >= limits.portfolioItems) {
    return NextResponse.json({ error: "portfolio_limit" }, { status: 403 });
  }

  let body: { size?: number; name?: string; contentType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const size = Number(body.size);
  const sizeLimit = videoSizeLimitBytes(plan);
  // R2 bucket-level absolute ceiling as a backstop (per-plan limit usually lower).
  const effectiveLimit = Math.min(sizeLimit, R2_CONFIG.maxVideoSizeBytes);
  if (!Number.isFinite(size) || size <= 0 || size > effectiveLimit) {
    return NextResponse.json({ error: "size_too_large" }, { status: 413 });
  }

  const safeName = (body.name ?? "video")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 60);
  const key = `portfolio/${user.id}/${Date.now()}-${safeName}.mp4`;

  const uploadUrl = await createPresignedPut(key, body.contentType ?? "video/mp4");
  if (!uploadUrl) return NextResponse.json({ error: "r2_not_configured" }, { status: 500 });

  return NextResponse.json({ uploadUrl, publicUrl: buildPublicUrl(key), key });
}
