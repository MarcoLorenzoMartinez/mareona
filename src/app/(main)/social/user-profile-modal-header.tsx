// Client: Cabecera con datos, acciones de amistad y controles de seguridad (bloqueo/denuncia)
"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, UserCheck, UserX, MessageSquare, Ban, Flag } from "lucide-react";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { toast } from "@/lib/ui/toast";
import { blockUserAction, unblockUserAction } from "@/lib/social/safety-actions";
import { UserReportModal } from "./user-report-modal";
import type { UserSocialProfile } from "@/lib/social/friendship-schemas";

interface ProfileModalHeaderProps {
  readonly profile: UserSocialProfile;
  readonly isCurrentUser: boolean;
  readonly onSendRequest: () => void;
  readonly onRemoveFriend: () => void;
  readonly onOpenChat?: () => void;
  readonly onClose: () => void;
  readonly isPendingAction: boolean;
  readonly onBlockStateChange?: (isBlocked: boolean) => void;
}

export function ProfileModalHeader({
  profile,
  isCurrentUser,
  onSendRequest,
  onRemoveFriend,
  onOpenChat,
  onClose,
  isPendingAction,
  onBlockStateChange,
}: ProfileModalHeaderProps) {
  const [isBlockBusy, setIsBlockBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const memberSince = (() => {
    try {
      return new Date(profile.createdAt).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    } catch {
      return "reciente";
    }
  })();

  const displayName = profile.displayName || profile.username;
  const isBlocked = Boolean(profile.isBlockedByMe);

  const handleToggleBlock = async () => {
    if (isBlockBusy) return;
    setIsBlockBusy(true);
    const res = isBlocked
      ? await unblockUserAction({ targetUserId: profile.id })
      : await blockUserAction({ targetUserId: profile.id });
    setIsBlockBusy(false);

    if (res.success) {
      toast.success(isBlocked ? `Has desbloqueado a @${profile.username}` : `Has bloqueado a @${profile.username}`);
      onBlockStateChange?.(!isBlocked);
    } else {
      toast.error(res.error ?? "No se pudo actualizar el bloqueo");
    }
  };

  return (
    <div className="border-b border-[var(--border)] bg-white px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <AuthAvatar src={profile.avatarUrl} alt={displayName} size="lg" />

        {isCurrentUser ? (
          <Link
            href="/perfil"
            onClick={onClose}
            className="inline-flex min-h-9 items-center rounded-full border border-[var(--border)] bg-white px-4 text-xs font-bold text-neutral-900 transition-colors hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            Editar perfil
          </Link>
        ) : isBlocked ? (
          <button
            type="button"
            onClick={handleToggleBlock}
            disabled={isBlockBusy}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 text-xs font-bold text-[var(--primary)] hover:bg-red-100 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
          >
            <Ban className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Desbloquear</span>
          </button>
        ) : (
          <div>
            {profile.friendshipStatus === "accepted" && (
              <div className="flex items-center gap-1.5">
                {onOpenChat && (
                  <button
                    type="button"
                    onClick={onOpenChat}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[var(--primary)] px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-[#b30015] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Mensaje</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onRemoveFriend}
                  disabled={isPendingAction}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 text-xs font-semibold text-neutral-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-50 cursor-pointer"
                >
                  <UserX className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Eliminar</span>
                </button>
              </div>
            )}
            {profile.friendshipStatus === "pending_sent" && (
              <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[var(--surface)] px-3.5 text-xs font-semibold text-neutral-500">
                <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Solicitud enviada</span>
              </span>
            )}
            {profile.friendshipStatus === "pending_received" && (
              <button
                type="button"
                onClick={onSendRequest}
                disabled={isPendingAction}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 text-xs font-bold text-white shadow-2xs transition-opacity hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-50"
              >
                <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Aceptar solicitud</span>
              </button>
            )}
            {profile.friendshipStatus === "none" && (
              <button
                type="button"
                onClick={onSendRequest}
                disabled={isPendingAction}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 text-xs font-bold text-white shadow-2xs transition-opacity hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-50"
              >
                <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Conectar</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-base font-bold text-neutral-900 truncate">{displayName}</h3>
        <p className="text-xs text-neutral-500">@{profile.username}</p>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
        <div className="flex items-center gap-x-2">
          <span>Desde {memberSince}</span>
        </div>

        {!isCurrentUser && (
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleToggleBlock} disabled={isBlockBusy} className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-xs cursor-pointer">
              <Ban className="h-3 w-3" aria-hidden="true" />
              <span>{isBlocked ? "Desbloquear" : "Bloquear"}</span>
            </button>
            <button type="button" onClick={() => setReportOpen(true)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-xs cursor-pointer">
              <Flag className="h-3 w-3" aria-hidden="true" />
              <span>Denunciar</span>
            </button>
          </div>
        )}
      </div>

      <UserReportModal
        isOpen={reportOpen}
        targetUser={{ id: profile.id, name: displayName, username: profile.username }}
        onClose={() => setReportOpen(false)}
        onBlocked={() => onBlockStateChange?.(true)}
      />
    </div>
  );
}
