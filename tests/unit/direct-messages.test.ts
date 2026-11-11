import test from "node:test";
import assert from "node:assert/strict";
import {
  sendDirectMessageSchema,
  openDirectConversationSchema,
  deleteDirectMessageSchema,
} from "../../src/lib/social/direct-messages-schemas.ts";
import {
  DM_AUDIT_REASON_PREFIX,
  USER_REPORT_REASON_PREFIX,
  REDACTED_DM_AUDIT_BODY,
  blockUserSchema,
  reportUserSchema,
  formatBlockedAttemptReason,
  formatUserReportAuditEntry,
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

test("blockUserSchema and reportUserSchema validate safety inputs properly", () => {
  const validBlock = blockUserSchema.safeParse({
    targetUserId: "123e4567-e89b-12d3-a456-426614174000",
  });
  assert.equal(validBlock.success, true);

  const invalidBlock = blockUserSchema.safeParse({
    targetUserId: "not-a-uuid",
  });
  assert.equal(invalidBlock.success, false);

  const validReport = reportUserSchema.safeParse({
    targetUserId: "123e4567-e89b-12d3-a456-426614174000",
    category: "threats",
    details: "Amenazas reiteradas por mensaje directo",
    conversationId: "123e4567-e89b-12d3-a456-426614174009",
    alsoBlock: true,
  });
  assert.equal(validReport.success, true);

  const invalidReportCategory = reportUserSchema.safeParse({
    targetUserId: "123e4567-e89b-12d3-a456-426614174000",
    category: "unknown_category",
  });
  assert.equal(invalidReportCategory.success, false);
});

test("DM legal custody & victim-consented report helpers handle visibility rules accurately", () => {
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

  // Un-reported private DMs are redacted in web panel
  const redacted = redactAuditBodyForWebPanel("Contenido privado sensible", dmReason);
  assert.equal(redacted, REDACTED_DM_AUDIT_BODY);

  // Victim-consented reports are visible to moderators for review
  const reportEntry = formatUserReportAuditEntry({
    reportedUsername: "infractor_gijon",
    reportedUserId: "123e4567-e89b-12d3-a456-426614174000",
    category: "harassment",
    details: "Insultos continuos",
    transcriptLines: ["[2026-11-11T01:00:00Z] @infractor_gijon: Mensaje ofensivo"],
  });
  assert.equal(reportEntry.reason.startsWith(USER_REPORT_REASON_PREFIX), true);
  assert.equal(isPrivateMessageAuditEntry(reportEntry.reason), false);
  assert.equal(
    redactAuditBodyForWebPanel(reportEntry.body, reportEntry.reason),
    reportEntry.body
  );
  assert.equal(reportEntry.body.includes("@infractor_gijon"), true);
});
