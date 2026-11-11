import { z } from "zod";

export const sendDirectMessageSchema = z.object({
  conversationId: z.string().uuid("Identificador de conversación inválido"),
  body: z
    .string()
    .trim()
    .min(1, "El mensaje no puede estar vacío")
    .max(2000, "El mensaje no puede superar los 2000 caracteres"),
});

export const openDirectConversationSchema = z.object({
  targetUserId: z.string().uuid("Identificador de aficionado inválido"),
});

export const deleteDirectMessageSchema = z.object({
  messageId: z.string().uuid("Identificador de mensaje inválido"),
  conversationId: z.string().uuid("Identificador de conversación inválido"),
});

export type SendDirectMessageInput = z.infer<typeof sendDirectMessageSchema>;
export type OpenDirectConversationInput = z.infer<typeof openDirectConversationSchema>;
export type DeleteDirectMessageInput = z.infer<typeof deleteDirectMessageSchema>;
