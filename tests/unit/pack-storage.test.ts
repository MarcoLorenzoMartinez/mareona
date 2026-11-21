import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getTodayDateString,
  getPreviousDateString,
  computeActiveGameStreak,
  resolveStreakRewardTier,
  awardDailyGamePack,
  claimDailyGamePack,
  getDailyMissionState,
  DEFAULT_PACK_INVENTORY,
  DUPLICATES_RECIPE_COST,
  loadUserPackInventory,
  loadUserCardInventory,
  claimDailyLoginPack,
  migrateCardInventorySlugs,
} from "../../src/lib/cards/pack-storage.ts";
import {
  reconcileAccountAlbumState,
  type AccountAlbumSnapshot,
} from "../../src/lib/cards/account-sync.ts";
import {
  hasWonAnyDailyGameForDate,
  mergeSyncedGameStorageEntries,
} from "../../src/lib/cards/account-games-sync.ts";
import { switchGameStorageUser } from "../../src/lib/cards/account-storage-partition.ts";

describe("Pack Storage & Missions Logic", () => {
  it("formats dates as canonical YYYY-MM-DD", () => {
    const fixed = new Date(2026, 9, 29); // Oct 29, 2026
    const str = getTodayDateString(fixed);
    assert.equal(str, "2026-10-29");
  });

  it("provides canonical default pack inventory for new users", () => {
    assert.equal(DEFAULT_PACK_INVENTORY.aficionado, 1);
    assert.equal(DEFAULT_PACK_INVENTORY.rojiblanco, 1);
    assert.equal(DEFAULT_PACK_INVENTORY.leyenda, 0);
  });

  it("defines canonical recycling cost of 10 duplicates for 1 pack", () => {
    assert.equal(DUPLICATES_RECIPE_COST, 10);
  });

  it("requires session for packs inventory and returns 0 packs for guests", () => {
    const guestInventory = loadUserPackInventory(undefined);
    assert.equal(guestInventory.aficionado, 0);
    assert.equal(guestInventory.rojiblanco, 0);
    assert.equal(guestInventory.leyenda, 0);
  });

  it("returns empty card inventory for guests to prevent orphan cards", () => {
    const guestCards = loadUserCardInventory(undefined);
    assert.deepEqual(guestCards, {});
  });

  it("rejects claiming daily packs when user has not authenticated", () => {
    const claimResult = claimDailyLoginPack(undefined);
    assert.equal(claimResult.success, false);
    assert.equal(claimResult.reason, "auth_required");
  });

  it("provisions the 2 canonical welcome packs upon authenticated session initialization", () => {
    const userInventory = loadUserPackInventory("user-authenticated-123");
    assert.equal(userInventory.aficionado, 1);
    assert.equal(userInventory.rojiblanco, 1);
    assert.equal(userInventory.leyenda, 0);
  });

  it("migrates retired youth card slugs to their canonical replacement slugs preserving quantities", () => {
    const legacy = {
      "quini-1979": 2,
      "marcos-2022": 3,
      "trabanco-2020": 1,
      "arguelles-2020": 2,
    };
    const { inventory, migrated } = migrateCardInventorySlugs(legacy);
    assert.equal(migrated, true);
    assert.equal(inventory["quini-1979"], 2);
    assert.equal(inventory["mario-gonzalez-2024"], 3);
    assert.equal(inventory["pol-valentin-2022"], 1);
    assert.equal(inventory["perrin-2025"], 2);
    assert.equal("marcos-2022" in inventory, false);
    assert.equal("trabanco-2020" in inventory, false);
    assert.equal("arguelles-2020" in inventory, false);
  });

  it("computes previous calendar date accurately across months and years", () => {
    assert.equal(getPreviousDateString("2026-11-16"), "2026-11-15");
    assert.equal(getPreviousDateString("2026-03-01"), "2026-02-28");
    assert.equal(getPreviousDateString("2026-01-01"), "2025-12-31");
  });

  it("preserves active game streak for today and yesterday, and resets when a day is missed", () => {
    assert.equal(computeActiveGameStreak(undefined, undefined, "2026-11-16"), 0);
    assert.equal(computeActiveGameStreak("2026-11-16", 4, "2026-11-16"), 4);
    assert.equal(computeActiveGameStreak("2026-11-15", 4, "2026-11-16"), 4);
    assert.equal(computeActiveGameStreak("2026-11-14", 4, "2026-11-16"), 0);
  });

  it("resolves Sobre Rojiblanco on days 1-6 and upgrades to Sobre Leyenda every 7th day", () => {
    for (let day = 1; day <= 6; day++) {
      assert.equal(resolveStreakRewardTier(day), "rojiblanco");
    }
    assert.equal(resolveStreakRewardTier(7), "leyenda");
    assert.equal(resolveStreakRewardTier(8), "rojiblanco");
    assert.equal(resolveStreakRewardTier(14), "leyenda");
  });

  it("awards Sobre Leyenda on the 7th consecutive daily game and blocks historic archive dates", () => {
    const store = new Map<string, string>();
    const originalWindow = globalThis.window;

    Object.defineProperty(globalThis, "window", {
      value: {
        localStorage: {
          getItem: (k: string) => store.get(k) ?? null,
          setItem: (k: string, v: string) => store.set(k, v),
          removeItem: (k: string) => store.delete(k),
        },
        dispatchEvent: () => true,
      },
      configurable: true,
      writable: true,
    });

    try {
      const userId = "streak-tester-7d";
      const days = [
        "2026-11-10",
        "2026-11-11",
        "2026-11-12",
        "2026-11-13",
        "2026-11-14",
        "2026-11-15",
        "2026-11-16",
      ];

      // Days 1 to 6: award Sobre Rojiblanco and block duplicate claims on the same day
      for (let i = 0; i < 6; i++) {
        const day = days[i]!;
        const res = awardDailyGamePack(day, userId, day);
        assert.equal(res.awarded, true);
        assert.equal(res.tier, "rojiblanco");
        assert.equal(res.streak, i + 1);

        // Playing a second game on the same day must not grant an extra pack
        const secondGameSameDay = awardDailyGamePack(day, userId, day);
        assert.equal(secondGameSameDay.awarded, false);
        assert.equal(secondGameSameDay.reason, "already_claimed_today");
      }

      // Playing an archive date must be rejected
      const archiveAttempt = awardDailyGamePack("2026-11-01", userId, "2026-11-16");
      assert.equal(archiveAttempt.awarded, false);
      assert.equal(archiveAttempt.reason, "historic_archive");

      // Day 7: upgrades to Sobre Leyenda!
      const seventhDay = awardDailyGamePack("2026-11-16", userId, "2026-11-16");
      assert.equal(seventhDay.awarded, true);
      assert.equal(seventhDay.tier, "leyenda");
      assert.equal(seventhDay.streak, 7);

      const stateBeforeClaim = getDailyMissionState("2026-11-16", userId);
      assert.equal(stateBeforeClaim.gameStreak, 7);
      assert.equal(stateBeforeClaim.hasCompletedDailyGame, true);
      assert.equal(stateBeforeClaim.hasClaimedDailyGame, false);

      const claimRes = claimDailyGamePack(userId, "2026-11-16");
      assert.equal(claimRes.success, true);
      assert.equal(claimRes.tier, "leyenda");

      const stateAfterClaim = getDailyMissionState("2026-11-16", userId);
      assert.equal(stateAfterClaim.hasCompletedDailyGame, true);
      assert.equal(stateAfterClaim.hasClaimedDailyGame, true);

      // Skipping 2026-11-17 and playing on 2026-11-18 resets streak to 1
      const afterSkip = awardDailyGamePack("2026-11-18", userId, "2026-11-18");
      assert.equal(afterSkip.awarded, true);
      assert.equal(afterSkip.tier, "rojiblanco");
      assert.equal(afterSkip.streak, 1);
    } finally {
      Object.defineProperty(globalThis, "window", {
        value: originalWindow,
        configurable: true,
        writable: true,
      });
    }
  });

  it("reconciles PC and mobile album snapshots deterministically regardless of connection order", () => {
    const pcUnplayedSnapshot: AccountAlbumSnapshot = {
      cards: {},
      packs: { aficionado: 4, rojiblanco: 4, leyenda: 3 },
      missions: {},
      hasActivity: false,
      revision: 0,
      updatedAt: "2026-11-21T12:00:00.000Z",
    };

    const mobileActiveSnapshot: AccountAlbumSnapshot = {
      cards: { "escudo-oficial-1997": 1, "quini-1979": 2 },
      packs: { aficionado: 0, rojiblanco: 0, leyenda: 0 },
      missions: {
        lastLoginClaimDate: "2026-11-21",
        lastGameWinDate: "2026-11-21",
        gameStreak: 1,
        pendingGameRewardTier: "rojiblanco",
      },
      hasActivity: true,
      revision: 0,
      updatedAt: "2026-11-21T12:44:00.000Z",
    };

    // Order A: PC connects first, then mobile connects, then PC refreshes
    const serverAfterPcFirst = reconcileAccountAlbumState(null, pcUnplayedSnapshot, "reconcile");
    const serverAfterMobileSecond = reconcileAccountAlbumState(
      serverAfterPcFirst,
      mobileActiveSnapshot,
      "reconcile"
    );
    const pcSyncedView = reconcileAccountAlbumState(
      serverAfterMobileSecond,
      { ...serverAfterPcFirst },
      "reconcile"
    );

    assert.deepEqual(pcSyncedView.cards, { "escudo-oficial-1997": 1, "quini-1979": 2 });
    assert.deepEqual(pcSyncedView.packs, { aficionado: 0, rojiblanco: 0, leyenda: 0 });
    assert.equal(pcSyncedView.missions.lastLoginClaimDate, "2026-11-21");
    assert.equal(pcSyncedView.missions.lastGameWinDate, "2026-11-21");
    assert.equal(pcSyncedView.missions.gameStreak, 1);
    assert.equal(pcSyncedView.missions.pendingGameRewardTier, "rojiblanco");

    // Order B: Mobile connects first, then PC connects
    const serverAfterMobileFirst = reconcileAccountAlbumState(null, mobileActiveSnapshot, "reconcile");
    const serverAfterPcSecond = reconcileAccountAlbumState(
      serverAfterMobileFirst,
      pcUnplayedSnapshot,
      "reconcile"
    );

    assert.deepEqual(serverAfterPcSecond.cards, pcSyncedView.cards);
    assert.deepEqual(serverAfterPcSecond.packs, pcSyncedView.packs);
    assert.deepEqual(serverAfterPcSecond.missions, pcSyncedView.missions);
  });

  it("merges daily minigame boards, records, and porra rewards across devices", () => {
    const serverEntries = {
      mareona_wordle_v2_state_2026_11_21_invalid: "ignored",
      "mareona_wordle_v2_state_2026-11-21": JSON.stringify({
        date: "2026-11-21",
        word: "QUINI",
        guesses: ["GOLAZ"],
        status: "IN_PROGRESS",
      }),
      mareona_higher_lower_stats_v1: JSON.stringify({
        bestScoreByMode: { matches: 5, goals: 2, minutes: 8 },
        totalGamesPlayed: 4,
      }),
      mareona_porra_claimed_rewards_v1: JSON.stringify(["match-1"]),
    };

    const clientEntries = {
      "mareona_wordle_v2_state_2026-11-21": JSON.stringify({
        date: "2026-11-21",
        word: "QUINI",
        guesses: ["GOLAZ", "QUINI"],
        status: "WON",
      }),
      "mareona_trivia_2026-11-21": JSON.stringify({
        dateStr: "2026-11-21",
        isCorrect: true,
        userAnswer: "Quini",
      }),
      mareona_higher_lower_stats_v1: JSON.stringify({
        bestScoreByMode: { matches: 3, goals: 9, minutes: 4 },
        totalGamesPlayed: 7,
      }),
      mareona_porra_claimed_rewards_v1: JSON.stringify(["match-2"]),
    };

    const merged = mergeSyncedGameStorageEntries(serverEntries, clientEntries, "reconcile");

    assert.equal("mareona_wordle_v2_state_2026_11_21_invalid" in merged, false);
    const wordle = JSON.parse(merged["mareona_wordle_v2_state_2026-11-21"]!) as { status: string };
    assert.equal(wordle.status, "WON");

    const hl = JSON.parse(merged.mareona_higher_lower_stats_v1!) as {
      bestScoreByMode: { matches: number; goals: number; minutes: number };
      totalGamesPlayed: number;
    };
    assert.deepEqual(hl.bestScoreByMode, { matches: 5, goals: 9, minutes: 8 });
    assert.equal(hl.totalGamesPlayed, 7);

    const porraClaimed = JSON.parse(merged.mareona_porra_claimed_rewards_v1!) as string[];
    assert.deepEqual(porraClaimed, ["match-1", "match-2"]);
  });

  it("isolates localStorage game and lineup partitions when switching accounts on the same browser", () => {
    const store = new Map<string, string>();
    const originalWindow = globalThis.window;
    const originalLocalStorage = globalThis.localStorage;

    const mockStorage = {
      get length() {
        return store.size;
      },
      key: (idx: number) => Array.from(store.keys())[idx] ?? null,
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
      clear: () => store.clear(),
    };

    Object.defineProperty(globalThis, "localStorage", {
      value: mockStorage,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, "window", {
      value: {
        localStorage: mockStorage,
        dispatchEvent: () => true,
      },
      configurable: true,
      writable: true,
    });

    try {
      // Account A plays Wordle and saves a lineup
      switchGameStorageUser("user-a");
      mockStorage.setItem(
        "mareona_wordle_v2_state_2026-11-21",
        JSON.stringify({ date: "2026-11-21", word: "QUINI", guesses: ["QUINI"], status: "WON" })
      );
      mockStorage.setItem("mareona_lineup_state_v1", JSON.stringify({ formationKey: "4-3-3" }));

      // Sign out -> switches to guest partition; Account A keys must not be visible
      switchGameStorageUser(null);
      assert.equal(mockStorage.getItem("mareona_wordle_v2_state_2026-11-21"), null);
      assert.equal(mockStorage.getItem("mareona_lineup_state_v1"), null);

      // Sign in as Account B -> clean slate, zero leakage from Account A
      switchGameStorageUser("user-b");
      assert.equal(mockStorage.getItem("mareona_wordle_v2_state_2026-11-21"), null);
      mockStorage.setItem(
        "mareona_trivia_2026-11-21",
        JSON.stringify({ dateStr: "2026-11-21", isCorrect: false, userAnswer: "Test" })
      );

      // Switch back to Account A -> Account A's Wordle and lineup are restored, Account B's trivia is hidden
      switchGameStorageUser("user-a");
      assert.ok(mockStorage.getItem("mareona_wordle_v2_state_2026-11-21")?.includes("WON"));
      assert.ok(mockStorage.getItem("mareona_lineup_state_v1")?.includes("4-3-3"));
      assert.equal(mockStorage.getItem("mareona_trivia_2026-11-21"), null);

      // Guest -> Account merge (account wins on conflict, single-consume guest bucket)
      switchGameStorageUser(null);
      mockStorage.setItem(
        "mareona_wordle_v2_state_2026-11-21",
        JSON.stringify({ date: "2026-11-21", word: "QUINI", guesses: ["XXXXX"], status: "LOST" })
      );
      mockStorage.setItem(
        "mareona_trivia_2026-11-21",
        JSON.stringify({ dateStr: "2026-11-21", isCorrect: true, userAnswer: "Quini" })
      );

      // Guest signs in as Account A (who already WON Wordle today, but had no Trivia)
      const mergeOutcome = switchGameStorageUser("user-a");
      assert.equal(mergeOutcome.switched, true);
      assert.equal(mergeOutcome.absorbedGuest, true);
      // Account A's Wordle WON must NOT be overwritten by Guest's LOST
      assert.ok(mockStorage.getItem("mareona_wordle_v2_state_2026-11-21")?.includes("WON"));
      // Guest's Trivia (new to Account A) IS absorbed
      assert.ok(mockStorage.getItem("mareona_trivia_2026-11-21")?.includes("Quini"));
      assert.equal(
        hasWonAnyDailyGameForDate(
          {
            "mareona_trivia_2026-11-21": mockStorage.getItem("mareona_trivia_2026-11-21")!,
          },
          "2026-11-21"
        ),
        true
      );

      // Single-consume: signing out and into Account B must NOT see Guest's consumed entries
      switchGameStorageUser(null);
      assert.equal(mockStorage.getItem("mareona_trivia_2026-11-21"), null);
    } finally {
      Object.defineProperty(globalThis, "window", {
        value: originalWindow,
        configurable: true,
        writable: true,
      });
      Object.defineProperty(globalThis, "localStorage", {
        value: originalLocalStorage,
        configurable: true,
        writable: true,
      });
    }
  });
});
