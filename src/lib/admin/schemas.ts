import { z } from "zod";

/**
 * Validation schema for banning a user.
 */
export const banUserSchema = z.object({
  userId: z.string().uuid("Identificador de usuario inválido"),
  reason: z
    .string()
    .trim()
    .min(3, "El motivo debe tener al menos 3 caracteres")
    .max(200, "El motivo no puede superar los 200 caracteres"),
  durationDays: z
    .number()
    .int()
    .min(1, "La duración mínima es de 1 día")
    .max(365, "La duración máxima es de 365 días")
    .nullable()
    .optional(),
});

export type BanUserInput = z.infer<typeof banUserSchema>;

/**
 * Validation schema for post moderation decision.
 */
export const moderatePostActionSchema = z.object({
  postId: z.string().uuid("Identificador de publicación inválido"),
  action: z.enum(["approve", "delete", "restore"]),
  reason: z.string().trim().max(200).optional(),
});

export type ModeratePostActionInput = z.infer<typeof moderatePostActionSchema>;

/**
 * Validation schema for global broadcast announcements.
 */
export const systemAnnouncementSchema = z.object({
  message: z
    .string()
    .trim()
    .min(3, "El mensaje debe tener al menos 3 caracteres")
    .max(300, "El mensaje no puede exceder 300 caracteres"),
  type: z.enum(["info", "warning", "alert"]).default("info"),
  isActive: z.boolean().default(true),
  readOnlyWall: z.boolean().default(false),
});

export type SystemAnnouncementInput = z.infer<typeof systemAnnouncementSchema>;
