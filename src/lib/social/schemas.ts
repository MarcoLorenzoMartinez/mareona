import { z } from "zod";
import { parsePostLineup } from "../lineup-builder/shared-lineup-codec.ts";

export const pollOptionSchema = z
  .string()
  .trim()
  .min(1, { message: "La opción no puede estar vacía" })
  .max(50, { message: "Máximo 50 caracteres por opción" });

export const createPostSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, { message: "El mensaje no puede estar vacío" })
    .max(2000, { message: "El mensaje no puede superar los 2000 caracteres" })
    .refine(
      (val) => {
        const { cleanBody, lineup } = parsePostLineup(val);
        return (lineup ? cleanBody.length : val.length) <= 500;
      },
      { message: "El mensaje no puede superar los 500 caracteres" }
    ),
  parentId: z.string().uuid().optional().nullable(),
  pollOptions: z
    .array(pollOptionSchema)
    .min(2, { message: "Una encuesta debe tener al menos 2 opciones" })
    .max(4, { message: "Una encuesta puede tener como máximo 4 opciones" })
    .optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const deletePostSchema = z.object({
  postId: z.string().min(1, { message: "Identificador de publicación inválido" }),
});

export type DeletePostInput = z.infer<typeof deletePostSchema>;

export const updatePostSchema = z.object({
  postId: z.string().min(1, { message: "Identificador de publicación inválido" }),
  body: z
    .string()
    .trim()
    .min(1, { message: "El mensaje no puede estar vacío" })
    .max(2000, { message: "El mensaje no puede superar los 2000 caracteres" })
    .refine(
      (val) => {
        const { cleanBody, lineup } = parsePostLineup(val);
        return (lineup ? cleanBody.length : val.length) <= 500;
      },
      { message: "El mensaje no puede superar los 500 caracteres" }
    ),
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;

export const votePollSchema = z.object({
  pollId: z.string().min(1, { message: "Identificador de encuesta inválido" }),
  optionId: z.string().min(1, { message: "Opción de encuesta inválida" }),
});

export type VotePollInput = z.infer<typeof votePollSchema>;
