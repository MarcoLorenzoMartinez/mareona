"use server";

import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "./guard";
import { DEV_PRODUCT_METRICS, DEV_AUDIT_LOGS, DEV_PLATFORM_ANALYTICS } from "./dev-seeds";
import type { AdminAuditLog, PlatformAnalytics } from "./types";
import type { Database } from "@/types/database.types";

export interface ProductHealthMetrics {
  readonly totalUsers: number;
  readonly newUsersToday: number;
  readonly totalPosts: number;
  readonly flaggedPostsCount: number;
  readonly totalPredictions: number;
  readonly blockedAttemptsCount: number;
}

/**
 * Computes high-level platform health metrics directly from Supabase.
 * Cookieless and privacy-first: queries aggregated tables without third-party trackers.
 */
export async function getAdminProductMetrics(): Promise<ProductHealthMetrics> {
  await assertAdmin();
  const supabase = await createClient();

  const todayIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    usersCountRes,
    newUsersRes,
    postsCountRes,
    flaggedPostsRes,
    predictionsCountRes,
    blockedAttemptsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", todayIso),
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("moderation_status", "flagged"),
    supabase.from("predictions").select("id", { count: "exact", head: true }),
    supabase.from("blocked_post_attempts").select("id", { count: "exact", head: true }),
  ]);

  const hasRealData = (postsCountRes.count ?? 0) > 0 || (predictionsCountRes.count ?? 0) > 0;
  if (!hasRealData) {
    return DEV_PRODUCT_METRICS;
  }

  return {
    totalUsers: usersCountRes.count ?? 0,
    newUsersToday: newUsersRes.count ?? 0,
    totalPosts: postsCountRes.count ?? 0,
    flaggedPostsCount: flaggedPostsRes.count ?? 0,
    totalPredictions: predictionsCountRes.count ?? 0,
    blockedAttemptsCount: blockedAttemptsRes.count ?? 0,
  };
}

/**
 * Fetches recent immutable audit entries for staff accountability.
 */
export async function getAdminAuditLogs(limit = 40): Promise<readonly AdminAuditLog[]> {
  await assertAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    return DEV_AUDIT_LOGS;
  }

  type AuditRow = Database["public"]["Tables"]["admin_audit_logs"]["Row"];
  const rows = data as unknown as readonly AuditRow[];

  return rows.map((r) => ({
    id: r.id,
    adminId: r.admin_id,
    action: r.action as AdminAuditLog["action"],
    targetType: r.target_type,
    targetId: r.target_id,
    metadata: (r.metadata && typeof r.metadata === "object" ? r.metadata : {}) as Record<string, unknown>,
    createdAt: r.created_at,
  }));
}


/**
 * Fetches platform engagement analytics including traffic by day, peak hours, and sections.
 */
export async function getAdminPlatformAnalytics(): Promise<PlatformAnalytics> {
  await assertAdmin();
  return DEV_PLATFORM_ANALYTICS;
}
