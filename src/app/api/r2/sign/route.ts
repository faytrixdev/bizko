import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createPresignedPut,
  buildPublicUrl,
  countR2Objects,
  isValidR2Config,
  isAllowedVideoContentType,
  VIDEO_CONTENT_TYPE,
  R2_CONFIG,
} from "@/lib/r2";
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
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id);
  if (!portfolioCountError && (portfolioCount ?? 0) >= limits.portfolioItems) {
    return NextResponse.json({ error: "portfolio_limit" }, { status: 403 });
  }

  // Objets déjà stockés dans le dossier R2 du membre, y compris les fichiers
  // orphelins (upload interrompu sans ligne portfolio_items) : sans ce
  // plafond, la limite de plan se contournait en n'enregistrant jamais la
  // ligne. `limits.videos` vaut Infinity en Pro => jamais bloquant.
  const r2ObjectCount = await countR2Objects(`portfolio/${user.id}/`);
  if (r2ObjectCount !== null && r2ObjectCount >= limits.videos + 5) {
    return NextResponse.json({ error: "videos_limit" }, { status: 403 });
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
  // Pré-contrôle d'UX uniquement : la taille annoncée par le navigateur n'est
  // pas opposable, la vérification qui fait foi est faite après l'upload par
  // POST /api/r2/verify (HEAD sur l'objet réel).
  const effectiveLimit = Math.min(sizeLimit, R2_CONFIG.maxVideoSizeBytes);
  if (!Number.isFinite(size) || size <= 0 || size > effectiveLimit) {
    return NextResponse.json({ error: "size_too_large" }, { status: 413 });
  }

  const safeName = (body.name ?? "video")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 60);
  const key = `portfolio/${user.id}/${Date.now()}-${safeName}.mp4`;

  // Le Content-Type est validé côté serveur (jamais pris tel quel) : il est
  // figé dans la signature du PUT, donc impossible à falsifier ensuite.
  // Seuls les types vidéo connus sont acceptés — un `text/html` serait sinon
  // servi depuis le domaine public media.bizko.pro.
  const requestedType =
    typeof body.contentType === "string" ? body.contentType : VIDEO_CONTENT_TYPE;
  const contentType = isAllowedVideoContentType(requestedType)
    ? requestedType
    : VIDEO_CONTENT_TYPE;

  const uploadUrl = await createPresignedPut(key, contentType);
  if (!uploadUrl) return NextResponse.json({ error: "r2_not_configured" }, { status: 500 });

  // `contentType` est renvoyé pour que le client envoie EXACTEMENT le type
  // signé dans l'en-tête du PUT (sinon la signature S3 est rejetée).
  return NextResponse.json({ uploadUrl, publicUrl: buildPublicUrl(key), key, contentType });
}
