import { z } from "zod";

/**
 * Username validation pattern matching the PostgreSQL check constraint:
 * username ~ '^[a-zA-Z0-9_]{3,20}$'
 */
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Introduce un correo electrónico válido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Introduce un correo electrónico válido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const profileUpdateSchema = z.object({
  username: z
    .string()
    .trim()
    .regex(USERNAME_REGEX, {
      message:
        "El apodo debe tener entre 3 y 20 caracteres (solo letras, números y guión bajo)",
    })
    .optional(),
  displayName: z
    .string()
    .trim()
    .max(40, { message: "El nombre visible no puede superar los 40 caracteres" })
    .optional()
    .nullable(),
  avatarUrl: z.string().trim().max(500).optional().nullable(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

/**
 * Sporting-themed avatar presets available for immediate selection during onboarding or profile editing.
 */
export interface SportingAvatarPreset {
  readonly id: string;
  readonly label: string;
  readonly url: string;
}

export const SPORTING_AVATAR_PRESETS: readonly SportingAvatarPreset[] = [
  {
    id: "molinon",
    label: "El Molinón",
    url: "/avatars/presets/molinon.svg",
  },
  {
    id: "rayas",
    label: "Rojiblanco",
    url: "/avatars/presets/rayas.svg",
  },
  {
    id: "bufanda",
    label: "Mareona",
    url: "/avatars/presets/bufanda.svg",
  },
  {
    id: "quini",
    label: "El Brujo",
    url: "/avatars/presets/quini.svg",
  },
] as const;
