// lib/rate-limit.ts
// Simple in-memory rate limiter for Next.js API routes

interface RateLimitConfig {
  windowMs: number;   // time window in ms
  maxRequests: number; // max requests per window
}

interface RequestRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RequestRecord>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (record.resetAt <= now) store.delete(key);
  }
}, 5 * 60 * 1000);

export function createRateLimiter(config: RateLimitConfig) {
  return function rateLimit(key: string): {
    success: boolean;
    remaining: number;
    resetAt: number;
  } {
    const now = Date.now();
    const record = store.get(key);

    if (!record || record.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + config.windowMs });
      return { success: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
    }

    if (record.count >= config.maxRequests) {
      return { success: false, remaining: 0, resetAt: record.resetAt };
    }

    record.count++;
    return { success: true, remaining: config.maxRequests - record.count, resetAt: record.resetAt };
  };
}

// Pre-configured limiters
export const apiLimiter        = createRateLimiter({ windowMs: 60_000, maxRequests: 60 });   // 60/min
export const authLimiter       = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });   // 10/min
export const checkoutLimiter   = createRateLimiter({ windowMs: 60_000, maxRequests: 5 });    // 5/min
export const verifyLimiter     = createRateLimiter({ windowMs: 3_600_000, maxRequests: 3 }); // 3/hour
export const ticketLimiter     = createRateLimiter({ windowMs: 3_600_000, maxRequests: 5 }); // 5/hour

// Helper to get IP from Next.js request
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");
  return (forwarded?.split(",")[0] || real || "unknown").trim();
}
