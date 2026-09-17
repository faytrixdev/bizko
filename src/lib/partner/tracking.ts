import { randomBytes } from "node:crypto";

export const REF_COOKIE_NAME = "bizko_ref";

export type ReferralSource = "partner_link" | "partner_profile";

export const PARTNER_CODE_PATTERN = /^[a-z0-9_]{3,60}_[a-z0-9]{4,8}$/;

export function isValidRefCode(code: string): boolean {
  return PARTNER_CODE_PATTERN.test(code);
}

export function generatePartnerCode(username: string): string {
  const slug = username
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 30);
  const suffix = randomBytes(3).toString("hex");
  return `${slug}_${suffix}`;
}

export function buildReferralLink(code: string, source?: "link" | "profile"): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
  const params = new URLSearchParams({ ref: code });
  if (source === "profile") {
    params.set("source", "profile");
  }
  return `${base}/?${params.toString()}`;
}

export function serializeRefCookieValue(v: { ref: string; source: ReferralSource }): string {
  return `${v.ref}|${v.source}`;
}

export function parseRefCookieValue(
  raw?: string | null
): { ref: string; source: ReferralSource } | null {
  if (!raw) return null;
  const [refPart, sourcePart] = raw.split("|");
  if (!refPart || !isValidRefCode(refPart)) return null;
  return {
    ref: refPart,
    source: sourcePart === "partner_profile" ? "partner_profile" : "partner_link",
  };
}