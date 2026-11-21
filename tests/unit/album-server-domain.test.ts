import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ensureInitialAlbumSnapshot,
  applyOpenPackOnSnapshot,
  applyDailyLoginClaimOnSnapshot,
  applyDailyGameWinOnSnapshot,
  applyDailyGameClaimOnSnapshot,
  applyRecycleDuplicatesOnSnapshot,
  applyPorraRewardsOnSnapshot,
} from "../../src/lib/cards/album-server-domain.ts";
import { HISTORICAL_CARDS_SEED } from "../../src/lib/cards/seed-data.ts";

describe("Album Server Domain State Transitions", () => {
  it("initializes welcome packs when server snapshot is null", () => {
    const snap = ensureInitialAlbumSnapshot(null, "2026-11-21T10:00:00.000Z");
    assert.deepEqual(snap.packs, { aficionado: 1, rojiblanco: 1, leyenda: 0 });
    assert.equal(snap.revision, 1);
  });

  it("rejects opening a pack when server balance is zero", () => {
    const snap = ensureInitialAlbumSnapshot(null);
    const res = applyOpenPackOnSnapshot(snap, "leyenda", HISTORICAL_CARDS_SEED);
    assert.equal(res.ok, false);
    if (!res.ok) assert.equal(res.reason, "no_packs");
  });

  it("opens an available pack, decrements pack balance, and adds generated cards", () => {
    const snap = ensureInitialAlbumSnapshot(null);
    const res = applyOpenPackOnSnapshot(snap, "aficionado", HISTORICAL_CARDS_SEED, "2026-11-21T10:05:00.000Z");
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.cards.length, 2);
      assert.equal(res.snapshot.packs.aficionado, 0);
      assert.equal(res.snapshot.revision, 2);
      const totalOwned = Object.values(res.snapshot.cards).reduce((a, b) => a + b, 0);
      assert.equal(totalOwned, 2);
    }
  });

  it("claims daily login pack once per calendar day", () => {
    const snap = ensureInitialAlbumSnapshot(null);
    const first = applyDailyLoginClaimOnSnapshot(snap, "2026-11-21");
    assert.equal(first.ok, true);
    if (first.ok) {
      assert.equal(first.snapshot.packs.aficionado, 2);
      const second = applyDailyLoginClaimOnSnapshot(first.snapshot, "2026-11-21");
      assert.equal(second.ok, false);
      if (!second.ok) assert.equal(second.reason, "already_claimed");
    }
  });

  it("records daily game win and allows claiming the unlocked pack on the server", () => {
    const snap = ensureInitialAlbumSnapshot(null);
    const win = applyDailyGameWinOnSnapshot(snap, "2026-11-21");
    assert.equal(win.awarded, true);
    assert.equal(win.tier, "rojiblanco");
    assert.equal(win.streak, 1);

    const claim = applyDailyGameClaimOnSnapshot(win.snapshot, "2026-11-21");
    assert.equal(claim.ok, true);
    if (claim.ok) {
      assert.equal(claim.snapshot.packs.rojiblanco, 2);
      assert.equal(claim.snapshot.missions.lastGameClaimDate, "2026-11-21");
    }
  });

  it("recycles exactly 10 duplicates into 1 Sobre Rojiblanco", () => {
    const base = ensureInitialAlbumSnapshot(null);
    const withDups = {
      ...base,
      cards: {
        "quini-1979": 6, // 5 duplicates
        "joaquin-alonso-1985": 7, // 6 duplicates -> total 11 duplicates
      },
    };
    const res = applyRecycleDuplicatesOnSnapshot(withDups);
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.snapshot.packs.rojiblanco, 2);
      const remainingDups = Object.values(res.snapshot.cards).reduce(
        (acc, q) => acc + Math.max(0, q - 1),
        0
      );
      assert.equal(remainingDups, 1);
    }
  });

  it("credits Porra rewards authoritatively without double-claiming", () => {
    const base = ensureInitialAlbumSnapshot(null);
    const first = applyPorraRewardsOnSnapshot(base, [
      { matchId: "match-1", tier: "leyenda" },
      { matchId: "match-2", tier: "rojiblanco" },
    ]);
    assert.equal(first.addedCount, 2);
    assert.equal(first.snapshot.packs.leyenda, 1);
    assert.equal(first.snapshot.packs.rojiblanco, 2);

    const repeat = applyPorraRewardsOnSnapshot(first.snapshot, [
      { matchId: "match-1", tier: "leyenda" },
    ]);
    assert.equal(repeat.addedCount, 0);
    assert.equal(repeat.snapshot.packs.leyenda, 1);
  });
});
