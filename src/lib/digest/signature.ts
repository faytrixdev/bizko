import { createHmac, timingSafeEqual } from "crypto";

export function signUnsubToken(profileId: string, secret: string): string {
  return createHmac("sha256", secret).update(profileId).digest("hex");
}

export function verifyUnsubToken(token: string, profileId: string, secret: string): boolean {
  const expected = signUnsubToken(profileId, secret);
  if (token.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}