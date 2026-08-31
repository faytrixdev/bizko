# Bizko Analytics — Design Document

**Date**: 2026-08-31
**Status**: Approved

## Overview

Build a private admin analytics dashboard (`/admin`) for Bizko, inspired by Google Analytics. Server-side admin protection, real Supabase data, no mock values.

## Stack Additions

- `recharts` — charting library
- `date-fns` — date formatting for charts/periods

## Database

### Table: `analytics_events`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| user_id | uuid nullable | FK to auth.users |
| session_id | text | client-generated session ID |
| event_name | text | e.g. page_view, whatsapp_clicked |
| page_path | text | URL path |
| referrer | text | HTTP referer |
| user_agent | text | raw UA string |
| country | text nullable | from headers or lookup |
| device_type | text | mobile / desktop / tablet |
| browser | text | chrome, safari, etc. |
| os | text | windows, android, ios, etc. |
| utm_source | text nullable | |
| utm_medium | text nullable | |
| utm_campaign | text nullable | |
| utm_content | text nullable | |
| utm_term | text nullable | |
| metadata | jsonb | extra context per event |
| created_at | timestamptz | default now() |

Indexes: `(event_name, created_at)`, `(user_id, created_at)`, `(session_id)`, `(page_path, created_at)`

### Table: `analytics_sessions`

| Column | Type | Notes |
|---|---|---|
| id | text PK | session ID |
| user_id | uuid nullable | |
| started_at | timestamptz | |
| ended_at | timestamptz nullable | |
| landing_page | text | |
| referrer | text | |
| country | text nullable | |
| device_type | text | |
| browser | text | |
| os | text | |
| is_new_user | boolean | |

### Column: `profiles.is_admin`

Add `is_admin boolean default false` to profiles table.

### SQL Functions (RPC)

- `get_overview_kpis(p_start, p_end, p_prev_start, p_prev_end)` — all overview KPIs with period comparison
- `get_daily_stats(p_start, p_end)` — daily time series
- `get_realtime_stats()` — active sessions last 5 min
- `get_top_pages(p_start, p_end, p_limit)` — page rankings
- `get_acquisition_stats(p_start, p_end)` — traffic sources
- `get_event_stats(p_event, p_start, p_end)` — per-event breakdown
- `get_retention_cohorts()` — weekly cohort retention
- `get_device_stats(p_start, p_end)` — device/browser/OS
- `get_country_stats(p_start, p_end)` — geographic
- `get_funnel_stats(p_start, p_end)` — conversion funnel

All return aggregated data. Frontend never fetches raw events.

## Admin Protection

1. Add `is_admin` to profiles table
2. Middleware: on `/admin/*` routes, fetch profile, check `is_admin`, return 403 if false
3. No client-side-only guards

## Tracking Integration

Create `src/lib/analytics.ts` with `trackEvent()` helper.

Integration points:
- **Middleware** → `session_start`, `page_view` (on every navigation)
- **`/api/track-click`** → `whatsapp_clicked`, `external_link_clicked`
- **Auth signup** → `user_signed_up`
- **Onboarding complete** → `profile_completed`
- **Service creation** → `service_created`
- **Profile page** → `profile_viewed`
- **Service page** → `service_viewed`

## Frontend Routes

```
/admin                  → Overview (KPIs + charts)
/admin/realtime         → Real-time active users
/admin/acquisition      → Traffic sources + UTM
/admin/pages            → Page rankings + profiles + services
/admin/events           → Event explorer
/admin/funnels          → Conversion funnel
/admin/retention        → Cohort retention
/admin/audience         → Countries, DAU/WAU/MAU
/admin/technology       → Devices, browsers, OS
```

## Shared Components

- `AdminLayout` — sidebar + header with period selector
- `DateRangePicker` — preset periods + custom + comparison toggle
- `KPICard` — value + comparison badge
- `ComparisonBadge` — +x% / -x% with color
- `EmptyState` — "Pas encore de données"
- `DataTable` — sortable/paginated table

## Period Selector

Presets: Aujourd'hui, Hier, 7j, 30j, 90j, Personnalisé
Toggle: "Comparer à la période précédente"
Shows: current value + delta % vs previous period

## Design Principles

- Server Components by default, Client Components only where interactivity needed
- All data via Supabase RPC (server-side aggregation)
- No mock data — show "Pas encore de données" when empty
- Responsive, dark/light mode via existing CSS variables
- Privacy-first: no IPs, no passwords, anonymized user IDs
