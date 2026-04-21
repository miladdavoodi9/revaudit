// In-memory rate limiter — resets on server restart, good for single-instance deploys.
// Limits each IP to MAX_REQUESTS per WINDOW_MS.

const WINDOW_MS    = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 5;              // 5 audits per IP per hour

interface Entry { count: number; resetAt: number }

const store = new Map<string, Entry>();

// Prune expired entries periodically so the map doesn't grow unbounded
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, WINDOW_MS);

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || entry.resetAt <= now) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
