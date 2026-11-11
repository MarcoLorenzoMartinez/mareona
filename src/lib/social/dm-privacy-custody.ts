import { z } from "zod";

export type ModerationAuditChannel = "post" | "direct_message" | "user_report";

export const DM_AUDIT_REASON_PREFIX = "[DM_PRIVATE]";
export const USER_REPORT_REASON_PREFIX = "[USER_REPORT]";

export const REDACTED_DM_AUDIT_BODY =
  "[Mensaje privado protegido — Contenido íntegro en custodia legal bloqueada (art. 32 LOPDGDD) para requerimiento judicial]";

export const REPORT_CATEGORIES = [
  { id: "harassment", label: "Acoso, insultos o coacciones" },
  { id: "threats", label: "Amenazas o incitación a la violencia" },
  { id: "spam_scam", label: "Spam, estafa o enlaces maliciosos" },
  { id: "impersonation", label: "Suplantación de identidad" },
  { id: "other", label: "Otro incumplimiento grave" },
] as const;

export type ReportCategoryId = (typeof REPORT_CATEGORIES)[number]["id"];

export const blockUserSchema = z.object({
  targetUserId: z.string().uuid("Identificador de aficionado inválido"),
});

export const reportUserSchema = z.object({
  targetUserId: z.string().uuid("Identificador de aficionado inválido"),
  category: z.enum(["harassment", "threats", "spam_scam", "impersonation", "other"]),
  details: z
    .string()
    .trim()
    .max(500, "La descripción adicional no puede superar los 500 caracteres")
    .optional(),
  conversationId: z.string().uuid("Identificador de conversación inválido").optional(),
  alsoBlock: z.boolean().optional(),
});

export type BlockUserInput = z.infer<typeof blockUserSchema>;
export type ReportUserInput = z.infer<typeof reportUserSchema>;

/**
 * Formats the moderation audit reason tag according to the communication channel.
 *
 * @param reason - Original moderation reason identifier.
 * @param channel - Origin channel (`post`, `direct_message`, or `user_report`).
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
  if (channel === "user_report") {
    return cleanReason.startsWith(USER_REPORT_REASON_PREFIX)
      ? cleanReason
      : `${USER_REPORT_REASON_PREFIX} ${cleanReason}`;
  }
  return cleanReason;
}

/**
 * Determines whether a recorded moderation audit entry originated from an un-reported private 1:1 message.
 * Note: Entries with `[USER_REPORT]` were explicitly submitted by the victim with consent for review.
 *
 * @param reason - Stored moderation reason from `blocked_post_attempts`.
 * @returns True if the attempt belongs to an un-reported private direct message.
 */
export function isPrivateMessageAuditEntry(reason: string | null | undefined): boolean {
  if (!reason) return false;
  return reason.trimStart().startsWith(DM_AUDIT_REASON_PREFIX);
}

/**
 * Redacts the body of un-reported private direct messages when rendered in the web
 * administration panel, while allowing victim-consented reports (`[USER_REPORT]`) and
 * public post attempts to be reviewed by moderators.
 *
 * @param body - Raw text stored in `blocked_post_attempts.body`.
 * @param reason - Stored moderation reason tag.
 * @returns Redacted placeholder for private DMs, or original body for public posts and victim reports.
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

/**
 * Builds the structured evidence payload for a victim-submitted user or conversation report,
 * capped safely within the 2000-character audit column limit.
 *
 * @param params - Report context including reported user, category, optional details and chat transcript.
 * @returns Formatted reason tag and evidence body.
 */
export function formatUserReportAuditEntry(params: {
  readonly reportedUsername: string;
  readonly reportedUserId: string;
  readonly category: ReportCategoryId;
  readonly details?: string;
  readonly transcriptLines?: readonly string[];
}): { readonly reason: string; readonly body: string } {
  const categoryObj = REPORT_CATEGORIES.find((c) => c.id === params.category);
  const categoryLabel = categoryObj?.label ?? params.category;

  const reason = formatBlockedAttemptReason(
    `${categoryLabel} — Denuncia contra @${params.reportedUsername}`,
    "user_report"
  );

  const sections: string[] = [
    `Usuario denunciado: @${params.reportedUsername} (${params.reportedUserId})`,
    `Motivo: ${categoryLabel}`,
  ];

  if (params.details && params.details.trim().length > 0) {
    sections.push(`Nota del denunciante: ${params.details.trim()}`);
  }

  if (params.transcriptLines && params.transcriptLines.length > 0) {
    sections.push(
      `Evidencia de conversación aportada por el denunciante:\n${params.transcriptLines.join("\n")}`
    );
  }

  const fullBody = sections.join("\n\n");
  return {
    reason,
    body: fullBody.length > 1990 ? `${fullBody.slice(0, 1987)}...` : fullBody,
  };
}
