# Page tarifs publique `/pricing` — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a public `/pricing` page with a Free vs Pro comparison table and adaptive CTAs (guest → signup, free → checkout, pro → manage subscription), so visitors understand why Bizko Pro is worth it.

**Architecture:** Server page `src/app/pricing/page.tsx` resolves the visitor's auth state (guest / free / pro) and renders a client component (`PricingClient`) for the hero, comparison table and price cards. The table data comes from a pure `PLAN_COMPARISON` export derived from the existing `LIMITS`/video constants in `src/lib/plans.ts` — single source of truth, no hardcoded numbers in the UI. Checkout forms reuse the existing `startSubscription` server action.

**Tech Stack:** Next.js App Router (server + client components), existing i18n (`useI18n` client hook + `getServerMessages` server messages), Tailwind (existing violet/accent palette from the app), Vitest for unit tests.

---

## Conventions & prior work

- Repo: `C:\Users\PC\Documents\Bizko` on branch `master`. Existing design doc: `docs/plans/2026-09-04-pricing-page-design.md`.
- **Iron law (TDD):** no production code without a failing unit test first for any logic in `src/lib/*`. UI components themselves are not unit-tested in this repo (matches existing convention).
- i18n: client components use `useI18n()` (returns `{ t, locale }`) from `@/lib/i18n/provider`; server pages use `getServerMessages()` from `@/lib/i18n/messages-server` (returns `msg` with `msg.landing`). Messages live in `messages/fr.json` and `messages/en.json`, mirrored identically in structure.
- Landing nav (`src/components/landing/LandingNavbar.tsx`) is a client component typed to receive `msg: { landing: {...} }`; add the new key `navPricing` to its destructured type + both message files.
- Checkout: `src/app/dashboard/actions.ts` exports `startSubscription(formData)` (server action) reading `interval` = `monthly` | `yearly`, redirecting to the Whop checkout; already used by the dashboard upgrade card. For NOT-logged-in users it redirects to `/login`.
- Success auth CB honors `?next=/pricing` for Google OAuth (existing behavior in `src/app/auth/callback/route.ts`). No auth changes needed.

### TL;DR of what exists today
- `getLimits("free" | "pro")` → `{ services, socials, portfolioItems, videos, templates }` and `videoDurationLimitSec(plan)`, `videoSizeLimitBytes(plan)`.
- The dashboard upgrade banner: `DashboardClient.tsx:137-166` (violet card, two forms calling `startSubscription`). We reuse those forms' pattern on `/pricing`.

---

## Task 1: Add `PLAN_COMPARISON` to `src/lib/plans.ts` (TDD)

**Files:**
- Modify: `src/lib/plans.ts` (append exports)
- Test: `src/lib/__tests__/plans.test.ts` (append describe block)

### Step 1: Write the failing test

Append to `src/lib/__tests__/plans.test.ts`:

```ts
import {
  ...existing imports...,
  PLAN_COMPARISON,
} from "../plans";

describe("PLAN_COMPARISON", () => {
  it("exposes exactly the 7 differentiating rows in a stable order", () => {
    expect(PLAN_COMPARISON.map((r) => r.labelKey)).toEqual([
      "pricing.services",
      "pricing.socials",
      "pricing.portfolio",
      "pricing.videos",
      "pricing.videoDuration",
      "pricing.videoSize",
      "pricing.templates",
    ]);
  });

  it("derives capacities from LIMITS (no hardcoded drift)", () => {
    const by = (key: string) => PLAN_COMPARISON.find((r) => r.labelKey === key)!;
    expect(by("pricing.services")).toMatchObject({ free: "8", pro: "15" });
    expect(by("pricing.socials")).toMatchObject({ free: "6", pro: "15" });
    expect(by("pricing.portfolio")).toMatchObject({ free: "9", pro: "30" });
    expect(by("pricing.templates")).toMatchObject({ free: "2", pro: "6" });
  });

  it("marks unlimited videos with the 'unlimited' sentinel", () => {
    const videos = PLAN_COMPARISON.find((r) => r.labelKey === "pricing.videos")!;
    expect(videos.free).toBe("3");
    expect(videos.pro).toBe("unlimited");
  });

  it("formats video duration and size rows in minutes and MB", () => {
    const by = (key: string) => PLAN_COMPARISON.find((r) => r.labelKey === key)!;
    expect(by("pricing.videoDuration")).toMatchObject({ free: "3 min", pro: "5 min" });
    expect(by("pricing.videoSize")).toMatchObject({ free: "200 MB", pro: "500 MB" });
  });
});
```

