// Client: Cabecera de perfil estilo timeline con avatar, métricas y acciones rápidas
"use client";

import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "@/components/auth/auth-avatar";

interface ProfileHeaderProps {
  readonly isEditing: boolean;
  readonly onToggleEdit: () => void;
}

export function ProfileHeader({ isEditing, onToggleEdit }: ProfileHeaderProps) {
  const { profile, user, handleSignOut } = useAuth();

  const displayName = profile?.display_name || profile?.username || "Aficionado";
  const username = profile?.username || "aficionado";
  const points = profile?.points ?? 0;

  const createdAtFormatted = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      })
    : "temporada actual";

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
            onClick={onToggleEdit}
            aria-expanded={isEditing}
            className={`min-h-9 rounded-full px-4 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
              isEditing
                ? "bg-neutral-900 text-white"
                : "border border-[var(--border)] bg-white text-neutral-900 hover:bg-[var(--surface)]"
            }`}
          >
            {isEditing ? "Cerrar edición" : "Editar perfil"}
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="min-h-9 rounded-full border border-[var(--border)] bg-white px-3.5 text-xs font-semibold text-[var(--primary)] transition-colors hover:border-red-200 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            Cerrar sesión
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
        <span>
          <strong className="font-sans font-bold tabular-nums text-neutral-900">
            {points}
          </strong>{" "}
          puntos
        </span>
        <span aria-hidden="true" className="text-neutral-300">·</span>
        <span>Desde {createdAtFormatted}</span>
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
