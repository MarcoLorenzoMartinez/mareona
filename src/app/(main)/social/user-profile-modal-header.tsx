// Client: Cabecera con datos y acciones de relación del perfil de aficionado
"use client";

import { UserPlus, UserCheck, UserX, Award, Calendar } from "lucide-react";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import type { UserSocialProfile } from "@/lib/social/friendship-schemas";

interface ProfileModalHeaderProps {
  readonly profile: UserSocialProfile;
  readonly isCurrentUser: boolean;
  readonly onSendRequest: () => void;
  readonly onRemoveFriend: () => void;
  readonly isPendingAction: boolean;
}

export function ProfileModalHeader({
  profile,
  isCurrentUser,
  onSendRequest,
  onRemoveFriend,
  isPendingAction,
}: ProfileModalHeaderProps) {
  const memberSince = (() => {
    try {
      return new Date(profile.createdAt).toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return "reciente";
    }
  })();

  return (
    <div className="space-y-4 pb-4 border-b border-neutral-100">
      <div className="flex items-start justify-between gap-3 pr-8">
        <AuthAvatar src={profile.avatarUrl} alt={profile.displayName || profile.username} size="lg" />

        {!isCurrentUser && (
          <div>
            {profile.friendshipStatus === "accepted" && (
              <button
                type="button"
                onClick={onRemoveFriend}
                disabled={isPendingAction}
                className="flex items-center gap-1.5 rounded-full border border-neutral-300 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:border-red-200 hover:text-[var(--primary)] transition-colors cursor-pointer disabled:opacity-50"
              >
                <UserX className="h-3.5 w-3.5" />
                <span>Dejar de conectar</span>
              </button>
            )}

            {profile.friendshipStatus === "pending_sent" && (
              <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3.5 py-1.5 text-xs font-medium text-neutral-500">
                <UserCheck className="h-3.5 w-3.5" />
                <span>Solicitud enviada</span>
              </span>
            )}

            {profile.friendshipStatus === "pending_received" && (
              <button
                type="button"
                onClick={onSendRequest}
                disabled={isPendingAction}
                className="flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-90 cursor-pointer disabled:opacity-50"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Aceptar solicitud</span>
              </button>
            )}

            {profile.friendshipStatus === "none" && (
              <button
                type="button"
                onClick={onSendRequest}
                disabled={isPendingAction}
                className="flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-90 cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Conectar</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-base font-bold text-neutral-900">{profile.displayName || profile.username}</h3>
        <p className="text-xs font-medium text-neutral-400">@{profile.username}</p>
      </div>

      <div className="flex items-center gap-4 text-xs text-neutral-500 flex-wrap">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-neutral-400" />
          <span>Aficionado desde {memberSince}</span>
        </span>
        <span className="flex items-center gap-1">
          <Award className="h-3.5 w-3.5 text-neutral-400" />
          <span className="tabular-nums font-sans font-bold text-neutral-800">{profile.points}</span>
          <span>puntos</span>
        </span>
      </div>
    </div>
  );
}