### Step 2: Run test to verify it fails

Run: `npx vitest run src/lib/__tests__/plans.test.ts`
Expected: FAIL — `PLAN_COMPARISON is not defined` (import resolves to `undefined`).

### Step 3: Write minimal implementation

Append to `src/lib/plans.ts` (after `videoSizeLimitBytes`):

```ts
export interface ComparisonRow {
  /** i18n key for the row label, e.g. "pricing.services" */
  labelKey: string;
  /** Display value for the Free column. The literal "unlimited" is a sentinel the UI translates via the "pricing.unlimited" i18n key. */
  free: string;
  /** Display value for the Pro column (same sentinel rules as `free`). */
  pro: string;
}

const MIB = 1024 * 1024;

function capacityLabel(count: number): string {
  return Number.isFinite(count) ? String(count) : "unlimited";
}

/**
 * The 7 differentiating rows between Free and Pro, derived from LIMITS and the
 * video constants so the pricing page can never drift from the real limits.
 */
export const PLAN_COMPARISON: ComparisonRow[] = [
  { labelKey: "pricing.services", free: String(getLimits("free").services), pro: String(getLimits("pro").services) },
  { labelKey: "pricing.socials", free: String(getLimits("free").socials), pro: String(getLimits("pro").socials) },
  { labelKey: "pricing.portfolio", free: String(getLimits("free").portfolioItems), pro: String(getLimits("pro").portfolioItems) },
  { labelKey: "pricing.videos", free: String(getLimits("free").videos), pro: capacityLabel(getLimits("pro").videos) },
  { labelKey: "pricing.videoDuration", free: `${videoDurationLimitSec("free") / 60} min`, pro: `${videoDurationLimitSec("pro") / 60} min` },
  { labelKey: "pricing.videoSize", free: `${videoSizeLimitBytes("free") / MIB} MB`, pro: `${videoSizeLimitBytes("pro") / MIB} MB` },
  { labelKey: "pricing.templates", free: String(getLimits("free").templates), pro: String(getLimits("pro").templates) },
];

/** True when a comparison cell is the "unlimited" sentinel. */
export function isUnlimited(value: string): boolean {
  return value === "unlimited";
}
```

### Step 4: Run test to verify it passes

Run: `npx vitest run src/lib/__tests__/plans.test.ts`
Expected: PASS.

### Step 5: Commit

```bash
git add src/lib/plans.ts src/lib/__tests__/plans.test.ts
git commit -m "feat(plans): derive PLAN_COMPARISON for the pricing page"
```

---

## Task 2: Add i18n keys (`pricing` namespace + `landing.navPricing`)

**Files:**
- Modify: `messages/fr.json`
- Modify: `messages/en.json`

### Step 1: Add `pricing` namespace to `messages/fr.json`

Insert a new top-level `"pricing": { ... }` block. Place it right after the `"dashboard"` block **and** before the closing `}` of the root object. Note: fr messages in this repo use plain ASCII (no accents on some words, e.g. "Passe", "publicite"); follow that style for new keys.

```json
"pricing": {
  "title": "Choisis ton plan",
  "subtitle": "Compare ce que tu gagnes en passant a Bizko Pro. Meme profil, meme lien - juste beaucoup plus de place pour ton business.",
  "compareTitle": "Free vs Pro",
  "colFree": "Free",
  "colPro": "Pro",
  "popular": "Populaire",
  "unlimited": "Illimite",
  "rowServices": "Services",
  "rowSocials": "Reseaux sociaux",
  "rowPortfolio": "Portfolio",
  "rowVideos": "Videos",
  "rowVideoDuration": "Duree des videos",
  "rowVideoSize": "Poids des videos",
  "rowTemplates": "Templates",
  "cardsTitle": "Un tarif simple, pense pour evoluer",
  "cardMonthlyLabel": "Pro Mensuel",
  "cardYearlyLabel": "Pro Annuel",
  "cardMonthlyPrice": "2 500 FCFA / mois",
  "cardYearlyPrice": "20 000 FCFA / an",
  "cardMonthlyCta": "Passer a Pro - Mensuel",
  "cardYearlyCta": "Passer a Pro - Annuel",
  "guestCta": "Creer mon compte",
  "manageCta": "Gerer mon abonnement"
}
```

