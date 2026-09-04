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
