"use server";

import { createClient } from "@/lib/supabase/server";
import { validateAvatarFile } from "./avatar-validation";
import type { AuthActionResult } from "./types";

/**
 * Securely uploads a user avatar to Supabase Storage and returns its public URL.
 * Profile persistence is finalized only when the user explicitly saves the edit or onboarding form.
 */
export async function uploadAvatarImage(
  formData: FormData
): Promise<AuthActionResult<{ readonly url: string }>> {
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return { success: false, error: "No se ha seleccionado ningún archivo" };
  }

  const validation = validateAvatarFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Debes iniciar sesión para subir una foto" };
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "webp";
    const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng =
      buffer.length >= 4 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;
    const isWebp =
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP";

    if (!isJpeg && !isPng && !isWebp) {
      return {
        success: false,
        error: "El archivo no corresponde a una imagen JPG, PNG o WebP válida.",
      };
    }

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      const isMissingBucket = uploadError.message?.toLowerCase().includes("bucket not found");
      return {
        success: false,
        error: isMissingBucket
          ? "El bucket 'avatars' no existe en Supabase Storage. Créalo para subir fotos."
          : `Error al subir la imagen: ${uploadError.message}`,
      };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return {
      success: true,
      data: { url: publicUrl },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error inesperado al subir la foto",
    };
  }
}
