import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createPostSchema,
  deletePostSchema,
  votePollSchema,
} from "../../src/lib/social/schemas.ts";
import { checkRateLimit } from "../../src/lib/security/rate-limiter.ts";
import {
  parseModerationResponse,
  MODERATION_REJECTED_MESSAGE,
} from "../../src/lib/social/moderation-ai.ts";

describe("Social Wall & Tertulia Integration Suite", () => {
  const userId = "c1234567-89ab-cdef-0123-456789abcdef";

  describe("Post Creation Schema & Poll Rules", () => {
    it("accepts valid text-only social post", () => {
      const parsed = createPostSchema.safeParse({
        body: "¡Este domingo todos al Molinón a animar al Real Sporting!",
      });
      assert.strictEqual(parsed.success, true);
    });

    it("accepts valid post with a 2 to 4 options poll", () => {
      const validPollPost = createPostSchema.safeParse({
        body: "¿Quién debería ser el delantero titular este fin de semana?",
        pollOptions: ["Campuzano", "Otero", "Dubasin"],
      });
      assert.strictEqual(validPollPost.success, true);
    });

    it("rejects post with a poll that has fewer than 2 options", () => {
      const invalidPoll = createPostSchema.safeParse({
        body: "¿Ganamos el derbi?",
        pollOptions: ["Sí"],
      });
      assert.strictEqual(invalidPoll.success, false);
      if (!invalidPoll.success) {
        assert.ok(invalidPoll.error.issues[0]?.message.includes("2"));
      }
    });

    it("rejects post with a poll exceeding 4 options", () => {
      const tooManyOptions = createPostSchema.safeParse({
        body: "¿Mejor jugador de la temporada?",
        pollOptions: ["Yáñez", "Rosas", "Insua", "Nacho Méndez", "Gaspar"],
      });
      assert.strictEqual(tooManyOptions.success, false);
    });

    it("rejects replies with invalid non-UUID parentId", () => {
      const invalidParent = createPostSchema.safeParse({
        body: "Respuesta de prueba",
        parentId: "not-a-valid-uuid",
      });
      assert.strictEqual(invalidParent.success, false);
    });
  });

  describe("Social Rate Limiting Protocol", () => {
    it("enforces sliding window rate limit on posting (5 posts per minute)", () => {
      const rateKey = `social_post_test_${Date.now()}_${userId}`;

      for (let i = 0; i < 5; i++) {
        const check = checkRateLimit({
          key: rateKey,
          limit: 5,
          windowMs: 60_000,
        });
        assert.strictEqual(check.allowed, true, `Post ${i + 1} should be permitted`);
      }

      const throttled = checkRateLimit({
        key: rateKey,
        limit: 5,
        windowMs: 60_000,
      });
      assert.strictEqual(throttled.allowed, false);
      assert.strictEqual(throttled.remaining, 0);
      assert.ok(throttled.retryAfterSeconds > 0);
    });
  });

  describe("AI Moderation Decision Parsing & Threat Categorization", () => {
    it("allows standard football passion and heated sporting debate", () => {
      const allowResponse = JSON.stringify({
        verdict: "allow",
        reason: "debate_futbolistico_normal",
      });
      const decision = parseModerationResponse(allowResponse);
      assert.strictEqual(decision.verdict, "allow");
    });

    it("blocks hate speech, racism, and violent threats strictly", () => {
      const blockResponse = JSON.stringify({
        verdict: "block",
        reason: "insulto_o_amenaza_grave",
      });
      const decision = parseModerationResponse(blockResponse);
      assert.strictEqual(decision.verdict, "block");
      assert.strictEqual(decision.reason, "insulto_o_amenaza_grave");
    });

    it("flags ambiguous or network-corrupted responses for human moderator review", () => {
      const malformedJson = "{ corrupted_data: ";
      const decision = parseModerationResponse(malformedJson);
      assert.strictEqual(decision.verdict, "flag");
      assert.strictEqual(decision.reason, "ai_invalid_response");
    });

    it("verifies the user-facing rejection message provides helpful guidance without technical noise", () => {
      assert.ok(MODERATION_REJECTED_MESSAGE.includes("normas de convivencia"));
    });
  });

  describe("Post Deletion & Poll Voting Schemas", () => {
    it("validates deletion payload requiring a non-empty postId", () => {
      const valid = deletePostSchema.safeParse({
        postId: "123e4567-e89b-12d3-a456-426614174000",
      });
      assert.strictEqual(valid.success, true);

      const invalid = deletePostSchema.safeParse({ postId: "" });
      assert.strictEqual(invalid.success, false);
    });

    it("validates poll voting requiring non-empty pollId and optionId", () => {
      const valid = votePollSchema.safeParse({
        pollId: "123e4567-e89b-12d3-a456-426614174000",
        optionId: "123e4567-e89b-12d3-a456-426614174001",
      });
      assert.strictEqual(valid.success, true);

      const invalid = votePollSchema.safeParse({
        pollId: "",
        optionId: "123e4567-e89b-12d3-a456-426614174001",
      });
      assert.strictEqual(invalid.success, false);
    });
  });
});
