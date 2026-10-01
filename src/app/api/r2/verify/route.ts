import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  deleteR2Object,
  headR2Object,
  isAllowedContentType,
  isOwnedR2Key,
  isR2MediaKind,
  type R2MediaKind,
} from "@/lib/r2";
import { mediaSpec } from "@/lib/mediaPolicy";
import { getLimits, type Plan } from "@/lib/plans";

interface VerifyBody {
  kind?: unknown;
  key?: unknown;
}

/**
 * Post-upload verification of one R2 object.
 *
 * A presigned PUT does not bound the request body: the `size` the browser
 * declared before signing is advisory. The real object is therefore re-read
 * (HEAD) and anything over the plan limit, or carrying a Content-Type outside
 * the kind's allowlist, is deleted immediately.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: VerifyBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const kind: R2MediaKind = isR2MediaKind(body.kind) ? body.kind : "video";

  // Confine the key to the member's own folder for this kind: keeps one member
  // from deleting another's objects, and rejects traversal.
  if (!isOwnedR2Key(kind, user.id, body.key)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const key = body.key;

  const head = await headR2Object(key);
  if (!head) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: isPro } = await supabase.rpc("is_pro", { p_profile_id: user.id });
  const plan: Plan = isPro ? "pro" : "free";
  const spec = mediaSpec(kind);
  const sizeLimit = spec.sizeLimitBytes(plan);

  if (head.contentType !== null && !isAllowedContentType(kind, head.contentType)) {
    await deleteR2Object(key);
    return NextResponse.json({ error: "invalid_content_type" }, { status: 415 });
  }

  if (!Number.isFinite(head.size) || head.size <= 0 || head.size > sizeLimit) {
    await deleteR2Object(key);
    return NextResponse.json({ error: "size_too_large" }, { status: 413 });
  }

  // The row/orphan caps were enforced before signing; the real size is returned
  // so the caller can report what was actually stored.
  const cap = spec.rowCap ? spec.rowCap(getLimits(plan)) : null;
  return NextResponse.json({
    ok: true,
    kind,
    size: head.size,
    contentType: head.contentType,
    sizeLimit,
    itemCap: cap,
  });
}
