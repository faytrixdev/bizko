import { describe, it, expect } from "vitest";
import {
  getLimits,
  canAddService,
  canAddSocial,
  canAddPortfolioItem,
  canAddVideo,
  videoDurationLimitSec,
  videoSizeLimitBytes,
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
