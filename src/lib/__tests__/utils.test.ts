import { describe, it, expect } from "vitest";
import { cn, normalizePhoneE164, buildWaLink, buildMainWaMessage, buildServiceWaMessage } from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});

describe("normalizePhoneE164", () => {
  it("adds + prefix", () => {
    expect(normalizePhoneE164("2250700000000")).toBe("+2250700000000");
  });
  it("converts 00 prefix", () => {
    expect(normalizePhoneE164("002250700000000")).toBe("+2250700000000");
  });
  it("keeps existing +", () => {
    expect(normalizePhoneE164("+2250700000000")).toBe("+2250700000000");
  });
  it("removes spaces and dashes", () => {
    expect(normalizePhoneE164("+225 07 00 00 00 00")).toBe("+2250700000000");
  });
});

describe("buildWaLink", () => {
  it("builds correct WhatsApp link", () => {
    const link = buildWaLink("+2250700000000", "Hello");
    expect(link).toBe("https://wa.me/2250700000000?text=Hello");
  });
  it("encodes message", () => {
    const link = buildWaLink("+2250700000000", "Salut, je suis intéressé");
    expect(link).toContain("text=Salut%2C%20je%20suis");
  });
});

describe("buildMainWaMessage", () => {
  it("includes display name", () => {
    const msg = buildMainWaMessage("Aminata");
    expect(msg).toContain("Aminata");
  });
});

describe("buildServiceWaMessage", () => {
  it("includes service title", () => {
    const msg = buildServiceWaMessage("Shooting photo");
    expect(msg).toContain("Shooting photo");
  });
  it("includes price when provided", () => {
    const msg = buildServiceWaMessage("Shooting photo", 50000, "XOF");
    expect(msg).toContain("50000 XOF");
  });
  it("omits price when null", () => {
    const msg = buildServiceWaMessage("Shooting photo", null);
    expect(msg).not.toContain("XOF");
  });
});