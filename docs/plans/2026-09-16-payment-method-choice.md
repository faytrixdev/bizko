# Choix du moyen de paiement (Whop ou Chariow) — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** When a user clicks "Passer à Pro" on `/pricing`, show a payment-method popup (Carte bancaire → Whop, Mobile Money → Chariow) before redirecting to the hosted checkout. Whop behaviour is preserved; Chariow is added as the Mobile Money option. The Pro plan has **two billing intervals — monthly and yearly —** so there are two Whop plans and two Chariow products, and the popup must carry the selected interval to whichever provider is chosen.

**Architecture:**
- Keep the current server-action flow (`startSubscription` in `src/app/dashboard/actions.ts`). Add a `provider` hidden field (`whop` | `chariow`) read by the action.
- Add a small Chariow client (`src/lib/chariow.ts`) mirroring `src/lib/whop.ts` patterns: `createCheckout()` calls `POST /v1/checkout` and returns the hosted `checkout_url` + `saleId`; `verifyPulse()` verifies the HMAC-SHA256 webhook signature over the raw body.
- Add `provider` to `pro_checkouts` so Whop self-healing (`findMembershipByCheckout`) ignores Chariow rows.
- The pricing page click on either interval button ("Mensuel" or "Annuel") opens a modal with two choices; each choice submits the existing `startSubscription` form with the matching hidden interval + provider.
- A signed webhook `/api/webhooks/chariow` handles `successful.sale`, resolves the profile via `sale.custom_metadata.profile_id`, and upserts `subscriptions` (plan `pro`, status `active`), deduped on `x-pulse-delivery-id`.

**Tech Stack:** Next.js 16 (App Router, server actions), Supabase (service-role admin client, `subscriptions` + `pro_checkouts`), Chariow Public API (`https://api.chariow.com/v1`), Node `crypto` HMAC. Tests: Vitest (existing `src/lib/__tests__/*.test.ts`).

**Environment variables to add (documented in `.env.local.example`):**
```
# Chariow (Bizko Pro — Mobile Money)
# Live: https://api.chariow.com/v1 | Local sandbox base if provided by Chariow
CHARIOW_BASE_URL=
CHARIOW_API_KEY=
# Pulse signing secret (whsec_...) from Automations → Pulses → Overview
CHARIOW_PULSE_SECRET=
# Monthly Pro product id (mandatory). Yearly is optional; falls back to monthly if unset.
CHARIOW_PRODUCT_ID_PRO=
CHARIOW_PRODUCT_ID_PRO_YEARLY=
# Where Chariow redirects after payment. Optional; defaults to /dashboard?success=pro.
CHARIOW_CHECKOUT_REDIRECT_URL=
```

---

## Task 1: Database migration — provider column + Chariow pulse dedup table

**Files:**
- Create: `supabase/migrations/20260916000000_chariow_checkouts.sql`

**Step 1: Write the migration**

```sql
-- Chariow (Mobile Money) checkouts for Bizko Pro.
-- pro_checkouts now records which provider created the checkout so the Whop
-- self-healing lookup (findMembershipByCheckout) only ever sees Whop rows.

alter table public.pro_checkouts
  add column provider text not null default 'whop'
  check (provider in ('whop','chariow'));

-- Chariow Pulse deliveries, for webhook deduplication on x-pulse-delivery-id.
create table if not exists public.chariow_pulse_deliveries (
  delivery_id text primary key,
  event text not null,
  sale_id text,
  profile_id uuid references public.profiles(id) on delete set null,
  processed_at timestamptz not null default now()
);

alter table public.chariow_pulse_deliveries enable row level security;

-- No user-facing rows: only the service role (bypasses RLS) writes/reads.
```

**Step 2: Verify it parses**

Run: `npx supabase db lint ` (or `supabase db push --dry-run` if configured) — expected: no errors.

**Step 3: Commit**

```bash
git add supabase/migrations/20260916000000_chariow_checkouts.sql
git commit -m "feat(payments): track checkout provider + Chariow pulse dedup"
```

---

## Task 2: Chariow client library

**Files:**
- Create: `src/lib/chariow.ts`
- Test: `src/lib/__tests__/chariow.test.ts`