### Step 2: Same block in `messages/en.json`

```json
"pricing": {
  "title": "Choose your plan",
  "subtitle": "See exactly what you unlock by going Bizko Pro. Same profile, same link - just a lot more room for your business.",
  "compareTitle": "Free vs Pro",
  "colFree": "Free",
  "colPro": "Pro",
  "popular": "Most popular",
  "unlimited": "Unlimited",
  "rowServices": "Services",
  "rowSocials": "Social links",
  "rowPortfolio": "Portfolio",
  "rowVideos": "Videos",
  "rowVideoDuration": "Video length",
  "rowVideoSize": "Video size",
  "rowTemplates": "Templates",
  "cardsTitle": "One simple price, built to grow",
  "cardMonthlyLabel": "Pro Monthly",
  "cardYearlyLabel": "Pro Yearly",
  "cardMonthlyPrice": "2,500 FCFA / month",
  "cardYearlyPrice": "20,000 FCFA / year",
  "cardMonthlyCta": "Go Pro - Monthly",
  "cardYearlyCta": "Go Pro - Yearly",
  "guestCta": "Create account",
  "manageCta": "Manage subscription"
}
```

### Step 3: Add `landing.navPricing` in both files

Inside the existing `"landing"` namespace, next to `"navFaq"`, add:

- fr: `"navPricing": "Tarifs"`
- en: `"navPricing": "Pricing"`

### Step 4: Validate JSON

Run:
```bash
Get-Content messages/fr.json -Raw | ConvertFrom-Json | Out-Null
Get-Content messages/en.json -Raw | ConvertFrom-Json | Out-Null
```
Expected: no errors.

### Step 5: Commit

```bash
git add messages/fr.json messages/en.json
git commit -m "feat(i18n): pricing page and landing nav keys"
```

---

## Task 3: Build `PricingTable` component

**Files:**
- Create: `src/app/pricing/PricingTable.tsx`

### Step 1: Write the component

A client component that renders the comparison table. Hollow circle = value, or "Illimite" for the sentinel. Pro column highlighted with a violet background + "Populaire" badge.

```tsx
"use client";

import React from "react";
import { PLAN_COMPARISON, isUnlimited } from "@/lib/plans";
import { useI18n } from "@/lib/i18n/provider";

function Cell({ value }: { value: string }) {
  return (
    <span className="text-sm font-medium text-gray-900">
      {isUnlimited(value) ? "∞" : value}
    </span>
  );
}

export function PricingTable() {
  const { t } = useI18n();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      <div className="grid grid-cols-[1.2fr_1fr_1fr]">
        {/* Header */}
        <div className="px-4 py-3 bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wide" />
        <div className="px-4 py-3 bg-gray-50/80 text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("pricing.colFree")}</span>
        </div>
        <div className="px-4 py-3 bg-violet-50 text-center border-b-2 border-violet-500">
          <span className="block text-xs font-semibold text-violet-700">{t("pricing.colPro")}</span>
          <span className="inline-block mt-1 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-semibold text-white">
            {t("pricing.popular")}
          </span>
        </div>

        {PLAN_COMPARISON.map((row) => (
          <React.Fragment key={row.labelKey}>
            <div className="px-4 py-3.5 border-t border-gray-100 text-sm text-gray-600">
              {t(row.labelKey)}
            </div>
            <div className="px-4 py-3.5 border-t border-gray-100 text-center">
              <Cell value={row.free} />
            </div>
            <div className="px-4 py-3.5 border-t border-gray-100 bg-violet-50/50 text-center">
              <Cell value={row.pro} />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
```

### Step 2: Verify it compiles

Run: `npx tsc --noEmit`
Expected: no errors.

### Step 3: Commit

```bash
git add src/app/pricing/PricingTable.tsx
git commit -m "feat(pricing): comparison table component"
```

