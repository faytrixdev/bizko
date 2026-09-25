import type { NextRequest } from "next/server";

interface Bucket {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  /** Maximum number of requests allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

const buckets = new Map<string, Bucket>();

function clientKey(request: NextRequest): string {
  // `x-real-ip` est posé par la plateforme (Vercel) et n'est pas influençable
  // par le client. À défaut, on prend le DERNIER maillon de `x-forwarded-for`
  // (le plus proche de notre infrastructure) : le premier maillon peut être
  // forgé par l'appelant, ce qui permettait de contourner la limite en
  // changeant d'en-tête à chaque requête.
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);
    const last = hops[hops.length - 1];
    if (last) return last;
  }

  return "unknown";
}

function sweep(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Very small in-memory fixed-window rate limiter keyed by an arbitrary string.
 * Suitable for a single server instance (e.g. one Vercel/Node lambda).
 * NOTE: not shared across instances/restarts — for multi-region/scale, move to
 * an external store (Upstash/Redis).
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): { allowed: boolean; retryAfterSeconds: number } {
  sweep();

  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= options.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function rateLimit(
  request: NextRequest,
  options: RateLimitOptions
): { allowed: boolean; retryAfterSeconds: number } {
  return checkRateLimit(`${clientKey(request)}:${request.nextUrl.pathname}`, options);
}
