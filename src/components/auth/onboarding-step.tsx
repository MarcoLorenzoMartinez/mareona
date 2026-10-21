// Client: Paso 2 opcional de bienvenida y personalización de perfil
"use client";

import { useState } from "react";
import { generateUsernameFromEmail } from "@/lib/auth/username";
import { updateProfile } from "@/lib/auth/actions";
import { useAuth } from "@/context/auth-context";
import { ProfileAvatarPicker } from "@/app/(main)/perfil/profile-avatar-picker";

interface OnboardingStepProps {
  readonly onFinish: () => void;
}

export function OnboardingStep({ onFinish }: OnboardingStepProps) {
  const { user, profile, refreshProfile, updateLocalProfile } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const defaultUsername =
    profile?.username || (user?.email ? generateUsernameFromEmail(user.email) : "");
  const [username, setUsername] = useState<string>(defaultUsername);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Support instant local demo update
    if (profile?.id.startsWith("00000000-0000-4000-8000")) {
      updateLocalProfile({
        username: username.trim() || profile.username,
        avatar_url: selectedAvatar,
      });
      setIsSubmitting(false);
      onFinish();
      return;
    }

    const res = await updateProfile({
      username: username.trim() || undefined,
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
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">
          ¡Bienvenido a Mareona!
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Confirma tu apodo rojiblanco o sube tu foto de perfil.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <ProfileAvatarPicker
          selectedAvatar={selectedAvatar}
          onSelect={setSelectedAvatar}
          displayName={username || user?.email || "Aficionado"}
        />

        <div>
          <label
            htmlFor="onboarding-username"
            className="block text-xs font-semibold text-neutral-700 mb-1"
          >
            Tu apodo en Mareona
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
              placeholder="quini_gijon"
              pattern="^[a-zA-Z0-9_]{3,20}$"
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

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onFinish}
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Omitir por ahora
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-[var(--primary)] px-5 py-2 text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            {isSubmitting ? "Guardando..." : "Comenzar"}
          </button>
        </div>
      </form>
    </div>
  );
}
