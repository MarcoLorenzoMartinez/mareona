"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateUsernameFromEmail, resolveUsernameCollision } from "./username";
import {
  signInSchema,
  signUpSchema,
  profileUpdateSchema,
  type SignInInput,
  type SignUpInput,
  type ProfileUpdateInput,
} from "./schemas";
import type { Database } from "@/types/database.types";
import type { UserProfile, AuthActionResult } from "./types";
export type { UserProfile, AuthActionResult };

/**
 * Signs in an existing user using email and password.
 */
export async function signInWithPassword(
  input: SignInInput
): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos de acceso inválidos",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    const isInvalid = error.message.includes("Invalid login credentials");
    return { success: false, error: isInvalid ? "Correo o contraseña incorrectos" : error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Registers a new user with email and password, resolving username collisions.
 */
export async function signUpWithPassword(
  input: SignUpInput
): Promise<AuthActionResult<{ readonly isNewUser: boolean }>> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos de registro inválidos",
    };
  }

  const baseHandle = generateUsernameFromEmail(parsed.data.email);
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("username")
    .ilike("username", `${baseHandle}%`);

  const takenSet = new Set((existing ?? []).map((p) => p.username));
  const finalHandle = resolveUsernameCollision(baseHandle, takenSet);

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { username: finalHandle, display_name: finalHandle },
    },
  });

  if (error) {
    if (error.message.includes("User already registered")) {
      return { success: false, error: "Ya existe una cuenta con este correo" };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, data: { isNewUser: Boolean(data.user) } };
}

/**
 * Closes the active session and revalidates cached layouts.
 */
export async function signOut(): Promise<AuthActionResult> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error al cerrar sesión" };
  }
}

/**
 * Aborts account creation: permanently deletes auth user and clears session cookies.
 */
export async function abortRegistration(): Promise<AuthActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.rpc("delete_current_user");
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error al cancelar" };
  }
}

/**
 * Permanently deletes the authenticated user's account and all associated personal data
 * via delete_current_user RPC (GDPR right to be forgotten), then signs out.
 */
export async function deleteAccount(): Promise<AuthActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "No hay sesión activa para eliminar" };
    }

    const { error: rpcError } = await supabase.rpc("delete_current_user");
    if (rpcError) {
      return {
        success: false,
        error: `Error al eliminar los datos: ${rpcError.message}`,
      };
    }

    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Error inesperado al eliminar la cuenta",
    };
  }
}

/**
 * Updates public profile attributes for the authenticated user.
 */
export async function updateProfile(
  input: ProfileUpdateInput
): Promise<AuthActionResult> {
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos de perfil inválidos",
    };
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Debes iniciar sesión para editar tu perfil" };
  }

  const updates: Partial<Database["public"]["Tables"]["profiles"]["Update"]> = {};
  if (parsed.data.username !== undefined) updates.username = parsed.data.username;
  if (parsed.data.displayName !== undefined) updates.display_name = parsed.data.displayName;
  if (parsed.data.avatarUrl !== undefined) updates.avatar_url = parsed.data.avatarUrl;

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);

  if (error) {
    const isConflict = error.code === "23505";
    return {
      success: false,
      error: isConflict ? "Ese apodo ya está en uso por otro aficionado. Elige otro." : error.message,
    };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Retrieves the currently authenticated user and their profile.
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return profile;
  } catch {
    return null;
  }
}
