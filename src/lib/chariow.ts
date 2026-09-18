import { createHmac, timingSafeEqual } from "crypto";
import type { BillingInterval } from "./plans";

type Headers = Record<string, string | string[] | undefined>;

// Derives a national phone number (and its country code) from a user's
// E.164 number (e.g. "+22670000000") + their profiles.country ISO code (BF).
export const DIAL_CODES: Record<string, string> = {
  DZ: "213", AO: "244", BJ: "229", BW: "267", BF: "226", BI: "257",
  CM: "237", CV: "238", CF: "236", TD: "235", KM: "269", CG: "242",
  CD: "243", CI: "225", DJ: "253", EG: "20", GQ: "240", ER: "291",
  SZ: "268", ET: "251", GA: "241", GM: "220", GH: "233", GN: "224",
  GW: "245", KE: "254", LS: "266", LR: "231", LY: "218", MG: "261",
  MW: "265", ML: "223", MR: "222", MU: "230", MA: "212", MZ: "258",
  NA: "264", NE: "227", NG: "234", RW: "250", ST: "239", SN: "221",
  SC: "248", SL: "232", SO: "252", ZA: "27", SS: "211", SD: "249",
  TZ: "255", TG: "228", TN: "216", UG: "256", EH: "212", ZM: "260",
  ZW: "263",
};

export function localizePhone(
  phoneE164: string,
  countryCode: string,
): { number: string; countryCode: string } {
  const digits = phoneE164.replace(/\D/g, "");
  const dial = DIAL_CODES[countryCode.toUpperCase()];
  if (dial && digits.startsWith(dial)) {
    const national = digits.slice(dial.length);
    if (national.length >= 6) return { number: national, countryCode: countryCode.toUpperCase() };
  }
  return { number: digits || phoneE164, countryCode: countryCode.toUpperCase() };
}

const BASE_URL = process.env.CHARIOW_BASE_URL ?? "https://api.chariow.com/v1";

/**
 * Resolves the Chariow product id for the requested Pro billing interval.
 * `yearly` falls back to the (mandatory) monthly product id when the yearly
 * product is not configured.
 */
export function resolveChariowProductId(interval: BillingInterval): string | undefined {
  if (interval === "yearly" && process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY) {
    return process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY;
  }
  return process.env.CHARIOW_PRODUCT_ID_PRO;
}

/**
 * True when a distinct yearly Chariow product id is configured. Without it,
 * "yearly" silently falls back to the monthly product, so the UI can use this
 * to avoid offering a yearly checkout that would actually bill monthly.
 */
export function isYearlyChariowProductConfigured(): boolean {
  return Boolean(process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY);
}

/** License duration in days per billing interval. Chariow has no recurring
 *  billing; a paid sale grants a fixed-length license that must be renewed
 *  manually. */
export const CHARIOW_LICENSE_DAYS: Record<BillingInterval, number> = {
  monthly: 30,
  yearly: 365,
};

/**
 * Resolves the billing interval from the Chariow product that was actually
 * purchased. Matched against the configured yearly product id; anything else
 * (including the mandatory monthly product) resolves to monthly.
 */
export function resolveChariowInterval(productId?: string | null): BillingInterval {
  if (productId && productId === process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY) return "yearly";
  return "monthly";
}

/** Chariow license expiry: `created` + the license duration for the interval. */
export function chariowPeriodEnd(created: string | Date, interval: BillingInterval): string {
  const base = typeof created === "string" ? new Date(created) : created;
  const ms = CHARIOW_LICENSE_DAYS[interval] * 86_400_000;
  return new Date(base.getTime() + ms).toISOString();
}

export class ChariowApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export interface ChariowCheckoutCustomer {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  phone_country_code: string;
}

/**
 * Creates a Chariow checkout session, tagging the sale with our profile_id via
 * custom_metadata so the Pulse webhook can map it back. Returns the sale id and
 * the hosted checkout URL the buyer should be redirected to.
 */
