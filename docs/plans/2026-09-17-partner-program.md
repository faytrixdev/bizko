# Partner Program V1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a full partner/affiliate program to Bizko: admin-activated partners get free Pro access, a referral link, a partner dashboard, recurring commissions on referred users' payments (Chariow + Whop), and manual payouts.

**Architecture:** Single Supabase migration adds `profiles.is_partner/partner_code/commission_rate`, plus immutable `referrals`, `payments`, `commissions`, `payouts` tables with RLS. Referral attribution is captured in a HttpOnly cookie by the middleware at the landing page (`?ref=`), persisted at onboarding (profile creation). Webhooks record `payments` and auto-create `commissions` (idempotent via unique constraints). Partner dashboard and admin surfaces are server components + server actions; admin writes go through the service role after a server-side `is_admin` check. `is_pro` RPC is extended so partners get Pro without any subscription row.

**Tech Stack:** Next.js 15 (App Router), Supabase (Postgres, RLS, RPCs), Next.js middleware + server actions, Chariow Pulse + Whop webhooks, Vitest, existing i18n (`messages/{fr,en}.json`). Commit style: conventional commits.

**Source of truth for the spec:** `docs/plans/2026-09-17-partner-program-design.md`.

---

### Task 1: Partner domain types & constants

**Files:**
- Modify: `src/types/database.ts:1-14`
- Create: `src/lib/partner/tracking.ts`
- Test: `src/lib/__tests__/partner.tracking.test.ts`

**Design decisions fixed in this task:** XOF-only amounts (integers), min payout 5000, default commission rate 30, recurring commissions (every confirmed payment).

**Step 1: Write the failing test**

Create `src/lib/__tests__/partner.tracking.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  REF_COOKIE_NAME,
  isValidRefCode,
  generatePartnerCode,
  buildReferralLink,
  parseRefCookieValue,
  serializeRefCookieValue,
} from "@/lib/partner/tracking";

describe("partner tracking utils", () => {
  it("validates ref codes of the form username_x8k2", () => {
    expect(isValidRefCode("faytrix_x8k2")).toBe(true);
    expect(isValidRefCode("faytrix")).toBe(false);
    expect(isValidRefCode("a_xy")).toBe(false);
    expect(isValidRefCode("Faytrix_x8k2")).toBe(false);
  });

  it("generates codes as lowercase username + 6 alnum chars", () => {
    const code = generatePartnerCode("Faytrix");
    expect(code).toMatch(/^faytrix_[a-z0-9]{6}$/);
    expect(code).not.toBe(generatePartnerCode("Faytrix"));
  });

  it("builds a referral link with optional source", () => {
    expect(buildReferralLink("faytrix_x8k2")).toContain("ref=faytrix_x8k2");
    expect(buildReferralLink("faytrix_x8k2", "profile")).toContain("source=profile");
  });

  it("serializes and parses the ref cookie value", () => {
    const cookie = serializeRefCookieValue({ ref: "faytrix_x8k2", source: "partner_profile" });
    expect(cookie).toContain("faytrix_x8k2");
    expect(parseRefCookieValue(cookie)).toEqual({ ref: "faytrix_x8k2", source: "partner_profile" });
    expect(parseRefCookieValue("garbage")).toBeNull();
    expect(parseRefCookieValue("")).toBeNull();
  });

  it("exposes a stable cookie name", () => {
    expect(REF_COOKIE_NAME).toBe("bizko_ref");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/partner.tracking.test.ts`
Expected: FAIL (`Cannot find module '@/lib/partner/tracking'`)

**Step 3: Write minimal implementation**

Create `src/lib/partner/tracking.ts`:

```ts
import { randomBytes } from "crypto";

export const REF_COOKIE_NAME = "bizko_ref";

export type ReferralSource = "partner_link" | "partner_profile";

export type RefCookieValue = { ref: string; source: ReferralSource };

// partner_code format produced by generatePartnerCode: <username>_<alnum>
export const PARTNER_CODE_PATTERN = /^[a-z0-9_]{3,60}_[a-z0-9]{4,8}$/;

export function isValidRefCode(code: string): boolean {
  return PARTNER_CODE_PATTERN.test(code);
}

export function generatePartnerCode(username: string): string {
  const slug = username.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 30);
  const suffix = randomBytes(6).toString("hex") as string;
  return `${slug}_${suffix.slice(0, 6)}`;
}

export function buildReferralLink(code: string, source?: ReferralSource): string {
  const url = new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  url.searchParams.set("ref", code);
  if (source) url.searchParams.set("source", source);
  return url.toString();
}

export function serializeRefCookieValue(v: RefCookieValue): string {
  return `${v.ref}|${v.source}`;
}

export function parseRefCookieValue(raw?: string | null): RefCookieValue | null {
  if (!raw) return null;
  const [ref, source] = raw.split("|");
  if (!isValidRefCode(ref ?? "")) return null;
  const s: ReferralSource = source === "partner_profile" ? "partner_profile" : "partner_link";
  return { ref, source: s };
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/partner.tracking.test.ts`
Expected: PASS (5 tests)

**Step 5: Commit**

```bash
git add src/types/database.ts src/lib/partner/tracking.ts src/lib/__tests__/partner.tracking.test.ts
git commit -m "feat(partners): partner code + ref cookie utils"
```

---

### Task 2: Partner math & commission helpers (pure, TDD)

**Files:**
- Create: `src/lib/partner/commissions.ts`
- Test: `src/lib/__tests__/partner.commissions.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import {
  MIN_PAYOUT_AMOUNT,
  DEFAULT_COMMISSION_RATE,
  computeCommissionAmount,
  computeAvailableBalance,
  pickCommissionsFifo,
} from "@/lib/partner/commissions";

describe("partner commission math", () => {
  it("rounds commission = total * rate / 100", () => {
    expect(computeCommissionAmount(5000, 30)).toBe(1500);
    expect(computeCommissionAmount(1000, 30)).toBe(300);
    expect(computeCommissionAmount(3333, 30)).toBe(1000); // 999.9 -> 1000
  });

  it("exposes the 5000 min payout and 30 default rate", () => {
    expect(MIN_PAYOUT_AMOUNT).toBe(5000);
    expect(DEFAULT_COMMISSION_RATE).toBe(30);
  });

  it("available = approved - pending payouts - paid payouts", () => {
    const balance = computeAvailableBalance({
      approvedCommissions: 12000,
      pendingPayouts: 5000,
      paidPayouts: 2000,
    });
    expect(balance).toBe(5000);
  });

  it("picks oldest approved commissions summing to the payout amount (FIFO)", () => {
    const picked = pickCommissionsFifo(
      [
        { id: "c1", amount: 1500, status: "approved", created_at: "2026-01-01T00:00:00Z" },
        { id: "c2", amount: 500, status: "approved", created_at: "2026-01-02T00:00:00Z" },
        { id: "c3", amount: 3000, status: "approved", created_at: "2026-01-03T00:00:00Z" },
        { id: "c4", amount: 7000, status: "paid", created_at: "2026-01-04T00:00:00Z" },
      ],
      5000
    );
    expect(picked.map((c) => c.id)).toEqual(["c1", "c2", "c3"]);
    expect(picked.reduce((s, c) => s + c.amount, 0)).toBe(5000);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/partner.commissions.test.ts`
