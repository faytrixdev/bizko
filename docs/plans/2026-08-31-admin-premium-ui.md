# Admin Premium UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Bizko Analytics admin dashboard from basic functional UI to premium light-mode elegant design (Stripe/Notion style).

**Architecture:** Pure visual changes — className updates + Lucide icon imports. Zero logic, data, or type changes. All existing RPC calls, contexts, and data flow remain identical.

**Tech Stack:** Tailwind CSS v4, Lucide React (new dependency), Recharts (existing)

---

### Task 1: Install lucide-react

**Files:**
- Modify: `package.json`

**Step 1: Install**

```bash
npm install lucide-react
```

**Step 2: Verify**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add lucide-react for admin icons"
```

---

### Task 2: Shared components — KPICard, ComparisonBadge, EmptyState, DataTable

**Files:**
- Modify: `src/components/admin/KPICard.tsx`
- Modify: `src/components/admin/ComparisonBadge.tsx`
- Modify: `src/components/admin/EmptyState.tsx`
- Modify: `src/components/admin/DataTable.tsx`

**KPICard.tsx** — new version:
```tsx
import { ComparisonBadge } from "./ComparisonBadge";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: number;
  previous: number;
  format?: "number" | "duration" | "percent";
  className?: string;
}

function formatValue(v: number, format: string): string {
  if (format === "duration") {
    const s = Math.round(v / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  }
  if (format === "percent") return `${v.toFixed(1)}%`;
  return v.toLocaleString("fr-FR");
}

export function KPICard({ label, value, previous, format = "number", className }: KPICardProps) {
  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border border-gray-100 p-5 transition-shadow hover:shadow-md", className)}>
      <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold tracking-tight text-gray-900">{formatValue(value, format)}</span>
        <ComparisonBadge current={value} previous={previous} />
      </div>
    </div>
  );
}
```

**ComparisonBadge.tsx** — new version:
```tsx
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";

export function ComparisonBadge({ current, previous, className }: { current: number; previous: number; className?: string }) {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent", className)}>
        <Sparkles className="w-3 h-3" />
        Nouveau
      </span>
    );
  }
  const pct = ((current - previous) / previous) * 100;
  const positive = pct >= 0;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
      positive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600",
      className
    )}>
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {positive ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
}
```

**EmptyState.tsx** — new version:
```tsx
import { BarChart3 } from "lucide-react";

export function EmptyState({ title = "Pas encore de données", description }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-5 ring-1 ring-gray-900/5">
        <BarChart3 className="w-10 h-10 text-gray-300" />
      </div>
      <p className="text-base font-semibold text-gray-900">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-2 max-w-sm">{description}</p>}
    </div>
  );
}
```

**DataTable.tsx** — update classes only:
- `<tr className="border-b border-gray-200">` → `<tr className="border-b border-gray-100 bg-gray-50/50">`
- `<th>` classes: add `first:pl-6 last:pr-6`
- `<td>` classes: add `first:pl-6 last:pr-6`
- `<tr>` row hover: `hover:bg-gray-50/80`
- Empty row: `py-12` instead of `py-8`

**Step: Commit**

```bash
git add src/components/admin/
git commit -m "feat(admin): premium shared components — KPICard, ComparisonBadge, EmptyState, DataTable"
```

---

### Task 3: Sidebar + Header

**Files:**
- Modify: `src/app/admin/AdminSidebar.tsx`
- Modify: `src/app/admin/AdminHeader.tsx`

**AdminSidebar.tsx** — key changes:
- Import Lucide icons: `BarChart3, Zap, TrendingUp, FileText, Target, GitBranch, Users, Globe, Smartphone, ArrowLeft`
- Replace emoji `icon: "📊"` etc. with `icon: BarChart3` (component reference)
- Sidebar background: `bg-white` (remove transparency)
- Border: `border-r border-gray-100`
- Nav item active: `bg-accent/5 text-accent border-l-2 border-accent` (accent bar)
- Nav item inactive: `text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl`
- Logo area: remove "Analytics" label, keep just Logo + back link
- Bottom "Retour": add `ArrowLeft` icon

**AdminHeader.tsx** — key changes:
- Shadow: `shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)]`
- Period selector active pill: `shadow-sm`
- Compare button active: `bg-accent text-white border-accent shadow-sm`

**Step: Commit**

```bash
git add src/app/admin/AdminSidebar.tsx src/app/admin/AdminHeader.tsx
git commit -m "feat(admin): premium sidebar with Lucide icons + refined header"
```

---

### Task 4: Overview page + Charts

**Files:**
- Modify: `src/app/admin/OverviewContent.tsx`
- Modify: `src/app/admin/OverviewCharts.tsx`

**OverviewContent.tsx** — key changes:
- Section headers: add small colored dot `w-1.5 h-1.5 rounded-full bg-accent` before the label
- Section header text: `text-sm font-semibold text-gray-700` (not uppercase/gray-400)
- KPI grid: `gap-4` instead of `gap-3`

**OverviewCharts.tsx** — key changes:
- Chart wrapper: `bg-white rounded-2xl shadow-sm border border-gray-100 p-6`
- Add `<defs>` with `<linearGradient>` for each area fill
- Grid stroke: `#f9fafb` (lighter)
- Tooltip: `contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 12 }}`
- Chart title: `text-base font-semibold text-gray-900`

**Step: Commit**

```bash
git add src/app/admin/OverviewContent.tsx src/app/admin/OverviewCharts.tsx
git commit -m "feat(admin): premium overview page with gradient charts"
```

---

### Task 5: All sub-pages (realtime, acquisition, pages, events, funnels, retention, audience, technology)

**Files:**
- Modify: `src/app/admin/realtime/RealtimeContent.tsx`
- Modify: `src/app/admin/acquisition/AcquisitionContent.tsx`
- Modify: `src/app/admin/pages/PagesContent.tsx`
- Modify: `src/app/admin/events/EventsContent.tsx`
- Modify: `src/app/admin/funnels/FunnelsContent.tsx`
- Modify: `src/app/admin/retention/RetentionContent.tsx`
- Modify: `src/app/admin/audience/AudienceContent.tsx`
- Modify: `src/app/admin/technology/TechnologyContent.tsx`

**Pattern for all pages:**
- Card wrappers: `bg-white rounded-2xl shadow-sm border border-gray-100 p-6`
- Page title: `text-xl font-bold tracking-tight text-gray-900`
- Page subtitle: `text-sm text-gray-500 mt-1`
- Section titles: `text-base font-semibold text-gray-900`
- Dividers: `border-gray-100` (lighter)
- Chart wrappers: same as OverviewCharts
- Funnel bars: use gradient fills
- Retention table: `rounded-2xl overflow-hidden`
- Technology stat rows: more padding, lighter dividers

**Step: Commit**

```bash
git add src/app/admin/realtime/ src/app/admin/acquisition/ src/app/admin/pages/ src/app/admin/events/ src/app/admin/funnels/ src/app/admin/retention/ src/app/admin/audience/ src/app/admin/technology/
git commit -m "feat(admin): premium styling across all sub-pages"
```

---

### Task 6: Final verification

**Step 1: TypeScript check**

```bash
npx tsc --noEmit
```

**Step 2: Lint**

```bash
npm run lint
```

**Step 3: Build**

```bash
npm run build
```

**Step 4: Commit if any fixes needed**

```bash
git add -A && git commit -m "fix(admin): UI polish fixes"
```
