// Client: Vista sobria para usuarios no autenticados que visitan /perfil
"use client";

import { useAuth } from "@/context/auth-context";

export function ProfileGuestView() {
  const { openAuthModal } = useAuth();

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-white p-8 text-center shadow-xs">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[var(--primary)] shadow-2xs">
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>

      <h1 className="mt-4 text-xl font-bold tracking-tight text-neutral-900">
        Tu Perfil de Aficionado
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        Inicia sesión o crea tu cuenta para guardar tus porras en cada jornada,
        acumular puntos en la clasificación y participar en los debates de Mareona.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={() => openAuthModal("signin")}
          className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white shadow-xs transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => openAuthModal("signup")}
          className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-bold text-neutral-700 shadow-2xs transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        >
          Crear cuenta
        </button>
      </div>
    </div>
  );
}
