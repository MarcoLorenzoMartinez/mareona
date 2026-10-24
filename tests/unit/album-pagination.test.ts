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
    assert.strictEqual(sorted.length, 500);

    // Escudos at the front
    assert.strictEqual(sorted[0].kind, "crest");

    // Moments and coaches towards the back
    const lastCard = sorted[sorted.length - 1];
    assert.ok(lastCard.kind === "moment" || lastCard.kind === "coach");
  });

  it("computes album chapters with contiguous valid page boundaries", () => {
    const sorted = sortCardsChronologically(HISTORICAL_CARDS_SEED);
    const pages = paginateCards(sorted, CARDS_PER_PAGE);
    const chapters = computeAlbumChapters(pages);

    assert.ok(chapters.length >= 6, "Expected at least 6 main historical chapters");
    assert.strictEqual(chapters[0].startPage, 1);

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      assert.ok(ch.startPage <= ch.endPage);
      if (i > 0) {
        assert.strictEqual(ch.startPage, chapters[i - 1].endPage + 1);
      }
    }
  });
});
