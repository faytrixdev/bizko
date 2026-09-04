# Gestion d'abonnement Bizko Pro Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a SaaS-style `/dashboard/subscription` page where Pro users can view their plan status, cancel/reactivate their Whop subscription, and see payment history — all backed by the Whop server-side API (no customer portal).

**Architecture:** The page reads the subscription state directly from Whop via our API key (Approach A — Whop is the source of truth). Our `subscriptions` table maps `profile_id → whop_membership_id` (and `is_pro`), used only to resolve the membership id and detect free vs pro. Server Actions call Whop helpers for cancel/uncancel; the existing webhook keeps the DB row in sync for `is_pro`.

**Tech Stack:** Next.js 16 (App Router, Server Components + Server Actions), Whop API v1 (`https://api.whop.com/api/v1`), Supabase (auth, `subscriptions` table), Tailwind v4, vitest, i18n (`messages/fr.json`, `messages/en.json`).

**Reference design doc:** `docs/plans/2026-09-04-whop-subscription-management-design.md` (already committed in `7e10d84`).

---

## Conventions (read first)
- **No prod code without a failing test** (TDD iron law).
- Server page pattern (see `src/app/account/page.tsx`, `src/app/dashboard/page.tsx`): `createClient()` → `auth.getUser()` → `redirect("/login")` if no user / `redirect("/onboarding")` if no profile → fetch → render `*Client` component.
- Server Actions live in `src/app/dashboard/actions.ts` (or a sibling `subscription/actions.ts`), `"use server"`, use `redirect()` for error/success flows. **Never wrap `redirect()` in try/catch** (throws `NEXT_REDIRECT`).
- Whop fetch helpers standardized in `src/lib/whop.ts` using `fetch` with `Authorization: Bearer ${apiKey}` header; throw `WhopApiError` on non-2xx (see `createCheckoutConfig`).
- Test pattern in `src/lib/__tests__/whop.test.ts`: `FetchLike` type alias, `mockCheckoutResponse()` sets `globalThis.fetch`, `requestInitOf(mock)` / `requestBodyOf(mock)` helpers; env restored in `afterEach`.
- `isPro` = `subscriptions` row where `plan==='pro' && status in ('active','trialing')`.
- i18n keys namespaced (e.g. `dashboard.upgradeTitle`); add keys to BOTH `messages/fr.json` and `messages/en.json`.
- Currency/formatting: FCFA (XOF). `formatted_renewal_price` from Whop already includes currency.

---

## Task 1: Whop helpers — `getMembership`

**Files:**
- Modify: `src/lib/whop.ts` (append after `createCheckoutConfig`)
- Test: `src/lib/__tests__/whop.test.ts`

**Step 1: Write the failing test**

```ts
describe("getMembership", () => {
  type FetchLike = (url: RequestInfo | URL, init: RequestInit) => Promise<Response>;
  function mockMembershipResponse() {
    const mock = vi.fn<FetchLike>(async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({
          id: "mber_123",
          plan_id: "plan_Y19ISQ4TaOryH",
          status: "active",
          cancel_at_period_end: false,
          current_period_end: "2026-10-04T00:00:00.000Z",
          formatted_renewal_price: "2 500 FCFA",
        }),
      }) as unknown as Response
    );
    globalThis.fetch = mock as unknown as typeof fetch;
    return mock;
  }

  function requestInitOf(mock: ReturnType<typeof mockMembershipResponse>): RequestInit {
    return mock.mock.calls[0][1];
  }

  it("GETs /memberships/:id with auth and returns the membership", async () => {
    const fetchMock = mockMembershipResponse();
    process.env.WHOP_API_KEY = "apik_test";

    const membership = await getMembership("mber_123");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.whop.com/api/v1/memberships/mber_123",
      expect.objectContaining({ method: "GET" })
    );
    expect(requestInitOf(fetchMock).headers).toMatchObject({ Authorization: "Bearer apik_test" });
    expect(membership).toMatchObject({ id: "mber_123", status: "active", cancel_at_period_end: false });
  });

  it("throws WhopApiError on a non-2xx response", async () => {
    const mock = vi.fn<FetchLike>(async () =>
      ({ ok: false, status: 404, json: async () => ({}) }) as unknown as Response
    );
    globalThis.fetch = mock as unknown as typeof fetch;
    process.env.WHOP_API_KEY = "apik_test";

    await expect(getMembership("mber_missing")).rejects.toMatchObject({ status: 404 });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/whop.test.ts`
Expected: FAIL — `getMembership is not a function`

**Step 3: Write minimal implementation** (append to `src/lib/whop.ts`)

```ts
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
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/whop.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/whop.ts src/lib/__tests__/whop.test.ts
git commit -m "feat(whop): getMembership helper"
```

