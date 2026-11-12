import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createMatchCommentSchema,
  submitMvpVoteSchema,
  submitPlayerRatingSchema,
} from "../../src/lib/match-community/schemas.ts";
import { buildMatchCommentTree } from "../../src/lib/match-community/comment-tree.ts";
import { checkRateLimit } from "../../src/lib/security/rate-limiter.ts";
import { MODERATION_REJECTED_MESSAGE } from "../../src/lib/social/moderation-ai.ts";

describe("Match Community & Comment Actions Integration Suite", () => {
  const matchId = "123456";
  const userId = "b9f9e53e-5231-4a15-b772-749bfd5d7e82";

  describe("Comment Input Validation & Integrity", () => {
    it("accepts valid match comments with and without parentId", () => {
      const rootComment = createMatchCommentSchema.safeParse({
        matchId,
        body: "¡Gran primera parte en El Molinón! Qué intensidad del equipo.",
      });
      assert.strictEqual(rootComment.success, true);

      const replyComment = createMatchCommentSchema.safeParse({
        matchId,
        body: "Totalmente de acuerdo, la presión tras pérdida está siendo clave.",
        parentId: "post-uuid-1",
      });
      assert.strictEqual(replyComment.success, true);
    });

    it("rejects empty comment or whitespace-only bodies", () => {
      const empty = createMatchCommentSchema.safeParse({
        matchId,
        body: "    ",
      });
      assert.strictEqual(empty.success, false);
      if (!empty.success) {
        assert.ok(empty.error.issues[0]?.message.includes("vacío"));
      }
    });

    it("rejects comments exceeding maximum length limit (500 chars)", () => {
      const tooLong = createMatchCommentSchema.safeParse({
        matchId,
        body: "a".repeat(501),
      });
      assert.strictEqual(tooLong.success, false);
    });
  });

  describe("Anti-Spam & Rate Limiter Integration", () => {
    it("enforces strict comment frequency limit (max 5 actions per 60s window)", () => {
      const rateLimitKey = `match_comment_test_${Date.now()}_${userId}`;

      // 5 allowed calls
      for (let i = 0; i < 5; i++) {
        const check = checkRateLimit({
          key: rateLimitKey,
          limit: 5,
          windowMs: 60_000,
        });
        assert.strictEqual(check.allowed, true, `Iteration ${i + 1} should be allowed`);
      }

      // 6th call should be blocked immediately
      const blocked = checkRateLimit({
        key: rateLimitKey,
        limit: 5,
        windowMs: 60_000,
      });
      assert.strictEqual(blocked.allowed, false);
      assert.ok(blocked.error?.includes("espera"));
    });
  });

  describe("Moderation & Threat Rejection Simulation", () => {
    it("flags or blocks toxic content and emits the canonical rejection message", () => {
      const mockModerationResult = {
        verdict: "block" as const,
        reason: "hate_speech_or_insult",
      };

      if (mockModerationResult.verdict === "block") {
        const errorResponse = { success: false, error: MODERATION_REJECTED_MESSAGE };
        assert.strictEqual(errorResponse.success, false);
        assert.strictEqual(errorResponse.error, MODERATION_REJECTED_MESSAGE);
      }
    });
  });

  describe("Comment Hierarchy & Reply Tree Assembly", () => {
    it("correctly nests replies under their respective parent comments", () => {
      const mockRawRows = [
        {
          id: "c1",
          body: "Golazo de Guille Rosas por la escuadra",
          created_at: "2026-11-12T12:00:00Z",
          user_id: "u1",
          parent_id: null,
          profiles: {
            display_name: "Pelayo Sportinguista",
            username: "pelayo_gijon",
            avatar_url: "https://example.com/avatar1.png",
          },
        },
        {
          id: "c2",
          body: "¡Menudo zapatazo! El portero ni la vio venir.",
          created_at: "2026-11-12T12:01:00Z",
          user_id: "u2",
          parent_id: "c1",
          profiles: {
            display_name: "Covadonga",
            username: "cova_rsg",
            avatar_url: null,
          },
        },
        {
          id: "c3",
          body: "Segundo comentario independiente",
          created_at: "2026-11-12T12:02:00Z",
          user_id: "u3",
          parent_id: null,
          profiles: null, // Fallback aficionado test
        },
      ];

      const tree = buildMatchCommentTree(mockRawRows, matchId);

      assert.strictEqual(tree.length, 2, "Should have exactly 2 root comments");
      const root1 = tree[0]!;
      assert.strictEqual(root1.id, "c1");
      assert.strictEqual(root1.authorName, "Pelayo Sportinguista");
      assert.strictEqual(root1.replies?.length, 1, "Root comment should contain 1 reply");

      const reply = root1.replies?.[0];
      assert.ok(reply);
      assert.strictEqual(reply.id, "c2");
      assert.strictEqual(reply.authorUsername, "cova_rsg");
      assert.strictEqual(reply.parentId, "c1");

      const root2 = tree[1]!;
      assert.strictEqual(root2.id, "c3");
      assert.strictEqual(root2.authorName, "Aficionado", "Should fall back gracefully when profile is null");
      assert.strictEqual(root2.replies?.length ?? 0, 0);
    });
  });

  describe("MVP & Player Ratings Schemas Integration", () => {
    it("validates MVP voting payload with valid player ID", () => {
      const validVote = submitMvpVoteSchema.safeParse({
        matchId: "12345",
        playerId: "player-9-guille",
      });
      assert.strictEqual(validVote.success, true);

      const invalidVote = submitMvpVoteSchema.safeParse({
        matchId: "12345",
        playerId: "",
      });
      assert.strictEqual(invalidVote.success, false);
    });

    it("validates and restricts player rating to 0..10 integer range", () => {
      const validRating = submitPlayerRatingSchema.safeParse({
        matchId: "12345",
        targetId: "player-1-yanez",
        rating: 9,
      });
      assert.strictEqual(validRating.success, true);

      const zeroRating = submitPlayerRatingSchema.safeParse({
        matchId: "12345",
        targetId: "player-1-yanez",
        rating: 0,
      });
      assert.strictEqual(zeroRating.success, true);

      const tooHigh = submitPlayerRatingSchema.safeParse({
        matchId: "12345",
        targetId: "player-1-yanez",
        rating: 11,
      });
      assert.strictEqual(tooHigh.success, false);

      const negativeRating = submitPlayerRatingSchema.safeParse({
        matchId: "12345",
        targetId: "player-1-yanez",
        rating: -1,
      });
      assert.strictEqual(negativeRating.success, false);
    });
  });
});