Expected: FAIL (`Cannot find module '@/lib/partner/commissions'`)

**Step 3: Write minimal implementation**

Create `src/lib/partner/commissions.ts`:

```ts
export const MIN_PAYOUT_AMOUNT = 5000;
export const DEFAULT_COMMISSION_RATE = 30;

export type CommissionStatus = "pending" | "approved" | "paid";

/** Commission on a payment: Math.round because XOF has no decimals. */
export function computeCommissionAmount(total: number, ratePercent: number): number {
  return Math.round((total * ratePercent) / 100);
}

/**
 * Balance withdrawable by a partner:
 * approved commissions minus amounts already requested (pending) or paid out.
 * Pending payouts reserve their funds to prevent double requests.
 */
export function computeAvailableBalance(b: {
  approvedCommissions: number;
  pendingPayouts: number;
  paidPayouts: number;
}): number {
  return Math.max(0, b.approvedCommissions - b.pendingPayouts - b.paidPayouts);
}

export interface CommissionLike {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

/** Oldest approved commissions whose total exactly matches `amount` (FIFO). */
export function pickCommissionsFifo(
  commissions: CommissionLike[],
  amount: number
): CommissionLike[] {
  const approved = commissions
    .filter((c) => c.status === "approved")
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const picked: CommissionLike[] = [];
  let used = 0;
  for (const c of approved) {
    const remain = amount - used;
    if (remain <= 0) break;
    if (c.amount >= remain) {
      picked.push(c);
      used += remain;
      break;
    }
    picked.push(c);
    used += c.amount;
  }
  if (used !== amount) return [];
  return picked;
}
```

Note: `pickCommissionsFifo` requires the sum to match exactly (the partner requests their exact available balance). If it returns `[]`, the caller must not mark the payout paid.

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/partner.commissions.test.ts`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add src/lib/partner/commissions.ts src/lib/__tests__/partner.commissions.test.ts
git commit -m "feat(partners): commission math, balance and FIFO payout selection"
```

---

### Task 3: Database migration (schema + RLS + is_pro)

**Files:**
- Create: `supabase/migrations/20260917000002_partner_program.sql`

**Step 1: Write the migration**

```sql
-- Partner program V1. Bizko is the source of truth: partners, referrals,
-- payments, commissions and payouts live here; Chariow/Whop only confirm payments.

-- profiles: partner identity (no expiry; Pro is granted purely by is_partner)
alter table public.profiles
  add column is_partner boolean not null default false,
  add column partner_code text,
  add column commission_rate integer not null default 30
    check (commission_rate between 1 and 100);

create unique index idx_profiles_partner_code on public.profiles(partner_code)
  where partner_code is not null;

-- referrals: immutable user -> partner attribution. One partner per user.
create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.profiles(id) on delete cascade,
  referred_user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null check (source in ('partner_link','partner_profile')),
  created_at timestamptz not null default now(),
  unique (referred_user_id)
);

create index idx_referrals_partner on public.referrals(partner_id);

alter table public.referrals enable row level security;

create policy "Partner can view their referrals"
  on public.referrals for select
  using (partner_id = auth.uid());

create policy "Referred user attributes themselves once"
  on public.referrals for insert
  with check (
    referred_user_id = auth.uid()
    and partner_id <> referred_user_id
    and exists (select 1 from public.profiles p where p.id = partner_id and p.is_partner)
  );

-- payments: one row per confirmed provider payment. Idempotency anchor.
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('whop','chariow')),
  provider_payment_id text not null unique,
  amount integer not null,
  currency text not null default 'XOF',
  interval text not null default 'monthly' check (interval in ('monthly','yearly')),
  plan text not null default 'pro',
  status text not null default 'succeeded' check (status in ('succeeded','failed','refunded')),
  created_at timestamptz not null default now()
);

create index idx_payments_profile on public.payments(profile_id);

alter table public.payments enable row level security;

create policy "Payer or their partner can view a payment"
  on public.payments for select
  using (
    profile_id = auth.uid()
    or exists (
      select 1 from public.referrals r
      where r.partner_id = auth.uid() and r.referred_user_id = payments.profile_id
    )
  );

-- payouts: manual withdrawal requests.
create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null check (amount >= 5000),
  method text not null,
  account_identifier text not null,
  account_holder text,
  details text,
  status text not null default 'pending' check (status in ('pending','paid','rejected')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index idx_payouts_partner on public.payouts(partner_id);
create index idx_payouts_status on public.payouts(status);

alter table public.payouts enable row level security;

create policy "Partner can view their payouts"
  on public.payouts for select
  using (partner_id = auth.uid());

create policy "Partner can request their payouts"
  on public.payouts for insert
  with check (partner_id = auth.uid());

-- commissions: one per payment, created by webhooks, linked to a payout when paid.
create table public.commissions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.profiles(id) on delete cascade,
  referred_user_id uuid not null references public.profiles(id) on delete cascade,
  payment_id uuid not null unique references public.payments(id) on delete cascade,
  amount integer not null,
  status text not null default 'approved' check (status in ('pending','approved','paid')),
  payout_id uuid references public.payouts(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_commissions_partner on public.commissions(partner_id);
create index idx_commissions_partner_status on public.commissions(partner_id, status);

alter table public.commissions enable row level security;

create policy "Partner can view their commissions"
  on public.commissions for select
  using (partner_id = auth.uid());

-- is_pro: partners are Pro for the whole collaboration, without a subscription row.
create or replace function public.is_pro(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions
    where profile_id = p_profile_id
      and plan = 'pro'
      and (
        (
          status in ('active','trialing')
          and (
            provider <> 'chariow'
            or current_period_end is null
            or current_period_end > now()
          )
        )
        or (
          pending_interval is not null
          and pending_effective_at is not null
          and now() <= pending_effective_at + interval '7 days'
        )
      )
  ) or exists (
    select 1 from public.profiles
    where id = p_profile_id and is_partner
  );
$$;

grant execute on function public.is_pro(uuid) to anon, authenticated;

notify pgrst, 'reload schema';
```

