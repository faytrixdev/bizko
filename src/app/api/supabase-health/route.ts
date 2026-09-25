import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rateLimit";

/**
 * Diagnostic de connectivité Supabase.
 *
 * Cet endpoint était public et renvoyait le nombre de profils visibles :
 * une métrique business exposée sans authentification. Il exige désormais
 * soit le CRON_SECRET (monitoring serveur), soit une session administrateur,
 * et ne renvoie plus aucune donnée métier.
 */
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

  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const authorizedBySecret =
    Boolean(cronSecret) && authHeader === `Bearer ${cronSecret}`;

  if (!authorizedBySecret) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (isAdmin !== true) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
  }

  try {
    const supabase = await createClient();
    // `head: true` : aucune ligne transférée, on ne teste que l'accès (RLS).
    const { error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });
    if (error) {
      console.error("supabase-health: query failed", error.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("supabase-health: exception", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
