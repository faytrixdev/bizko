import { describe, expect, it } from "vitest";
import {
  REF_COOKIE_NAME,
  isValidRefCode,
  generatePartnerCode,
  buildReferralLink,
  parseRefCookieValue,
  serializeRefCookieValue,
} from "@/lib/partner/tracking";

describe("partner tracking utils", () => {
  it("validates ref codes of the form username_x8k2", () => {
    expect(isValidRefCode("faytrix_x8k2")).toBe(true);
    expect(isValidRefCode("faytrix")).toBe(false);
    expect(isValidRefCode("a_xy")).toBe(false);
    expect(isValidRefCode("Faytrix_x8k2")).toBe(false);
  });

  it("generates codes as lowercase username + 6 alnum chars", () => {
    const code = generatePartnerCode("Faytrix");
    expect(code).toMatch(/^faytrix_[a-z0-9]{6}$/);
    expect(code).not.toBe(generatePartnerCode("Faytrix"));
  });

  it("builds a referral link with optional source", () => {
    expect(buildReferralLink("faytrix_x8k2")).toContain("ref=faytrix_x8k2");
    expect(buildReferralLink("faytrix_x8k2", "profile")).toContain("source=profile");
  });

  it("serializes and parses the ref cookie value", () => {
    const cookie = serializeRefCookieValue({ ref: "faytrix_x8k2", source: "partner_profile" });
    expect(cookie).toContain("faytrix_x8k2");
    expect(parseRefCookieValue(cookie)).toEqual({ ref: "faytrix_x8k2", source: "partner_profile" });
    expect(parseRefCookieValue("garbage")).toBeNull();
    expect(parseRefCookieValue("")).toBeNull();
  });

  it("exposes a stable cookie name", () => {
    expect(REF_COOKIE_NAME).toBe("bizko_ref");
  });
});