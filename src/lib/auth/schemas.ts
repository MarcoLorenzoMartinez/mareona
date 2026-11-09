import { z } from "zod";

/**
 * Username validation pattern matching the PostgreSQL check constraint:
 * username ~ '^[a-zA-Z0-9_]{3,20}$'
 */
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

/**
 * Extracts and sanitizes a valid username from an email address.
 * Conforms strictly to USERNAME_REGEX and Postgres citext constraint.
 *
 * @param email - Raw user email (e.g. "pelayo.sporting+test@gmail.com")
 * @returns Clean username between 3 and 20 chars (e.g. "pelayo_sporting")
 */
export function generateUsernameFromEmail(email: string): string {
  if (!email || typeof email !== "string") {
    return "sportinguista";
  }

  // 1. Extract local part before '@' and before '+' (email tagging)
  const localPart = email.split("@")[0]?.split("+")[0] ?? "";

  // 2. Normalize: lowercase and replace non [a-zA-Z0-9_] characters with underscore
  let clean = localPart
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  // 3. Ensure minimum length of 3 chars
  if (clean.length === 0) {
    clean = "sportinguista";
  } else if (clean.length < 3) {
    clean = `${clean}_rsg`.slice(0, 20);
  }

  // 4. Ensure maximum length of 20 chars
  if (clean.length > 20) {
    clean = clean.slice(0, 20).replace(/_+$/, "");
  }

  return clean;
}

/**
 * Resolves a proposed public display name from user metadata or email.
 *
 * @param metadataName - Optional full name from OAuth provider (e.g. Google).
 * @param email - User email address.
 * @returns Clean, formatted display name up to 40 characters.
 */
export function generateDefaultDisplayName(
  metadataName?: string | null,
  email?: string | null
): string {
  if (metadataName && metadataName.trim().length > 0) {
    return metadataName.trim().slice(0, 40);
  }
  if (!email) return "Aficionado";
  const localPart = email.split("@")[0]?.split("+")[0] ?? "";
  const words = localPart
    .replace(/[._-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  return words.length > 0 ? words.slice(0, 40) : "Aficionado";
}

/**
 * Generates the next available username by appending an incremental numeric suffix if taken.
 * Ensures the candidate never exceeds 20 characters.
 */
export function resolveUsernameCollision(
  baseUsername: string,
  existingUsernames: Set<string> | readonly string[]
): string {
  const set = existingUsernames instanceof Set
    ? existingUsernames
    : new Set(existingUsernames.map((u) => u.toLowerCase()));

  const normalized = baseUsername.toLowerCase();
  if (!set.has(normalized)) {
    return baseUsername;
  }

  let suffix = 1;
  while (suffix < 1000) {
    const suffixStr = `_${suffix}`;
    const maxBaseLen = 20 - suffixStr.length;
    const candidate = `${baseUsername.slice(0, maxBaseLen)}${suffixStr}`.toLowerCase();
    if (!set.has(candidate)) {
      return candidate;
    }
    suffix++;
  }

  return `${baseUsername.slice(0, 15)}_${Date.now().toString().slice(-4)}`;
}

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
