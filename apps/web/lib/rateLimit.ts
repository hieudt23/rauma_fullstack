import type { NextRequest } from "next/server";

interface Bucket {
  count: number;
  resetAt: number;
}

// In-memory fixed-window counter. Good enough for a single-instance deployment;
// if this app ever runs multi-instance, swap for a shared store (e.g. Redis).
const buckets = new Map<string, Bucket>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Returns true if the request is allowed, false if the caller (IP + route key)
 * has exceeded `limit` requests within `windowMs`.
 */
export function checkRateLimit(
  req: NextRequest,
  routeKey: string,
  limit: number,
  windowMs: number
): boolean {
  const key = `${routeKey}:${getClientIp(req)}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}

// Periodic cleanup so the map doesn't grow unbounded over a long-running process.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();
