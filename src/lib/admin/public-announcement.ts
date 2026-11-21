import { cacheLife, cacheTag } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SystemAnnouncement } from "./types";
import type { Database } from "@/types/database.types";

/**
 * Fetches and caches the active public announcement banner without reading
 * per-request cookies, keeping public routes statically/PPR-cacheable.
 */
export async function getCachedPublicAnnouncement(): Promise<SystemAnnouncement | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("system-announcement");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  try {
    const supabase = createSupabaseClient<Database>(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await supabase
      .from("system_announcements")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      message: data.message,
      type: data.type,
      isActive: data.is_active,
      readOnlyWall: data.read_only_wall,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch {
    return null;
  }
}
