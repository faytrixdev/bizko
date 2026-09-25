import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rateLimit";
import { requestThrottleKey } from "@/lib/clientKey";

// Types autorisés pour ce endpoint. Les clics WhatsApp passent par
// /api/track-click (ils portent une redirection) ; ici on ne traite que les
// vues de profil, pour lesquelles il n'existe pas d'autre point d'entrée.
const ALLOWED_TYPES = new Set(["view"]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Enregistre une vue de profil.
 *
 * Pourquoi une route serveur : `record_event` était appelable avec la clé anon
 * (exposée au navigateur), ce qui permettait de gonfler les compteurs de
 * n'importe quel profil public sans limite. La RPC est désormais réservée au
 * service role ; cette route ajoute une limite par IP et transmet une clé de
 * throttle (hash d'IP, jamais l'IP en clair) que la base re-vérifie.
 */
export async function POST(request: NextRequest) {
  const { allowed, retryAfterSeconds } = rateLimit(request, {
    limit: 60,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  let body: { profileId?: unknown; type?: unknown };
  try {
    body = (await request.json()) as { profileId?: unknown; type?: unknown };
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const profileId = typeof body.profileId === "string" ? body.profileId : "";
  const type = typeof body.type === "string" ? body.type : "view";

  if (!UUID_RE.test(profileId) || !ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.rpc("record_event", {
    p_profile_id: profileId,
    p_type: type,
    p_throttle_key: requestThrottleKey(request.headers),
  });

  if (error) {
    // Profil privé/inexistant, type invalide ou throttle : jamais remonté au
    // client (pas d'oracle d'existence) et jamais bloquant pour le visiteur.
    console.error("track-view: failed to record event", error.message);
  }

  return new NextResponse(null, { status: 204 });
}
