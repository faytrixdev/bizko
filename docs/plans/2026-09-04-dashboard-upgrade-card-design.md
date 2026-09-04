# Dashboard upgrade card → link to /pricing

**Date:** 2026-09-04
**Status:** Approved (option A)

## Problem
The dashboard upgrade banner (`DashboardClient.tsx:137-166`) embeds two direct
checkout forms (yearly / monthly) calling `startSubscription`. Since the public
`/pricing` page now exists (comparison table + price cards with checkout), the
embedded forms are redundant, duplicate the price strings (2 500 / 20 000 FCFA)
in the dashboard, and give the user no value context before paying.

## Decision
Replace the two checkout forms in the dashboard upgrade banner with a single
violet button "Passer a Pro" that links to `/pricing`. The pricing page is the
single place where the visitor (free, logged-in) picks monthly/yearly and checks
out.

## Changes
- `src/app/dashboard/DashboardClient.tsx`: replace the two `<form action={startSubscription}>`
  blocks with one `<Link href="/pricing">` styled like the current yearly button
  (`bg-violet-600`, `h-9 px-5`, `rounded-xl`). Remove `startSubscription` import
  if it becomes unused in this file.
- i18n keys (fr + en):
  - Remove `dashboard.upgradeMonthly`, `dashboard.upgradeYearly`.
  - Add `dashboard.upgradeCta` = "Passer a Pro" (fr) / "Go Pro" (en).
- Price strings (`2 500 FCFA`, `20 000 FCFA`) now live ONLY in `pricing.*` keys.

## Non-goals
- No changes to `/pricing`, `startSubscription`, or the subscription page.
- No new routing/query params.