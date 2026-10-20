import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createMatchCommentSchema,
  submitMvpVoteSchema,
  submitPlayerRatingSchema,
} from "../../src/lib/match-community/schemas.ts";

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

    it("rejects vote with missing matchId or playerId", () => {
      const res = submitMvpVoteSchema.safeParse({
        matchId: "",
        playerId: "player-9",
      });
      assert.equal(res.success, false);
    });
  });

  describe("submitPlayerRatingSchema", () => {
    it("accepts ratings between 1 and 10", () => {
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
      assert.equal(res1.success, true);
      assert.equal(res10.success, true);
      assert.equal(res75.success, true);
    });

    it("rejects ratings below 1 or above 10", () => {
      const below = submitPlayerRatingSchema.safeParse({
        matchId: "match-789",
        targetId: "player-1",
        rating: 0,
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
});
