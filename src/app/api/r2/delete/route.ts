import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  deleteR2Object,
  isOwnedR2Key,
  isR2MediaKind,
  keyFromPublicUrl,
  R2_MEDIA_KINDS,
  type R2MediaKind,
} from "@/lib/r2";

interface DeleteBody {
  kind?: unknown;
  key?: unknown;
  /** Public URL of an object to remove, e.g. a replaced avatar. */
  publicUrl?: unknown;
}

/**
 * Deletes one of the caller's own R2 objects.
 *
 * Used as best-effort cleanup after a failed insert, so it must accept every
 * kind the uploader can produce: the photo, the video, the video's poster
 * frame, and the avatar.
 *
 * The caller may send either the raw `key` (it just signed one) or the
 * `publicUrl` it had stored (e.g. the previous avatar URL read back from the
 * database). Resolving a URL to a key happens here rather than in the client,
 * so the public bucket base URL never has to be exposed to the browser and
 * ownership is always decided server-side.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: DeleteBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // With no kind given, accept the key under any of the member's own prefixes.
  // This matches the original behaviour (which only knew `portfolio/<uid>/`)
  // while covering the prefixes added for images.
  const kind: R2MediaKind | null = isR2MediaKind(body.kind) ? body.kind : null;

  const key =
    typeof body.key === "string"
      ? body.key
      : typeof body.publicUrl === "string"
        ? keyFromPublicUrl(body.publicUrl)
        : null;

  const owned =
    key !== null &&
    (kind !== null
      ? isOwnedR2Key(kind, user.id, key)
      : R2_MEDIA_KINDS.some((k) => isOwnedR2Key(k, user.id, key)));

  if (!owned) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  await deleteR2Object(key);
  return NextResponse.json({ ok: true });
}