Mirrors the Whop client patterns (`WhopApiError`, `resolveProPlanId`, fetch helpers).

**Step 1: Write the test first**

`src/lib/__tests__/chariow.test.ts`:

```ts
import { afterEach, describe, it, expect, vi } from "vitest";
import {
  createCheckout,
  verifyPulse,
  resolveChariowProductId,
  isYearlyChariowProductConfigured,
  localizePhone,
} from "../chariow";

const ENV_BACKUP = { ...process.env };

afterEach(() => {
  process.env.CHARIOW_API_KEY = ENV_BACKUP.CHARIOW_API_KEY;
  process.env.CHARIOW_PRODUCT_ID_PRO = ENV_BACKUP.CHARIOW_PRODUCT_ID_PRO;
  process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY = ENV_BACKUP.CHARIOW_PRODUCT_ID_PRO_YEARLY;
  process.env.CHARIOW_CHECKOUT_REDIRECT_URL = ENV_BACKUP.CHARIOW_CHECKOUT_REDIRECT_URL;
  vi.restoreAllMocks();
});

describe("resolveChariowProductId", () => {
  it("returns the monthly product id by default", () => {
    process.env.CHARIOW_PRODUCT_ID_PRO = "prd_monthly";
    delete process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY;
    expect(resolveChariowProductId("monthly")).toBe("prd_monthly");
  });

  it("returns the yearly product id when requested and configured", () => {
    process.env.CHARIOW_PRODUCT_ID_PRO = "prd_monthly";
    process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY = "prd_yearly";
    expect(resolveChariowProductId("yearly")).toBe("prd_yearly");
  });

  it("falls back to the monthly product id when yearly is not configured", () => {
    process.env.CHARIOW_PRODUCT_ID_PRO = "prd_monthly";
    delete process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY;
    expect(resolveChariowProductId("yearly")).toBe("prd_monthly");
  });

  it("returns undefined when no product id is configured", () => {
    delete process.env.CHARIOW_PRODUCT_ID_PRO;
    delete process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY;
    expect(resolveChariowProductId("monthly")).toBeUndefined();
  });
});

describe("isYearlyChariowProductConfigured", () => {
  it("true when the yearly product id is set, false otherwise", () => {
    process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY = "prd_yearly";
    expect(isYearlyChariowProductConfigured()).toBe(true);
    delete process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY;
    expect(isYearlyChariowProductConfigured()).toBe(false);
  });
});

describe("localizePhone", () => {
  it("strips the national dial code to produce a national number", () => {
    expect(localizePhone("+22670000000", "BF")).toEqual({ number: "70000000", countryCode: "BF" });
    expect(localizePhone("+2250700000000", "CI")).toEqual({ number: "0700000000", countryCode: "CI" });
  });

  it("falls back to the full digits when the dial code is unknown", () => {
    expect(localizePhone("+155512345678", "US")).toEqual({ number: "155512345678", countryCode: "US" });
  });
});

describe("createCheckout", () => {
  type FetchLike = (url: RequestInfo | URL, init: RequestInit) => Promise<Response>;
  function mockCheckoutResponse() {
    const mock = vi.fn<FetchLike>(async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            step: "payment",
            purchase: { id: "sal_abc123", status: "awaiting_payment" },
            payment: { checkout_url: "https://payment.chariow.com/checkout?token=tk_1", transaction_id: "txn_1" },
          },
        }),
      }) as unknown as Response
    );
    globalThis.fetch = mock as unknown as typeof fetch;
    return mock;
  }

  function requestInitOf(mock: ReturnType<typeof mockCheckoutResponse>): RequestInit {
    return mock.mock.calls[0][1];
  }
  function requestBodyOf(mock: ReturnType<typeof mockCheckoutResponse>): string {
    return String(requestInitOf(mock).body);
  }

  const CUSTOMER = {
    email: "a@b.com",
    first_name: "Amadou",
    last_name: "Diallo",
    phone_number: "70000000",
    phone_country_code: "BF",
  };

  it("POSTs to /checkout with the ordered body and returns the hosted URL + sale id", async () => {
    const fetchMock = mockCheckoutResponse();
    process.env.CHARIOW_API_KEY = "sk_test";
    process.env.CHARIOW_PRODUCT_ID_PRO = "prd_monthly";
    process.env.NEXT_PUBLIC_SITE_URL = "https://bizko.pro";
    delete process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY;
    delete process.env.CHARIOW_CHECKOUT_REDIRECT_URL;

    const res = await createCheckout({
      profileId: "profile_1",
      interval: "monthly",
      customer: CUSTOMER,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.chariow.com/v1/checkout",
      expect.objectContaining({ method: "POST" })
    );
    expect(requestInitOf(fetchMock).headers).toMatchObject({ Authorization: "Bearer sk_test" });
    const body = JSON.parse(requestBodyOf(fetchMock));
    expect(body.product_id).toBe("prd_monthly");
    expect(body.email).toBe("a@b.com");
    expect(body.first_name).toBe("Amadou");
    expect(body.last_name).toBe("Diallo");
    expect(body.phone).toEqual({ number: "70000000", country_code: "BF" });
    expect(body.custom_metadata).toEqual({ profile_id: "profile_1" });
    expect(body.redirect_url).toBe("https://bizko.pro/dashboard?success=pro");
    expect(res).toEqual({ saleId: "sal_abc123", checkoutUrl: "https://payment.chariow.com/checkout?token=tk_1" });
  });

  it("uses the yearly product id and the env redirect when set", async () => {
    const fetchMock = mockCheckoutResponse();
    process.env.CHARIOW_API_KEY = "sk_test";
    process.env.CHARIOW_PRODUCT_ID_PRO = "prd_monthly";
    process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY = "prd_yearly";
    process.env.CHARIOW_CHECKOUT_REDIRECT_URL = "https://bizko.pro/merci";

    await createCheckout({ profileId: "p1", interval: "yearly", customer: CUSTOMER });

    const body = JSON.parse(requestBodyOf(fetchMock));
    expect(body.product_id).toBe("prd_yearly");
    expect(body.redirect_url).toBe("https://bizko.pro/merci");
  });

  it("throws for step already_purchased", async () => {
    const mock = vi.fn<FetchLike>(async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({
          data: { step: "already_purchased", message: "already yours", purchase: null, payment: null },
        }),
      }) as unknown as Response
    );
    globalThis.fetch = mock as unknown as typeof fetch;
    process.env.CHARIOW_API_KEY = "sk_test";
    process.env.CHARIOW_PRODUCT_ID_PRO = "prd_monthly";

    await expect(createCheckout({ profileId: "p1", interval: "monthly", customer: CUSTOMER })).rejects.toThrow();
  });

  it("throws when Chariow is not configured", async () => {
    process.env.CHARIOW_API_KEY = "";
    process.env.CHARIOW_PRODUCT_ID_PRO = "";
    await expect(createCheckout({ profileId: "p1", interval: "monthly", customer: CUSTOMER })).rejects.toThrow();
  });
});

describe("verifyPulse", () => {
  const SECRET = "whsec_0123456789abcdef0123456789abcdef";
  function sign(body: string, secret = SECRET): string {
    const { createHmac } = require("crypto") as typeof import("crypto");
    return "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
  }
  function headers(body: string, opts?: { secret?: string; signature?: string }): Record<string, string> {
    return { "x-chariow-signature": opts?.signature ?? sign(body, opts?.secret) };
  }

  it("returns the parsed payload for a valid signature", () => {
    const body = JSON.stringify({ event: "successful.sale" });
    expect(verifyPulse(headers(body), body, SECRET)).toEqual({ event: "successful.sale" });
  });

  it("throws on a wrong secret or missing header", () => {
    const body = JSON.stringify({ event: "successful.sale" });
    expect(() => verifyPulse(headers(body, { secret: "whsec_wrong" }), body, SECRET)).toThrow();
    expect(() => verifyPulse({}, body, SECRET)).toThrow();
  });
});
```

**Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/__tests__/chariow.test.ts`
Expected: FAIL — module `../chariow` cannot be resolved.

**Step 3: Implement `src/lib/chariow.ts`**

```ts
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

/** True when a distinct yearly Chariow product id is configured. */
export function isYearlyChariowProductConfigured(): boolean {
  return Boolean(process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY);
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
      first_name: opts.customer.first_name?.slice(0, 50),
      last_name: opts.customer.last_name?.slice(0, 50),
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
```

**Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/__tests__/chariow.test.ts`
Expected: PASS (10 tests).

**Step 5: Commit**

```bash
git add src/lib/chariow.ts src/lib/__tests__/chariow.test.ts
git commit -m "feat(payments): add Chariow checkout client + pulse verifier"
```

---

## Task 3: Hook Chariow into the `startSubscription` server action

**Files:**
- Modify: `src/app/dashboard/actions.ts:237-270` (startSubscription)
- Modify: `.env.local.example`

**Step 1: Add imports + a redirect-URL helper + a name splitter**

Edit `src/app/dashboard/actions.ts`:

- Import `createCheckout, localizePhone, isYearlyChariowProductConfigured` from `@/lib/chariow`.
- Import `isYearlyProPlanConfigured` already imports Whop's; keep both.
- Add a private helper near `dashboardError`:

```ts
// Post-checkout return path for a Pro upgrade, called by both providers.
function upgradeRedirectUrl(next: string | undefined, tpl: string | undefined): string | undefined {
  if (next === "/onboarding") {
    return tpl ? `/onboarding?tpl=${encodeURIComponent(tpl)}` : "/onboarding";
  }
  return undefined;
}

// Best-effort split of "Nom complet" into first/last name for Chariow.
function splitFullName(full: string): { first_name: string; last_name: string } {
  const trimmed = full.trim();
  const idx = trimmed.indexOf(" ");
  if (idx === -1) return { first_name: trimmed, last_name: trimmed };
  return { first_name: trimmed.slice(0, idx), last_name: trimmed.slice(idx + 1).trim() || trimmed };
}
```

**Step 2: Refactor `startSubscription`**

Replace the body of `startSubscription` (lines 237-270) with:

```ts
export async function startSubscription(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: isPro } = await supabase.rpc("is_pro", { p_profile_id: user.id });
  if (isPro) redirect("/dashboard?success=already_pro");

  const interval = (formData.get("interval") as string) ?? "monthly";
  if (!isBillingInterval(interval)) redirect("/dashboard?error=checkout_failed");

  const provider = (formData.get("provider") as string) ?? "whop";
  if (provider !== "whop" && provider !== "chariow") redirect("/dashboard?error=checkout_failed");

  // Optional post-payment return. Only allow known relative paths to avoid
  // turning the checkout redirect into an open redirect.
  const next = (formData.get("next") as string) ?? "";
  const tpl = (formData.get("tpl") as string) ?? "";
  const redirectUrl = upgradeRedirectUrl(next || undefined, tpl || undefined);

  let purchaseUrl: string;
  if (provider === "chariow") {
    try {
      purchaseUrl = await startChariowCheckout(supabase, user.id, user.email, interval, redirectUrl);
    } catch (err) {
      console.error("[startSubscription] Chariow checkout failed:", err);
      redirect("/dashboard?error=checkout_failed");
    }
  } else {
    try {
      const { sessionId, purchaseUrl: url } = await createCheckoutConfig(user.id, interval, redirectUrl);
      purchaseUrl = url;
      await supabase.from("pro_checkouts").insert({
        profile_id: user.id,
        checkout_configuration_id: sessionId,
        provider: "whop",
      });
    } catch (err) {
      console.error("[startSubscription] Whop checkout failed:", err);
      redirect("/dashboard?error=checkout_failed");
    }
  }
  redirect(purchaseUrl);
}

async function startChariowCheckout(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profileId: string,
  email: string | undefined,
  interval: BillingInterval,
  redirectUrl: string | undefined,
): Promise<string> {
  if (!email) throw new ChariowApiError("User has no email", 400);

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, phone_e164, country")
    .eq("id", profileId)
    .maybeSingle();
  const p = profile && !Array.isArray(profile) ? profile : null;
  if (!p?.display_name || !p?.phone_e164) throw new ChariowApiError("Incomplete profile", 400);

  const { first_name, last_name } = splitFullName(p.display_name);
  const phone = localizePhone(p.phone_e164, p.country ?? "");

  const { saleId, checkoutUrl } = await createCheckout({
    profileId,
    interval,
    redirectUrl,
    customer: {
      email,
      first_name,
      last_name,
      phone_number: phone.number,
      phone_country_code: phone.countryCode,
    },
  });
  if (checkoutUrl) {
    await supabase.from("pro_checkouts").insert({
      profile_id: profileId,
      checkout_configuration_id: saleId,
      provider: "chariow",
    });
  }
  return checkoutUrl ?? "";
}
```

Notes:
- Whop path is byte-for-byte the previous behaviour except the explicit `provider: "whop"` in the insert (default anyway).
- `user.email` is read-only from the auth session; no new DB query is needed.
- Add `provider` usage only where the table advertises it (no schema change needed for this step — that's Task 1).

**Step 3: Document env vars**

Append to `.env.local.example`:

```
## Chariow (Bizko Pro — Mobile Money)
# Live: https://api.chariow.com/v1 (override only if Chariow provides a sandbox base)
CHARIOW_BASE_URL=
CHARIOW_API_KEY=
# Pulse signing secret (whsec_...) from Automations → Pulses → Overview tab.
CHARIOW_PULSE_SECRET=
# Monthly Pro product id (mandatory). Yearly is optional; falls back to monthly if unset.
CHARIOW_PRODUCT_ID_PRO=
CHARIOW_PRODUCT_ID_PRO_YEARLY=
# Where Chariow redirects the buyer after payment. Optional; defaults to /dashboard?success=pro.
CHARIOW_CHECKOUT_REDIRECT_URL=
```

**Step 4: Lint / typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

**Step 5: Commit**

```bash
git add src/app/dashboard/actions.ts .env.local.example
git commit -m "feat(payments): route Chariow checkouts from the subscription action"
```

---

## Task 4: Webhook — Chariow Pulse `successful.sale`

**Files:**
- Create: `src/app/api/webhooks/chariow/route.ts`

**Step 1: Write the route**

```ts
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
    // Respond 500 so Chariow retries with backoff. Never leak internals.
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

export async function applyPulse({ deliveryId, event, payload, rawBody }: PulseArgs): Promise<void> {
  const admin = createAdminClient();

  if (deliveryId) {
    // Deduplicate retries/replays. A test pulse carries no delivery id.
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
    await admin.from("subscriptions").upsert(
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
    // Record the delivery AFTER processing so a crash mid-upsert retries.
    if (deliveryId) {
      await admin.from("chariow_pulse_deliveries").insert({
        delivery_id: deliveryId,
        event,
        sale_id: saleId ?? null,
        profile_id: profileId,
      });
    }
  } else if (event === "failed.sale" || event === "abandoned.sale") {
    // Nothing to deactivate today; ack so Chariow stops retrying.
    if (deliveryId) {
      await admin.from("chariow_pulse_deliveries").insert({ delivery_id: deliveryId, event });
    }
  } else {
    // Unknown/irrelevant events are still acked.
    if (deliveryId) {
      await admin.from("chariow_pulse_deliveries").insert({ delivery_id: deliveryId, event });
    }
  }
}
```

**Step 2: Lint / typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

**Step 3: Commit**

```bash
git add src/app/api/webhooks/chariow/route.ts
git commit -m "feat(payments): process Chariow successful.sale pulses"
```

---

## Task 5: Payment-method modal component

**Files:**
- Create: `src/components/payment/PaymentMethodModal.tsx`

**Step 1: Write the component**

Client component using the existing fixed-overlay modal pattern (see `src/components/SwitchReminder.tsx`). The two options are real `<form action={startSubscription}>` elements so the server action flow (and CSRF/redirect handling) stays identical to today.

```tsx
"use client";

import { startSubscription } from "@/app/dashboard/actions";
import { useI18n } from "@/lib/i18n/provider";
import type { BillingInterval } from "@/lib/plans";

interface PaymentMethodModalProps {
  open: boolean;
  interval: BillingInterval;
  next?: string;
  tpl?: string;
  onClose: () => void;
}

export function PaymentMethodModal({ open, interval, next, tpl, onClose }: PaymentMethodModalProps) {
  const { t } = useI18n();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t("pricing.paymentTitle")}</h2>
            <p className="mt-1 text-sm text-gray-500">{t("pricing.paymentSubtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.cancel")}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {/* Carte bancaire → Whop (existing flow) */}
          <form action={startSubscription}>
            <input type="hidden" name="provider" value="whop" />
            <input type="hidden" name="interval" value={interval} />
            {next && <input type="hidden" name="next" value={next} />}
            {tpl && <input type="hidden" name="tpl" value={tpl} />}
            <button
              type="submit"
              className="w-full flex items-center gap-4 rounded-xl border border-gray-200 p-4 text-left hover:border-violet-300 hover:bg-violet-50/50 transition-colors"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-gray-900">{t("pricing.payByCard")}</span>
                <span className="block mt-0.5 text-xs text-gray-500 leading-5">{t("pricing.payByCardDesc")}</span>
              </span>
              <span className="text-gray-300">›</span>
            </button>
          </form>

          {/* Mobile Money → Chariow */}
          <form action={startSubscription}>
            <input type="hidden" name="provider" value="chariow" />
            <input type="hidden" name="interval" value={interval} />
            {next && <input type="hidden" name="next" value={next} />}
            {tpl && <input type="hidden" name="tpl" value={tpl} />}
            <button
              type="submit"
              className="w-full flex items-center gap-4 rounded-xl border border-gray-200 p-4 text-left hover:border-violet-300 hover:bg-violet-50/50 transition-colors"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="7" y="2" width="10" height="20" rx="2" />
                  <path d="M11 18h2" />
                </svg>
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-gray-900">{t("pricing.payByMobileMoney")}</span>
                <span className="block mt-0.5 text-xs text-gray-500 leading-5">{t("pricing.payByMobileMoneyDesc")}</span>
              </span>
              <span className="text-gray-300">›</span>
            </button>
          </form>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Add the i18n keys**

`messages/fr.json` — inside the `pricing` object (after `manageCta`):

```json
"paymentTitle": "Choisis ton moyen de paiement",
"paymentSubtitle": "Sélectionne comment tu veux payer pour passer à Bizko Pro.",
"payByCard": "Carte bancaire",
"payByCardDesc": "Paiement sécurisé par carte via Whop.",
"payByMobileMoney": "Mobile Money",
"payByMobileMoneyDesc": "Paiement par Mobile Money (Orange Money, MTN, Moov…) via Chariow."
```

`messages/en.json` — same keys:

```json
"paymentTitle": "Choose your payment method",
"paymentSubtitle": "Select how you want to pay to go Pro.",
"payByCard": "Credit card",
"payByCardDesc": "Secure card payment via Whop.",
"payByMobileMoney": "Mobile Money",
"payByMobileMoneyDesc": "Pay with Mobile Money (Orange Money, MTN, Moov…) via Chariow."
```

**Step 3: Lint / typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

**Step 4: Commit**

```bash
git add src/components/payment/PaymentMethodModal.tsx messages/fr.json messages/en.json
git commit -m "feat(pricing): payment-method popup (card / mobile money)"
```

---

## Task 6: Wire the modal into the pricing page

**Files:**
- Modify: `src/app/pricing/PricingClient.tsx`

**Step 1: Update `PricingClient.tsx`**

- Add `useState` and import the modal.
- In the two "free" branches (monthly & yearly), replace the `<form action={startSubscription}>` buttons with a `<button type="button">` that opens the modal for that interval. Keep the visual classes unchanged.
- Render `<PaymentMethodModal>` once at the end, moving `next`/`tpl` hidden inputs into the modal (they are already rendered by the modal).

New top of file:

```tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { PricingTable } from "./PricingTable";
import { PaymentMethodModal } from "@/components/payment/PaymentMethodModal";
import type { BillingInterval } from "@/lib/plans";
```

Add state inside the component:

```tsx
const [paymentOpen, setPaymentOpen] = useState<BillingInterval | null>(null);
```

Monthly free branch becomes:

```tsx
{ctaState === "free" ? (
  <button
    type="button"
    onClick={() => setPaymentOpen("monthly")}
    className="mt-6 w-full h-10 rounded-xl border border-violet-300 bg-white text-violet-700 text-sm font-semibold hover:bg-violet-100 transition-colors"
  >
    {t("pricing.cardMonthlyCta")}
  </button>
) : /* guest / pro branches unchanged */}
```

Yearly free branch becomes:

```tsx
{ctaState === "free" ? (
  <button
    type="button"
    onClick={() => setPaymentOpen("yearly")}
    className="mt-6 w-full h-10 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
  >
    {t("pricing.cardYearlyCta")}
  </button>
) : /* guest / pro branches unchanged */}
```

Remove the now-unused `startSubscription` import.

Render the modal just before the closing `</main>`:

```tsx
<PaymentMethodModal
  open={paymentOpen !== null}
  interval={paymentOpen ?? "monthly"}
  next={nextParam}
  tpl={tplParam}
  onClose={() => setPaymentOpen(null)}
/>
```

**Step 2: Lint / typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

**Step 3: Verify manually**

- `npm run dev`
- Log in with a free account → `/pricing`
- Click "Passer à Pro - Mensuel": popup appears with Carte bancaire / Mobile Money.
- Click "Mobile Money": redirects to `https://api.chariow.com/v1/checkout` (or errors to `/dashboard?error=checkout_failed` until env vars are set — acceptable pre-config).
- Click the yearly button: popup shows; submitting either form sends `interval=yearly`.
- Clicking the backdrop or "Annuler" closes the popup.
- Card option submits `provider=whop` — same redirect as before.

**Step 4: Commit**

```bash
git add src/app/pricing/PricingClient.tsx
git commit -m "feat(pricing): open payment-method popup from Pro CTAs"
```

---

## Task 7: Preserve Whop self-healing on the subscription page

**Files:**
- Modify: `src/app/dashboard/subscription/page.tsx:10-19`

**Step 1: Filter to Whop checkouts only**

`latestCheckoutId` must only return Whop rows so a Chariow sale id (`sal_...`) is never passed to `findMembershipByCheckout`:

```ts
async function latestCheckoutId(supabase: Awaited<ReturnType<typeof createClient>>, profileId: string): Promise<string | null> {
  const { data } = await supabase
    .from("pro_checkouts")
    .select("checkout_configuration_id")
    .eq("profile_id", profileId)
    .eq("provider", "whop")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.checkout_configuration_id ?? null;
}
```

**Step 2: Lint / typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

**Step 3: Commit**

```bash
git add src/app/dashboard/subscription/page.tsx
git commit -m "fix(payments): keep Whop self-healing isolated from Chariow rows"
```

---

## Task 8: Full test pass + completion

**Files:** none (verification only).

**Step 1: Run the whole test suite**

Run: `npx vitest run`
Expected: all green, including the pre-existing `src/lib/__tests__/whop.test.ts` (unchanged) and the new `chariow.test.ts`.

**Step 2: Typecheck + lint**

Run: `npx tsc --noEmit`
Run: `npm run lint` (if configured)
Expected: clean.

**Step 3: Manual smoke test**

1. Free account → pricing → monthly → Mobile Money → popup closes, Chariow checkout available / graceful error until env configured.
2. Card → Whop checkout (identical to today).
3. Yearly interval flows through both providers.

**Step 4: Final commit (if stragglers)**

```bash
git add -A
git commit -m "chore(payments): finalize Chariow payment-method integration"
```

---

## Out of scope (noted for later)
- Charging / renewals for Chariow (one-time product semantics). The `subscriptions` row is set to `active` on `successful.sale`; renewal handling and expiry for Mobile Money are product decisions for a follow-up.
- Applying the same popup to `finalizePendingSwitch` (deferred plan switch) — kept Whop-only for now, per "don't modify existing Whop flows unnecessarily".
- Chariow `already_purchased` UX (currently surfaces as `checkout_failed`).