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
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp?.trim() || "unknown";
  return ip;
}

function sweep(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Very small in-memory fixed-window rate limiter keyed by client IP + endpoint.
 * Suitable for a single server instance (e.g. one Vercel/Node lambda).
 * NOTE: not shared across instances/restarts — for multi-region/scale, move to
 * an external store (Upstash/Redis).
 */
export function rateLimit(
  request: NextRequest,
  options: RateLimitOptions
): { allowed: boolean; retryAfterSeconds: number } {
  sweep();

  const key = `${clientKey(request)}:${request.nextUrl.pathname}`;
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
