// Client: Cabecera de perfil estilo timeline con avatar, métricas y acciones rápidas
"use client";

import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "@/components/auth/auth-avatar";
import { getDictionary } from "@/i18n";

interface ProfileHeaderProps {
  readonly onEdit: () => void;
}

export function ProfileHeader({ onEdit }: ProfileHeaderProps) {
  const dict = getDictionary();
  const { profile, user, handleSignOut } = useAuth();

  const displayName = profile?.display_name || profile?.username || dict.auth.common.defaultFanName;
  const username = profile?.username || "aficionado";

  const createdAtFormatted = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      })
    : dict.profile.header.currentSeasonFallback;

  return (
    <div className="border-b border-[var(--border)] bg-white px-4 py-5 sm:px-5">
      <div className="flex items-start justify-between gap-4">
        <AuthAvatar
          src={profile?.avatar_url}
          alt={displayName}
          size="xl"
          className="border-2 border-white shadow-xs ring-1 ring-neutral-100"
        />

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="min-h-9 rounded-full border border-[var(--border)] bg-white px-4 text-xs font-bold text-neutral-900 transition-colors hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            {dict.profile.header.editButton}
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="min-h-9 rounded-full border border-[var(--border)] bg-white px-3.5 text-xs font-semibold text-[var(--primary)] transition-colors hover:border-red-200 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            {dict.profile.header.signOutButton}
          </button>
        </div>
      </div>

      <div className="mt-3.5">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 truncate">
          {displayName}
        </h1>
        <p className="text-sm text-neutral-500">@{username}</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
        <span>{dict.profile.header.sincePrefix} {createdAtFormatted}</span>
        {user?.email && (
          <>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span className="truncate">{user.email}</span>
          </>
        )}
      </div>
    </div>
  );
}
