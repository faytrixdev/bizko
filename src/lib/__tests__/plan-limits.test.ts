import { describe, it, expect } from "vitest";
import { getLimits, canAddTestimonial, PLAN_COMPARISON, isUnlimited } from "../plans";

describe("canAddTestimonial", () => {
  it("allows free users up to 2 published testimonials", () => {
    expect(canAddTestimonial("free", 0)).toBe(true);
    expect(canAddTestimonial("free", 1)).toBe(true);
    expect(canAddTestimonial("free", 2)).toBe(false);
  });

  it("allows pro users unlimited testimonials", () => {
    expect(canAddTestimonial("pro", 0)).toBe(true);
    expect(canAddTestimonial("pro", 2)).toBe(true);
    expect(canAddTestimonial("pro", 100)).toBe(true);
  });
});

describe("getLimits – publishedTestimonials", () => {
  it("returns 2 for free and Infinity for pro", () => {
    expect(getLimits("free").publishedTestimonials).toBe(2);
    expect(getLimits("pro").publishedTestimonials).toBe(Infinity);
  });
});

describe("PLAN_COMPARISON – testimonials row", () => {
  it("includes a testimonials row with correct values", () => {
    const row = PLAN_COMPARISON.find((r) => r.labelKey === "pricing.rowTestimonials");
    expect(row).toBeDefined();
    expect(row!.free).toBe("2");
    expect(isUnlimited(row!.pro)).toBe(true);
  });
});
