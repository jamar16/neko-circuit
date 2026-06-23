/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Trade-offs (documented, not hidden):
 * - Resets on server restart — acceptable for a single-server deploy.
 * - No cross-instance coordination — fine until you scale horizontally.
 * - Memory bounded by cleanup interval — stale entries are pruned every 60s.
 *
 * If/when you move to multi-instance hosting, swap this for upstash/ratelimit
 * or a Redis-backed solution. For now this stops the bot-flood scenario
 * Claude Code flagged without adding any external dependencies.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // epoch ms
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

// Prune stale entries every 60s to bound memory
let cleanupScheduled = false;
function scheduleCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;
  setInterval(() => {
    const now = Date.now();
    for (const store of stores.values()) {
      for (const [key, entry] of store.entries()) {
        if (now > entry.resetAt) store.delete(key);
      }
    }
  }, 60_000).unref?.();
}

export interface RateLimitConfig {
  /** Unique name for this limiter (e.g. 'subscribe', 'checkout') */
  name: string;
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given key (typically IP address).
 */
export function checkRateLimit(
  config: RateLimitConfig,
  key: string
): RateLimitResult {
  scheduleCleanup();

  if (!stores.has(config.name)) {
    stores.set(config.name, new Map());
  }
  const store = stores.get(config.name)!;
  const now = Date.now();
  const entry = store.get(key);

  // Window expired or first request — reset
  if (!entry || now > entry.resetAt) {
    const resetAt = now + config.windowSeconds * 1000;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.limit - 1, resetAt };
  }

  // Within window
  if (entry.count < config.limit) {
    entry.count++;
    return { allowed: true, remaining: config.limit - entry.count, resetAt: entry.resetAt };
  }

  // Over limit
  return { allowed: false, remaining: 0, resetAt: entry.resetAt };
}

/**
 * Extract a reasonable client identifier from a Request.
 * Prefers x-forwarded-for (common behind proxies), falls back to a constant.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can be "client, proxy1, proxy2" — take the first
    return forwarded.split(',')[0].trim();
  }
  // If no forwarded header, use a generic key (still limits per-endpoint globally)
  return 'unknown';
}
