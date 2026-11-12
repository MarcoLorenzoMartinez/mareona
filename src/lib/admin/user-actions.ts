"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "./guard";
import { banUserSchema, type BanUserInput } from "./schemas";
import type { DisciplinaryUser } from "./types";
import type { Database } from "@/types/database.types";

/**
 * Searches users for administrative disciplinary inspection.
 * Returns up to 30 records matching username/display_name or latest registered accounts.
 */
export async function searchAdminUsers(query?: string): Promise<readonly DisciplinaryUser[]> {
  await assertAdmin();
  const supabase = await createClient();

  let req = supabase
    .from("profiles")
    .select(`
      id,
      username,
      display_name,
      avatar_url,
      points,
      is_banned,
      banned_until,
      banned_reason,
      created_at
    `)
    .limit(30);

  const cleanQuery = query?.trim();
  if (cleanQuery) {
    req = req.or(`username.ilike.%${cleanQuery}%,display_name.ilike.%${cleanQuery}%`);
  } else {
    req = req.order("created_at", { ascending: false });
  }

  const { data, error } = await req;

  type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
  const rows = (error || !data ? [] : data) as unknown as readonly ProfileRow[];

  const realUsers: DisciplinaryUser[] = rows.map((r) => ({
    id: r.id,
    username: r.username,
    displayName: r.display_name,
    avatarUrl: r.avatar_url,
    points: r.points,
    isBanned: Boolean(r.is_banned),
    bannedUntil: r.banned_until,
    bannedReason: r.banned_reason,
    createdAt: r.created_at,
  }));

  return realUsers;
}

/**
 * Applies a temporary or permanent ban to a user account.
 */
export async function banUserAction(
  input: BanUserInput
): Promise<{ success: boolean; error?: string }> {
  const { user } = await assertAdmin();
  const parsed = banUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const bannedUntil = parsed.data.durationDays
    ? new Date(Date.now() + parsed.data.durationDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      is_banned: true,
      banned_until: bannedUntil,
      banned_reason: parsed.data.reason,
    })
    .eq("id", parsed.data.userId);

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.from("admin_audit_logs").insert({
    admin_id: user.id,
    action: "ban_user",
    target_type: "user",
    target_id: parsed.data.userId,
    metadata: {
      reason: parsed.data.reason,
      durationDays: parsed.data.durationDays ?? "permanent",
      bannedUntil,
    },
  });

  revalidatePath("/admin/usuarios");
  return { success: true };
}

/**
 * Lifts an active ban from a user account.
 */
export async function unbanUserAction(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const { user } = await assertAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      is_banned: false,
      banned_until: null,
      banned_reason: null,
    })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.from("admin_audit_logs").insert({
    admin_id: user.id,
    action: "unban_user",
    target_type: "user",
    target_id: userId,
    metadata: { reason: "Sanción levantada manualmente por el administrador" },
  });

  revalidatePath("/admin/usuarios");
  return { success: true };
}

/**
 * Resets an abusive or illicit user avatar back to default placeholder.
 */
export async function resetUserAvatarAction(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const { user } = await assertAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.from("admin_audit_logs").insert({
    admin_id: user.id,
    action: "reset_avatar",
    target_type: "user",
    target_id: userId,
    metadata: { reason: "Avatar restablecido por vulnerar normas de imagen" },
  });

  revalidatePath("/admin/usuarios");
  return { success: true };
}
