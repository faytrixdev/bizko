import { describe, it, expect } from "vitest";
import { isValidTestimonialInput, MAX_TESTIMONIAL_CONTENT, MAX_TESTIMONIAL_NAME, MAX_TESTIMONIAL_ROLE } from "@/lib/testimonials";

describe("isValidTestimonialInput", () => {
  it("accepts a valid input", () => {
    expect(isValidTestimonialInput({ authorName: "Awa", content: "Superbe prestation!" })).toBe(true);
  });
  it("rejects empty author or content", () => {
    expect(isValidTestimonialInput({ authorName: "", content: "ok" })).toBe(false);
    expect(isValidTestimonialInput({ authorName: "Awa", content: " " })).toBe(false);
  });
  it("rejects content above limit", () => {
    expect(isValidTestimonialInput({ authorName: "Awa", content: "x".repeat(MAX_TESTIMONIAL_CONTENT + 1) })).toBe(false);
  });
  it("rejects rating out of 1..5", () => {
    expect(isValidTestimonialInput({ authorName: "Awa", content: "ok", rating: 6 })).toBe(false);
    expect(isValidTestimonialInput({ authorName: "Awa", content: "ok", rating: 0 })).toBe(false);
    expect(isValidTestimonialInput({ authorName: "Awa", content: "ok", rating: 5 })).toBe(true);
    expect(isValidTestimonialInput({ authorName: "Awa", content: "ok", rating: 1 })).toBe(true);
  });
  it("rejects rating NaN", () => {
    expect(isValidTestimonialInput({ authorName: "Awa", content: "ok", rating: NaN })).toBe(false);
  });
  it("accepts authorName at the limit", () => {
    expect(isValidTestimonialInput({ authorName: "a".repeat(MAX_TESTIMONIAL_NAME), content: "ok" })).toBe(true);
    expect(isValidTestimonialInput({ authorName: "a".repeat(MAX_TESTIMONIAL_NAME + 1), content: "ok" })).toBe(false);
  });
  it("accepts content at the limit", () => {
    expect(isValidTestimonialInput({ authorName: "Awa", content: "x".repeat(MAX_TESTIMONIAL_CONTENT) })).toBe(true);
  });
  it("handles authorRole edge cases", () => {
    expect(isValidTestimonialInput({ authorName: "Awa", content: "ok", authorRole: "" })).toBe(true);
    expect(isValidTestimonialInput({ authorName: "Awa", content: "ok", authorRole: "   " })).toBe(true);
    expect(isValidTestimonialInput({ authorName: "Awa", content: "ok", authorRole: "f".repeat(MAX_TESTIMONIAL_ROLE + 1) })).toBe(false);
    expect(isValidTestimonialInput({ authorName: "Awa", content: "ok", authorRole: "Fondatrice" })).toBe(true);
  });
});
