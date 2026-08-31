# Design: Admin Premium UI — Light Mode Élégant

**Date:** 2026-08-31
**Status:** Approved

## Goal

Transform the Bizko Analytics admin dashboard from a basic functional UI to a premium, elegant light-mode design inspired by Stripe/Notion dashboards.

## Design Principles

- **Light mode élégant** — white surfaces with depth via subtle shadows
- **Proper SVG icons** — replace emojis with Lucide React icons
- **Consistent spacing** — more air, larger touch targets
- **Subtle gradients** — on KPI cards and chart fills
- **Sophisticated sidebar** — active state with accent bar, not just background change

## Changes by Component

### Sidebar (`AdminSidebar.tsx`)
- Background: `bg-white` (solid, no transparency)
- Border: `border-r border-gray-100` (lighter)
- Nav items: Lucide icons, `rounded-xl`, active state = `bg-accent/5 text-accent` with left accent bar `border-l-2 border-accent`
- Inactive: `text-gray-500 hover:text-gray-900 hover:bg-gray-50`
- Logo area: clean, no "Analytics" label
- Bottom: "Retour à Bizko" with `ArrowLeft` icon

### Header (`AdminHeader.tsx`)
- Background: `bg-white/95 backdrop-blur-xl`
- Shadow: `shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)]`
- Period selector: slightly larger padding, active pill with `shadow-sm`
- Compare button: accent color when active

### KPI Cards (`KPICard.tsx`)
- Card: `bg-white rounded-2xl shadow-sm border border-gray-100 p-5`
- Value: `text-3xl font-bold tracking-tight text-gray-900`
- Label: `text-sm font-medium text-gray-500`
- Comparison badge: small pill with colored background (`bg-green-50 text-green-700` / `bg-red-50 text-red-600`)

### EmptyState (`EmptyState.tsx`)
- Circle: gradient background (`bg-gradient-to-br from-gray-50 to-gray-100`)
- Icon: `text-gray-400` Lucide icon
- Title: `text-base font-semibold`
- Description: `text-sm text-gray-500`

### Section Headers (in page content files)
- Pattern: small colored dot/bar + `text-sm font-semibold text-gray-700`
- Or: section label with subtle left border accent

### Charts (`OverviewCharts.tsx` + all chart pages)
- Chart wrapper: `bg-white rounded-2xl shadow-sm border border-gray-100 p-6`
- Area fills: gradient from color to transparent (using recharts `<defs><linearGradient>`)
- Tooltip: rounded-xl, shadow-lg, clean design
- Grid: lighter (`stroke="#f9fafb"`)

### Loading States
- Replace spinner with a pulsing skeleton or keep spinner but larger + accent-colored

### Data Tables (`DataTable.tsx`)
- Header: `bg-gray-50/50` with `border-b border-gray-200`
- Rows: `hover:bg-gray-50/80` transition
- Font: slightly larger, more padding

## Icon Library

Install `lucide-react` (tree-shakeable, ~0kb gzipped for individual icons).

Icons mapping for sidebar:
- Overview → `BarChart3`
- Temps réel → `Zap`
- Acquisition → `TrendingUp`
- Pages & contenu → `FileText`
- Événements → `Target`
- Funnel → `GitBranch`
- Rétention → `Users`
- Audience → `Globe`
- Technologie → `Smartphone`

## Files to Modify

1. `src/components/admin/KPICard.tsx`
2. `src/components/admin/EmptyState.tsx`
3. `src/components/admin/DataTable.tsx`
4. `src/components/admin/ComparisonBadge.tsx`
5. `src/app/admin/AdminSidebar.tsx`
6. `src/app/admin/AdminHeader.tsx`
7. `src/app/admin/OverviewContent.tsx`
8. `src/app/admin/OverviewCharts.tsx`
9. `src/app/admin/realtime/RealtimeContent.tsx`
10. `src/app/admin/acquisition/AcquisitionContent.tsx`
11. `src/app/admin/pages/PagesContent.tsx`
12. `src/app/admin/events/EventsContent.tsx`
13. `src/app/admin/funnels/FunnelsContent.tsx`
14. `src/app/admin/retention/RetentionContent.tsx`
15. `src/app/admin/audience/AudienceContent.tsx`
16. `src/app/admin/technology/TechnologyContent.tsx`

## What stays unchanged

- All data fetching logic (RPC calls, types, contexts)
- Layout structure (sidebar + header + main)
- Period selector logic
- Mobile menu behavior
- Error boundary
- AnalyticsTracker exclusion
