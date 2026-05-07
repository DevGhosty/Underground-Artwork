type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();
const maxBuckets = 10_000;

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

function pruneExpired(now: number) {
  for (const [key, bucket] of store) {
    if (now >= bucket.resetAt) {
      store.delete(key);
    }
  }
}

function keepStoreBounded(now: number) {
  if (store.size < maxBuckets) return;
  pruneExpired(now);
  while (store.size >= maxBuckets) {
    const oldestKey = store.keys().next().value;
    if (oldestKey === undefined) return;
    store.delete(oldestKey);
  }
}

export function rateLimitTake(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  keepStoreBounded(now);
  let b = store.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    store.set(key, b);
  }
  if (b.count >= limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)) };
  }
  b.count += 1;
  return { ok: true };
}
