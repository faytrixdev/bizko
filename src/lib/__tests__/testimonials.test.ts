import { describe, it, expect } from "vitest";
import { isValidTestimonialInput, MAX_TESTIMONIAL_CONTENT } from "@/lib/testimonials";

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
  });
});
