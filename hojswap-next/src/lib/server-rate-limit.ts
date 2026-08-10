type RateLimitEntry = { count: number; resetAt: number };

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;
const buckets = new Map<string, RateLimitEntry>();

export function consumeQuoteRequest(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const client = forwarded || request.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const existing = buckets.get(client);

  if (!existing || existing.resetAt <= now) {
    buckets.set(client, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (existing.count >= MAX_REQUESTS) return false;
  existing.count += 1;

  if (buckets.size > 10_000) {
    for (const [key, entry] of buckets) {
      if (entry.resetAt <= now) buckets.delete(key);
    }
  }

  return true;
}
