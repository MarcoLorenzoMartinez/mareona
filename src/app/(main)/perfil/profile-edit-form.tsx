// Client: Formulario accesible para editar el perfil público y avatar rojiblanco
"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { SPORTING_AVATAR_PRESETS } from "@/lib/auth/schemas";
import { updateProfile } from "@/lib/auth/actions";

export function ProfileEditForm() {
  const { profile, refreshProfile, updateLocalProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [selectedAvatar, setSelectedAvatar] = useState(
    profile?.avatar_url ?? SPORTING_AVATAR_PRESETS[0].url
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    // Support instant local demo profile update
    if (profile?.id.startsWith("00000000-0000-4000-8000")) {
      updateLocalProfile({
        display_name: displayName.trim() || null,
        username: username.trim() || profile.username,
        avatar_url: selectedAvatar,
      });
      setIsSubmitting(false);
      setStatusMessage({
        type: "success",
        text: "¡Perfil actualizado con éxito!",
      });
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
    setStatusMessage({
      type: "success",
      text: "¡Perfil actualizado con éxito!",
    });
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs">
      <h2 className="text-base font-bold text-neutral-900">
        Personalizar Identidad
      </h2>
      <p className="mt-1 text-xs text-neutral-500">
        Modifica tu nombre público, apodo y avatar rojiblanco.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-2">
            Avatar sportinguista
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SPORTING_AVATAR_PRESETS.map((preset) => {
              const isSelected = selectedAvatar === preset.url;
              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => setSelectedAvatar(preset.url)}
                  className={`flex items-center gap-2.5 rounded-xl border p-2.5 transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                    isSelected
                      ? "border-[var(--primary)] bg-red-50/50 shadow-xs"
                      : "border-neutral-200 hover:border-neutral-300 bg-white"
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-neutral-100 shadow-2xs">
                    <Image
                      src={preset.url}
                      alt={preset.label}
                      width={40}
                      height={40}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isSelected ? "font-bold text-[var(--primary)]" : "text-neutral-700"
                    }`}
                  >
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label
              htmlFor="edit-username"
              className="block text-xs font-semibold text-neutral-700 mb-1"
            >
              Apodo de usuario (@)
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
                className="w-full rounded-lg border border-neutral-200 bg-white py-2 pr-3 pl-7 text-sm font-sans text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          </div>
        </div>

        {statusMessage && (
          <div
            role="status"
            className={`rounded-lg p-3 text-xs font-medium border ${
              statusMessage.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-[var(--primary)]"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white shadow-xs transition-opacity hover:opacity-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