---

## Task 2: Whop helpers — `cancelMembership` / `uncancelMembership`

**Files:**
- Modify: `src/lib/whop.ts`
- Test: `src/lib/__tests__/whop.test.ts`

**Step 1: Write the failing test**

```ts
describe("cancelMembership / uncancelMembership", () => {
  type FetchLike = (url: RequestInfo | URL, init: RequestInit) => Promise<Response>;
  function mockOkResponse(body: unknown = {}) {
    const mock = vi.fn<FetchLike>(async () =>
      ({ ok: true, status: 200, json: async () => body }) as unknown as Response
    );
    globalThis.fetch = mock as unknown as typeof fetch;
    return mock;
  }
  function requestInitOf(mock: ReturnType<typeof mockOkResponse>): RequestInit {
    return mock.mock.calls[0][1];
  }

  it("cancels at_period_end by default with a POST body", async () => {
    const fetchMock = mockOkResponse();
    process.env.WHOP_API_KEY = "apik_test";

    await cancelMembership("mber_123");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.whop.com/api/v1/memberships/mber_123/cancel",
      expect.objectContaining({ method: "POST" })
    );
    expect(JSON.parse(String(requestInitOf(fetchMock).body))).toEqual({ cancellation_mode: "at_period_end" });
  });

  it("supports immediate cancellation", async () => {
    const fetchMock = mockOkResponse();
    process.env.WHOP_API_KEY = "apik_test";

    await cancelMembership("mber_123", "now");

    expect(JSON.parse(String(requestInitOf(fetchMock).body))).toEqual({ cancellation_mode: "now" });
  });

  it("uncancels via POST to /uncancel", async () => {
    const fetchMock = mockOkResponse();
    process.env.WHOP_API_KEY = "apik_test";

    await uncancelMembership("mber_123");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.whop.com/api/v1/memberships/mber_123/uncancel",
      expect.objectContaining({ method: "POST" })
    );
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/whop.test.ts`
Expected: FAIL — `cancelMembership is not a function`

**Step 3: Write minimal implementation** (append to `src/lib/whop.ts`)

```ts
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
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/whop.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/whop.ts src/lib/__tests__/whop.test.ts
git commit -m "feat(whop): cancelMembership and uncancelMembership helpers"
```

---

## Task 3: Whop helper — `listMembershipPayments`

**Files:**
- Modify: `src/lib/whop.ts`
- Test: `src/lib/__tests__/whop.test.ts`

**Step 1: Write the failing test**

```ts
describe("listMembershipPayments", () => {
  type FetchLike = (url: RequestInfo | URL, init: RequestInit) => Promise<Response>;
  it("GETs /payments filtered by membership query", async () => {
    const mock = vi.fn<FetchLike>(async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({
          data: [
            { id: "pay_1", total: 2500, currency: "xof", status: "succeeded", paid_at: "2026-09-04T00:00:00.000Z" },
          ],
        }),
      }) as unknown as Response
    );
    globalThis.fetch = mock as unknown as typeof fetch;
    process.env.WHOP_API_KEY = "apik_test";

    const res = await listMembershipPayments("mber_123");

    expect(mock).toHaveBeenCalledWith(
      expect.stringContaining("query=mber_123") && expect.stringContaining("/payments"),
      expect.objectContaining({ method: "GET" })
    );
    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({ id: "pay_1", currency: "xof" });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/whop.test.ts`
Expected: FAIL — `listMembershipPayments is not a function`

**Step 3: Write minimal implementation** (append to `src/lib/whop.ts`)

```ts
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
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/whop.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/whop.ts src/lib/__tests__/whop.test.ts
git commit -m "feat(whop): listMembershipPayments helper"
```

---

## Task 4: Pure helpers — plan period & status resolution

**Files:**
- Modify: `src/lib/whop.ts` (helpers) and optionally `src/lib/plans.ts`
- Test: `src/lib/__tests__/whop.test.ts`

**Step 1: Write the failing test**

```ts
describe("derivePlanInfo", () => {
  it("resolves period and label from a plan id", () => {
    process.env.WHOP_PLAN_ID_PRO = "plan_monthly";
    process.env.WHOP_PLAN_ID_PRO_YEARLY = "plan_yearly";
    expect(derivePlanInfo("plan_yearly")).toEqual({ period: "yearly" });
    expect(derivePlanInfo("plan_monthly")).toEqual({ period: "monthly" });
    expect(derivePlanInfo("plan_unknown")).toEqual({ period: "monthly" }); // safe default
  });

  it("maps status to a display variant", () => {
    expect(subscriptionDisplay({ status: "active", cancel_at_period_end: false })).toEqual("active");
    expect(subscriptionDisplay({ status: "active", cancel_at_period_end: true })).toEqual("canceling");
    expect(subscriptionDisplay({ status: "past_due", cancel_at_period_end: false })).toEqual("past_due");
    expect(subscriptionDisplay({ status: "canceled" })).toEqual("canceled");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/whop.test.ts`