---

## Task 4: Build `PricingClient` with adaptive CTAs

**Files:**
- Create: `src/app/pricing/PricingClient.tsx`

### Step 1: Write the component

Client component. Props: `{ ctaState: "guest" | "free" | "pro" }`.

- `guest` → hero CTA + both card buttons link to `/signup?next=/pricing`.
- `free` → hero CTA links to `/signup?next=/pricing`; card buttons become `<form action={startSubscription}>` with hidden `interval` (reuse the exact pattern from `DashboardClient.tsx:145-162`, importing `startSubscription` from `@/app/dashboard/actions`).
- `pro` → all CTAs link to `/dashboard/subscription`.

```tsx
"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { PricingTable } from "./PricingTable";
import { startSubscription } from "@/app/dashboard/actions";

export type PricingCtaState = "guest" | "free" | "pro";

interface PricingClientProps {
  ctaState: PricingCtaState;
}

export function PricingClient({ ctaState }: PricingClientProps) {
  const { t } = useI18n();

  function ctaHref(): string {
    if (ctaState === "guest") return "/signup?next=/pricing";
    if (ctaState === "pro") return "/dashboard/subscription";
    return "/signup?next=/pricing";
  }
  function ctaLabel(): string {
    if (ctaState === "guest") return t("pricing.guestCta");
    if (ctaState === "pro") return t("pricing.manageCta");
    return t("pricing.guestCta");
  }

  return (
    <main className="max-w-3xl mx-auto px-5 sm:px-8 pb-24">
      {/* Hero */}
      <section className="pt-14 pb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-gray-900">
          {t("pricing.title")}
        </h1>
        <p className="mt-4 text-gray-500 leading-7 max-w-xl mx-auto">
          {t("pricing.subtitle")}
        </p>
      </section>

      {/* Compare */}
      <section className="mb-12">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">{t("pricing.compareTitle")}</h2>
        <PricingTable />
      </section>

      {/* Cards */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 text-center mb-8">{t("pricing.cardsTitle")}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Monthly */}
          <div className="rounded-2xl border border-gray-200 p-6 flex flex-col">
            <p className="text-sm font-semibold text-gray-900">{t("pricing.cardMonthlyLabel")}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{t("pricing.cardMonthlyPrice")}</p>
            {ctaState === "free" ? (
              <form action={startSubscription} className="mt-6">
                <input type="hidden" name="interval" value="monthly" />
                <button
                  type="submit"
                  className="w-full h-10 rounded-xl border border-violet-300 bg-white text-violet-700 text-sm font-semibold hover:bg-violet-100 transition-colors"
                >
                  {t("pricing.cardMonthlyCta")}
                </button>
              </form>
            ) : (
              <Link href={ctaHref()} className="mt-6 inline-flex items-center justify-center w-full h-10 rounded-xl border border-violet-300 bg-white text-violet-700 text-sm font-semibold hover:bg-violet-100 transition-colors">
                {ctaState === "pro" ? t("pricing.manageCta") : t("pricing.cardMonthlyCta")}
              </Link>
            )}
          </div>

          {/* Yearly */}
          <div className="rounded-2xl border-2 border-violet-500 bg-violet-50/40 p-6 flex flex-col">
            <p className="text-sm font-semibold text-gray-900">{t("pricing.cardYearlyLabel")}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{t("pricing.cardYearlyPrice")}</p>
            {ctaState === "free" ? (
              <form action={startSubscription} className="mt-6">
                <input type="hidden" name="interval" value="yearly" />
                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
                >
                  {t("pricing.cardYearlyCta")}
                </button>
              </form>
            ) : (
              <Link href={ctaHref()} className="mt-6 inline-flex items-center justify-center w-full h-10 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors">
                {ctaState === "pro" ? t("pricing.manageCta") : t("pricing.cardYearlyCta")}
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
```

### Step 2: Verify it compiles

Run: `npx tsc --noEmit`
Expected: no errors.

### Step 3: Commit

```bash
git add src/app/pricing/PricingClient.tsx
git commit -m "feat(pricing): client with adaptive CTAs"
```

---

## Task 5: Build the `/pricing` server page

