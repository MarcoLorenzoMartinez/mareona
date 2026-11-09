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
