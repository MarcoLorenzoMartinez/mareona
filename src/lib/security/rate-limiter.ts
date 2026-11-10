/**
 * In-memory sliding window rate limiter designed for Server Actions.
 * Protects community posting, polling and predictions against automated flooding.
 */

export interface RateLimitOptions {
  readonly key: string;
  readonly limit: number;
  readonly windowMs: number;
}

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly retryAfterSeconds: number;
  readonly error?: string;
}

const rateLimitStore = new Map<string, number[]>();
let checkCounter = 0;

/**
 * Periodically prunes expired timestamps and idle keys to prevent memory leaks.
 */
function cleanupStore(now: number): void {
  for (const [key, timestamps] of rateLimitStore.entries()) {
    const valid = timestamps.filter((t) => now - t < 120_000);
    if (valid.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, valid);
    }
  }
}

/**
 * Evaluates whether an action key is permitted under the sliding window limit.
 *
 * @param options.key - Unique rate-limiting identity (e.g. `post_${userId}`).
 * @param options.limit - Maximum number of allowed requests in the time window.
 * @param options.windowMs - Sliding window duration in milliseconds.
 */
export function checkRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitOptions): RateLimitResult {
  const now = Date.now();

  checkCounter += 1;
  if (checkCounter % 100 === 0 || rateLimitStore.size > 500) {
    cleanupStore(now);
  }

  const existing = rateLimitStore.get(key) || [];
  const windowStart = now - windowMs;
  const recent = existing.filter((t) => t > windowStart);

  if (recent.length >= limit) {
    const oldestInWindow = recent[0];
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldestInWindow + windowMs - now) / 1000)
    );

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
      error: `Has realizado varias acciones muy rápido. Por favor, espera ${retryAfterSeconds} segundos.`,
    };
  }

  recent.push(now);
  rateLimitStore.set(key, recent);

  return {
    allowed: true,
    remaining: Math.max(0, limit - recent.length),
    retryAfterSeconds: 0,
  };
}

/**
 * Resets the in-memory store; intended strictly for unit test isolation.
 */
export function resetRateLimiter(): void {
  rateLimitStore.clear();
  checkCounter = 0;
}
