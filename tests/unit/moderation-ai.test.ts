import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseModerationResponse } from "../../src/lib/social/moderation-ai.ts";

describe("parseModerationResponse", () => {
  it("accepts a valid verdict", () => {
    assert.deepEqual(parseModerationResponse('{"verdict":"block","reason":"insulto"}'), {
      verdict: "block",
      reason: "insulto",
    });
    assert.equal(parseModerationResponse('{"verdict":"allow"}').verdict, "allow");
  });

  it("degrades to flag on malformed or unknown output", () => {
    assert.equal(parseModerationResponse("not json").verdict, "flag");
    assert.equal(parseModerationResponse('{"verdict":"maybe"}').verdict, "flag");
    assert.equal(parseModerationResponse(null).verdict, "flag");
    assert.equal(parseModerationResponse("").reason, "ai_empty_response");
  });
});
