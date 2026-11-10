// Client: Formulario de edición con avatar interactivo y campos de identidad
"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { updateProfile } from "@/lib/auth/actions";
import { ProfileAvatarPicker } from "./profile-avatar-picker";
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog";

interface ProfileEditFormProps {
  readonly onCancel: () => void;
  readonly onSaved?: () => void;
}

export function ProfileEditForm({ onCancel, onSaved }: ProfileEditFormProps) {
  const { profile, refreshProfile, updateLocalProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    profile?.avatar_url ?? null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    if (profile?.id.startsWith("00000000-0000-4000-8000")) {
      updateLocalProfile({
        display_name: displayName.trim() || null,
        username: username.trim() || profile.username,
        avatar_url: selectedAvatar,
      });
      setIsSubmitting(false);
      onSaved?.();
      return;
    }

    const res = await updateProfile({
      displayName: displayName.trim() || null,
      username: username.trim() || undefined,
      avatarUrl: selectedAvatar,
    });

    setIsSubmitting(false);
    if (!res.success) {
      setStatusMessage({
        type: "error",
        text: res.error ?? "No se pudo actualizar el perfil",
      });
      return;
    }

    await refreshProfile();
    onSaved?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-b border-[var(--border)] bg-white px-4 py-5 sm:px-5 space-y-4"
    >
      <ProfileAvatarPicker
        selectedAvatar={selectedAvatar}
        onSelect={setSelectedAvatar}
        displayName={displayName || profile?.display_name || "Aficionado"}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        <div>
          <label
            htmlFor="edit-display-name"
            className="block text-xs font-semibold text-neutral-700 mb-1"
          >
            Nombre visible
          </label>
          <input
            id="edit-display-name"
            type="text"
            maxLength={40}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ej. Pelayo Álvarez"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        <div>
          <label
            htmlFor="edit-username"
            className="block text-xs font-semibold text-neutral-700 mb-1"
          >
            Apodo de usuario
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-neutral-400">
              @
            </span>
            <input
              id="edit-username"
              type="text"
              pattern="^[a-zA-Z0-9_]{3,20}$"
              title="De 3 a 20 caracteres (letras, números y guión bajo)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="pelayo_rsg"
              className="w-full rounded-xl border border-[var(--border)] bg-white py-2 pr-3 pl-7 text-sm font-sans text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      {statusMessage && (
        <p
          role="alert"
          className={`text-xs font-semibold ${
            statusMessage.type === "success" ? "text-green-700" : "text-[var(--primary)]"
          }`}
        >
          {statusMessage.text}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
        <button
          type="button"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="text-xs font-semibold text-red-600 transition-colors hover:text-red-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-xs"
        >
          Eliminar mi cuenta y mis datos
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-9 rounded-full px-3.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-9 rounded-full bg-[var(--primary)] px-4 text-xs font-bold text-white shadow-2xs transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </form>
  );
}
