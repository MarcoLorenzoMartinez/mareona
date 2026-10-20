import { z } from "zod";

export const createPostSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, { message: "El mensaje no puede estar vacío" })
    .max(500, { message: "El mensaje no puede superar los 500 caracteres" }),
  parentId: z.string().uuid().optional().nullable(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
