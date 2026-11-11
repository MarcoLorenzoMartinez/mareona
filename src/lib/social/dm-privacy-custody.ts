export type ModerationAuditChannel = "post" | "direct_message";

export const DM_AUDIT_REASON_PREFIX = "[DM_PRIVATE]";

export const REDACTED_DM_AUDIT_BODY =
  "[Mensaje privado protegido — Contenido íntegro en custodia legal bloqueada (art. 32 LOPDGDD) para requerimiento judicial]";

/**
 * Formats the moderation audit reason tag according to the communication channel.
 * Marks private direct messages explicitly while preserving the underlying safety reason.
 *
 * @param reason - Original moderation reason identifier.
 * @param channel - Whether the text originated in a public post or a private 1:1 DM.
 * @returns Tagged reason string stored in `blocked_post_attempts.reason`.
 */
export function formatBlockedAttemptReason(
  reason: string,
  channel: ModerationAuditChannel = "post"
): string {
  const cleanReason = reason.trim() || "policy_violation";
  if (channel === "direct_message") {
    return cleanReason.startsWith(DM_AUDIT_REASON_PREFIX)
      ? cleanReason
      : `${DM_AUDIT_REASON_PREFIX} ${cleanReason}`;
  }
  return cleanReason;
}

/**
 * Determines whether a recorded moderation audit entry originated from a private 1:1 message.
 *
 * @param reason - Stored moderation reason from `blocked_post_attempts`.
 * @returns True if the attempt belongs to a private direct message.
 */
export function isPrivateMessageAuditEntry(reason: string | null | undefined): boolean {
  if (!reason) return false;
  return reason.trimStart().startsWith(DM_AUDIT_REASON_PREFIX);
}

/**
 * Redacts the body of private direct messages when rendered in the web administration panel,
 * preventing casual inspection by moderators while the unredacted payload remains intact
 * in database legal custody (`service_role`) for judicial or law-enforcement warrants.
 *
 * @param body - Raw text stored in `blocked_post_attempts.body`.
 * @param reason - Stored moderation reason tag.
 * @returns Redacted placeholder for private DMs, or original body for public posts.
 */
export function redactAuditBodyForWebPanel(
  body: string,
  reason: string | null | undefined
): string {
  if (isPrivateMessageAuditEntry(reason)) {
    return REDACTED_DM_AUDIT_BODY;
  }
  return body;
}
