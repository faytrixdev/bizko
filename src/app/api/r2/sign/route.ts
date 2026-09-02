import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPresignedPut, buildPublicUrl, R2_CONFIG, isValidR2Config } from "@/lib/r2";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!isValidR2Config()) return NextResponse.json({ error: "r2_not_configured" }, { status: 500 });

  let body: { size?: number; name?: string; contentType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const size = Number(body.size);
  if (!Number.isFinite(size) || size <= 0 || size > R2_CONFIG.maxVideoSizeBytes) {
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
