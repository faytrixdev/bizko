import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  isAllowedVideoContentType,
  R2_CONFIG,
  deleteR2Object,
  headR2Object,
} from "@/lib/r2";
import { getLimits, videoSizeLimitBytes } from "@/lib/plans";

/**
 * Vérification post-upload d'une vidéo R2.
 *
 * Une URL présignée PUT ne permet pas de borner la taille du corps envoyé :
 * `size` transmis par le navigateur avant signature est déclaratif. On relit
 * donc l'objet réel (HEAD) et on supprime immédiatement tout fichier qui
 * dépasse la limite du plan ou dont le Content-Type n'est pas celui imposé.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { key?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Même contrôle que /api/r2/delete : clé confinée au dossier du membre.
  const prefix = `portfolio/${user.id}/`;
  if (
    typeof body.key !== "string" ||
    !body.key.startsWith(prefix) ||
    body.key.includes("..")
  ) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const key = body.key;

  const head = await headR2Object(key);
  if (!head) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: isPro } = await supabase.rpc("is_pro", { p_profile_id: user.id });
  const plan = isPro ? "pro" : "free";
  const limits = getLimits(plan);
  const sizeLimit = Math.min(videoSizeLimitBytes(plan), R2_CONFIG.maxVideoSizeBytes);
  const expectedTotal = limits.videos;

  if (head.contentType !== null && !isAllowedVideoContentType(head.contentType)) {
    await deleteR2Object(key);
    return NextResponse.json({ error: "invalid_content_type" }, { status: 415 });
  }

  if (!Number.isFinite(head.size) || head.size <= 0 || head.size > sizeLimit) {
    await deleteR2Object(key);
    return NextResponse.json({ error: "size_too_large" }, { status: 413 });
  }

  // Le quota de vidéos est déjà contrôlé avant signature (lignes
  // portfolio_items + objets R2 présents) : rien à faire ici, on renvoie la
  // taille réelle pour information.
  return NextResponse.json({
    ok: true,
    size: head.size,
    contentType: head.contentType,
    videoLimit: Number.isFinite(expectedTotal) ? expectedTotal : null,
  });
}
