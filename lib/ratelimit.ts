/**
 * Fixed-window in-memory limiter. ponytail: per-process only, resets on restart and isn't shared across
 * instances. Fine for one container; swap for Redis if this ever scales out.
 */
const hits = new Map<string, { n: number; reset: number }>();

export function allow(key: string, max: number, windowMs: number, now = Date.now()): boolean {
  const h = hits.get(key);
  if (!h || now > h.reset) {
    if (hits.size > 5000) hits.clear(); // crude bound so a flood of keys can't grow memory forever
    hits.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  return ++h.n <= max;
}

/** Client IP as set by the reverse proxy. ponytail: trusts x-forwarded-for, so run behind nginx/Caddy that overwrites it. */
export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}
