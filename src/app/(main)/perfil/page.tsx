// Client: Página principal de perfil de aficionado con vista y edición en el mismo bloque
"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { ProfileGuestView } from "./profile-guest-view";
import { ProfileHeader } from "./profile-header";
import { ProfileEditForm } from "./profile-edit-form";
import { ProfilePostsList } from "./profile-posts-list";

export default function PerfilPage() {
  const { user, profile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl py-4 sm:py-6">
        <div
          className="h-96 w-full animate-pulse rounded-2xl border border-[var(--border)] bg-neutral-100"
          aria-busy="true"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-2xl py-4 sm:py-6">
        <ProfileGuestView />
      </div>
    );
  }

  const displayName = profile?.display_name || profile?.username || "Aficionado";
  const username = profile?.username || "aficionado";

  return (
    <div className="mx-auto w-full max-w-2xl py-4 sm:py-6">
      <div className="w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-2xs">
        {isEditing ? (
          <ProfileEditForm
            onCancel={() => setIsEditing(false)}
            onSaved={() => setIsEditing(false)}
          />
        ) : (
          <ProfileHeader onEdit={() => setIsEditing(true)} />
        )}

        <ProfilePostsList
          userId={user.id}
          displayName={displayName}
          username={username}
          avatarUrl={profile?.avatar_url}
        />
      </div>
    </div>
  );
}
