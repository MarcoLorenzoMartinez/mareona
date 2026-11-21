"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import {
  generateUsernameFromEmail,
  generateDefaultDisplayName,
  resolveUsernameCollision,
} from "./username";
import { buildEmailConfirmationUrl } from "./oauth-redirect";
import { canSafelyAbortRegistration } from "./new-user";
import {
  signInSchema,
  signUpSchema,
  profileUpdateSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  type SignInInput,
  type SignUpInput,
  type ProfileUpdateInput,
  type ResetPasswordInput,
} from "./schemas";
import type { Database } from "@/types/database.types";
import type { UserProfile, AuthActionResult } from "./types";
export type { UserProfile, AuthActionResult };

function isAllowedOriginHost(host: string): boolean {
  const normalized = host.trim().toLowerCase();
  const allowed = new Set<string>(["mareona.es", "www.mareona.es", "localhost:3000", "127.0.0.1:3000"]);
  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      allowed.add(new URL(process.env.NEXT_PUBLIC_APP_URL).host.toLowerCase());
    } catch {
      // Ignore invalid env URL
    }
  }
  if (process.env.VERCEL_URL) {
    allowed.add(process.env.VERCEL_URL.toLowerCase());
  }
  return allowed.has(normalized);
}

async function resolveRequestOrigin(): Promise<string> {
  try {
    const reqHeaders = await headers();
    const originHeader = reqHeaders.get("origin");
    if (originHeader && originHeader.startsWith("http")) {
      try {
        const parsed = new URL(originHeader);
        if (isAllowedOriginHost(parsed.host)) {
          return parsed.origin;
        }
      } catch {
        // Ignore invalid origin header
      }
    }
    const forwardedHost = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
    if (forwardedHost && isAllowedOriginHost(forwardedHost)) {
      const proto = forwardedHost.startsWith("localhost") || forwardedHost.startsWith("127.0.0.1") ? "http" : "https";
      return `${proto}://${forwardedHost}`;
    }
  } catch {
    // Fallback to environment variable outside request context
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function isEmailDispatchFailure(message: string, code?: string | null, status?: number | null): boolean {
  const lower = (message || "").toLowerCase();
  const normCode = (code || "").toLowerCase();
  return (
    normCode === "over_email_send_rate_limit" ||
    status === 429 ||
    lower.includes("error sending confirmation email") ||
    lower.includes("error sending email") ||
    lower.includes("smtp") ||
    lower.includes("email rate limit")
  );
}

async function purgeUserAvatarFiles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<void> {
  try {
    const { data: files } = await supabase.storage.from("avatars").list(userId, { limit: 100 });
    if (files && files.length > 0) {
      const paths = files.map((f) => `${userId}/${f.name}`);
      await supabase.storage.from("avatars").remove(paths);
    }
  } catch {
    // Do not block account deletion if avatar folder does not exist
  }
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

  const rate = checkRateLimit({
    key: `auth_signin_${parsed.data.email.toLowerCase()}`,
    limit: 8,
    windowMs: 60_000,
  });
  if (!rate.allowed) {
    return { success: false, error: rate.error };
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

  const rate = checkRateLimit({
    key: `auth_signup_${parsed.data.email.toLowerCase()}`,
    limit: 5,
    windowMs: 60_000,
  });
  if (!rate.allowed) {
    return { success: false, error: rate.error };
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
    if (isEmailDispatchFailure(error.message, error.code, error.status)) {
      return {
        success: false,
        error:
          "No hemos podido enviar el correo de verificación en este momento. Inténtalo de nuevo en unos minutos o accede directamente con Google.",
      };
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
 * Resends the signup confirmation email to the provided address.
 */
export async function resendConfirmationEmail(email: string): Promise<AuthActionResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const rate = checkRateLimit({
    key: `auth_resend_${normalizedEmail}`,
    limit: 3,
    windowMs: 60_000,
  });
  if (!rate.allowed) {
    return { success: false, error: rate.error };
  }

  try {
    const supabase = await createClient();
    const origin = await resolveRequestOrigin();
    const emailRedirectTo = buildEmailConfirmationUrl(origin);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
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
 * Sends a password recovery email pointing to `/auth/callback?type=recovery`.
 */
export async function requestPasswordReset(email: string): Promise<AuthActionResult> {
  const parsed = requestPasswordResetSchema.safeParse({ email });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Introduce un correo válido",
    };
  }

  const rate = checkRateLimit({
    key: `auth_reset_${parsed.data.email.toLowerCase()}`,
    limit: 3,
    windowMs: 60_000,
  });
  if (!rate.allowed) {
    return { success: false, error: rate.error };
  }

  try {
    const supabase = await createClient();
    const origin = await resolveRequestOrigin();
    const redirectTo = `${origin}/auth/callback?next=/auth/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo,
    });
    if (error) {
      return { success: false, error: translateAuthError(error.message) };
    }
    return { success: true };
  } catch {
    return { success: false, error: "No se pudo enviar el enlace de recuperación" };
  }
}

/**
 * Updates the authenticated user's password after completing a recovery flow.
 */
export async function updatePassword(input: ResetPasswordInput): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Contraseña no válida",
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return {
        success: false,
        error: "El enlace de recuperación ha caducado o no es válido. Solicita uno nuevo.",
      };
    }

    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) {
      return { success: false, error: translateAuthError(error.message) };
    }
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "No se pudo actualizar la contraseña" };
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
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("created_at, updated_at, points")
        .eq("id", user.id)
        .maybeSingle();

      if (
        !canSafelyAbortRegistration({
          userCreatedAt: user.created_at,
          profileCreatedAt: profile?.created_at,
          profileUpdatedAt: profile?.updated_at,
          points: profile?.points,
        })
      ) {
        return {
          success: false,
          error: "Esta cuenta ya está activa. Si deseas eliminarla, hazlo desde tu Perfil.",
        };
      }

      await purgeUserAvatarFiles(supabase, user.id);
      const { error: rpcError } = await supabase.rpc("delete_current_user");
      if (rpcError) {
        return { success: false, error: `Error al cancelar el registro: ${rpcError.message}` };
      }
    }
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

    await purgeUserAvatarFiles(supabase, user.id);

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