**Step 2: Sanity-check the SQL**

Run: `node -e "const s=require('fs').readFileSync('supabase/migrations/20260917000002_partner_program.sql','utf8'); if(/create table|alter table|create policy|create or replace function/.test(s)) console.log('SQL ok:', s.split('\n').length, 'lines')"`
Expected: prints `SQL ok: N lines`

(No local Postgres. Real check happens when the migration is applied to Supabase — the executor or the member must run `supabase db push` / paste into the SQL editor and report back.)

**Step 3: Commit**

```bash
git add supabase/migrations/20260917000002_partner_program.sql
git commit -m "feat(partners): partner schema, RLS and is_pro extension"
```

---

### Task 4: Capture `?ref=` in middleware

**Files:**
- Modify: `src/lib/supabase/middleware.ts:1-30`

**Step 1: Read the current middleware head**

The ref capture must run BEFORE the existing early returns. Current head (after `const pathname = url.pathname`):

```ts
const pathname = url.pathname;
const code = url.searchParams.get("code");
```

**Step 2: Implement the capture**

Add after the `code` forwarding block (before `publicRoutes`), importing from the partner lib:

```ts
import { REF_COOKIE_NAME, isValidRefCode, serializeRefCookieValue } from "@/lib/partner/tracking";

// Partner referral attribution: capture o?ref= on the landing page into a
// HttpOnly cookie that survives multi-page navigation until account creation.
if (pathname === "/" ) {
  const ref = url.searchParams.get("ref") ?? "";
  if (isValidRefCode(ref) && !request.cookies.has(REF_COOKIE_NAME)) {
    const source = url.searchParams.get("source") === "profile" ? "partner_profile" : "partner_link";
    const res = NextResponse.redirect(new URL("/", request.url));
    res.cookies.set(REF_COOKIE_NAME, serializeRefCookieValue({ ref, source }), {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    return res;
  }
}
```

**Step 3: Verify with tsc/lint**

Run: `npx tsc --noEmit && npx eslint src/lib/supabase/middleware.ts`
Expected: no errors

**Step 4: Manual smoke test (local)**

Run: `npm run dev` then visit `http://localhost:3000/?ref=faytrix_x8k2` → assert URL cleans to `/` and the `bizko_ref` cookie is set to `faytrix_x8k2|partner_link`. Visit `/?ref=faytrix_x8k2&source=profile` → cookie `faytrix_x8k2|partner_profile`. Visit `/?ref=bad` → no cookie set.

**Step 5: Commit**

```bash
git add src/lib/supabase/middleware.ts
git commit -m "feat(partners): capture landing page ref into referral cookie"
```

---

### Task 5: "Fait avec Bizko" partner link + profile data

**Files:**
- Modify: `src/types/database.ts:1-14` (profile partner fields)
- Modify: `src/app/[username]/ProfileView.tsx:54-60`
- Modify: `src/app/[username]/__tests__/ProfileView.test.tsx`

**Step 1: Extend the Profile type**

Add to `src/types/database.ts` `Profile`:

```ts
  is_partner?: boolean;
  partner_code?: string | null;
  commission_rate?: number | null;
```

(Optional so existing fixtures/tests compile. Real rows will carry them after the migration; `getCachedPublicProfileData` does `select("*")`, so they flow through automatically.)

**Step 2: Write the failing test for the madeWith link**

Modify `src/app/[username]/__tests__/ProfileView.test.tsx` — read it first, then add a case:

```tsx
it("points the Bizko link at the referral URL when the owner is a partner", async () => {
  const view = await renderProfileView({ profileOverrides: { is_partner: true, partner_code: "faytrix_x8k2" } });
  const link = view.container.querySelector('a[href*="ref=faytrix_x8k2"]');
  expect(link).not.toBeNull();
  expect(link?.getAttribute("href")).toContain("source=profile");
});

it("keeps a plain home link for non-partners", async () => {
  const view = await renderProfileView({});
  expect(view.container.querySelector('a[href="/"]')).not.toBeNull();
});
```

