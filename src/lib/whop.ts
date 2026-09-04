import { createHmac, timingSafeEqual } from "crypto";
import type { BillingInterval } from "./plans";

type Headers = Record<string, string | string[] | undefined>;

export interface WhopEvent {
  id: string;
  type: string;
  api_version?: string;
  timestamp?: string;
  data: Record<string, unknown>;
}

const REPLAY_TOLERANCE_SEC = 300;

function headerValue(headers: Headers, name: string): string | undefined {
  const v = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(v)) return v[0];
  return v;
}

/**
 * Verifies a Whop webhook per the Standard Webhooks spec:
 *   signature = base64( HMAC-SHA256( key=WHOP_WEBHOOK_SECRET, msg=`{id}.{timestamp}.{body}` ) )
 * sent in the `webhook-signature` header as `v1,<signature>`.
 * Rejects invalid signatures and replays older than 5 minutes.
 * Returns the parsed event.
 */
export function verifyWebhook(headers: Headers, rawBody: string, secret: string): WhopEvent {
  if (!secret) throw new Error("WHOP_WEBHOOK_SECRET is not configured");

  const id = headerValue(headers, "webhook-id");
  const timestamp = headerValue(headers, "webhook-timestamp");
  const signature = headerValue(headers, "webhook-signature");

  if (!id || !timestamp || !signature) {
    throw new Error("Missing webhook signature headers");
  }

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) throw new Error("Invalid webhook timestamp");
  const age = Math.abs(Date.now() / 1000 - ts);
  if (age > REPLAY_TOLERANCE_SEC) throw new Error("Webhook timestamp too old (replay?)");

  const [scheme, providedSig] = signature.split(",");
  if (scheme !== "v1" || !providedSig) throw new Error("Unsupported webhook signature version");

  const expected = createHmac("sha256", secret).update(`${id}.${timestamp}.${rawBody}`).digest();
  const provided = Buffer.from(providedSig, "base64");

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    throw new Error("Invalid webhook signature");
  }

  return JSON.parse(rawBody) as WhopEvent;
}

const BASE_URL = process.env.WHOP_BASE_URL ?? "https://api.whop.com/api/v1";

/**
 * Resolves the Whop plan id for the requested Pro billing interval.
 * `yearly` falls back to the (mandatory) monthly plan id when the yearly
 * plan is not configured, keeping checkout functional even if only
 * WHOP_PLAN_ID_PRO is set.
 */
export function resolveProPlanId(interval: BillingInterval): string | undefined {
  if (interval === "yearly" && process.env.WHOP_PLAN_ID_PRO_YEARLY) {
    return process.env.WHOP_PLAN_ID_PRO_YEARLY;
  }
  return process.env.WHOP_PLAN_ID_PRO;
}

export class WhopApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

/**
 * Creates a Whop checkout configuration for the Pro plan, tagging the link
 * with our profile_id so the payment/membership webhooks can be mapped back.
 * Returns the shareable checkout session id.
 *
 * `redirectUrl` (where Whop sends the buyer after checkout) falls back to
 * WHOP_CHECKOUT_REDIRECT_URL, then to /dashboard?success=pro.
 */
export async function createCheckoutConfig(
  profileId: string,
  interval: BillingInterval = "monthly",
  redirectUrl?: string
): Promise<{ sessionId: string; purchaseUrl: string }> {
  const apiKey = process.env.WHOP_API_KEY;
  const planId = resolveProPlanId(interval);
  if (!apiKey || !planId) throw new WhopApiError("Whop not configured", 500);

  let redirect = redirectUrl ?? process.env.WHOP_CHECKOUT_REDIRECT_URL ?? "/dashboard?success=pro";
  if (!/^https?:\/\//i.test(redirect)) {
    const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
    redirect = `${base}${redirect.startsWith("/") ? "" : "/"}${redirect}`;
  }

  const res = await fetch(`${BASE_URL}/checkout_configurations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      plan_id: planId,
      metadata: { profile_id: profileId },
      redirect_url: redirect,
    }),
  });

  if (!res.ok) {
    throw new WhopApiError(`Whop checkout creation failed (${res.status})`, res.status);
  }

  const json = (await res.json()) as { id: string; purchase_url?: string; url?: string };
  return { sessionId: json.id, purchaseUrl: json.purchase_url ?? json.url ?? "" };
}

export interface WhopMembership {
  id: string;
  plan_id?: string | null;
  status?: string;
  cancel_at_period_end?: boolean;
  current_period_end?: string | null;
  formatted_renewal_price?: string | null;
}

async function whopGet<T>(path: string): Promise<T> {
  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey) throw new WhopApiError("Whop not configured", 500);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new WhopApiError(`Whop GET ${path} failed (${res.status})`, res.status);
  return (await res.json()) as T;
}

export function getMembership(membershipId: string): Promise<WhopMembership> {
  return whopGet<WhopMembership>(`/memberships/${membershipId}`);
}

export type CancellationMode = "at_period_end" | "now";

async function whopPost<T>(path: string, body?: unknown): Promise<T> {
  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey) throw new WhopApiError("Whop not configured", 500);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new WhopApiError(`Whop POST ${path} failed (${res.status})`, res.status);
  return (await res.json()) as T;
}

export function cancelMembership(membershipId: string, mode: CancellationMode = "at_period_end"): Promise<WhopMembership> {
  return whopPost<WhopMembership>(`/memberships/${membershipId}/cancel`, { cancellation_mode: mode });
}

export function uncancelMembership(membershipId: string): Promise<WhopMembership> {
  return whopPost<WhopMembership>(`/memberships/${membershipId}/uncancel`);
}

export interface WhopPayment {
  id: string;
  total?: number;
  currency?: string;
  status?: string;
  substatus?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  card_last4?: string | null;
}

export async function listMembershipPayments(membershipId: string): Promise<WhopPayment[]> {
  const data = await whopGet<{ data?: WhopPayment[] }>(
    `/payments?query=${encodeURIComponent(membershipId)}&first=20`
  );
  return data.data ?? [];
}
