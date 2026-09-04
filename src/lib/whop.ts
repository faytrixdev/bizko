import { createHmac, timingSafeEqual } from "crypto";

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

export class WhopApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

/**
 * Creates a Whop checkout configuration for the Pro plan, tagging the link
 * with our profile_id so the payment/membership webhooks can be mapped back.
 * Returns the shareable checkout session id.
 */
export async function createCheckoutConfig(profileId: string): Promise<{ sessionId: string; purchaseUrl: string }> {
  const apiKey = process.env.WHOP_API_KEY;
  const planId = process.env.WHOP_PLAN_ID_PRO;
  if (!apiKey || !planId) throw new WhopApiError("Whop not configured", 500);

  const res = await fetch(`${BASE_URL}/checkout_configurations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      plan_id: planId,
      metadata: { profile_id: profileId },
    }),
  });

  if (!res.ok) {
    throw new WhopApiError(`Whop checkout creation failed (${res.status})`, res.status);
  }

  const json = (await res.json()) as { id: string; purchase_url?: string; url?: string };
  return { sessionId: json.id, purchaseUrl: json.purchase_url ?? json.url ?? "" };
}
