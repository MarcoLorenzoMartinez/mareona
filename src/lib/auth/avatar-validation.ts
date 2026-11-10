export const ALLOWED_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

/**
 * Validates file constraints for user avatars.
 */
export function validateAvatarFile(file: {
  readonly size: number;
  readonly type: string;
}): { readonly valid: boolean; readonly error?: string } {
  if (file.size > MAX_AVATAR_FILE_SIZE) {
    return {
      valid: false,
      error: "La imagen es demasiado pesada. El límite es de 2 MB.",
    };
  }

  const isAllowed = ALLOWED_AVATAR_MIME_TYPES.includes(
    file.type as (typeof ALLOWED_AVATAR_MIME_TYPES)[number]
  );

  if (!isAllowed) {
    return {
      valid: false,
      error: "Formato no compatible. Por favor sube una imagen JPG, PNG o WebP.",
    };
  }

  return { valid: true };
}
