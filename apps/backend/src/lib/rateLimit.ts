interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Counts an attempt for `key` in a fixed window. In-memory, so it limits one server
 * instance; put a shared store behind it when the backend runs on several.
 * @param key - what is being limited (e.g. client IP + username).
 * @param limit - attempts allowed per window.
 * @param windowMs - window length in milliseconds.
 * @param now - current time, overridable for tests.
 * @returns whether this attempt is allowed.
 */
export function allowAttempt(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): boolean {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

/** Forgets every counter (tests). */
export function resetRateLimits(): void {
  buckets.clear();
}
