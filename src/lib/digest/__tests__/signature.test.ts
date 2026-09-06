import { describe, it, expect } from "vitest";
import { signUnsubToken, verifyUnsubToken } from "../signature";

describe("signUnsubToken", () => {
  const secret = "test-secret";
  const profileId = "profile-123";

  it("returns a hex string", () => {
    const token = signUnsubToken(profileId, secret);
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for same inputs", () => {
    const t1 = signUnsubToken(profileId, secret);
    const t2 = signUnsubToken(profileId, secret);
    expect(t1).toBe(t2);
  });

  it("differs for different profileIds", () => {
    const t1 = signUnsubToken("profile-1", secret);
    const t2 = signUnsubToken("profile-2", secret);
    expect(t1).not.toBe(t2);
  });

  it("differs for different secrets", () => {
    const t1 = signUnsubToken(profileId, "secret-a");
    const t2 = signUnsubToken(profileId, "secret-b");
    expect(t1).not.toBe(t2);
  });
});

describe("verifyUnsubToken", () => {
  const secret = "test-secret";
  const profileId = "profile-123";

  it("returns true for valid token", () => {
    const token = signUnsubToken(profileId, secret);
    expect(verifyUnsubToken(token, profileId, secret)).toBe(true);
  });

  it("returns false for tampered token", () => {
    const token = signUnsubToken(profileId, secret);
    const tampered = token.slice(0, -1) + (token.slice(-1) === "a" ? "b" : "a");
    expect(verifyUnsubToken(tampered, profileId, secret)).toBe(false);
  });

  it("returns false for wrong profileId", () => {
    const token = signUnsubToken(profileId, secret);
    expect(verifyUnsubToken(token, "other-profile", secret)).toBe(false);
  });

  it("returns false for wrong secret", () => {
    const token = signUnsubToken(profileId, secret);
    expect(verifyUnsubToken(token, profileId, "wrong-secret")).toBe(false);
  });

  it("returns false for empty token", () => {
    expect(verifyUnsubToken("", profileId, secret)).toBe(false);
  });

  it("returns false for mismatched length (timing-safe)", () => {
    const shortToken = "a".repeat(32);
    expect(verifyUnsubToken(shortToken, profileId, secret)).toBe(false);
  });
});