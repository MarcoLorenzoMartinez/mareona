"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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
 *
 * @param input - Validated email and password credentials.
 * @returns Object indicating success or Spanish error description.
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
 * Registers a new user with email and password.
 * Triggers automatic profile creation in the database (handle_new_user).
 *
 * @param input - Validated email and password.
 * @returns Object indicating success or localized error.
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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.message.includes("User already registered")) {
      return { success: false, error: "Ya existe una cuenta con este correo" };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    data: { isNewUser: Boolean(data.user) },
  };
}

/**
 * Closes the active session and revalidates cached layouts.
 *
 * @returns Object confirming sign out.
 */
export async function signOut(): Promise<AuthActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Updates public profile attributes for the authenticated user.
 *
 * @param input - Validated profile fields (username, displayName, avatarUrl).
 * @returns Result confirming update or reporting collision/format error.
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
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Debes iniciar sesión para editar tu perfil" };
  }

  const updates: Partial<Database["public"]["Tables"]["profiles"]["Update"]> = {};
  if (parsed.data.username !== undefined) updates.username = parsed.data.username;
  if (parsed.data.displayName !== undefined) updates.display_name = parsed.data.displayName;
  if (parsed.data.avatarUrl !== undefined) updates.avatar_url = parsed.data.avatarUrl;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "Ese apodo ya está en uso por otro aficionado. Elige otro.",
      };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Retrieves the currently authenticated user and their profile.
 * Intended for Server Components or layout hydration.
 *
 * @returns User profile or null if anonymous.
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
