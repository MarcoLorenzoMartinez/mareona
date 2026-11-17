import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createPostSchema, updatePostSchema } from "../../src/lib/social/schemas.ts";

describe("Social Schemas", () => {
  const sampleLineupTag = "<!--once:4-3-3|Yáñez*1*1145322*POR*50*88,Cote*3*189211*LI*12*72,Rober Pier*4*534120*DFC*38*72,Diego Sánchez*24*409211*DFC*62*72,Guille Rosas*2*1105432*LD*88*72,Nacho Martín*6*854312*MC*35*50,Lander*14*743219*MCD*50*58,Gelabert*25*998124*MC*65*50,Queipo*9*1142109*EI*18*28,Otero*18*674391*DC*50*22,Dubasin*19*1094321*ED*82*28-->";

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

  it("accepts 500 characters of written text with attached lineup", () => {
    const userText = "A".repeat(500);
    const postWithLineup = { body: `${userText}\n\n${sampleLineupTag}` };
    const res = createPostSchema.safeParse(postWithLineup);
    assert.equal(res.success, true);
  });

  it("rejects written text exceeding 500 characters even when lineup is attached", () => {
    const userText = "A".repeat(501);
    const postWithLineup = { body: `${userText}\n\n${sampleLineupTag}` };
    const res = createPostSchema.safeParse(postWithLineup);
    assert.equal(res.success, false);
    if (!res.success) {
      assert.match(res.error.issues[0].message, /no puede superar los 500 caracteres/);
    }
  });

  it("accepts post containing only attached lineup with empty commentary", () => {
    const lineupOnly = { body: sampleLineupTag };
    const res = createPostSchema.safeParse(lineupOnly);
    assert.equal(res.success, true);
  });

  it("accepts optional parentId for threaded replies", () => {
    const reply = {
      body: "Totalmente de acuerdo contigo",
      parentId: "00000000-0000-4000-8000-000000000001",
    };
    const res = createPostSchema.safeParse(reply);
    assert.equal(res.success, true);
  });

  describe("updatePostSchema", () => {
    it("accepts valid update within character limit", () => {
      const res = updatePostSchema.safeParse({
        postId: "post-123",
        body: "Texto corregido",
      });
      assert.equal(res.success, true);
    });

    it("rejects empty body update", () => {
      const res = updatePostSchema.safeParse({
        postId: "post-123",
        body: "   ",
      });
      assert.equal(res.success, false);
    });

    it("rejects missing postId", () => {
      const res = updatePostSchema.safeParse({
        postId: "",
        body: "Texto válido",
      });
      assert.equal(res.success, false);
    });

    it("accepts update with preserved lineup tag", () => {
      const res = updatePostSchema.safeParse({
        postId: "post-123",
        body: `Texto corregido\n\n${sampleLineupTag}`,
      });
      assert.equal(res.success, true);
    });
  });
});
