import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  checkRateLimit,
  resetRateLimiter,
} from "../../src/lib/security/rate-limiter.ts";

describe("Sliding Window Rate Limiter Suite", () => {
  beforeEach(() => {
    resetRateLimiter();
  });

  it("permits actions below the maximum limit", () => {
    const res1 = checkRateLimit({ key: "user_1", limit: 3, windowMs: 10_000 });
    assert.equal(res1.allowed, true);
    assert.equal(res1.remaining, 2);

    const res2 = checkRateLimit({ key: "user_1", limit: 3, windowMs: 10_000 });
    assert.equal(res2.allowed, true);
    assert.equal(res2.remaining, 1);

    const res3 = checkRateLimit({ key: "user_1", limit: 3, windowMs: 10_000 });
    assert.equal(res3.allowed, true);
    assert.equal(res3.remaining, 0);
  });

  it("blocks actions once the rate limit threshold is exceeded", () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit({ key: "user_spam", limit: 3, windowMs: 10_000 });
    }

    const blocked = checkRateLimit({ key: "user_spam", limit: 3, windowMs: 10_000 });
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.remaining, 0);
    assert.ok(blocked.retryAfterSeconds > 0);
    assert.match(blocked.error ?? "", /muy rápido/);
  });

  it("partitions limits independently by key", () => {
    for (let i = 0; i < 2; i++) {
      checkRateLimit({ key: "user_a", limit: 2, windowMs: 10_000 });
    }

    const userABlocked = checkRateLimit({ key: "user_a", limit: 2, windowMs: 10_000 });
    assert.equal(userABlocked.allowed, false);

    const userBAllowed = checkRateLimit({ key: "user_b", limit: 2, windowMs: 10_000 });
    assert.equal(userBAllowed.allowed, true);
  });
});
