/**
 * Simple in-memory fixed-window rate limiter.
 *
 * NOTE: state lives in module memory and is therefore PER SERVERLESS INSTANCE.
 * On platforms like Vercel each lambda/instance keeps its own counters, so this
 * is best-effort only and will not enforce a single global limit across the
 * fleet. For true distributed rate limiting use a shared store such as Upstash
 * or Redis.
 */

interface Bucket {
  count: number;
  resetAt: number; // epoch ms when the current window expires
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the window resets (0 when allowed). */
  retryAfter: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (existing.count < limit) {
    existing.count += 1;
    return { allowed: true, retryAfter: 0 };
  }

  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  return { allowed: false, retryAfter };
}
