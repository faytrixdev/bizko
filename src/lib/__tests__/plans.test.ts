import { describe, it, expect } from "vitest";
import {
  getLimits,
  canAddService,
  canAddSocial,
  canAddPortfolioItem,
  canAddVideo,
  videoDurationLimitSec,
  videoSizeLimitBytes,
  PLAN_COMPARISON,
  isUnlimited,
  isProPlan,
} from "../plans";

describe("getLimits", () => {
  it("returns free limits", () => {
    const l = getLimits("free");
    expect(l.services).toBe(8);
    expect(l.socials).toBe(6);
    expect(l.portfolioItems).toBe(9);
    expect(l.videos).toBe(3);
    expect(l.templates).toBe(2);
  });

  it("returns pro limits", () => {
    const l = getLimits("pro");
    expect(l.services).toBe(15);
    expect(l.socials).toBe(15);
    expect(l.portfolioItems).toBe(30);
    expect(l.videos).toBe(Infinity);
    expect(l.templates).toBe(6);
  });

  it("treats unknown plan as free", () => {
    expect(getLimits("whatever" as "free" | "pro").services).toBe(8);
  });
});

describe("canAddService", () => {
  it("allows free users up to the limit", () => {
    expect(canAddService("free", 7)).toBe(true);
    expect(canAddService("free", 8)).toBe(false);
  });
  it("allows pro users up to their limit", () => {
    expect(canAddService("pro", 14)).toBe(true);
    expect(canAddService("pro", 15)).toBe(false);
  });
});

describe("canAddSocial", () => {
  it("allows free users up to the limit", () => {
    expect(canAddSocial("free", 5)).toBe(true);
    expect(canAddSocial("free", 6)).toBe(false);
  });
  it("allows pro users more", () => {
    expect(canAddSocial("pro", 14)).toBe(true);
    expect(canAddSocial("pro", 15)).toBe(false);
  });
});

describe("canAddPortfolioItem", () => {
  it("allows free users up to the limit", () => {
    expect(canAddPortfolioItem("free", 8)).toBe(true);
    expect(canAddPortfolioItem("free", 9)).toBe(false);
  });
  it("allows pro users up to 30", () => {
    expect(canAddPortfolioItem("pro", 29)).toBe(true);
    expect(canAddPortfolioItem("pro", 30)).toBe(false);
  });
});

describe("canAddVideo", () => {
  it("caps free users at 3 videos", () => {
    expect(canAddVideo("free", 2)).toBe(true);
    expect(canAddVideo("free", 3)).toBe(false);
  });
  it("allows pro users unlimited videos", () => {
    expect(canAddVideo("pro", 3)).toBe(true);
    expect(canAddVideo("pro", 300)).toBe(true);
  });
});

describe("videoDurationLimitSec", () => {
  it("limits free to 3 minutes and pro to 5 minutes", () => {
    expect(videoDurationLimitSec("free")).toBe(180);
    expect(videoDurationLimitSec("pro")).toBe(300);
  });
});

describe("videoSizeLimitBytes", () => {
  it("limits free to 200 MB and pro to 500 MB", () => {
    expect(videoSizeLimitBytes("free")).toBe(200 * 1024 * 1024);
    expect(videoSizeLimitBytes("pro")).toBe(500 * 1024 * 1024);
  });
});

describe("PLAN_COMPARISON", () => {
  it("exposes exactly the 7 differentiating rows in a stable order", () => {
    expect(PLAN_COMPARISON.map((r) => r.labelKey)).toEqual([
      "pricing.rowServices",
      "pricing.rowSocials",
      "pricing.rowPortfolio",
      "pricing.rowVideos",
      "pricing.rowVideoDuration",
      "pricing.rowVideoSize",
      "pricing.rowTemplates",
    ]);
  });

  it("derives capacities from LIMITS (no hardcoded drift)", () => {
    const by = (key: string) => PLAN_COMPARISON.find((r) => r.labelKey === key)!;
    expect(by("pricing.rowServices")).toMatchObject({ free: "8", pro: "15" });
    expect(by("pricing.rowSocials")).toMatchObject({ free: "6", pro: "15" });
    expect(by("pricing.rowPortfolio")).toMatchObject({ free: "9", pro: "30" });
    expect(by("pricing.rowTemplates")).toMatchObject({ free: "2", pro: "6" });
  });

  it("marks unlimited videos with the 'unlimited' sentinel", () => {
    const videos = PLAN_COMPARISON.find((r) => r.labelKey === "pricing.rowVideos")!;
    expect(videos.free).toBe("3");
    expect(videos.pro).toBe("unlimited");
  });

  it("formats video duration and size rows in minutes and MB", () => {
    const by = (key: string) => PLAN_COMPARISON.find((r) => r.labelKey === key)!;
    expect(by("pricing.rowVideoDuration")).toMatchObject({ free: "3 min", pro: "5 min" });
    expect(by("pricing.rowVideoSize")).toMatchObject({ free: "200 MB", pro: "500 MB" });
  });
});

describe("isUnlimited", () => {
  it("flags only the unlimited sentinel", () => {
    expect(isUnlimited("unlimited")).toBe(true);
    expect(isUnlimited("3")).toBe(false);
  });
});

describe("isProPlan", () => {
  it("is true only for active or trialing pro plans", () => {
    expect(isProPlan("pro", "active")).toBe(true);
    expect(isProPlan("pro", "trialing")).toBe(true);
  });

  it("is false for free plans, other statuses, and missing data", () => {
    expect(isProPlan("free", "active")).toBe(false);
    expect(isProPlan("pro", "canceled")).toBe(false);
    expect(isProPlan("pro", "past_due")).toBe(false);
    expect(isProPlan(null, null)).toBe(false);
    expect(isProPlan(undefined, "active")).toBe(false);
  });
});
