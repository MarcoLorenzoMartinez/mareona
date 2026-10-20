// Client: Paso 2 opcional de bienvenida y personalización de perfil rojiblanco
"use client";

import { useState } from "react";
import Image from "next/image";
import { SPORTING_AVATAR_PRESETS } from "@/lib/auth/schemas";
import { updateProfile } from "@/lib/auth/actions";
import { useAuth } from "@/context/auth-context";

interface OnboardingStepProps {
  readonly onFinish: () => void;
}

export function OnboardingStep({ onFinish }: OnboardingStepProps) {
  const { profile, refreshProfile, updateLocalProfile } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    SPORTING_AVATAR_PRESETS[0].url
  );
  const [username, setUsername] = useState<string>(profile?.username ?? "");
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
          Personaliza tu imagen y apodo rojiblanco o continúa directamente.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-2">
            Elige tu avatar sportinguista
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {SPORTING_AVATAR_PRESETS.map((preset) => {
              const isSelected = selectedAvatar === preset.url;
              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => setSelectedAvatar(preset.url)}
                  className={`group flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                    isSelected
                      ? "border-[var(--primary)] bg-red-50/50 shadow-xs"
                      : "border-neutral-200 hover:border-neutral-300 bg-white"
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="relative h-11 w-11 overflow-hidden rounded-full border border-neutral-100 shadow-2xs">
                    <Image
                      src={preset.url}
                      alt={preset.label}
                      width={44}
                      height={44}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span
                    className={`text-[10px] font-medium leading-none ${
                      isSelected ? "font-bold text-[var(--primary)]" : "text-neutral-600"
                    }`}
                  >
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

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

        <div className="pt-2 flex flex-col gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[var(--primary)] py-2.5 text-sm font-bold text-white shadow-xs transition-opacity hover:opacity-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            {isSubmitting ? "Guardando..." : "Guardar mi perfil"}
          </button>
          <button
            type="button"
            onClick={onFinish}
            disabled={isSubmitting}
            className="w-full py-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            Omitir por ahora
          </button>
        </div>
      </form>
    </div>
  );
}
