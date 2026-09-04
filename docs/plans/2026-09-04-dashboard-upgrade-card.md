# Dashboard Upgrade Card → Link to /pricing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the two direct checkout forms in the dashboard upgrade banner with a single "Passer a Pro" button linking to `/pricing`.

**Architecture:** Pure frontend change in `DashboardClient.tsx` (client component) + i18n key cleanup. The checkout forms calling `startSubscription` are removed from the dashboard; the pricing page becomes the single checkout entry point for free users.

**Tech Stack:** Next.js App Router, existing Tailwind + i18n (`useI18n`).

**Design doc:** `docs/plans/2026-09-04-dashboard-upgrade-card-design.md` (approved).

---

## Task 1: Swap checkout forms for a single `/pricing` link

**Files:**
- Modify: `src/app/dashboard/DashboardClient.tsx:144-163` (the two `<form>` blocks) and line 12 (import)

**Step 1: Remove the now-unused import**

At line 12, remove:
```ts
import { startSubscription } from "./actions";
```

**Step 2: Replace the button group**

Replace this block (lines 144-163):
```tsx
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                <form action={startSubscription} className="w-full sm:w-auto">
                  <input type="hidden" name="interval" value="yearly" />
                  <button
                    type="submit"
                    className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center h-9 px-5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors duration-200 whitespace-nowrap"
                  >
                    {t("dashboard.upgradeYearly")}
                  </button>
                </form>
                <form action={startSubscription} className="w-full sm:w-auto">
                  <input type="hidden" name="interval" value="monthly" />
                  <button
                    type="submit"
                    className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center h-9 px-5 rounded-xl bg-white text-violet-700 border border-violet-300 text-sm font-semibold hover:bg-violet-100 transition-colors duration-200 whitespace-nowrap"
                  >
                    {t("dashboard.upgradeMonthly")}
                  </button>
                </form>
              </div>
```

With:
```tsx
              <div className="w-full sm:w-auto">
                <Link
                  href="/pricing"
                  className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center h-9 px-5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors duration-200 whitespace-nowrap"
                >
                  {t("dashboard.upgradeCta")}
                </Link>
              </div>
```

(`Link` is already imported at line 4 and used elsewhere.)

**Step 3: Fix i18n keys**

In `messages/fr.json` and `messages/en.json`, inside the `dashboard` namespace (fr lines 297-300 / en mirror):
- Delete `"upgradeMonthly": "Mensuel - 2 500 FCFA"` (fr) / `"upgradeMonthly": "Monthly - 2,500 FCFA"` (en).
- Delete `"upgradeYearly": "Annuel - 20 000 FCFA"` (fr) / `"upgradeYearly": "Yearly - 20,000 FCFA"` (en).
- Add `"upgradeCta": "Passer a Pro"` (fr) and `"upgradeCta": "Go Pro"` (en) in their place.
- Keep `upgradeTitle` and `upgradeSubtitle` untouched.

**Step 4: Validate JSON**

Run:
```bash
Get-Content messages/fr.json -Raw | ConvertFrom-Json | ForEach-Object { Write-Output $_.dashboard.upgradeCta }
Get-Content messages/en.json -Raw | ConvertFrom-Json | ForEach-Object { Write-Output $_.dashboard.upgradeCta }
```
Expected: `Passer a Pro` and `Go Pro`, no parse errors.

**Step 5: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors (no unused-import error, no missing-key errors at runtime — tsc won't catch missing keys, JSON validation above does).

Run: `npx eslint src/app/dashboard/DashboardClient.tsx`
Expected: no output (clean). Confirms the removed import leaves no unused symbol.

Run: `npx vitest run`
Expected: all test files pass (86 tests) — no lib logic changed.

**Step 6: Commit**

```bash
git add src/app/dashboard/DashboardClient.tsx messages/fr.json messages/en.json
git commit -m "feat(dashboard): upgrade banner links to pricing page"
```

**Step 7: Push**

```bash
git push origin master
```

---

## Out of scope (YAGNI)
- No changes to `/pricing`, the `startSubscription` server action, or the subscription page.
- No price strings retained in the dashboard namespace (prices live only under `pricing.*`).
- No new routing/query-param logic.