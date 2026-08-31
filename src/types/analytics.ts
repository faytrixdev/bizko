// ─── Period & comparison ───────────────────────────────────────

export type PeriodPreset = "today" | "yesterday" | "7d" | "30d" | "90d" | "custom";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface PeriodState {
  preset: PeriodPreset;
  range: DateRange;
  compare: boolean;
}

// ─── KPI ───────────────────────────────────────────────────────

export interface KPIValue {
  current: number;
  previous: number;
}

export interface OverviewKPIs {
  active_users: KPIValue;
  new_users: KPIValue;
  returning_users: KPIValue;
  sessions: KPIValue;
  page_views: KPIValue;
  signups: KPIValue;
  profile_completed: KPIValue;
  services_created: KPIValue;
  profile_views: KPIValue;
  service_views: KPIValue;
  whatsapp_clicks: KPIValue;
  external_clicks: KPIValue;
  link_copies: KPIValue;
}

// ─── Daily chart data ──────────────────────────────────────────

export interface DailyStats {
  day: string;
  active_users: number;
  new_users: number;
  sessions: number;
  page_views: number;
  profile_views: number;
  service_views: number;
  whatsapp_clicks: number;
  external_clicks: number;
  signups: number;
}

// ─── Realtime ──────────────────────────────────────────────────

export interface RealtimeStats {
  active_sessions: number;
  active_users: number;
  pages: { page_path: string; views: number }[];
  recent_events: { event_name: string; page_path: string; created_at: string }[];
  devices: { device_type: string; cnt: number }[];
  countries: { country: string; cnt: number }[];
}

// ─── Pages ─────────────────────────────────────────────────────

export interface TopPage {
  page_path: string;
  views: number;
  unique_visitors: number;
  avg_duration_ms: number;
}

// ─── Acquisition ───────────────────────────────────────────────

export interface AcquisitionSource {
  source: string;
  sessions: number;
  users: number;
  signups: number;
}

export interface UTMCampaign {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  sessions: number;
  users: number;
}

export interface AcquisitionStats {
  by_source: AcquisitionSource[];
  utm_campaigns: UTMCampaign[];
}

// ─── Events ────────────────────────────────────────────────────

export interface EventStat {
  event_name: string;
  total: number;
  unique_users: number;
  sessions: number;
}

export interface EventDetail {
  total: number;
  unique_users: number;
  sessions: number;
  daily: { day: string; count: number }[];
}

// ─── Devices ───────────────────────────────────────────────────

export interface DeviceStats {
  devices: { device_type: string; cnt: number }[];
  browsers: { browser: string; cnt: number }[];
  os_list: { os: string; cnt: number }[];
}

// ─── Countries ─────────────────────────────────────────────────

export interface CountryStat {
  country: string;
  users: number;
  sessions: number;
  signups: number;
}

// ─── Funnel ────────────────────────────────────────────────────

export interface FunnelStep {
  name: string;
  count: number;
}

export interface FunnelData {
  step_name: string;
  unique_users: number;
  total_events: number;
}

// ─── Retention ─────────────────────────────────────────────────

export interface RetentionCohort {
  cohort_week: string;
  size: number;
  retention: { week_offset: number; retained: number; rate: number }[];
}

export interface RetentionCohortRow {
  cohort_week: string;
  cohort_size: number;
  week1_retention: number | null;
  week2_retention: number | null;
  week3_retention: number | null;
  week4_retention: number | null;
}

// ─── Device Stats (Technology page) ────────────────────────────

export interface DeviceStat {
  dimension: string;
  value: string;
  sessions: number;
  percentage: number;
}

// ─── Search ────────────────────────────────────────────────────

export interface SearchStats {
  total_searches: number;
  unique_users: number;
  top_queries: { query: string; cnt: number }[];
}

// ─── Legacy types (kept for backward compat) ───────────────────

export interface DailyEvent {
  day: string;
  views: number;
  clicks: number;
}

export interface ClickBucket {
  bucket: string;
  count: number;
}
