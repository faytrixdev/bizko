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

/**
 * Finds a membership for a checkout configuration id (the `ch_...` session id
 * our app created via `createCheckoutConfig`), by paging through the memberships
 * of our Pro plans until the `checkout_configuration_id` matches.
 *
 * Requires `member:basic:read` and `WHOP_COMPANY_ID` (Whop requires a
 * company id when authenticating with an API key). Returns null when no
 * membership matches. Lets the subscription page resolve a user's membership
 * without depending on the webhook.
 */
export interface WhopMembershipSummary {
  id: string;
  plan_id?: string | null;
  status?: string;
  cancel_at_period_end?: boolean;
  current_period_end?: string | null;
  formatted_renewal_price?: string | null;
}

interface WhopMembershipListEntry {
  id?: string;
  checkout_configuration_id?: string | null;
  status?: string;
  cancel_at_period_end?: boolean;
  renewal_period_end?: string | null;
  formatted_renewal_price?: string | null;
  plan?: { id?: string | null } | null;
}

export async function findMembershipByCheckout(
  checkoutConfigurationId: string
): Promise<WhopMembershipSummary | null> {
  const apiKey = process.env.WHOP_API_KEY;
  const companyId = process.env.WHOP_COMPANY_ID;
  const planIds = [process.env.WHOP_PLAN_ID_PRO, process.env.WHOP_PLAN_ID_PRO_YEARLY].filter(
    (x): x is string => Boolean(x)
  );
  if (!apiKey) throw new WhopApiError("Whop not configured", 500);
  if (!companyId || !planIds.length) throw new WhopApiError("Whop not configured", 500);

  const params = new URLSearchParams({
    company_id: companyId,
    first: "100",
  });
  planIds.forEach((p) => params.append("plan_ids[]", p));

  let after: string | null = null;
  for (let page = 0; page < 10; page++) {
    const query = new URLSearchParams(params);
    if (after) query.set("after", after);
    const data = await whopGet<{
      data?: WhopMembershipListEntry[];
      page_info?: { has_next_page?: boolean; end_cursor?: string | null };
    }>(`/memberships?${query.toString()}`);

    const match = (data.data ?? []).find(
      (m) => m.checkout_configuration_id === checkoutConfigurationId
    );
    if (match) {
      return {
        id: match.id ?? "",
        plan_id: match.plan?.id ?? null,
        status: match.status,
        cancel_at_period_end: match.cancel_at_period_end,
        current_period_end: match.renewal_period_end ?? null,
        formatted_renewal_price: match.formatted_renewal_price ?? null,
      };
    }
    if (!data.page_info?.has_next_page || !data.page_info.end_cursor) return null;
    after = data.page_info.end_cursor;
  }
  return null;
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

export function derivePlanInfo(planId?: string | null): { period: "monthly" | "yearly" } {
  if (planId && process.env.WHOP_PLAN_ID_PRO_YEARLY && planId === process.env.WHOP_PLAN_ID_PRO_YEARLY) {
    return { period: "yearly" };
  }
  return { period: "monthly" };
}

export type SubscriptionDisplay = "active" | "canceling" | "past_due" | "canceled";

export function subscriptionDisplay(m: {
  status?: string;
  cancel_at_period_end?: boolean;
}): SubscriptionDisplay {
  if (m.status === "past_due") return "past_due";
  if (m.status === "canceled" || m.status === "expired") return "canceled";
  if (m.status === "active" && m.cancel_at_period_end) return "canceling";
  return "active";
}
