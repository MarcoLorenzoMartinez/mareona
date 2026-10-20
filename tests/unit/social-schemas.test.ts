import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createPostSchema } from "../../src/lib/social/schemas.ts";

describe("Social Schemas", () => {
  it("accepts a valid message between 1 and 500 characters", () => {
    const valid = { body: "Gran victoria hoy en El Molinón. ¡Puxa Sporting!" };
    const res = createPostSchema.safeParse(valid);
    assert.equal(res.success, true);
  });

  it("rejects an empty message or whitespace only", () => {
    const empty = { body: "   " };
    const res = createPostSchema.safeParse(empty);
    assert.equal(res.success, false);
    if (!res.success) {
      assert.match(res.error.issues[0].message, /no puede estar vacío/);
    }
  });

  it("rejects messages exceeding 500 characters", () => {
    const tooLong = { body: "A".repeat(501) };
    const res = createPostSchema.safeParse(tooLong);
    assert.equal(res.success, false);
    if (!res.success) {
      assert.match(res.error.issues[0].message, /no puede superar los 500 caracteres/);
    }
  });

  it("accepts optional parentId for threaded replies", () => {
    const reply = {
      body: "Totalmente de acuerdo contigo",
      parentId: "00000000-0000-4000-8000-000000000001",
    };
    const res = createPostSchema.safeParse(reply);
    assert.equal(res.success, true);
  });
});
