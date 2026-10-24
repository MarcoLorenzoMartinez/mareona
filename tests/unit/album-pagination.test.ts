import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CARDS_PER_PAGE,
  paginateCards,
  sortCardsChronologically,
  computeAlbumChapters,
} from "../../src/app/(main)/juegos/album/album-types.ts";
import { HISTORICAL_CARDS_SEED } from "../../src/lib/cards/seed-data.ts";

describe("Album Pagination & Chronological Suite", () => {
  it("guarantees every paginated page has exactly CARDS_PER_PAGE or fewer on the last page", () => {
    const pages = paginateCards(HISTORICAL_CARDS_SEED, CARDS_PER_PAGE);
    assert.strictEqual(pages.length, Math.ceil(HISTORICAL_CARDS_SEED.length / CARDS_PER_PAGE));

    for (let i = 0; i < pages.length - 1; i++) {
      assert.strictEqual(
        pages[i].length,
        CARDS_PER_PAGE,
        `Page ${i + 1} does not have exactly ${CARDS_PER_PAGE} cards`
      );
    }

    assert.ok(pages[pages.length - 1].length <= CARDS_PER_PAGE);
  });

  it("sorts historical cards chronologically from origins through recent eras", () => {
    const sorted = sortCardsChronologically(HISTORICAL_CARDS_SEED);
    assert.strictEqual(sorted.length, 522);

    // Escudos and identity at the front
    assert.strictEqual(sorted[0].kind, "crest");

    // Second chapter is moments (from card 19 onwards)
    assert.strictEqual(sorted[18].kind, "moment");

    // Last cards are modern players from the 2020s
    const lastCard = sorted[sorted.length - 1];
    assert.strictEqual(lastCard.decade, "2020s");
  });

  it("orders players within each era by position from goalkeepers to forwards with sequential IDs", () => {
    const sorted = sortCardsChronologically(HISTORICAL_CARDS_SEED);
    const players = sorted.filter((c) => c.kind === "player");
    const posRank: Record<string, number> = {
      goalkeeper: 1,
      defender: 2,
      midfielder: 3,
      forward: 4,
    };

    const decades = [...new Set(players.map((p) => p.decade))];
    for (const decade of decades) {
      const inDecade = players.filter((p) => p.decade === decade);
      for (let i = 1; i < inDecade.length; i++) {
        const prev = inDecade[i - 1];
        const curr = inDecade[i];
        const prevRank = posRank[prev.position ?? ""] ?? 99;
        const currRank = posRank[curr.position ?? ""] ?? 99;
        assert.ok(
          prevRank <= currRank,
          `In ${decade}, ${prev.knownAs} (${prev.position}) appeared after ${curr.knownAs} (${curr.position})`
        );
        assert.ok(
          prev.id < curr.id,
          `In ${decade}, expected sequential ID ordering: ${prev.id} < ${curr.id}`
        );
      }
    }
  });

  it("computes album chapters with contiguous valid page boundaries", () => {
    const sorted = sortCardsChronologically(HISTORICAL_CARDS_SEED);
    const pages = paginateCards(sorted, CARDS_PER_PAGE);
    const chapters = computeAlbumChapters(pages);

    assert.ok(chapters.length >= 6, "Expected at least 6 main historical chapters");
    assert.strictEqual(chapters[0].startPage, 1);
    assert.strictEqual(chapters[0].label, "Identidad");
    assert.strictEqual(chapters[0].endPage, 2);

    assert.strictEqual(chapters[1].label, "Momentos");
    assert.strictEqual(chapters[1].startPage, 3);
    assert.strictEqual(chapters[1].endPage, 4);

    assert.strictEqual(chapters[2].label, "Años 20");
    assert.strictEqual(chapters[2].startPage, 5);
    assert.strictEqual(chapters[2].endPage, 6);

    assert.strictEqual(chapters[chapters.length - 1].label, "Años 2020");

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      assert.ok(ch.startPage <= ch.endPage);
      if (i > 0) {
        assert.strictEqual(ch.startPage, chapters[i - 1].endPage + 1);
      }
    }
  });
});
