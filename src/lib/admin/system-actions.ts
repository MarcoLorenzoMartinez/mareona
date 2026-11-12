"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "./guard";
import { systemAnnouncementSchema, type SystemAnnouncementInput } from "./schemas";
import type { SystemAnnouncement } from "./types";
import type { Database } from "@/types/database.types";

/**
 * Fetches the currently active public announcement banner, if any.
 * Does not require admin authentication; safe for public layout rendering.
 */
export async function getActiveAnnouncementPublic(): Promise<SystemAnnouncement | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("system_announcements")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    type AnnRow = Database["public"]["Tables"]["system_announcements"]["Row"];
    const row = data as AnnRow;

    return {
      id: row.id,
      message: row.message,
      type: row.type,
      isActive: row.is_active,
      readOnlyWall: row.read_only_wall,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch {
    return null;
  }
}

/**
 * Fetches the latest system announcement configuration for the admin panel.
 */
export async function getLatestAnnouncementAdmin(): Promise<SystemAnnouncement | null> {
  await assertAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("system_announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  type AnnRow = Database["public"]["Tables"]["system_announcements"]["Row"];
  const row = data as AnnRow;

  return {
    id: row.id,
    message: row.message,
    type: row.type,
    isActive: row.is_active,
    readOnlyWall: row.read_only_wall,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Saves a new announcement broadcast and optionally sets it active.
 */
export async function saveAnnouncementAction(
  input: SystemAnnouncementInput
): Promise<{ success: boolean; error?: string }> {
  const { user } = await assertAdmin();
  const parsed = systemAnnouncementSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Parámetros inválidos" };
  }

  const supabase = await createClient();

  if (parsed.data.isActive) {
    await supabase.from("system_announcements").update({ is_active: false }).eq("is_active", true);
  }

  const { error } = await supabase.from("system_announcements").insert({
    message: parsed.data.message,
    type: parsed.data.type,
    is_active: parsed.data.isActive,
    read_only_wall: parsed.data.readOnlyWall,
    created_by: user.id,
  });

  if (error) return { success: false, error: error.message };

  await supabase.from("admin_audit_logs").insert({
    admin_id: user.id,
    action: "update_announcement",
    target_type: "banner",
    target_id: "global_broadcast",
    metadata: { ...parsed.data },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/anuncios");
  return { success: true };
}

/**
 * Toggles an announcement on or off.
 */
export async function toggleAnnouncementActiveAction(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const { user } = await assertAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("system_announcements")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  await supabase.from("admin_audit_logs").insert({
    admin_id: user.id,
    action: "toggle_announcement",
    target_type: "banner",
    target_id: id,
    metadata: { isActive },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/anuncios");
  return { success: true };
}

/**
 * Purges and invalidates cached football data paths (temporada, historico, home).
 */
export async function purgeSportsCacheAction(): Promise<{ success: boolean; error?: string }> {
  const { user } = await assertAdmin();
  const supabase = await createClient();

  await supabase.from("admin_audit_logs").insert({
    admin_id: user.id,
    action: "purge_sports_cache",
    target_type: "cache",
    target_id: "sports_apis",
    metadata: { reason: "Purga manual de rutas deportivas en servidor" },
  });

  revalidatePath("/temporada");
  revalidatePath("/historico");
  revalidatePath("/");
  revalidatePath("/admin/anuncios");
  return { success: true };
}
