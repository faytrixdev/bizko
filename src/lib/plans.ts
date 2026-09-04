export type Plan = "free" | "pro";

export type BillingInterval = "monthly" | "yearly";

export const BILLING_INTERVALS: BillingInterval[] = ["monthly", "yearly"];

export function isBillingInterval(value: string | null | undefined): value is BillingInterval {
  return value === "monthly" || value === "yearly";
}

export interface PlanLimits {
  services: number;
  socials: number;
  portfolioItems: number;
  videos: number;
  templates: number;
}

const LIMITS: Record<Plan, PlanLimits> = {
  free: {
    services: 8,
    socials: 6,
    portfolioItems: 9,
    videos: 3,
    templates: 2,
  },
  pro: {
    services: 15,
    socials: 15,
    portfolioItems: 30,
    videos: Number.POSITIVE_INFINITY,
    templates: 6,
  },
};

export function getLimits(plan: Plan): PlanLimits {
  return LIMITS[plan] ?? LIMITS.free;
}

export function isPlan(plan: string | null | undefined): plan is Plan {
  return plan === "free" || plan === "pro";
}

export function canAddService(plan: Plan, current: number): boolean {
  return current < getLimits(plan).services;
}

export function canAddSocial(plan: Plan, current: number): boolean {
  return current < getLimits(plan).socials;
}

export function canAddPortfolioItem(plan: Plan, current: number): boolean {
  return current < getLimits(plan).portfolioItems;
}

export function canAddVideo(plan: Plan, currentVideos: number): boolean {
  return currentVideos < getLimits(plan).videos;
}

export function videoDurationLimitSec(plan: Plan): number {
  return plan === "pro" ? 300 : 180;
}

export function videoSizeLimitBytes(plan: Plan): number {
  return plan === "pro" ? 500 * 1024 * 1024 : 200 * 1024 * 1024;
}

export interface ComparisonRow {
  /** i18n key for the row label, e.g. "pricing.services" */
  labelKey: string;
  /** Display value for the Free column. `UNLIMITED_SENTINEL` is a sentinel the UI translates via the "pricing.unlimited" i18n key. */
  free: string;
  /** Display value for the Pro column (same sentinel rules as `free`). */
  pro: string;
}

const MIB = 1024 * 1024;

/** Sentinel used in `PLAN_COMPARISON` cells; the UI translates it via the "pricing.unlimited" i18n key. */
export const UNLIMITED_SENTINEL = "unlimited";

function capacityLabel(count: number): string {
  return Number.isFinite(count) ? String(count) : UNLIMITED_SENTINEL;
}

/**
 * The 7 differentiating rows between Free and Pro, derived from LIMITS and the
 * video constants so the pricing page can never drift from the real limits.
 */
export const PLAN_COMPARISON: ComparisonRow[] = [
  { labelKey: "pricing.rowServices", free: String(getLimits("free").services), pro: String(getLimits("pro").services) },
  { labelKey: "pricing.rowSocials", free: String(getLimits("free").socials), pro: String(getLimits("pro").socials) },
  { labelKey: "pricing.rowPortfolio", free: String(getLimits("free").portfolioItems), pro: String(getLimits("pro").portfolioItems) },
  { labelKey: "pricing.rowVideos", free: String(getLimits("free").videos), pro: capacityLabel(getLimits("pro").videos) },
  { labelKey: "pricing.rowVideoDuration", free: `${videoDurationLimitSec("free") / 60} min`, pro: `${videoDurationLimitSec("pro") / 60} min` },
  { labelKey: "pricing.rowVideoSize", free: `${videoSizeLimitBytes("free") / MIB} MB`, pro: `${videoSizeLimitBytes("pro") / MIB} MB` },
  { labelKey: "pricing.rowTemplates", free: String(getLimits("free").templates), pro: String(getLimits("pro").templates) },
];

/** True when a comparison cell is the "unlimited" sentinel. */
export function isUnlimited(value: string): boolean {
  return value === UNLIMITED_SENTINEL;
}

/** True when a subscription row represents an active (or trialing) Pro plan. */
export function isProPlan(
  plan: string | null | undefined,
  status: string | null | undefined,
): boolean {
  return plan === "pro" && (status === "active" || status === "trialing");
}
