import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  friendRequestSchema,
  respondFriendRequestSchema,
} from "../../src/lib/social/friendship-schemas.ts";

describe("Friendship Schemas", () => {
  it("accepts a valid UUID for addresseeId in friend request", () => {
    const validUuid = "123e4567-e89b-12d3-a456-426614174000";
    const result = friendRequestSchema.safeParse({ addresseeId: validUuid });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.addresseeId, validUuid);
    }
  });

  it("rejects non-uuid strings in friend request", () => {
    const result = friendRequestSchema.safeParse({ addresseeId: "not-a-uuid" });
    assert.equal(result.success, false);
  });

  it("validates respond request for accept and decline", () => {
    const validUuid = "123e4567-e89b-12d3-a456-426614174000";
    const acceptRes = respondFriendRequestSchema.safeParse({
      friendshipId: validUuid,
      action: "accept",
    });
    assert.equal(acceptRes.success, true);

    const declineRes = respondFriendRequestSchema.safeParse({
      friendshipId: validUuid,
      action: "decline",
    });
    assert.equal(declineRes.success, true);

    const invalidAction = respondFriendRequestSchema.safeParse({
      friendshipId: validUuid,
      action: "other",
    });
    assert.equal(invalidAction.success, false);
  });
});
