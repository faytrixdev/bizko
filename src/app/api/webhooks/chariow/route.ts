import { NextRequest, NextResponse } from "next/server";
import { verifyPulse } from "@/lib/chariow";
import { createAdminClient } from "@/lib/supabase/admin";

// Service-role writes bypass RLS; signature verification is the only gate.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const secret = process.env.CHARIOW_PULSE_SECRET;

  let payload: Record<string, unknown>;
  try {
    payload = verifyPulse(Object.fromEntries(req.headers), rawBody, secret ?? "");
  } catch (err) {
    console.error("[chariow-webhook] verification failed:", (err as Error).message);
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  const deliveryId = headerValue(req.headers, "x-pulse-delivery-id");
  const event = typeof payload.event === "string" ? payload.event : "";

  try {
    await applyPulse({ deliveryId, event, payload, rawBody });
  } catch (err) {
    console.error(`[chariow-webhook] handling ${event} failed:`, err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }

  return new Response("OK", { status: 200 });
}

function headerValue(headers: Headers, name: string): string | undefined {
  const v = headers.get(name);
  return v ?? undefined;
}

type PulseArgs = {
  deliveryId: string | undefined;
  event: string;
  payload: Record<string, unknown>;
  rawBody: string;
};

export async function applyPulse({ deliveryId, event, payload }: PulseArgs): Promise<void> {
  const admin = createAdminClient();

  if (deliveryId) {
    const { data: existing } = await admin
      .from("chariow_pulse_deliveries")
      .select("delivery_id")
      .eq("delivery_id", deliveryId)
      .maybeSingle();
    if (existing) return;
  }

  if (event === "successful.sale") {
    const sale = (payload.sale ?? {}) as Record<string, unknown>;
    const meta = (sale.custom_metadata ?? {}) as Record<string, unknown>;
    const profileId = typeof meta.profile_id === "string" ? meta.profile_id : undefined;
    if (!profileId) {
      console.warn("[chariow-webhook] successful.sale without custom_metadata.profile_id");
      return;
    }
    const saleId = typeof sale.id === "string" ? sale.id : undefined;
    const { error: subError } = await admin.from("subscriptions").upsert(
      {
        profile_id: profileId,
        plan: "pro",
        status: "active",
        cancel_at_period_end: false,
        pending_interval: null,
        pending_effective_at: null,
      },
      { onConflict: "profile_id" },
    );
    if (subError) throw subError;
    if (deliveryId) {
      await admin.from("chariow_pulse_deliveries").insert({
        delivery_id: deliveryId,
        event,
        sale_id: saleId ?? null,
        profile_id: profileId,
      });
    }
  } else if (event === "failed.sale" || event === "abandoned.sale") {
    if (deliveryId) {
      await admin.from("chariow_pulse_deliveries").insert({ delivery_id: deliveryId, event });
    }
  } else {
    if (deliveryId) {
      await admin.from("chariow_pulse_deliveries").insert({ delivery_id: deliveryId, event });
    }
  }
}
