import test from "node:test";
import assert from "node:assert/strict";
import {
  sendDirectMessageSchema,
  openDirectConversationSchema,
} from "../../src/lib/social/direct-messages-schemas.ts";

test("sendDirectMessageSchema validates input correctly", () => {
  const valid = sendDirectMessageSchema.safeParse({
    conversationId: "123e4567-e89b-12d3-a456-426614174000",
    body: "¡Hola! ¿Irás al partido del Molinón este domingo?",
  });
  assert.equal(valid.success, true);
  if (valid.success) {
    assert.equal(valid.data.body, "¡Hola! ¿Irás al partido del Molinón este domingo?");
  }

  // Rejects empty body
  const empty = sendDirectMessageSchema.safeParse({
    conversationId: "123e4567-e89b-12d3-a456-426614174000",
    body: "   ",
  });
  assert.equal(empty.success, false);

  // Rejects invalid UUID
  const invalidUuid = sendDirectMessageSchema.safeParse({
    conversationId: "not-a-uuid",
    body: "Mensaje de prueba",
  });
  assert.equal(invalidUuid.success, false);

  // Rejects message exceeding 2000 characters
  const tooLong = sendDirectMessageSchema.safeParse({
    conversationId: "123e4567-e89b-12d3-a456-426614174000",
    body: "a".repeat(2001),
  });
  assert.equal(tooLong.success, false);
});

test("openDirectConversationSchema validates UUID correctly", () => {
  const valid = openDirectConversationSchema.safeParse({
    targetUserId: "123e4567-e89b-12d3-a456-426614174000",
  });
  assert.equal(valid.success, true);

  const invalid = openDirectConversationSchema.safeParse({
    targetUserId: "invalid-user-id",
  });
  assert.equal(invalid.success, false);
});
