// Client: Cabecera con datos y acciones de relación del perfil de aficionado
"use client";

import Link from "next/link";
import { UserPlus, UserCheck, UserX } from "lucide-react";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import type { UserSocialProfile } from "@/lib/social/friendship-schemas";

interface ProfileModalHeaderProps {
  readonly profile: UserSocialProfile;
  readonly isCurrentUser: boolean;
  readonly onSendRequest: () => void;
  readonly onRemoveFriend: () => void;
  readonly onClose: () => void;
  readonly isPendingAction: boolean;
}

export function ProfileModalHeader({
  profile,
  isCurrentUser,
  onSendRequest,
  onRemoveFriend,
  onClose,
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

  const displayName = profile.displayName || profile.username;

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
        ) : (
          <div>
            {profile.friendshipStatus === "accepted" && (
              <button
                type="button"
                onClick={onRemoveFriend}
                disabled={isPendingAction}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3.5 text-xs font-semibold text-neutral-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-50"
              >
                <UserX className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Dejar de conectar</span>
              </button>
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

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
        <span>
          <strong className="font-sans font-bold tabular-nums text-neutral-900">
            {profile.points}
          </strong>{" "}
          puntos
        </span>
        <span aria-hidden="true" className="text-neutral-300">·</span>
        <span>Desde {memberSince}</span>
      </div>
    </div>
  );
}