Expected: FAIL — `derivePlanInfo is not a function`

**Step 3: Write minimal implementation** (append to `src/lib/whop.ts`)

```ts
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
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/whop.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/whop.ts src/lib/__tests__/whop.test.ts
git commit -m "feat(whop): derive plan period and subscription display state"
```

---

## Task 5: Server page `/dashboard/subscription/page.tsx`

**Files:**
- Create: `src/app/dashboard/subscription/page.tsx`
- Create: `src/app/dashboard/subscription/SubscriptionClient.tsx`
- Modify: `src/app/dashboard/DashboardClient.tsx` (add "Gérer l'abonnement" link in Pro banner)

**Step 1: Write the server page**

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMembership, listMembershipPayments } from "@/lib/whop";
import { SubscriptionClient } from "./SubscriptionClient";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (!profile) redirect("/onboarding");

  // Resolve the membership id from our subscriptions mapping.
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("whop_membership_id, plan, status")
    .eq("profile_id", user.id)
    .maybeSingle();

  const isPro = sub?.plan === "pro" && (sub.status === "active" || sub.status === "trialing");

  let membership = null;
  let payments = [];
  let error: string | null = null;

  if (isPro) {
    const membershipId = (sub as { whop_membership_id?: string | null }).whop_membership_id;
    if (membershipId) {
      try {
        membership = await getMembership(membershipId);
        payments = await listMembershipPayments(membershipId);
      } catch (e) {
        console.error("[subscription] Whop fetch failed:", e);
        error = "unavailable";
      }
    }
  }

  return (
    <SubscriptionClient
      isPro={isPro}
      membership={membership}
      payments={payments}
      error={error}
      retryHref="/dashboard/subscription"
    />
  );
}
```

**Step 2: Build/typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors (SubscriptionClient not yet created — create a stub first to satisfy imports, or build after Task 6).

> Note: To keep commits green, create a minimal `SubscriptionClient.tsx` stub in Task 5 too, then flesh it out in Task 6.

**Step 3: Commit**

```bash
git add src/app/dashboard/subscription/page.tsx src/app/dashboard/subscription/SubscriptionClient.tsx
git commit -m "feat(dashboard/subscription): server page loading membership + payments"
```

---

## Task 6: Server Actions — cancel / reactivate

**Files:**
- Create: `src/app/dashboard/subscription/actions.ts`
- Modify: `src/app/dashboard/subscription/page.tsx` (pass nothing new; actions invoked from client)

**Step 1: Write the server actions file**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cancelMembership, uncancelMembership } from "@/lib/whop";

async function resolveMembershipId(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("whop_membership_id")
    .eq("profile_id", user.id)
    .maybeSingle();
  const id = sub && !Array.isArray(sub) ? (sub as { whop_membership_id?: string | null }).whop_membership_id : null;
  return id ?? null;
}

export async function cancelSubscriptionAction() {
  const supabase = await createClient();
  const membershipId = await resolveMembershipId(supabase);
  if (!membershipId) redirect("/dashboard/subscription?error=generic");

  try {
    await cancelMembership(membershipId, "at_period_end");
  } catch (err) {
    console.error("[subscription] cancel failed:", err);
    redirect("/dashboard/subscription?error=generic");
  }
  revalidatePath("/dashboard/subscription");
  redirect("/dashboard/subscription?success=canceled");
}

export async function reactivateSubscriptionAction() {
  const supabase = await createClient();
  const membershipId = await resolveMembershipId(supabase);
  if (!membershipId) redirect("/dashboard/subscription?error=generic");

  try {
    await uncancelMembership(membershipId);
  } catch (err) {
    console.error("[subscription] reactivate failed:", err);
    redirect("/dashboard/subscription?error=generic");
  }
  revalidatePath("/dashboard/subscription");
  redirect("/dashboard/subscription?success=reactivated");
}
```

> **Important:** Do NOT wrap `redirect()` inside try/catch (throws `NEXT_REDIRECT`). The try/catch above wraps only the Whop API call; the redirects are outside.

**Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

**Step 3: Commit**

```bash
git add src/app/dashboard/subscription/actions.ts
git commit -m "feat(dashboard/subscription): cancel and reactivate server actions"
```

---

## Task 7: `SubscriptionClient` component + i18n keys

**Files:**
- Modify: `src/app/dashboard/subscription/SubscriptionClient.tsx`
- Modify: `src/app/dashboard/DashboardClient.tsx` (add "Gérer l'abonnement" link when `isPro`)
- Modify: `messages/fr.json`, `messages/en.json`

