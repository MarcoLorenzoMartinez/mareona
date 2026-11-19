/**
 * Domain types for Mareona administrative operations, role-based access control (RBAC),
 * moderation actions, user discipline, and system announcements.
 */

export type AdminRole = "admin" | "moderator";

export type AuditLogAction =
  | "ban_user"
  | "unban_user"
  | "reset_avatar"
  | "reset_username"
  | "approve_post"
  | "soft_delete_post"
  | "restore_post"
  | "toggle_announcement"
  | "update_announcement"
  | "purge_sports_cache"
  | "recalculate_porra_match";

export type AuditLogTargetType =
  | "user"
  | "post"
  | "cache"
  | "banner"
  | "system"
  | "poll";

export interface AdminAuditLog {
  readonly id: string;
  readonly adminId: string;
  readonly action: AuditLogAction;
  readonly targetType: AuditLogTargetType;
  readonly targetId: string;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
}

export interface SystemAnnouncement {
  readonly id: string;
  readonly message: string;
  readonly type: "info" | "warning" | "alert";
  readonly isActive: boolean;
  readonly readOnlyWall: boolean;
  readonly createdBy: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface DisciplinaryUser {
  readonly id: string;
  readonly username: string;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly points: number;
  readonly isBanned: boolean;
  readonly bannedUntil: string | null;
  readonly bannedReason: string | null;
  readonly createdAt: string;
}

export interface DailyTrafficPoint {
  readonly date: string;
  readonly label: string;
  readonly visits: number;
  readonly uniqueVisitors: number;
  readonly isMatchDay?: boolean;
}

export interface HourlyTrafficPoint {
  readonly hour: number;
  readonly label: string;
  readonly count: number;
  readonly percentage: number;
  readonly isPeak?: boolean;
}

export interface SectionUsageStat {
  readonly key: string;
  readonly label: string;
  readonly percentage: number;
  readonly visits: number;
}

export interface DeviceUsageStat {
  readonly device: string;
  readonly label: string;
  readonly percentage: number;
  readonly count: number;
}

export interface AccessModeStat {
  readonly mode: string;
  readonly label: string;
  readonly percentage: number;
  readonly count: number;
}

export interface GeographicOriginStat {
  readonly key: string;
  readonly label: string;
  readonly percentage: number;
  readonly visits: number;
}

export interface TopPageStat {
  readonly path: string;
  readonly label: string;
  readonly visits: number;
  readonly percentage: number;
}

export interface PlatformAnalytics {
  readonly dailyTraffic: readonly DailyTrafficPoint[];
  readonly allDailyTraffic?: readonly DailyTrafficPoint[];
  readonly hourlyTraffic: readonly HourlyTrafficPoint[];
  readonly sectionUsage: readonly SectionUsageStat[];
  readonly deviceUsage: readonly DeviceUsageStat[];
  readonly accessModes: readonly AccessModeStat[];
  readonly geographicProvinces: readonly GeographicOriginStat[];
  readonly geographicCountries: readonly GeographicOriginStat[];
  readonly topPages: readonly TopPageStat[];
  readonly avgSessionMinutes: number;
  readonly bounceRatePercentage: number;
  readonly pagesPerSession: number;
  readonly matchDayMultiplier: number | null;
}
