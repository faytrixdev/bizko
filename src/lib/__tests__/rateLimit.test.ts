import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/rateLimit";

describe("checkRateLimit", () => {
  it("allows requests within the limit and denies afterwards", () => {
    const key = `rl-${Date.now()}-allow`;
    expect(checkRateLimit(key, { limit: 2, windowMs: 60_000 }).allowed).toBe(true);
    expect(checkRateLimit(key, { limit: 2, windowMs: 60_000 }).allowed).toBe(true);
    const res = checkRateLimit(key, { limit: 2, windowMs: 60_000 });
    expect(res.allowed).toBe(false);
    expect(res.retryAfterSeconds).toBeGreaterThan(0);
  });
  it("treats distinct keys independently", () => {
    const a = `rl-${Date.now()}-a`;
    const b = `rl-${Date.now()}-b`;
    expect(checkRateLimit(a, { limit: 1, windowMs: 60_000 }).allowed).toBe(true);
    expect(checkRateLimit(a, { limit: 1, windowMs: 60_000 }).allowed).toBe(false);
    expect(checkRateLimit(b, { limit: 1, windowMs: 60_000 }).allowed).toBe(true);
  });
});