**Step 1: Add i18n keys**

`messages/fr.json` (under a new `"subscription"` namespace):
```json
"subscription": {
  "back": "← Tableau de bord",
  "title": "Mon abonnement",
  "rest": "Bizko Pro",
  "periodMonthly": "Mensuel",
  "periodYearly": "Annuel",
  "renews": "Renouvellement",
  "renewsAuto": "automatique activé",
  "renewsCancelled": "annulé",
  "nextBilling": "Prochaine échéance",
  "badgeActive": "Actif",
  "badgeCanceling": "Annulation en cours",
  "badgePastDue": "En retard",
  "badgeCanceled": "Annulé",
  "cancelBtn": "Annuler l'abonnement",
  "cancelTitle": "Annuler ?",
  "cancelBody": "Tes avantages Pro restent actifs jusqu'au {date}, puis tu repasses en gratuit.",
  "cancelConfirm": "Confirmer l'annulation",
  "cancelAbort": "Retour",
  "reactivateBtn": "Réactiver l'abonnement",
  "upgradeBtn": "Passer à Pro",
  "subscribeBtn": "S'abonner",
  "history": "Historique des paiements",
  "historyEmpty": "Aucun paiement pour le moment",
  "colAmount": "Montant",
  "colDate": "Date",
  "colStatus": "Statut",
  "colMethod": "Moyen",
  "paid": "Réussi",
  "failed": "Échec",
  "card": "Carte •••• {last4}",
  "errorUnavailable": "Nous n'arrivons pas à charger ton abonnement. Réessaie."
}
```

`messages/en.json`: mirror the same keys with English values.

**Step 2: Write `SubscriptionClient.tsx`**

A client component ("use client") that:
- Renders the back link, the summary card (badge by display state, plan, price, next billing, renewal), the action button (based on `display` via modal for cancel, direct submit for reactivate), and the payments table.
- Uses `useSearchParams` for `error`/`success` messages (mirroring DashboardClient).
- Routes action buttons to `startSubscription` (upgrade/subscribe) and the new server actions via `<form action={...}>`.
- Cancellation confirmation uses a local `useState` modal (confirm dialog).

Base the visual style on the existing dashboard (white card, `rounded-2xl`, `border-violet-200 bg-violet-50` accents, `max-w-[640px] mx-auto px-4 py-6`).

**Step 3: Add "Gérer l'abonnement" link in the Pro banner**

In `src/app/dashboard/DashboardClient.tsx`, inside the `{!isPro && (...)}` upgrade banner is shown only when NOT pro — so add a new, separate "manage subscription" affordance when `isPro` is true, e.g. a small `Link href="/dashboard/subscription"` near the header or a Pro status chip. Show it only when `isPro`.

**Step 4: Build/typecheck**

Run: `npx tsc --noEmit && npx eslint src/app/dashboard/subscription`
Expected: no new errors.

**Step 5: Commit**

```bash
git add src/app/dashboard/subscription/SubscriptionClient.tsx src/app/dashboard/DashboardClient.tsx messages/fr.json messages/en.json
git commit -m "feat(dashboard/subscription): client UI, i18n, and manage link"
```

---

## Task 8: Verify full suite + lint + typecheck

**Step 1: Run tests**

Run: `npx vitest run`
Expected: all tests pass (previous 61 + new Whop helper tests).

**Step 2: Lint**

Run: `npm run lint`
Expected: no new errors (4 pre-existing lint errors outside scope remain).

**Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "chore: final verification pass"
```

---

## Manual verification (prod, done by user)
1. As a Pro user, open `/dashboard/subscription` — see status badge, plan, price, next billing, renewal state.
2. Click "Annuler l'abonnement" → confirm modal → shows "Annulation en cours" badge + reactivate button.
3. Click "Réactiver" → badge returns to "Actif".
4. Confirm payment history renders recent payments.
5. As a free user, page shows "Passer à Pro" CTA to checkout.
6. Confirm Whop permissions: `membership:cancel`, `member:manage`, `member:basic:read` (+ payment read perms) are set on the API key.

## Notes / risks
- **Permissions**: current key needs `membership:cancel` and `member:manage` added (user updated permissions last session; verify).
- **Webhook secret still unverified in prod** (session note) — not a blocker for this page (it reads via API), but the DB `is_pro` mapping depends on the webhook working. Confirm re-delivery of a webhook to validate `WHOP_WEBHOOK_SECRET`.
- `formatted_renewal_price` may be null for canceled memberships — fall back to a fixed string (2 500 FCFA/mois or 20 000 FCFA/an by period).
- Payment `currency` from Whop is `xof` (lowercase); our UI always displays FCFA.
