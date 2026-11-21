import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  getOfflineGameQueue,
  enqueueGameResult,
  removeQueuedGameEvents,
  clearOfflineGameQueue,
  processOfflineGameSync,
} from "../../src/lib/games/offline-sync-queue.ts";
import { syncOfflineGamesInputSchema } from "../../src/lib/games/offline-sync-types.ts";
import { verifyDailyGameWinProof } from "../../src/lib/games/offline-sync-verify.ts";
import { getChallengeForDate } from "../../src/lib/wordle/words.ts";
import { getTriviaForDate } from "../../src/lib/trivia/engine.ts";
import rawWhoAreYaPlayers from "../../src/data/who-are-ya/players.json" with { type: "json" };
import { getPlayerForDate } from "../../src/lib/who-are-ya/daily.ts";
import type { WhoAreYaPlayer } from "../../src/lib/who-are-ya/types.ts";

describe("Offline Game Sync Queue Suite", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    (globalThis as unknown as {
      window: {
        localStorage: Storage;
        dispatchEvent: (ev: Event) => boolean;
      };
    }).window = {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, String(value)),
        removeItem: (key: string) => {
          store.delete(key);
        },
        clear: () => store.clear(),
        key: () => null,
        length: store.size,
      },
      dispatchEvent: () => true,
    };
  });

  it("returns an empty queue when storage is vacant", () => {
    const queue = getOfflineGameQueue();
    assert.deepEqual(queue, []);
  });

  it("enqueues a game completion event with a unique id", () => {
    const event = enqueueGameResult({
      gameType: "wordle",
      challengeDate: "2026-11-10",
      won: true,
      score: 4,
      completedAt: "2026-11-10T12:00:00Z",
    });

    assert.ok(event.id);
    assert.equal(event.gameType, "wordle");
    assert.equal(event.won, true);

    const stored = getOfflineGameQueue();
    assert.equal(stored.length, 1);
    assert.equal(stored[0].id, event.id);
  });

  it("prevents overwriting daily challenge results once completed (anti-cheat)", () => {
    enqueueGameResult({
      gameType: "who_are_ya",
      challengeDate: "2026-11-10",
      won: false,
      score: 6,
      completedAt: "2026-11-10T11:00:00Z",
    });

    let stored = getOfflineGameQueue();
    assert.equal(stored.length, 1);
    assert.equal(stored[0].won, false);

    // Second attempt on the same date with answer revealed cannot overwrite the first loss
    const duplicate = enqueueGameResult({
      gameType: "who_are_ya",
      challengeDate: "2026-11-10",
      won: true,
      score: 3,
      completedAt: "2026-11-10T11:05:00Z",
    });

    stored = getOfflineGameQueue();
    assert.equal(stored.length, 1);
    assert.equal(stored[0].won, false);
    assert.equal(duplicate.won, false);
  });

  it("allows updating high scores in arcade mode (higher_lower)", () => {
    enqueueGameResult({
      gameType: "higher_lower",
      challengeDate: "2026-11-10",
      won: true,
      score: 4,
      completedAt: "2026-11-10T11:00:00Z",
    });

    let stored = getOfflineGameQueue();
    assert.equal(stored.length, 1);
    assert.equal(stored[0].score, 4);

    enqueueGameResult({
      gameType: "higher_lower",
      challengeDate: "2026-11-10",
      won: true,
      score: 9,
      completedAt: "2026-11-10T11:10:00Z",
    });

    stored = getOfflineGameQueue();
    assert.equal(stored.length, 1);
    assert.equal(stored[0].score, 9);
  });

  it("removes specified IDs from the queue upon sync confirmation", () => {
    const ev1 = enqueueGameResult({
      gameType: "wordle",
      challengeDate: "2026-11-09",
      won: true,
      completedAt: "2026-11-09T10:00:00Z",
    });
    const ev2 = enqueueGameResult({
      gameType: "trivia",
      challengeDate: "2026-11-10",
      won: true,
      completedAt: "2026-11-10T10:00:00Z",
    });

    assert.equal(getOfflineGameQueue().length, 2);
    removeQueuedGameEvents([ev1.id]);

    const remaining = getOfflineGameQueue();
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].id, ev2.id);
  });

  it("clears the entire offline queue safely", () => {
    enqueueGameResult({
      gameType: "higher_lower",
      challengeDate: "2026-11-10",
      won: true,
      score: 7,
      completedAt: "2026-11-10T10:00:00Z",
    });
    assert.equal(getOfflineGameQueue().length, 1);

    clearOfflineGameQueue();
    assert.equal(getOfflineGameQueue().length, 0);
  });

  it("processes queue through sync handler and retains failed items", async () => {
    const ev1 = enqueueGameResult({
      gameType: "wordle",
      challengeDate: "2026-11-08",
      won: true,
      completedAt: "2026-11-08T10:00:00Z",
    });
    const ev2 = enqueueGameResult({
      gameType: "trivia",
      challengeDate: "2026-11-08",
      won: true,
      completedAt: "2026-11-08T11:00:00Z",
    });

    // Simulate a partial sync handler that only acknowledges ev1
    const result = await processOfflineGameSync(async () => {
      return {
        success: true,
        syncedIds: [ev1.id],
      };
    });

    assert.equal(result.syncedCount, 1);
    assert.deepEqual(result.failedIds, [ev2.id]);

    const remaining = getOfflineGameQueue();
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].id, ev2.id);
  });

  it("validates offline sync payloads through Zod schema", () => {
    const validBatch = {
      events: [
        {
          id: "uuid-test-1",
          gameType: "wordle" as const,
          challengeDate: "2026-11-10",
          won: true,
          score: 4,
          completedAt: "2026-11-10T12:00:00Z",
        },
      ],
    };

    const parsed = syncOfflineGamesInputSchema.safeParse(validBatch);
    assert.equal(parsed.success, true);

    const invalidBatch = {
      events: [
        {
          id: "",
          gameType: "not_a_game",
        },
      ],
    };
    const invalidParsed = syncOfflineGamesInputSchema.safeParse(invalidBatch);
    assert.equal(invalidParsed.success, false);
  });

  it("verifies daily win proofs server-side and rejects forged events without valid proof", () => {
    const today = "2026-11-21";
    const wordleTarget = getChallengeForDate(today);
    const triviaTarget = getTriviaForDate(today);
    const wayTarget = getPlayerForDate(today, rawWhoAreYaPlayers as WhoAreYaPlayer[]);

    // Forged win without proof must be rejected
    assert.equal(
      verifyDailyGameWinProof(
        {
          id: "forged-1",
          gameType: "wordle",
          challengeDate: today,
          won: true,
          completedAt: "2026-11-21T10:00:00Z",
        },
        today
      ),
      false
    );

    // Wrong proof must be rejected
    assert.equal(
      verifyDailyGameWinProof(
        {
          id: "wrong-word",
          gameType: "wordle",
          challengeDate: today,
          won: true,
          proof: "ZZZZZ",
          completedAt: "2026-11-21T10:00:00Z",
        },
        today
      ),
      false
    );

    // Genuine wordle, trivia, and who_are_ya proofs pass
    assert.equal(
      verifyDailyGameWinProof(
        {
          id: "ok-wordle",
          gameType: "wordle",
          challengeDate: today,
          won: true,
          proof: wordleTarget.word,
          completedAt: "2026-11-21T10:00:00Z",
        },
        today
      ),
      true
    );

    assert.equal(
      verifyDailyGameWinProof(
        {
          id: "ok-trivia",
          gameType: "trivia",
          challengeDate: today,
          won: true,
          proof: triviaTarget.question.acceptedAnswers[0],
          completedAt: "2026-11-21T10:00:00Z",
        },
        today
      ),
      true
    );

    assert.equal(
      verifyDailyGameWinProof(
        {
          id: "ok-way",
          gameType: "who_are_ya",
          challengeDate: today,
          won: true,
          proof: String(wayTarget.bdfId),
          completedAt: "2026-11-21T10:00:00Z",
        },
        today
      ),
      true
    );
  });
});
