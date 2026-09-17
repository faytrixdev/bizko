import { NextRequest, NextResponse } from "next/server";
import { verifyPulse, resolveChariowInterval, chariowPeriodEnd } from "@/lib/chariow";
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

function saleProductId(sale: Record<string, unknown>): string | undefined {
  const raw = sale.product;
  const id = raw && typeof raw === "object" && "id" in raw ? (raw as { id?: unknown }).id : undefined;
  if (typeof id === "string") return id;
  return typeof sale.product_id === "string" ? sale.product_id : undefined;
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
    // The product that was actually purchased tells us the billing interval, and
    // therefore how long the (non-recurring) license lasts. Chariow has no
    // recurring billing: the local expiry is the only source of truth.
    const productId = saleProductId(sale);
    const created =
      typeof sale.created_at === "string"
        ? sale.created_at
        : typeof sale.completed_at === "string"
          ? sale.completed_at
          : typeof sale.paid_at === "string"
            ? sale.paid_at
            : undefined;
    const interval = resolveChariowInterval(productId);
    const currentPeriodEnd = created ? chariowPeriodEnd(created, interval) : null;
    const { error: subError } = await admin.from("subscriptions").upsert(
      {
        profile_id: profileId,
        plan: "pro",
        status: "active",
        provider: "chariow",
        chariow_sale_id: saleId ?? null,
        chariow_product_id: productId ?? null,
        current_period_end: currentPeriodEnd,
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
