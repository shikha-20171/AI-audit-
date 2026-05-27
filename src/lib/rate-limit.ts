const hits = new Map<string, number[]>();

export function checkRateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((stamp) => now - stamp < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return {
    allowed: recent.length <= limit,
    remaining: Math.max(0, limit - recent.length),
  };
}
