import { z } from "zod";

export const createMatchCommentSchema = z.object({
  matchId: z.string().min(1, "El identificador del partido es obligatorio"),
  body: z
    .string()
    .trim()
    .min(1, "El comentario no puede estar vacío")
    .max(500, "El comentario no puede superar los 500 caracteres"),
  parentId: z.string().optional().nullable(),
});

export type CreateMatchCommentInput = z.infer<typeof createMatchCommentSchema>;

export const submitMvpVoteSchema = z.object({
  matchId: z.string().min(1, "El identificador del partido es obligatorio"),
  playerId: z.string().min(1, "El identificador del jugador es obligatorio"),
  previousPlayerId: z.string().optional().nullable(),
});

export type SubmitMvpVoteInput = z.infer<typeof submitMvpVoteSchema>;

export const submitPlayerRatingSchema = z.object({
  matchId: z.string().min(1, "El identificador del partido es obligatorio"),
  targetId: z.string().min(1, "El identificador del destinatario es obligatorio"),
  rating: z
    .number()
    .min(0, "La nota mínima es 0 (No calificable)")
    .max(10, "La nota máxima es 10"),
});

export type SubmitPlayerRatingInput = z.infer<typeof submitPlayerRatingSchema>;
