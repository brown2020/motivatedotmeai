export function createRateLimiter(limit: number, windowMs: number) {
  const buckets = new Map<string, number[]>();

  return {
    allow(key: string, now = Date.now()): boolean {
      const recent = (buckets.get(key) ?? []).filter((ts) => now - ts < windowMs);
      if (recent.length >= limit) {
        buckets.set(key, recent);
        return false;
      }
      recent.push(now);
      buckets.set(key, recent);
      return true;
    },
  };
}

/** 8 coaching requests per uid per 10 minutes, per server instance. */
export const aiInsightLimiter = createRateLimiter(8, 10 * 60 * 1000);
