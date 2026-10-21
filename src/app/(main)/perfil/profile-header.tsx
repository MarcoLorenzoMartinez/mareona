// Client: Cabecera visual del perfil con avatar, apodo y botón de desconexión
"use client";

import { useAuth } from "@/context/auth-context";
import { AuthAvatar } from "@/components/auth/auth-avatar";

export function ProfileHeader() {
  const { profile, user, handleSignOut } = useAuth();

  const displayName = profile?.display_name || profile?.username || "Aficionado";
  const username = profile?.username || "aficionado";

  // Format creation timestamp
  const createdAtFormatted = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      })
    : "temporada actual";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <AuthAvatar
          src={profile?.avatar_url}
          alt={displayName}
          size="lg"
          className="border-2 border-white shadow-md ring-2 ring-neutral-100"
        />

        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 truncate">
              {displayName}
            </h1>
          </div>

          <p className="text-sm font-semibold text-neutral-500 mt-0.5">
            @{username}
          </p>

          <p className="text-xs text-neutral-400 mt-2">
            Desde {createdAtFormatted}
            {user?.email && (
              <span className="block sm:inline sm:ml-2 sm:border-l sm:border-neutral-200 sm:pl-2 text-neutral-500">
                {user.email}
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 hover:border-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
