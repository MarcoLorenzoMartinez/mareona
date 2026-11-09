// Client: Paso interactivo obligatorio de elección de nombre y usuario al registrar cuenta
"use client";

import { useState } from "react";
import { generateUsernameFromEmail, generateDefaultDisplayName } from "@/lib/auth/username";
import { updateProfile } from "@/lib/auth/actions";
import { useAuth } from "@/context/auth-context";
import { ProfileAvatarPicker } from "@/app/(main)/perfil/profile-avatar-picker";

interface OnboardingStepProps {
  readonly onFinish: () => void;
  readonly onCancel: () => void;
}

/**
 * Mandatory identity selection screen presented during account creation.
 * Pre-fills proposed default values (derived from OAuth metadata or email),
 * allowing fans to customize them or confirm them directly with a single click.
 */
export function OnboardingStep({ onFinish, onCancel }: OnboardingStepProps) {
  const { user, profile, refreshProfile, updateLocalProfile } = useAuth();

  const defaultDisplayName =
    profile?.display_name ||
    generateDefaultDisplayName(
      (user?.user_metadata?.full_name as string | undefined) ??
        (user?.user_metadata?.name as string | undefined),
      user?.email
    );

  const defaultUsername =
    profile?.username || (user?.email ? generateUsernameFromEmail(user.email) : "aficionado");

  const [displayName, setDisplayName] = useState<string>(defaultDisplayName);
  const [username, setUsername] = useState<string>(defaultUsername);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    () => profile?.avatar_url || (user?.user_metadata?.avatar_url as string | undefined) || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const finalDisplayName = displayName.trim() || defaultDisplayName;
    const finalUsername = username.trim() || defaultUsername;

    // Instant local state update for demo accounts
    if (profile?.id.startsWith("00000000-0000-4000-8000")) {
      updateLocalProfile({
        display_name: finalDisplayName,
        username: finalUsername,
        avatar_url: selectedAvatar,
      });
      setIsSubmitting(false);
      onFinish();
      return;
    }

    const res = await updateProfile({
      displayName: finalDisplayName,
      username: finalUsername,
      avatarUrl: selectedAvatar,
    });

    if (!res.success) {
      setErrorMessage(res.error ?? "No se pudo actualizar el perfil");
      setIsSubmitting(false);
      return;
    }

    await refreshProfile();
    setIsSubmitting(false);
    onFinish();
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900">
          Elige tu nombre y usuario
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Puedes personalizar tus datos o dejar los valores sugeridos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <ProfileAvatarPicker
          selectedAvatar={selectedAvatar}
          onSelect={setSelectedAvatar}
          displayName={displayName || username || user?.email || "Aficionado"}
        />

        {/* Campo 1: Nombre en Mareona */}
        <div>
          <label
            htmlFor="onboarding-display-name"
            className="block text-xs font-semibold text-neutral-700 mb-1"
          >
            Tu nombre en Mareona
          </label>
          <input
            id="onboarding-display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="ej. Pelayo García"
            maxLength={40}
            className="w-full rounded-lg border border-neutral-200 bg-white py-2 px-3 text-sm font-sans text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        {/* Campo 2: Apodo / Usuario */}
        <div>
          <label
            htmlFor="onboarding-username"
            className="block text-xs font-semibold text-neutral-700 mb-1"
          >
            Tu apodo (@usuario)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-neutral-400">
              @
            </span>
            <input
              id="onboarding-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="pelayo_1905"
              pattern="^[a-zA-Z0-9_]{3,20}$"
              maxLength={20}
              title="De 3 a 20 caracteres (letras, números y guión bajo)"
              className="w-full rounded-lg border border-neutral-200 bg-white py-2 pr-3 pl-7 text-sm font-sans text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs font-medium text-[var(--primary)]"
          >
            {errorMessage}
          </div>
        )}

        <div className="pt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 rounded-lg cursor-pointer"
          >
            Cancelar y salir
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 min-h-[44px] rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white shadow-xs transition-opacity hover:opacity-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
          >
            {isSubmitting ? "Guardando..." : "Comenzar"}
          </button>
        </div>
      </form>
    </div>
  );
}