export async function createCheckout(opts: {
  profileId: string;
  interval?: BillingInterval;
  redirectUrl?: string;
  customer: ChariowCheckoutCustomer;
}): Promise<{ saleId: string; checkoutUrl: string | null }> {
  const apiKey = process.env.CHARIOW_API_KEY;
  const productId = resolveChariowProductId(opts.interval ?? "monthly");
  if (!apiKey || !productId) throw new ChariowApiError("Chariow not configured", 500);

  let redirect = opts.redirectUrl ?? process.env.CHARIOW_CHECKOUT_REDIRECT_URL ?? "/dashboard?success=pro";
  if (!/^https?:\/\//i.test(redirect)) {
    const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
    redirect = `${base}${redirect.startsWith("/") ? "" : "/"}${redirect}`;
  }

  const res = await fetch(`${BASE_URL}/checkout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: productId,
      email: opts.customer.email,
      first_name: opts.customer.first_name.slice(0, 50),
      last_name: opts.customer.last_name.slice(0, 50),
      phone: {
        number: opts.customer.phone_number,
        country_code: opts.customer.phone_country_code,
      },
      redirect_url: redirect,
      custom_metadata: { profile_id: opts.profileId },
    }),
  });

  if (!res.ok) {
    throw new ChariowApiError(`Chariow checkout creation failed (${res.status})`, res.status);
  }
  const json = (await res.json()) as {
    data?: {
      step?: string;
      purchase?: { id?: string } | null;
      payment?: { checkout_url?: string | null } | null;
    };
  };
  const data = json.data ?? {};
  if (data.step !== "payment" || !data.payment?.checkout_url) {
    throw new ChariowApiError(`Chariow checkout returned step=${String(data.step)}`, 422);
  }
  return { saleId: data.purchase?.id ?? "", checkoutUrl: data.payment.checkout_url };
}

function headerValue(headers: Headers, name: string): string | undefined {
  const v = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(v)) return v[0];
  return v;
}

/**
 * Verifies a Chariow Pulse signature: `x-chariow-signature: sha256=<hex>` is the
 * HMAC-SHA256 of the RAW body bytes keyed with the Pulse signing secret.
 * Throws on mismatch. Returns the parsed payload. Callers must pass the raw
 * body string (never a re-serialised object).
 */
export function verifyPulse(headers: Headers, rawBody: string, secret: string): Record<string, unknown> {
  if (!secret) throw new Error("CHARIOW_PULSE_SECRET is not configured");
  const received = headerValue(headers, "x-chariow-signature") ?? "";
  const expected = "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid Chariow pulse signature");
  }
  return JSON.parse(rawBody) as Record<string, unknown>;
}

export interface ChariowSale {
  id?: string;
  total?: number;
  amount?: number;
  currency?: string;
  status?: string;
  product?: { id?: string } | null;
  product_id?: string;
}

/** Fetches a Chariow sale by id (fallback when the webhook payload lacks the amount). */
export async function getSale(saleId: string): Promise<ChariowSale | null> {
  const apiKey = process.env.CHARIOW_API_KEY;
  if (!apiKey) throw new ChariowApiError("Chariow not configured", 500);
  const res = await fetch(`${BASE_URL}/sales/${saleId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new ChariowApiError(`Chariow GET /sales failed (${res.status})`, res.status);
  }
  const json = (await res.json()) as { data?: ChariowSale };
  return json.data ?? null;
}

/** Best-effort amount from a Chariow sale payload; returns null when unknown. */
export function extractSaleAmount(sale: Record<string, unknown>): { amount: number; currency: string } | null {
  const candidates = [sale.total, sale.amount, (sale.purchase as Record<string, unknown> | undefined)?.total];
  const amount = candidates.find((c): c is number => typeof c === "number");
  const currency = typeof sale.currency === "string" ? sale.currency : "XOF";
  return amount === undefined ? null : { amount, currency: currency.toUpperCase() };
}
