import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createMatchCommentSchema,
  submitMvpVoteSchema,
  submitPlayerRatingSchema,
} from "../../src/lib/match-community/schemas.ts";
import { applyMvpVoteTransition } from "../../src/lib/match-community/mvp.ts";
import { buildMatchRatingTargets } from "../../src/app/(main)/temporada/partidos/[id]/rating-targets.ts";
import type { DomainMatchDetail } from "../../src/lib/sports-api/types.ts";

describe("Match Community Schemas", () => {
  describe("createMatchCommentSchema", () => {
    it("validates valid comment input", () => {
      const valid = createMatchCommentSchema.safeParse({
        matchId: "match-123",
        body: "¡Gran primera parte en El Molinón!",
        parentId: null,
      });
      assert.equal(valid.success, true);
    });

    it("rejects empty comment or whitespace", () => {
      const empty = createMatchCommentSchema.safeParse({
        matchId: "match-123",
        body: "   ",
      });
      assert.equal(empty.success, false);
    });

    it("rejects comments exceeding 500 characters", () => {
      const longComment = createMatchCommentSchema.safeParse({
        matchId: "match-123",
        body: "a".repeat(501),
      });
      assert.equal(longComment.success, false);
    });
  });

  describe("submitMvpVoteSchema", () => {
    it("accepts valid MVP vote", () => {
      const res = submitMvpVoteSchema.safeParse({
        matchId: "match-456",
        playerId: "player-9",
      });
      assert.equal(res.success, true);
    });

    it("accepts valid MVP vote with previousPlayerId transfer", () => {
      const res = submitMvpVoteSchema.safeParse({
        matchId: "match-456",
        playerId: "player-9",
        previousPlayerId: "player-1",
      });
      assert.equal(res.success, true);
    });

    it("rejects vote with missing matchId or playerId", () => {
      const res = submitMvpVoteSchema.safeParse({
        matchId: "",
        playerId: "player-9",
      });
      assert.equal(res.success, false);
    });
  });

  describe("applyMvpVoteTransition", () => {
    it("adds 1 vote when user casts their first vote", () => {
      const initial = { "player-1": 5, "player-9": 8 };
      const updated = applyMvpVoteTransition(initial, "player-9", null);
      assert.equal(updated["player-9"], 9);
      assert.equal(updated["player-1"], 5);
    });

    it("transfers vote by subtracting 1 from previous candidate and adding 1 to new candidate", () => {
      const initial = { "player-1": 10, "player-9": 4 };
      const updated = applyMvpVoteTransition(initial, "player-9", "player-1");
      assert.equal(updated["player-1"], 9);
      assert.equal(updated["player-9"], 5);
      // Overall total remains constant
      const sumInitial = Object.values(initial).reduce((a, b) => a + b, 0);
      const sumUpdated = Object.values(updated).reduce((a, b) => a + b, 0);
      assert.equal(sumUpdated, sumInitial);
    });

    it("does not decrement below 0 if previous candidate had 0 votes", () => {
      const initial = { "player-1": 0 };
      const updated = applyMvpVoteTransition(initial, "player-9", "player-1");
      assert.equal(updated["player-1"], 0);
      assert.equal(updated["player-9"], 1);
    });
  });

  describe("submitPlayerRatingSchema", () => {
    it("accepts ratings between 0 and 10 (including 0 as No calificable)", () => {
      const res0 = submitPlayerRatingSchema.safeParse({
        matchId: "match-789",
        targetId: "player-1",
        rating: 0,
      });
      const res1 = submitPlayerRatingSchema.safeParse({
        matchId: "match-789",
        targetId: "player-1",
        rating: 1,
      });
      const res10 = submitPlayerRatingSchema.safeParse({
        matchId: "match-789",
        targetId: "coach",
        rating: 10,
      });
      const res75 = submitPlayerRatingSchema.safeParse({
        matchId: "match-789",
        targetId: "player-10",
        rating: 7.5,
      });
      assert.equal(res0.success, true);
      assert.equal(res1.success, true);
      assert.equal(res10.success, true);
      assert.equal(res75.success, true);
    });

    it("rejects ratings below 0 or above 10", () => {
      const below = submitPlayerRatingSchema.safeParse({
        matchId: "match-789",
        targetId: "player-1",
        rating: -1,
      });
      const above = submitPlayerRatingSchema.safeParse({
        matchId: "match-789",
        targetId: "player-1",
        rating: 10.5,
      });
      assert.equal(below.success, false);
      assert.equal(above.success, false);
    });
  });

  describe("buildMatchRatingTargets", () => {
    it("groups starters, subbed-in players and head coach properly", () => {
      const dummyMatch = {
        externalId: "match-999",
        status: "finished",
        homeLineup: {
          isSporting: true,
          starters: [
            { id: "p1", name: "Rubén Yáñez", jersey: 1, photoUrl: "/img/1.png" },
            { id: "p2", name: "Rosas", jersey: 2, photoUrl: "/img/2.png" },
          ],
          substitutes: [
            { id: "p12", name: "Queipo", jersey: 9, subbedIn: true, photoUrl: "/img/9.png" },
            { id: "p13", name: "Campuzano", jersey: 11, subbedIn: false },
          ],
        },
        advancedStats: {
          playerStats: {
            p1: { rating: 7.4 },
            p12: { rating: 6.8 },
          },
        },
      } as unknown as DomainMatchDetail;

      const result = buildMatchRatingTargets(dummyMatch);
      assert.equal(result.starters.length, 2);
      assert.equal(result.starters[0]?.name, "Rubén Yáñez");
      assert.equal(result.starters[0]?.averageRating, 7.4);

      // Only substitutes who subbed in are included
      assert.equal(result.substitutes.length, 1);
      assert.equal(result.substitutes[0]?.name, "Queipo");
      assert.equal(result.substitutes[0]?.averageRating, 6.8);

      // Head coach is assigned correctly
      assert.equal(result.coach.name, "Rubén Albés");
      assert.equal(result.coach.role, "coach");
    });
  });
});
