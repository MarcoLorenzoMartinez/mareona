"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateAvatarFile } from "./avatar-validation";
import type { AuthActionResult } from "./types";

/**
 * Securely uploads a user avatar to Supabase Storage and updates the profile.
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

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: `Error al subir la imagen: ${uploadError.message}` };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // Update public profile avatar url
    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    revalidatePath("/perfil");
    revalidatePath("/social");

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