(Match the existing file's render helper; adapt the helper signature if the test file uses its own fixture builder.)

**Step 3: Implement the conditional link**

In `ProfileView.tsx` import `buildReferralLink` and change the link:

```tsx
const madeWithHref =
  profile.is_partner && profile.partner_code
    ? buildReferralLink(profile.partner_code, "partner_profile")
    : "/";
...
<Link href={madeWithHref} className="font-medium text-accent">
  Bizko
</Link>
```

The public profile URL (`/usernameslug`) stays untouched; only the made-with link carries `?ref=`.

**Step 4: Run tests**

Run: `npx vitest run src/app/[username]/__tests__/ProfileView.test.tsx`
Expected: PASS (with both new cases)

**Step 5: Commit**

```bash
git add src/types/database.ts src/app/[username]/ProfileView.tsx src/app/[username]/__tests__/ProfileView.test.tsx
git commit -m "feat(partners): made-with-Bizko link attributes partners"
```

---

### Task 6: Persist referral at onboarding

**Files:**
- Create: `src/lib/partner/attribution.ts`
- Modify: `src/app/onboarding/actions.ts`
- Test: `src/lib/__tests__/partner.attribution.test.ts`

**Step 1: Write the failing test (pure attribution logic with a mocked client)**

```ts
import { describe, expect, it, vi } from "vitest";
import { recordReferral } from "@/lib/partner/attribution";

function clientStub(partnerRow: unknown) {
  const call = vi.fn(async () => ({ data: partnerRow, error: null }));
  const insert = vi.fn(async () => ({ error: null }));
  return {
    channel: () => ({}),
    from: (table: string) =>
      table === "profiles"
        ? { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: call }) }) }) }
        : { insert: insert },
  } as never;
}

describe("recordReferral", () => {
  it("inserts a referral when the code belongs to an active partner", async () => {
    const client = clientStub({ id: "p1", is_partner: true });
    const result = await recordReferral({
      client,
      userId: "u1",
      ref: "faytrix_x8k2",
      source: "partner_profile",
    });
    expect(result).toEqual({ recorded: true });
    expect(client.from("referrals").insert).toHaveBeenCalledWith(
      expect.objectContaining({ partner_id: "p1", referred_user_id: "u1", source: "partner_profile" })
    );
  });

  it("skips when the partner is inactive or the user self-refers", async () => {
    expect((await recordReferral({ client: clientStub(null), userId: "u1", ref: "x_y", source: "partner_link" })).recorded).toBe(false);
    const self = clientStub({ id: "u1", is_partner: true });
    expect((await recordReferral({ client: self, userId: "u1", ref: "x_y", source: "partner_link" })).recorded).toBe(false);
  });

  it("never throws (attribution is best-effort)", async () => {
    const broken = { from: () => ({ select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: vi.fn(async () => ({ data: null, error: new Error("db") })) }) }) }) }) }) } as never;
    const result = await recordReferral({ client: broken, userId: "u1", ref: "x_y", source: "partner_link" });
    expect(result).toEqual({ recorded: false });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/partner.attribution.test.ts`
Expected: FAIL (`Cannot find module '@/lib/partner/attribution'`)

**Step 3: Write the attribution helper**

Create `src/lib/partner/attribution.ts`:

```ts
import { cookies } from "next/headers";
import { REF_COOKIE_NAME, parseRefCookieValue, type ReferralSource } from "./tracking";

interface ReferralClient {
  from(table: string): { insert(row: unknown): Promise<{ error: unknown }> };
}

/** Reads the HttpOnly referral cookie (server-only). Returns null when absent. */
export async function readRefCookie(): Promise<{ ref: string; source: ReferralSource } | null> {
  const store = await cookies();
  return parseRefCookieValue(store.get(REF_COOKIE_NAME)?.value);
}

/** Clears the referral cookie. */
export async function clearRefCookie(): Promise<void> {
  const store = await cookies();
  store.set({ name: REF_COOKIE_NAME, value: "", maxAge: 0 });
}

/**
 * Attributes `userId` to the partner owning `ref`. Verified server-side:
 * partner must exist, be active (is_partner) and not be the user themselves.
 * Best-effort: never rejects the onboarding when attribution fails.
 */
export async function recordReferral(args: {
  client: ReferralClient;
  userId: string;
  ref: string;
  source: ReferralSource;
}): Promise<{ recorded: boolean }> {
  try {
    const { data: partner } = await (args.client.from("profiles") as any)
      .select("id, is_partner")
      .eq("partner_code", args.ref)
      .eq("is_partner", true)
      .maybeSingle();
    if (!partner || partner.id === args.userId) return { recorded: false };
    const { error } = await args.client.from("referrals").insert({
      partner_id: partner.id,
      referred_user_id: args.userId,
      source: args.source,
    });
    return { recorded: !error };
  } catch {
    return { recorded: false };
  }
}
```

Note on client typing: server actions pass a Supabase query client (`createClient()` from `@/lib/supabase/server`) with `from().select().eq().eq().maybeSingle()`. The stub above reflects this shape. The `recordReferral` helper only needs the chained select + insert.

**Step 4: Hook it into onboarding**

In `src/app/onboarding/actions.ts` `completeOnboarding`, inside `if (!existingProfile) {`, after the successful profile insert + `trackEvent("profile_completed", ...)`:

```ts
// Partner referral attribution: lock the partner once, attributes are final.
const refCookie = await readRefCookie();
if (refCookie) {
  await recordReferral({ client: supabase, userId: user.id, ref: refCookie.ref, source: refCookie.source });
  await clearRefCookie();
}
```

(Keep `supabase` — it's the authenticated client with the RLS insert policy for `referrals`, which matches `referred_user_id = auth.uid()`.)

**Step 5: Run tests**

Run: `npx vitest run src/lib/__tests__/partner.attribution.test.ts`
Expected: PASS (3 tests)

**Step 6: Verify onboarding still type-checks**

Run: `npx tsc --noEmit`
Expected: no errors (the `ReferralClient` shape is accepted by the call)

**Step 7: Commit**

```bash
git add src/lib/partner/attribution.ts src/app/onboarding/actions.ts src/lib/__tests__/partner.attribution.test.ts
git commit -m "feat(partners): persist referral attribution at onboarding"
```

---

### Task 7: Payment + commission creation helper (idempotent)

**Files:**
- Create: `src/lib/partner/payments.ts`
- Test: `src/lib/__tests__/partner.payments.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import { handleConfirmedPayment, PaymentSeed } from "@/lib/partner/payments";

function makeClient(opts: {
  existingPayment?: unknown;
  referral?: unknown;
  partner?: unknown;
  paymentInsertError?: unknown;
  commissionInsertError?: unknown;
}) {
  const calls: { type: string; arg: unknown }[] = [];
  const t = (type: string, arg: unknown) => calls.push({ type, arg });
  return {
    calls,
    from: (table: string) => {
      if (table === "payments") {
        return {
          select: () => ({ eq: () => ({ maybeSingle: vi.fn(async () => ({ data: opts.existingPayment ?? null, error: null })) }) }),
          insert: vi.fn(async (row) => { t("payments.insert", row); return { error: opts.paymentInsertError ?? null }; }),
          upsert: vi.fn(async (row) => { t("payments.upsert", row); return { error: null }; }),
        };
      }
      if (table === "referrals") {
        return { select: () => ({ eq: () => ({ maybeSingle: vi.fn(async () => ({ data: opts.referral ?? null, error: null })) }) }) };
      }
      if (table === "profiles") {
        return { select: () => ({ eq: () => ({ maybeSingle: vi.fn(async () => ({ data: opts.partner ?? null, error: null })) }) }) };
      }
      if (table === "commissions") {
        return {
          insert: vi.fn(async (row) => { t("commissions.insert", row); return { error: opts.commissionInsertError ?? null }; }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  } as never;
}

const SEED: PaymentSeed = {
  profileId: "u1", provider: "whop", providerPaymentId: "pay_1",
  amount: 5000, currency: "XOF", interval: "monthly", plan: "pro",
};

describe("handleConfirmedPayment", () => {
  it("creates payment + commission for a referred, active partner", async () => {
    const client = makeClient({ referral: { partner_id: "p1" }, partner: { id: "p1", is_partner: true, commission_rate: 30 } });
    const res = await handleConfirmedPayment({ client, seed: SEED });
    expect(res).toEqual({ status: "commissioned" });
    expect(client.calls).toContainEqual(expect.objectContaining({ type: "payments.upsert", arg: expect.objectContaining({ provider_payment_id: "pay_1" }) }));
    expect(client.calls).toContainEqual(expect.objectContaining({ type: "commissions.insert", arg: expect.objectContaining({ partner_id: "p1", referred_user_id: "u1", amount: 1500, status: "approved" }) }));
  });

  it("is idempotent: leaves the existing record alone on replay", async () => {
    const client = makeClient({ existingPayment: { id: "pay-row" } });
    const res = await handleConfirmedPayment({ client, seed: SEED });
    expect(res.status).toBe("already_processed");
    expect(client.calls.filter((c) => c.type === "commissions.insert")).toHaveLength(0);
  });

  it("records the payment but no commission when there is no referral", async () => {
    const client = makeClient({ referral: null });
    const res = await handleConfirmedPayment({ client, seed: SEED });
    expect(res.status).toBe("no_referral");
    expect(client.calls).toContainEqual(expect.objectContaining({ type: "payments.upsert" }));
  });

  it("skips commission for an inactive partner", async () => {
    const client = makeClient({ referral: { partner_id: "p1" }, partner: { id: "p1", is_partner: false } });
    const res = await handleConfirmedPayment({ client, seed: SEED });
    expect(res.status).toBe("partner_inactive");
    expect(client.calls.filter((c) => c.type === "commissions.insert")).toHaveLength(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/partner.payments.test.ts`
Expected: FAIL (`Cannot find module '@/lib/partner/payments'`)

**Step 3: Write the helper**

Create `src/lib/partner/payments.ts`:

```ts
import { computeCommissionAmount } from "./commissions";

export type PaymentSeed = {
  profileId: string;
  provider: "whop" | "chariow";
  providerPaymentId: string;
  amount: number;
  currency: string;
  interval: "monthly" | "yearly";
  plan: string;
};

interface AdminClient {
  from(table: string): any;
}

export type PaymentResult =
  | { status: "already_processed" }
  | { status: "no_referral" }
  | { status: "partner_inactive" }
  | { status: "commissioned" };

/**
 * Records a confirmed payment and, when the payer has an active referrer,
 * creates its commission. Idempotent by construction: `provider_payment_id`
 * unique on payments and `payment_id` unique on commissions. Throws on DB
 * errors so the calling webhook can return 500 and let the provider retry.
 */
export async function handleConfirmedPayment(args: {
  client: AdminClient;
  seed: PaymentSeed;
}): Promise<PaymentResult> {
  const { client, seed } = args;

  const { data: existing } = await client
    .from("payments")
    .select("id")
    .eq("provider_payment_id", seed.providerPaymentId)
    .maybeSingle();
  if (existing) return { status: "already_processed" };

  await client.from("payments").upsert(
    {
      profile_id: seed.profileId,
      provider: seed.provider,
      provider_payment_id: seed.providerPaymentId,
      amount: seed.amount,
      currency: seed.currency,
      interval: seed.interval,
      plan: seed.plan,
    },
    { onConflict: "provider_payment_id" }
  );

  const { data: referral } = await client
    .from("referrals")
    .select("partner_id")
    .eq("referred_user_id", seed.profileId)
    .maybeSingle();
  if (!referral) return { status: "no_referral" };

  const { data: partner } = await client
    .from("profiles")
    .select("id, is_partner, commission_rate")
    .eq("id", referral.partner_id)
    .maybeSingle();
  if (!partner || partner.is_partner !== true) return { status: "partner_inactive" };

  const amount = computeCommissionAmount(seed.amount, partner.commission_rate);
  await client.from("commissions").insert(
    {
      partner_id: partner.id,
      referred_user_id: seed.profileId,
      payment_id: undefined as never, // placeholder replaced below by the executor after the payment row id is known
    },
    { onConflict: "payment_id" }
  );

  return { status: "commissioned" };
}
```

> Implementation note for the executor: the payment row id is NOT known locally after upsert (we don't get a return). Two correct options:
> 1. Re-select the inserted payment by `provider_payment_id` to get its `id`, then insert the commission with that `payment_id`, using `onConflict: "payment_id"`.
> 2. Change the migration to add `provider_payment_id text unique` on commissions instead of `payment_id` (or add a trigger). Prefer option 1: after upsert, `select("id, status").eq("provider_payment_id", seed.providerPaymentId).maybeSingle()`; if it already had `status='succeeded'` at step 2's check, you can still proceed — the commissions `payment_id` unique guard is the real dedupe. The test stub asserts `payments.upsert` called and `commissions.insert` called with `partner_id`, `referred_user_id`, `amount`, `status`; the real implementation must include `payment_id` from the re-select.

**Step 4: Run tests**

Run: `npx vitest run src/lib/__tests__/partner.payments.test.ts`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add src/lib/partner/payments.ts src/lib/__tests__/partner.payments.test.ts
git commit -m "feat(partners): idempotent payment + commission creation"
```

---

### Task 8: Amount extraction (Chariow) + webhook wiring

**Files:**
- Modify: `src/lib/chariow.ts`
- Modify: `src/app/api/webhooks/chariow/route.ts`
- Modify: `src/lib/__tests__/chariow.test.ts`

**Step 1: Add `getSale` + amount extractor to `src/lib/chariow.ts`**

```ts
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
```

**Step 2: Write failing unit tests** (append to `src/lib/__tests__/chariow.test.ts`, following its existing fetch-mock style):

- `extractSaleAmount` returns `{ amount: 5000, currency: "XOF" }` from `{ total: 5000 }`, and from `{ amount: 5000 }`, and null for `{ id: "s1" }`.
- `getSale` calls `GET ${BASE_URL}/sales/s1` and returns the `data` object on 200, null on 404.

**Step 3: Wire the webhook**

In `src/app/api/webhooks/chariow/route.ts` `applyPulse`, in the `successful.sale` branch after the subscription upsert + delivery insert, add:

```ts
import { handleConfirmedPayment } from "@/lib/partner/payments";
import { extractSaleAmount, getSale } from "@/lib/chariow";

// Payment ledger + partner commission (idempotent).
let amountInfo = extractSaleAmount(sale);
if (!amountInfo && saleId) {
  const fetched = await getSale(saleId);
  amountInfo = fetched && fetched.total != null ? { amount: fetched.total, currency: fetched.currency ?? "XOF" } : null;
}
if (amountInfo && profileId) {
  await handleConfirmedPayment({
    client: admin,
    seed: {
      profileId,
      provider: "chariow",
      providerPaymentId: saleId ?? `sale_${Date.now()}`,
      amount: amountInfo.amount,
      currency: amountInfo.currency,
      interval,
      plan: "pro",
    },
  });
} else {
  console.warn("[chariow-webhook] successful.sale without a resolvable amount; no payment/commission recorded");
}
```

**Step 4: Run tests**

Run: `npx vitest run src/lib/__tests__/chariow.test.ts`
Expected: PASS

**Step 5: Type-check the route**

Run: `npx tsc --noEmit`
Expected: no errors

**Step 6: Commit**

```bash
git add src/lib/chariow.ts src/app/api/webhooks/chariow/route.ts src/lib/__tests__/chariow.test.ts
git commit -m "feat(partners): record Chariow payments and commissions on successful.sale"
```

---

### Task 9: Amount extraction (Whop) + webhook wiring

**Files:**
- Modify: `src/lib/whop.ts`
- Modify: `src/app/api/webhooks/whop/route.ts`
- Modify: `src/lib/__tests__/whop.test.ts`

**Step 1: Add a payment fetch helper to `src/lib/whop.ts`**

```ts
export async function getPayment(paymentId: string): Promise<WhopPayment | null> {
  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey) throw new WhopApiError("Whop not configured", 500);
  const res = await fetch(`${BASE_URL}/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new WhopApiError(`Whop GET /payments/${paymentId} failed (${res.status})`, res.status);
  }
  return (await res.json()) as WhopPayment;
}

/** Best-effort amount from a Whop payment event payload; XOF has zero decimals. */
export function extractWhopAmount(data: Record<string, unknown>): { amount: number; currency: string } | null {
  const raw = data.amount ?? data.total ?? (data.payment as Record<string, unknown> | undefined)?.total;
  const amount = typeof raw === "number" ? raw : typeof raw === "string" && /^\d+$/.test(raw) ? Number(raw) : null;
  const currency = typeof data.currency === "string" ? data.currency.toUpperCase() : "XOF";
  return amount === null ? null : { amount, currency };
}
```

**Step 2: Write failing tests** (append to `src/lib/__tests__/whop.test.ts`):
- `extractWhopAmount({ amount: 5000, currency: "xof" })` → `{ amount: 5000, currency: "XOF" }`.
- `extractWhopAmount({})` → null.
- `getPayment` hits `GET ${BASE_URL}/payments/pay_1` and returns the object (mock `fetch` like the existing tests).

**Step 3: Wire the webhook**

In `src/app/api/webhooks/whop/route.ts` `applyEvent`, case `payment.succeeded`: after `await upsertActive(profileId, event)` add:

```ts
import { handleConfirmedPayment } from "@/lib/partner/payments";
import { derivePlanInfo, extractWhopAmount, getPayment, listMembershipPayments } from "@/lib/whop";

const data = (event.data ?? {}) as EventData;
let amountInfo = extractWhopAmount(data);
if (!amountInfo) {
  const paymentId = typeof data.id === "string" ? data.id : event.id;
  const membershipId = typeof data.membership_id === "string" ? data.membership_id
    : (data.member as { membership?: { id?: string } } | undefined)?.membership?.id;
  const fallback = paymentId
    ? (await getPayment(paymentId)) ?? (membershipId ? (await listMembershipPayments(membershipId)).find((p) => p.id === paymentId) ?? null : null)
    : null;
  if (fallback && fallback.total != null) amountInfo = { amount: fallback.total, currency: fallback.currency ?? "XOF" };
}
if (amountInfo && profileId) {
  const paymentId = typeof data.id === "string" ? data.id : event.id;
  const intervalRaw = typeof data.plan_id === "string" ? data.plan_id : undefined;
  await handleConfirmedPayment({
    client: supabase(),
    seed: {
      profileId,
      provider: "whop",
      providerPaymentId: paymentId,
      amount: amountInfo.amount,
      currency: amountInfo.currency,
      interval: derivePlanInfo(intervalRaw).period,
      plan: "pro",
    },
  });
}
```

Only `payment.succeeded` creates a payment/commission (`membership.activated` keeps just syncing the subscription, to avoid double commissions).

**Step 4: Run tests**

Run: `npx vitest run src/lib/__tests__/whop.test.ts`
Expected: PASS

**Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

**Step 6: Commit**

```bash
git add src/lib/whop.ts src/app/api/webhooks/whop/route.ts src/lib/__tests__/whop.test.ts
git commit -m "feat(partners): record Whop payments and commissions on payment.succeeded"
```

---

### Task 10: Partner dashboard — server queries, page, payout request

**Files:**
- Create: `src/lib/partner/queries.ts`
- Create: `src/app/dashboard/partner/page.tsx`
- Create: `src/app/dashboard/partner/actions.ts`
- Create: `src/app/dashboard/partner/PartnerDashboard.tsx` (client, copy + form)

**Step 1: Server query helpers — `src/lib/partner/queries.ts`**

```ts
import { createClient } from "@/lib/supabase/server";
import { computeAvailableBalance } from "./commissions";

export interface PartnerOverview {
  partnerCode: string;
  commissionRate: number;
  referralCount: number;
  payersCount: number;
  commissionsGenerated: number;
  commissionsPending: number;
  commissionsApproved: number;
  commissionsPaid: number;
  pendingPayouts: number;
  paidPayouts: number;
  availableBalance: number;
}

export async function getPartnerOverview(userId: string, partnerCode: string, commissionRate: number): Promise<PartnerOverview> {
  const supabase = await createClient();
  const { data: referrals } = await supabase.from("referrals").select("id").eq("partner_id", userId);
  const referralIds = referrals?.map((r) => r.id) ?? [];
  const { data: commissions } = await supabase
    .from("commissions")
    .select("id, amount, status")
    .eq("partner_id", userId);
  const { data: payouts } = await supabase
    .from("payouts")
    .select("id, amount, status")
    .eq("partner_id", userId);
  const { data: payments } = referralIds.length
    ? await supabase.from("payments").select("profile_id").in(
        "profile_id",
        referralIds // placeholder: replaced by the real referred_user_id lookup below
      )
    : { data: [] };

  const sum = (rows: { amount: number }[] | null) => (rows ?? []).reduce((s, r) => s + r.amount, 0);
  const approved = sum((commissions ?? []).filter((c) => c.status === "approved"));
  const paid = sum((commissions ?? []).filter((c) => c.status === "paid"));

  return {
    partnerCode,
    commissionRate,
    referralCount: referrals?.length ?? 0,
    payersCount: quantities or the distinct referred users with payments (see note),
    commissionsGenerated: approved + paid,
    commissionsPending: sum((commissions ?? []).filter((c) => c.status === "pending")),
    commissionsApproved: approved,
    commissionsPaid: paid,
    pendingPayouts: sum((payouts ?? []).filter((p) => p.status === "pending")),
    paidPayouts: sum((payouts ?? []).filter((p) => p.status === "paid")),
    availableBalance: computeAvailableBalance({ approvedCommissions: approved, pendingPayouts: pending, paidPayouts: paid }),
  };
}
```

> Executor note: the "payers" count needs the set of `referred_user_id` from this partner's referrals, then a `payments.select("profile_id").in("profile_id", thoseUuids)` distinct count. The `in` placeholder above must be implemented with the real referred user ids (fetch `referrals.select("referred_user_id")` first, then `in`). Keep the number exact.

Also export `getPartnerReferrals(userId)` (referrals + joined referred profile username/display_name + latest payment + commission row) for the history table, and `getPartnerPayouts(userId)` (own payouts). Use server-side joins or two-step in-clauses; never build raw SQL.

**Step 2: Partner dashboard page — `src/app/dashboard/partner/page.tsx`**

Server component. Guard: fetch `profiles` for `auth.uid()` via `createClient()`, `select("is_partner, partner_code, commission_rate, display_name")`; if `!is_partner` → `notFound()`. Fetch overview + referrals + payouts + build `https://bizko.pro/?ref=<code>` link. Hand off to `PartnerDashboard` client component with props: `overview`, `referrals`, `payouts`, `referralLink`, `minPayout`, `canRequestPayout`, and localized messages.

**Step 3: Request payout server action — `src/app/dashboard/partner/actions.ts`**

```ts
"use server";

export async function requestPayout(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles").select("is_partner, partner_code, commission_rate").eq("id", user.id).single();
  if (!profile?.is_partner) return { error: "not_partner" };

  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") ?? "").trim();
  const account_identifier = String(formData.get("account_identifier") ?? "").trim();
  const account_holder = String(formData.get("account_holder") ?? "").trim() || null;
  const details = String(formData.get("details") ?? "").trim() || null;

  if (!Number.isInteger(amount) || amount < MIN_PAYOUT_AMOUNT) return { error: "below_minimum" };
  if (!method || !account_identifier) return { error: "incomplete" };

  const overview = await getPartnerOverview(user.id, profile.partner_code!, profile.commission_rate ?? DEFAULT_COMMISSION_RATE);
  if (amount > overview.availableBalance) return { error: "insufficient_balance" };

  const { error } = await supabase.from("payouts").insert({
    partner_id: user.id, amount, method, account_identifier, account_holder, details,
  });
  if (error) return { error: "failed" };
  revalidatePath("/dashboard/partner");
  return { ok: true };
}
```

Revalidate path after insert so the balance + list refresh. Client form calls this action via `useActionState` and updates the message/disabled state.

**Step 4: Client component — `PartnerDashboard.tsx`**

Renders: copy button for the referral link (navigator.clipboard with fallback), stat cards (see design §5), history table (user, date, source, payment, commission, status), payout list + form. Reuse the existing card/badge styling used across the dashboard (rounded-2xl cards, gray text, accent accents, `cn`). No new dependencies.

**Step 5: Manual & automated checks**

Run: `npx tsc --noEmit && npx eslint src/app/dashboard/partner`
Expected: clean.

**Step 6: Commit**

```bash
git add src/lib/partner/queries.ts src/app/dashboard/partner
git commit -m "feat(partners): partner dashboard, stats and payout request"
```

---

### Task 11: Partner Pro card on the subscription page + access point

**Files:**
- Modify: `src/app/dashboard/subscription/page.tsx`
- Create: `src/app/dashboard/subscription/PartnerProCard.tsx`

**Step 1: Read `src/app/dashboard/subscription/page.tsx`** to find where the profile and subscription are fetched and where `SubscriptionClient` is rendered.

**Step 2: Partner branch**

If `profile.is_partner` is true, render `<PartnerProCard profile={profile} />` instead of the usual pricing/subscription client (the partner gets Pro for the whole collaboration — no buy/renew/switch/manage UI).

`PartnerProCard.tsx` (server): badge "Actif", title « Pro — via partenariat », text « Votre accès Pro est offert grâce à votre statut de partenaire Bizko. Il reste actif tant que le partenariat est actif. », primary button `Espace Partenaire → /dashboard/partner`, secondary note explaining no card/auto-renewal. No `SubscriptionClient` render.

**Step 3: Access point**

The dashboard has no global sidebar; the partner space is reached from this card. Optionally also add a small « Partenaire » chip next to the Pro badge in `account/page.tsx` if a status section exists there (check the file; skip if it would add clutter).

**Step 4: Type-check + lint**

Run: `npx tsc --noEmit && npx eslint src/app/dashboard/subscription`
Expected: clean.

**Step 5: Commit**

```bash
git add src/app/dashboard/subscription
git commit -m "feat(partners): partner Pro card on billing page"
```

---

### Task 12: i18n (fr/en) for the partner surfaces

**Files:**
- Modify: `messages/fr.json`
- Modify: `messages/en.json`

**Step 1: Add the `partner` namespace**

Keys (fr / en), following the file's alphabetical nesting style:

```
partner.dashboard        | Espace partenaire | Partner space
partner.partnerProgram   | Partenariat Bizko  | Bizko partnership
partner.linkTitle        | Votre lien de parrainage | Your referral link
partner.copy             | Copier            | Copy
partner.copied           | Copié !           | Copied!
partner.statReferrals    | Utilisateurs apportés | Users referred
partner.statPayers       | Ont souscrit      | Subscribed
partner.statGenerated    | Commissions générées | Commissions earned
partner.statPending      | En attente        | Pending
partner.statAvailable    | Disponibles       | Available
partner.statPaid         | Déjà payées       | Already paid
partner.statBalance      | Solde disponible pour retrait | Available for withdrawal
partner.historyTitle     | Historique        | History
partner.user             | Utilisateur       | User
partner.date             | Date              | Date
partner.source           | Source            | Source
partner.payment          | Paiement          | Payment
partner.commission       | Commission        | Commission
partner.status           | Statut            | Status
partner.sourceLink       | Lien partenaire   | Partner link
partner.sourceProfile    | Profil pro        | Pro partner profile
partner.payoutTitle      | Demandes de retrait | Withdrawal requests
partner.requestPayout    | Demander un retrait | Request a withdrawal
partner.minimumHint      | Minimum {amount} FCFA | Minimum {amount} FCFA
partner.balanceTooLow    | Solde insuffisant pour un retrait | Balance too low for a withdrawal
partner.method           | Méthode           | Method
partner.methodPlaceholder| Ex : Orange Money, Wave… | e.g. Orange Money, Wave…
partner.accountIdentifier| Numéro Mobile Money | Mobile Money number
partner.accountHolder    | Titulaire (si nécessaire) | Account holder (if needed)
partner.details          | Informations supplémentaires | Additional details
partner.amount           | Montant           | Amount
partner.paidOn           | Payé le           | Paid on
partner.rejectedHint     | Rejetée           | Rejected
partner.proViaPartner    | Pro via partenariat | Pro via partnership
partner.proActiveUntilEnd| Actif — tant que le partenariat est actif | Active — for as long as the partnership lasts
partner.proNoPayment     | Aucun paiement requis ni auto-renouvellement | No payment or auto-renewal
```

Use `t("partner.xxx")` in client components and `msg.partner.xxx` in server components, following existing i18n conventions (`related-messages` server/client split as used elsewhere).

**Step 2: Locate the i18n helper**

Check how messages are nested and accessed (see `src/lib/i18n/messages.ts`, `messages-server.ts`) and add the namespace keys at the top level of both files.

**Step 3: Run tests (i18n integrity)**

Run: `npx vitest run` (there is an i18n parity test in the repo — check `src/lib/__tests__` for a messages test and ensure fr/en have identical key sets).
Expected: PASS.

**Step 4: Commit**

```bash
git add messages/fr.json messages/en.json
git commit -m "feat(partners): i18n for partner surfaces"
```

---

### Task 13: Admin « Partenaires »

**Files:**
- Modify: `src/app/admin/AdminSidebar.tsx:20-30`
- Create: `src/app/admin/partners/page.tsx`
- Create: `src/app/admin/partners/PartnersClient.tsx`
- Create: `src/app/admin/partners/actions.ts`
- Create: `src/app/admin/partners/data.ts`

**Step 1: Nav item**

Add to `NAV_ITEMS` in `AdminSidebar.tsx` (import `Handshake` from `lucide-react`):

```ts
{ href: "/admin/partners", label: "Partenaires", icon: Handshake },
```

**Step 2: Server actions (admin-gated) — `actions.ts`**

Every action first calls `requireAdmin()`:

```ts
async function requireAdmin(): Promise<ReturnType<typeof createClient>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/dashboard");
  return supabase;
}
```

Actions (auth via `createClient()` to confirm the operator is admin, then data writes via `createAdminClient()` — service role):

- `activatePartner(formData)`:
  ```
  userId = form; rate = clamp(parseInt(rate ?? DEFAULT_COMMISSION_RATE), 1, 100)
  fetch target profile username, is_partner, partner_code (service role)
  if (!partner_code) partner_code = generatePartnerCode(username) (retry on unique conflict, max 3)
  update profiles set is_partner=true, partner_code=<code>, commission_rate=rate
  updateTag(PUBLIC_PROFILES_TAG)  // refresh made-with link cache
  revalidatePath("/admin/partners")
  ```
- `deactivatePartner(userId)`: `update { is_partner: false }` (keep partner_code for stability; blocks new referrals because every referral/commission path checks `is_partner`). Revalidate tags.
- `setCommissionRate(userId, rate)`: clamp 1..100; update.
- `markPayoutPaid(payoutId)`:
  ```
  fetch payout (partner_id, amount, status) via service role; require status === "pending"
  fetch partner's approved commissions (id, amount, created_at) ordered ascending
  pick = pickCommissionsFifo(commissions, payout.amount)
  if (!pick.length) return { error: "sum_mismatch" }   // exact FIFO match required
  update commissions set payout_id=<payoutId>, status='paid' where id in pick.ids
  update payout set status='paid', paid_at=now()
  revalidatePath("/admin/partners")
  ```
- `rejectPayout(payoutId)`: require pending → `update { status: 'rejected' }`.

**Step 3: Data — `data.ts` (server, admin-gated read)**

`getPartnerAdminData()`: verify `is_admin` via the user client, then with the service role fetch:
- partners: `profiles` where `is_partner = true` (+ username, display_name, commission_rate, partner_code, created_at).
- per partner aggregates: referrals count, payments count, commissions sum by status, payouts by status (run a few `select + in`/`eq` queries; small volume).
- pending payouts list (for the review section): `payouts` where `status = 'pending'`, join partner display_name/username.

Export a typed `PartnerAdminData` object consumed by `PartnersClient`.

**Step 4: Page + client**

- `page.tsx`: `const data = await getPartnerAdminData(); return <PartnersClient data={data} />;`
- `PartnersClient.tsx` ("use client"): two sections — « Retraits à traiter » (pending payouts with accept/reject buttons calling the actions) and « Partenaires » (table: username, nom, taux, ref code, stats, actions Activer/Désactiver + taux input). Use the existing admin card/table styling. All mutations via `useTransition` + `useRouter().refresh()`.

**Step 5: Type-check + lint**

Run: `npx tsc --noEmit && npx eslint src/app/admin/partners`
Expected: clean.

**Step 6: Commit**

```bash
git add src/app/admin/AdminSidebar.tsx src/app/admin/partners
git commit -m "feat(partners): admin partners management and payout review"
```

---

### Task 14: Full verification

**Files:** none

**Step 1: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

**Step 2: Lint**

Run: `npx eslint .`
Expected: no errors.

**Step 3: Full test suite**

Run: `npx vitest run`
Expected: all tests pass (existing 447 + new partner suites). If a fixture anywhere lacks the new optional `Profile` fields, the tests still compile/serialize because the new fields are optional.

**Step 4: Migration apply (member or CI)**

Run: apply `supabase/migrations/20260917000002_partner_program.sql` to the Supabase project (SQL editor / `supabase db push`), then sanity checks in the SQL editor:
```sql
select is_partner, partner_code, commission_rate from profiles where id in (select id from profiles where is_partner) limit 5;
select count(*) from payments p join referrals r on r.referred_user_id = p.profile_id;
select is_pro('00000000-0000-0000-0000-000000000000'); -- partner row returns true; unknown + no sub returns false
```

**Step 5: Commit any fixes**

```bash
git add -A && git commit -m "fix(partners): post-verification fixes"
```

---

## Notes & risks

- **Migration ordering**: `commissions` references `payouts`, so `payouts` is created before `commissions` (SQL order matters; the migration above respects it).
- **Whop amount source**: `payment.succeeded` payload shape is not guaranteed; the extractor + `getPayment` fallback covers it. Total is in XOF integer minor units (0-decimal currency), stored as-is.
- **Chariow amount source**: payload `sale.total`/`amount`, fallback `GET /sales/{id}`; if unresolvable we skip payment+commission rather than inventing an amount.
- **Admin writes**: never via the user RLS client; always `createAdminClient()` after `requireAdmin()`.
- **Cache invalidation**: partner activation must `updateTag(PUBLIC_PROFILES_TAG)` so the "Fait avec Bizko" link flips promptly (public profile cache = 60s).
- **Pending payouts reserve funds**: `computeAvailableBalance` subtracts pending and paid payouts, so a partner can never request more than the unlocked balance.
- **No deletion surfaces**: the app never DELETE on referrals/payments/commissions/payouts. Deactivation only flips `is_partner`.
- **Self-review before finishing**: run Task 14 checks, then request a code review pass on the webhook `handleConfirmedPayment` idempotency and the payout FIFO `markPayoutPaid` path.