"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdmin } from "./guard";
import { computePlatformAnalytics } from "@/lib/telemetry/analytics-calculator";
import { logger } from "@/lib/logger";
import type { AdminAuditLog, PlatformAnalytics } from "./types";
import type { Database } from "@/types/database.types";

const log = logger.child("admin-stats");

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
  const supabase = createAdminClient() ?? (await createClient());

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
  const supabase = createAdminClient() ?? (await createClient());

  const { data, error } = await supabase
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    log.error("Failed to fetch admin_audit_logs", error);
    return [];
  }
  if (!data || data.length === 0) {
    return [];
  }

  type AuditRow = Database["public"]["Tables"]["admin_audit_logs"]["Row"];
  const rows = data as unknown as readonly AuditRow[];

  return rows.map((r) => ({
    id: r.id,
    adminId: r.admin_id ?? "deleted-admin",
    action: r.action as AdminAuditLog["action"],
    targetType: r.target_type,
    targetId: r.target_id,
    metadata: (r.metadata && typeof r.metadata === "object" ? r.metadata : {}) as Record<string, unknown>,
    createdAt: r.created_at,
  }));
}


/**
 * Fetches platform engagement analytics including traffic by day, peak hours, and sections.
 * Privacy-first and cookieless: paginates `site_visits` in 1,000-row batches so PostgREST's
 * default row cap never truncates long-range metrics silently.
 */
export async function getAdminPlatformAnalytics(): Promise<PlatformAnalytics> {
  await assertAdmin();
  const supabase = createAdminClient() ?? (await createClient());

  const oneYearAgoIso = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
  const PAGE_SIZE = 1000;
  const MAX_ROWS = 50_000;

  type SiteVisitRow = Database["public"]["Tables"]["site_visits"]["Row"];
  const allRows: SiteVisitRow[] = [];

  for (let offset = 0; offset < MAX_ROWS; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("site_visits")
      .select("*")
      .gte("created_at", oneYearAgoIso)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      log.error("Failed to fetch site_visits for admin analytics", error);
      return computePlatformAnalytics(allRows);
    }

    if (!data || data.length === 0) {
      break;
    }

    allRows.push(...(data as unknown as readonly SiteVisitRow[]));
    if (data.length < PAGE_SIZE) {
      break;
    }
  }

  return computePlatformAnalytics(allRows);
}
