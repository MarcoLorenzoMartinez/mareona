"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateUsernameFromEmail,
  generateDefaultDisplayName,
  resolveUsernameCollision,
} from "./username";
import { buildEmailConfirmationUrl } from "./oauth-redirect";
import { isEmailDeliveryFailure } from "./email-fallback";
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

async function resolveRequestOrigin(): Promise<string> {
  try {
    const reqHeaders = await headers();
    const originHeader = reqHeaders.get("origin");
    if (originHeader && originHeader.startsWith("http")) {
      return originHeader;
    }
    const forwardedHost = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
    if (forwardedHost) {
      const proto = reqHeaders.get("x-forwarded-proto") ?? (forwardedHost.includes("localhost") ? "http" : "https");
      return `${proto}://${forwardedHost}`;
    }
  } catch {
    // Fallback to environment variable outside request context
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Correo o contraseña incorrectos";
  }
  if (lower.includes("email not confirmed")) {
    return "Aún no has confirmado tu correo electrónico";
  }
  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return "Ya existe una cuenta con este correo";
  }
  if (lower.includes("rate limit") || lower.includes("for security purposes")) {
    return "Has solicitado demasiados envíos seguidos. Espera un minuto e inténtalo de nuevo.";
  }
  return message;
}

/**
 * Signs in an existing user using email and password.
 */
export async function signInWithPassword(
  input: SignInInput
): Promise<AuthActionResult<{ readonly requiresEmailConfirmation?: boolean }>> {
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
    const isUnconfirmed = error.message.toLowerCase().includes("email not confirmed");
    return {
      success: false,
      error: translateAuthError(error.message),
      data: isUnconfirmed ? { requiresEmailConfirmation: true } : undefined,
    };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Registers a new user with email and password, resolving username collisions.
 */
export async function signUpWithPassword(
  input: SignUpInput
): Promise<AuthActionResult<{ readonly isNewUser: boolean; readonly requiresEmailConfirmation?: boolean }>> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos de registro inválidos",
    };
  }

  const baseHandle = generateUsernameFromEmail(parsed.data.email);
  const defaultDisplayName = generateDefaultDisplayName(null, parsed.data.email);
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("username")
    .ilike("username", `${baseHandle}%`);

  const takenSet = new Set((existing ?? []).map((p) => p.username));
  const finalHandle = resolveUsernameCollision(baseHandle, takenSet);
  const origin = await resolveRequestOrigin();
  const emailRedirectTo = buildEmailConfirmationUrl(origin);

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo,
      data: { username: finalHandle, display_name: defaultDisplayName },
    },
  });

  if (error) {
    if (isEmailDeliveryFailure(error.message, error.code, error.status)) {
      const fallbackResult = await tryAutoConfirmFallbackSignUp({
        email: parsed.data.email,
        password: parsed.data.password,
        username: finalHandle,
        displayName: defaultDisplayName,
      });
      if (fallbackResult) {
        return fallbackResult;
      }
    }
    return { success: false, error: translateAuthError(error.message) };
  }

  // When email confirmation is enabled, Supabase returns an obfuscated user with empty identities
  // if the email is already registered. Detect this so the user knows to sign in instead.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return {
      success: false,
      error: "Ya existe una cuenta con este correo. Inicia sesión con tu contraseña.",
    };
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    data: {
      isNewUser: Boolean(data.user),
      requiresEmailConfirmation: !data.session,
    },
  };
}

/**
 * Fail-safe contingency when the external SMTP relay is down or hits its daily quota:
 * Auto-creates/confirms the account via the server-only Admin API and establishes an
 * immediate session so the fan proceeds straight to identity onboarding without friction.
 */
async function tryAutoConfirmFallbackSignUp(params: {
  readonly email: string;
  readonly password: string;
  readonly username: string;
  readonly displayName: string;
}): Promise<AuthActionResult<{ readonly isNewUser: boolean; readonly requiresEmailConfirmation?: boolean }> | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  try {
    const { error: createError } = await admin.auth.admin.createUser({
      email: params.email,
      password: params.password,
      email_confirm: true,
      user_metadata: {
        username: params.username,
        display_name: params.displayName,
      },
    });

    if (createError) {
      // If GoTrue already created the unconfirmed user before the SMTP step failed,
      // locate the unconfirmed account and mark email_confirm: true.
      const { data: listData } = await admin.auth.admin.listUsers({ page: 1, perPage: 100 });
      const existingUnconfirmed = listData?.users.find(
        (u) => u.email?.toLowerCase() === params.email.toLowerCase() && !u.email_confirmed_at
      );

      if (!existingUnconfirmed) {
        return null;
      }

      const { error: updateError } = await admin.auth.admin.updateUserById(
        existingUnconfirmed.id,
        {
          email_confirm: true,
          password: params.password,
          user_metadata: {
            username: params.username,
            display_name: params.displayName,
          },
        }
      );
      if (updateError) return null;
    }

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password,
    });

    if (signInError) return null;

    revalidatePath("/", "layout");
    return {
      success: true,
      data: {
        isNewUser: true,
        requiresEmailConfirmation: false,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Resends the signup confirmation email to the provided address.
 */
export async function resendConfirmationEmail(email: string): Promise<AuthActionResult> {
  try {
    const supabase = await createClient();
    const origin = await resolveRequestOrigin();
    const emailRedirectTo = buildEmailConfirmationUrl(origin);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: {
        emailRedirectTo,
      },
    });
    if (error) return { success: false, error: translateAuthError(error.message) };
    return { success: true };
  } catch {
    return { success: false, error: "No se pudo reenviar el correo de confirmación" };
  }
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
