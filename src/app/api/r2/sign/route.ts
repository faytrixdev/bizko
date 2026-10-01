import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildPublicUrl,
  countR2Objects,
  createPresignedPut,
  isR2MediaKind,
  isValidR2Config,
  resolveContentType,
  type R2MediaKind,
} from "@/lib/r2";
import { buildKeyFor } from "@/lib/mediaKinds";
import { mediaSpec, orphanCapFor, orphanPrefixFor } from "@/lib/mediaPolicy";
import { getLimits, type Plan } from "@/lib/plans";

interface SignBody {
  kind?: unknown;
  size?: unknown;
  name?: unknown;
  contentType?: unknown;
}

/**
 * Issues a presigned PUT for one object of one media kind.
 *
 * The policy (plan caps, size ceiling, object-level orphan guard) is
 * table-driven in `mediaPolicy.ts`; this route only applies it. Each kind
 * counts rows in its own set and lists objects under its own key prefix, so a
 * member's photo count can never trip the video guard.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!isValidR2Config()) return NextResponse.json({ error: "r2_not_configured" }, { status: 500 });

  let body: SignBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Defaults to "video": the only kind this endpoint accepted before images
  // were routed through R2.
  const kind: R2MediaKind = isR2MediaKind(body.kind) ? body.kind : "video";
  const spec = mediaSpec(kind);

  const { data: isPro } = await supabase.rpc("is_pro", { p_profile_id: user.id });
  const plan: Plan = isPro ? "pro" : "free";
  const limits = getLimits(plan);

  // Row-count guard: counts `portfolio_items` rows, not client-reported intent,
  // so the UI can never be the gate.
  if (spec.rowCap && spec.rowScope !== "none") {
    const base = supabase
      .from("portfolio_items")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.id);
    const { count, error } = spec.rowScope === "video"
      ? await base.eq("media_type", "video")
      : await base;

    if (!error && (count ?? 0) >= spec.rowCap(limits)) {
      return NextResponse.json({ error: spec.rowCapError }, { status: 403 });
    }
  }

  // A video is also a portfolio item, so the *total* cap applies on top of the
  // per-kind row cap. Enforced here for video only; images and thumbnails are
  // already counted against the total by their own `rowScope: "all"` guard.
  if (spec.alsoCapsTotalRows) {
    const { count, error } = await supabase
      .from("portfolio_items")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.id);
    if (!error && (count ?? 0) >= limits.portfolioItems) {
      return NextResponse.json({ error: "portfolio_limit" }, { status: 403 });
    }
  }

  // Object-level guard: a presigned PUT creates no row, so without counting
  // objects a member could upload unlimited files and never reach their plan
  // limit. `orphanSlack` absorbs objects orphaned by an interrupted upload, so
  // one flaky PUT never locks a legitimate member out.
  const objectCount = await countR2Objects(orphanPrefixFor(kind, user.id));
  if (objectCount !== null && objectCount >= orphanCapFor(kind, plan)) {
    return NextResponse.json({ error: spec.rowCapError }, { status: 403 });
  }

  const size = Number(body.size);
  const sizeLimit = spec.sizeLimitBytes(plan);
  // Pre-check of UX only: the size announced by the browser is not binding.
  // The authoritative check runs after upload in /api/r2/verify, which HEADs
  // the real object and deletes anything out of bounds.
  if (!Number.isFinite(size) || size <= 0 || size > sizeLimit) {
    return NextResponse.json({ error: "size_too_large" }, { status: 413 });
  }

  // The Content-Type is validated server-side, never taken as-is: it is frozen
  // into the PUT signature, so it cannot be changed afterwards. An unknown type
  // is replaced by the kind's canonical one rather than trusted — otherwise a
  // client could park `text/html` in the bucket served by media.bizko.pro.
  const contentType = resolveContentType(kind, body.contentType);
  const name = typeof body.name === "string" ? body.name : kind;
  const key = buildKeyFor(kind, user.id, name, Date.now());

  const uploadUrl = await createPresignedPut(key, contentType, kind);
  if (!uploadUrl) return NextResponse.json({ error: "r2_not_configured" }, { status: 500 });

  // `contentType` is returned so the client sends EXACTLY the signed type in
  // the PUT header, otherwise the S3 signature is rejected.
  return NextResponse.json({ uploadUrl, publicUrl: buildPublicUrl(key), key, contentType, kind });
}
