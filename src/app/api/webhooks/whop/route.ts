import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook, WhopEvent } from "@/lib/whop";
import { createAdminClient } from "@/lib/supabase/admin";

// Service-role writes bypass RLS; the signature check above is the only gate.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const secret = process.env.WHOP_WEBHOOK_SECRET;

  let event: WhopEvent;
  try {
    event = verifyWebhook(Object.fromEntries(req.headers), rawBody, secret ?? "");
  } catch (err) {
    console.error("[whop-webhook] verification failed:", (err as Error).message);
    return NextResponse.json({ error: "invalid_signature", detail: (err as Error).message }, { status: 401 });
  }

  try {
    await applyEvent(event);
  } catch (err) {
    // Never leak internals; respond fast so Whop's retry/backoff kicks in.
    console.error(`[whop-webhook] handling ${event.type} failed:`, err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }

  return new Response("OK", { status: 200 });
}

type SubRow = {
  profile_id: string;
  plan: string;
  status: string;
  whop_user_id?: string | null;
  whop_membership_id?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null;
};

const supabase = () => createAdminClient();

// Resolve which of our profiles an event belongs to.
// Priority: checkout metadata > membership id > whop user id.
type EventData = Record<string, unknown>;
type Meta = { profile_id?: unknown; [k: string]: unknown };

async function resolveProfileId(event: WhopEvent): Promise<string | null> {
  const data = (event.data ?? {}) as EventData;

  const meta = (data.metadata ?? {}) as Meta;
  if (typeof meta.profile_id === "string") return meta.profile_id;

  const membershipId = typeof data.membership_id === "string" ? data.membership_id : undefined;
  const memberId = (data.member as { id?: unknown } | undefined)?.id;
  const userId = typeof data.user_id === "string" ? data.user_id : undefined;
  const ids = [membershipId, userId, typeof memberId === "string" ? memberId : undefined].filter(
    (x): x is string => Boolean(x)
  );

  if (!ids.length) return null;

  // Try to match a stored subscription row by membership or user id.
  const conditions = ids.flatMap((i) => [`whop_membership_id.eq.${i}`, `whop_user_id.eq.${i}`]);
  const { data: rows } = await supabase()
    .from("subscriptions")
    .select("profile_id, whop_membership_id, whop_user_id")
    .or(conditions.join(","));

  const matched = rows?.find((r) =>
    ids.includes(r.whop_membership_id ?? "") || ids.includes(r.whop_user_id ?? "")
  );
  return matched?.profile_id ?? null;
}

function currentPeriodEnd(data: EventData): string | null {
  const v = data.current_period_end ?? data.expires_at ?? data.next_billing_at;
  if (typeof v !== "string" && typeof v !== "number") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

async function upsertActive(profileId: string, event: WhopEvent): Promise<void> {
  const data = (event.data ?? {}) as EventData;
  const member = (data.member as { id?: unknown } | undefined);
  const userId = typeof data.user_id === "string"
    ? data.user_id
    : typeof member?.id === "string"
      ? member.id
      : undefined;
  const row: SubRow = {
    profile_id: profileId,
    plan: "pro",
    status: "active",
    whop_membership_id: typeof data.membership_id === "string" ? data.membership_id : undefined,
    whop_user_id: userId,
    current_period_end: currentPeriodEnd(data),
  };
  await supabase().from("subscriptions").upsert(row, { onConflict: "profile_id" });
}

async function applyEvent(event: WhopEvent): Promise<void> {
  switch (event.type) {
    case "payment.succeeded": {
      const profileId = await resolveProfileId(event);
      if (!profileId) return; // no checkout metadata + no prior row; nothing to map
      await upsertActive(profileId, event);
      break;
    }
    case "membership.activated": {
      const profileId = await resolveProfileId(event);
      if (!profileId) return;
      await upsertActive(profileId, event);
      break;
    }
    case "membership.deactivated": {
      const profileId = await resolveProfileId(event);
      if (!profileId) return;
      await supabase()
        .from("subscriptions")
        .update({ status: "canceled", cancel_at_period_end: false })
        .eq("profile_id", profileId);
      break;
    }
    case "membership.cancel_at_period_end_changed": {
      const profileId = await resolveProfileId(event);
      if (!profileId) return;
      const cancel = (event.data as EventData)?.cancel_at_period_end === true;
      await supabase()
        .from("subscriptions")
        .update({ cancel_at_period_end: cancel })
        .eq("profile_id", profileId);
      break;
    }
    default:
      // Events we don't act on are still fine; acked so Whop stops retrying.
      break;
  }
}

export { applyEvent, resolveProfileId };