# Phase 3: Premium Card Styling Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update all 5 dashboard tab components to have premium-looking cards with better shadows, rounded corners, and hover states.

**Architecture:** Direct CSS class replacements across existing React components. No new dependencies or components.

**Tech Stack:** Tailwind CSS 4, React 19, Next.js 16

---

### Task 1: Update TabOverview.tsx

**Files:**
- Modify: `src/components/dashboard/TabOverview.tsx:19-44`

**Step 1: Read current file**

Read `src/components/dashboard/TabOverview.tsx` to understand current structure.

**Step 2: Update share card container**

Replace line 19:
```tsx
<div className="border border-gray-200 rounded-xl p-5">
```
With:
```tsx
<div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
```

**Step 3: Update share card title**

Replace line 20:
```tsx
<h2 className="font-semibold font-display text-sm text-gray-900">{t("dashboard.share")}</h2>
```
With:
```tsx
<h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">{t("dashboard.share")}</h2>
```

**Step 4: Update analytics card container**

Replace line 32:
```tsx
<div className="border border-gray-200 rounded-xl p-5">
```
With:
```tsx
<div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
```

**Step 5: Update analytics card title**

Replace line 33:
```tsx
<h2 className="font-semibold font-display text-sm text-gray-900">{t("dashboard.analytics")}</h2>
```
With:
```tsx
<h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">{t("dashboard.analytics")}</h2>
```

**Step 6: Commit changes**

```bash
git add src/components/dashboard/TabOverview.tsx
git commit -m "feat: premium card styling for TabOverview"
```

---

### Task 2: Update TabServices.tsx

**Files:**
- Modify: `src/components/dashboard/TabServices.tsx:24-43`

**Step 1: Read current file**

Read `src/components/dashboard/TabServices.tsx` to understand current structure.

**Step 2: Update main card container**

Replace line 24:
```tsx
<div className="border border-gray-200 rounded-xl p-5">
```
With:
```tsx
<div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
```

**Step 3: Update card title**

Replace line 25:
```tsx
<h2 className="font-semibold font-display text-sm text-gray-900">{t("dashboard.servicesTitle")} ({services.length}/8)</h2>
```
With:
```tsx
<h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">{t("dashboard.servicesTitle")} ({services.length}/8)</h2>
```

**Step 4: Update button styling**

Replace line 37:
```tsx
<button className="h-10 rounded-lg bg-[#FF6B35] text-white text-sm font-medium hover:bg-[#EA580C]">
```
With:
```tsx
<button className="h-10 rounded-lg bg-[#FF6B35] text-white text-sm font-medium hover:bg-[#EA580C] transition-all duration-200 hover:shadow-sm">
```

**Step 5: Note about service items**

Service items are rendered by `ServiceList` component (not in this file). No changes needed here.

**Step 6: Commit changes**

```bash
git add src/components/dashboard/TabServices.tsx
git commit -m "feat: premium card styling for TabServices"
```

---

### Task 3: Update TabPortfolio.tsx

**Files:**
- Modify: `src/components/dashboard/TabPortfolio.tsx:23-42`

**Step 1: Read current file**

Read `src/components/dashboard/TabPortfolio.tsx` to understand current structure.

**Step 2: Update main card container**

Replace line 23:
```tsx
<div className="border border-gray-200 rounded-xl p-5">
```
With:
```tsx
<div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
```

**Step 3: Update card title**

Replace line 25:
```tsx
<h2 className="font-semibold font-display text-sm text-gray-900">{t("dashboard.portfolioTitle")} ({portfolio.length}/9)</h2>
```
With:
```tsx
<h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">{t("dashboard.portfolioTitle")} ({portfolio.length}/9)</h2>
```

**Step 4: Note about portfolio images**

Portfolio images are rendered by `PortfolioGrid` component (not in this file). No changes needed here.

**Step 5: Commit changes**

```bash
git add src/components/dashboard/TabPortfolio.tsx
git commit -m "feat: premium card styling for TabPortfolio"
```

---

### Task 4: Update TabSocials.tsx

**Files:**
- Modify: `src/components/dashboard/TabSocials.tsx:21-58`

**Step 1: Read current file**

Read `src/components/dashboard/TabSocials.tsx` to understand current structure.

**Step 2: Update main card container**

Replace line 21:
```tsx
<div className="border border-gray-200 rounded-xl p-5">
```
With:
```tsx
<div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
```

**Step 3: Update card title**

Replace line 22:
```tsx
<h2 className="font-semibold font-display text-sm text-gray-900">{t("dashboard.socialsTitle")} ({socials.length}/6)</h2>
```
With:
```tsx
<h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">{t("dashboard.socialsTitle")} ({socials.length}/6)</h2>
```

**Step 4: Update social items styling**

Replace line 46:
```tsx
<div key={s.id} className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5">
```
With:
```tsx
<div key={s.id} className="flex items-center justify-between border border-gray-100 bg-gray-50/50 rounded-xl px-3 py-2.5">
```

**Step 5: Commit changes**

```bash
git add src/components/dashboard/TabSocials.tsx
git commit -m "feat: premium card styling for TabSocials"
```

---

### Task 5: Update TabSettings.tsx

**Files:**
- Modify: `src/components/dashboard/TabSettings.tsx:29-52`

**Step 1: Read current file**

Read `src/components/dashboard/TabSettings.tsx` to understand current structure.

**Step 2: Update main card container**

Replace line 29:
```tsx
<div className="border border-gray-200 rounded-xl p-5">
```
With:
```tsx
<div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
```

**Step 3: Update card title**

Replace line 30:
```tsx
<h2 className="font-semibold font-display text-sm text-gray-900">{t("dashboard.settingsTitle")}</h2>
```
With:
```tsx
<h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">{t("dashboard.settingsTitle")}</h2>
```

**Step 4: Update input styling**

Add `focus:ring-2 focus:ring-gray-900/10 transition-all duration-200` to all input/textarea/select elements. Example for line 35:
```tsx
<input name="display_name" defaultValue={profile.display_name} required placeholder={t("dashboard.namePlaceholder")} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
```
Should become:
```tsx
<input name="display_name" defaultValue={profile.display_name} required placeholder={t("dashboard.namePlaceholder")} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200" />
```

**Step 5: Update save button styling**

Replace line 48:
```tsx
<button className="h-10 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#EA580C] transition">
```
With:
```tsx
<button className="h-10 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#EA580C] transition-all duration-200 hover:shadow-sm active:scale-[0.98]">
```

**Step 6: Commit changes**

```bash
git add src/components/dashboard/TabSettings.tsx
git commit -m "feat: premium card styling for TabSettings"
```

---

### Task 6: Run lint and verify

**Step 1: Run lint**

```bash
npm run lint
```
Expected: No errors

**Step 2: Final commit if lint fixes needed**

```bash
git add -A
git commit -m "fix: lint errors after card styling updates"
```

**Step 3: Verify all changes**

Check that all 5 files have been updated with premium styling.

---

## Execution Handoff

Plan complete and saved to `docs/plans/2026-08-27-phase3-cards-implementation.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?