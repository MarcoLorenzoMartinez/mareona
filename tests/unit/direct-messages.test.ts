import test from "node:test";
import assert from "node:assert/strict";
import {
  sendDirectMessageSchema,
  openDirectConversationSchema,
  deleteDirectMessageSchema,
} from "../../src/lib/social/direct-messages-schemas.ts";
import {
  DM_AUDIT_REASON_PREFIX,
  REDACTED_DM_AUDIT_BODY,
  formatBlockedAttemptReason,
  isPrivateMessageAuditEntry,
  redactAuditBodyForWebPanel,
} from "../../src/lib/social/dm-privacy-custody.ts";

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

test("deleteDirectMessageSchema validates messageId and conversationId UUIDs", () => {
  const valid = deleteDirectMessageSchema.safeParse({
    messageId: "123e4567-e89b-12d3-a456-426614174001",
    conversationId: "123e4567-e89b-12d3-a456-426614174000",
  });
  assert.equal(valid.success, true);

  const invalidMessageId = deleteDirectMessageSchema.safeParse({
    messageId: "bad-id",
    conversationId: "123e4567-e89b-12d3-a456-426614174000",
  });
  assert.equal(invalidMessageId.success, false);

  const invalidConvId = deleteDirectMessageSchema.safeParse({
    messageId: "123e4567-e89b-12d3-a456-426614174001",
    conversationId: "bad-conv-id",
  });
  assert.equal(invalidConvId.success, false);
});

test("DM legal custody & audit privacy helpers tag and redact private messages properly", () => {
  const postReason = formatBlockedAttemptReason("insulto_grave", "post");
  assert.equal(postReason, "insulto_grave");
  assert.equal(isPrivateMessageAuditEntry(postReason), false);
  assert.equal(
    redactAuditBodyForWebPanel("Texto en muro público", postReason),
    "Texto en muro público"
  );

  const dmReason = formatBlockedAttemptReason("amenaza_detectada", "direct_message");
  assert.equal(dmReason, `${DM_AUDIT_REASON_PREFIX} amenaza_detectada`);
  assert.equal(isPrivateMessageAuditEntry(dmReason), true);

  // Web panel redacts private DM body while DB retains raw text for judicial custody
  const redacted = redactAuditBodyForWebPanel("Contenido privado sensible", dmReason);
  assert.equal(redacted, REDACTED_DM_AUDIT_BODY);
});
