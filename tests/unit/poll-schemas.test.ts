import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createPostSchema, votePollSchema } from "../../src/lib/social/schemas.ts";

describe("Poll Schemas Suite", () => {
  it("accepts post without poll options", () => {
    const res = createPostSchema.safeParse({
      body: "Debate sobre el partido del domingo",
    });
    assert.equal(res.success, true);
  });

  it("accepts post with 2 valid poll options", () => {
    const res = createPostSchema.safeParse({
      body: "¿Quién debe ser titular?",
      pollOptions: ["Otero", "Campuzano"],
    });
    assert.equal(res.success, true);
  });

  it("accepts post with up to 4 poll options", () => {
    const res = createPostSchema.safeParse({
      body: "¿Resultado en El Molinón?",
      pollOptions: ["1-0", "2-0", "2-1", "Empate"],
    });
    assert.equal(res.success, true);
  });

  it("rejects post with only 1 poll option", () => {
    const res = createPostSchema.safeParse({
      body: "Pregunta",
      pollOptions: ["Solo una"],
    });
    assert.equal(res.success, false);
  });

  it("rejects post with more than 4 poll options", () => {
    const res = createPostSchema.safeParse({
      body: "Pregunta",
      pollOptions: ["1", "2", "3", "4", "5"],
    });
    assert.equal(res.success, false);
  });

  it("rejects poll option with empty or whitespace string", () => {
    const res = createPostSchema.safeParse({
      body: "Pregunta",
      pollOptions: ["Válida", "   "],
    });
    assert.equal(res.success, false);
  });

  it("validates votePollSchema with pollId and optionId", () => {
    const valid = votePollSchema.safeParse({
      pollId: "poll-123",
      optionId: "opt-456",
    });
    assert.equal(valid.success, true);

    const invalid = votePollSchema.safeParse({
      pollId: "",
      optionId: "opt-456",
    });
    assert.equal(invalid.success, false);
  });
});