**Files:**
- Create: `src/app/pricing/page.tsx`

### Step 1: Write the page

Server component. Resolves auth state, renders `LandingNavbar` + `PricingClient` + a simple footer (mirror the landing footer's bare-bones variant: brand + tagline). Only reads `subscriptions` when a user is present; never calls Whop.

```tsx
import { getServerMessages } from "@/lib/i18n/messages-server";
import { createClient } from "@/lib/supabase/server";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { PricingClient, type PricingCtaState } from "./PricingClient";

export const metadata = {
  title: "Bizko - Tarifs",
  description:
    "Compare Bizko Free et Bizko Pro. Services, reseaux, portfolio, videos et templates - choisis le plan qui te fait grandir.",
  alternates: {
    canonical: "/pricing",
  },
};

type SubRow = {
  plan?: string | null;
  status?: string | null;
};

export default async function PricingPage() {
  const msg = await getServerMessages();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let ctaState: PricingCtaState = "guest";
  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("profile_id", user.id)
      .maybeSingle();
    const row = sub && !Array.isArray(sub) ? (sub as SubRow) : null;
    const isPro =
      row?.plan === "pro" && (row.status === "active" || row.status === "trialing");
    ctaState = isPro ? "pro" : "free";
  }

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar msg={msg} />
      <PricingClient ctaState={ctaState} />

      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <span className="text-lg font-bold font-display text-gray-900 tracking-tight">Bizko</span>
          <p className="mt-2 text-sm text-gray-400">{msg.landing.footerTagline}</p>
        </div>
      </footer>
    </div>
  );
}
```

### Step 2: Verify it builds

Run: `npx tsc --noEmit`
Expected: no errors.

### Step 3: Commit

```bash
git add src/app/pricing/page.tsx
git commit -m "feat(pricing): public server page with auth-aware CTAs"
```

---

## Task 6: Add the "Tarifs" link to `LandingNavbar`

**Files:**
- Modify: `src/components/landing/LandingNavbar.tsx`

### Step 1: Update the props type and menu items

- In the `LandingNavbarProps` interface, add `navPricing` to the `landing` shape:
  `landing: { login: string; heroCta: string; navFeatures: string; navHowItWorks: string; navExamples: string; navFaq: string; navPricing: string };`
- In the `menuItems` array, add `{ name: msg.landing.navPricing, href: "/pricing" }` (a real route, not an anchor) at the end.

### Step 2: Verify it compiles

Run: `npx tsc --noEmit`
Expected: no errors.

### Step 3: Commit

```bash
git add src/components/landing/LandingNavbar.tsx
git commit -m "feat(landing): add pricing link to navbar"
```

---

## Task 7: Full verification

### Step 1: Run the full test suite

Run: `npx vitest run`
Expected: all test files pass (was 81 tests at plan time; now +4 from Task 1 = 85).

### Step 2: Typecheck

Run: `npx tsc --noEmit`
Expected: 0 errors.

### Step 3: Lint

Run: `npx eslint src/app/pricing src/lib/plans.ts src/lib/__tests__/plans.test.ts src/components/landing/LandingNavbar.tsx`
Expected: no output (clean).

### Step 4: Manual smoke (optional, dev server)

Run: `npm run dev` then open `http://localhost:3000/pricing`.
Expected: hero + table (8/15, 6/15, 9/30, 3/∞, 3 min/5 min, 200 MB/500 MB, 2/6), Pro column highlighted, monthly/yearly cards. Logged out → "Creer mon compte" links to `/signup?next=/pricing`. Logged-in free → checkout forms. Logged-in pro → "Gerer mon abonnement" to `/dashboard/subscription`.

### Step 5: Commit any residual changes + push

```bash
git status --short
git add -A
git commit -m "chore(pricing): final polish"   # only if there are real changes
git push origin master
```

---

## Out of scope (YAGNI)
- No changes to the auth/signup flow (email-verified users follow the normal onboarding; only Google OAuth honors `?next=/pricing`).
- No footer pricing link (navbar link only).
- No plan switching / portal work (that stays with the Whop manage_url from the prior task).
- `pricing.unlimited` is only used inside `PricingTable` as `∞`; the sentinel string is intentionally not user-visible.