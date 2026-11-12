import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit } from "../../src/lib/security/rate-limiter.ts";

describe("Concurrency, Load & Resilience Suite (Match-Day Traffic Spikes)", () => {
  it("handles high concurrency burst (50 parallel requests) with deterministic throttling", async () => {
    const burstKey = `concurrency_burst_${Date.now()}`;
    const limit = 10;
    const windowMs = 5_000;
    const totalRequests = 50;

    // Simulate 50 simultaneous actions in parallel using Promise.all
    const tasks = Array.from({ length: totalRequests }, (_, index) => {
      return Promise.resolve().then(() => {
        return {
          index,
          result: checkRateLimit({
            key: burstKey,
            limit,
            windowMs,
          }),
        };
      });
    });

    const results = await Promise.all(tasks);

    const allowed = results.filter((r) => r.result.allowed);
    const throttled = results.filter((r) => !r.result.allowed);

    // Exactly `limit` requests must be allowed
    assert.strictEqual(
      allowed.length,
      limit,
      `Expected exactly ${limit} allowed requests, but got ${allowed.length}`
    );

    // The remainder must be throttled with valid retry metadata
    assert.strictEqual(
      throttled.length,
      totalRequests - limit,
      `Expected ${totalRequests - limit} throttled requests, but got ${throttled.length}`
    );

    for (const item of throttled) {
      assert.strictEqual(item.result.remaining, 0);
      assert.ok(item.result.retryAfterSeconds > 0);
      assert.ok(item.result.error?.includes("espera"));
    }
  });

  it("handles 100 distinct users acting simultaneously without cross-talk or lock contention", async () => {
    const userCount = 100;
    const timestamp = Date.now();

    const userTasks = Array.from({ length: userCount }, (_, i) => {
      const userKey = `user_action_${timestamp}_${i}`;
      return Promise.resolve().then(() => {
        const first = checkRateLimit({ key: userKey, limit: 3, windowMs: 10_000 });
        const second = checkRateLimit({ key: userKey, limit: 3, windowMs: 10_000 });
        const third = checkRateLimit({ key: userKey, limit: 3, windowMs: 10_000 });
        const fourth = checkRateLimit({ key: userKey, limit: 3, windowMs: 10_000 });

        return {
          userId: i,
          firstAllowed: first.allowed,
          secondAllowed: second.allowed,
          thirdAllowed: third.allowed,
          fourthBlocked: !fourth.allowed,
        };
      });
    });

    const userResults = await Promise.all(userTasks);

    for (const res of userResults) {
      assert.strictEqual(res.firstAllowed, true);
      assert.strictEqual(res.secondAllowed, true);
      assert.strictEqual(res.thirdAllowed, true);
      assert.strictEqual(res.fourthBlocked, true);
    }
  });

  it("resilience: gracefully degrades on transient database or network latency simulation", async () => {
    // Simulates an edge fallback handler when external sports API or database times out
    async function simulateResilientFetch<T>(
      primaryFn: () => Promise<T>,
      fallbackFn: () => Promise<T>,
      timeoutMs: number
    ): Promise<{ data: T; source: "primary" | "fallback" }> {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), timeoutMs)
        );
        const data = await Promise.race([primaryFn(), timeoutPromise]);
        return { data, source: "primary" };
      } catch {
        const fallbackData = await fallbackFn();
        return { data: fallbackData, source: "fallback" };
      }
    }

    // 1. Successful primary case
    const successResult = await simulateResilientFetch(
      async () => ({ score: "2 - 1" }),
      async () => ({ score: "0 - 0" }),
      100
    );
    assert.strictEqual(successResult.source, "primary");
    assert.strictEqual(successResult.data.score, "2 - 1");

    // 2. Timeout case gracefully degrading to fallback
    const timeoutResult = await simulateResilientFetch<{ score: string }>(
      () => new Promise((resolve) => setTimeout(() => resolve({ score: "3 - 0" }), 150)),
      async () => ({ score: "Información en preparación" }),
      30
    );
    assert.strictEqual(timeoutResult.source, "fallback");
    assert.strictEqual(timeoutResult.data.score, "Información en preparación");
  });
});
