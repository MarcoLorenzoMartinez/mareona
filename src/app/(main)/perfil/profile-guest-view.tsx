// Client: Vista sobria para usuarios no autenticados que visitan /perfil
"use client";

import { useAuth } from "@/context/auth-context";

export function ProfileGuestView() {
  const { openAuthModal } = useAuth();

  return (
    <div className="w-full rounded-2xl border border-[var(--border)] bg-white px-6 py-12 text-center shadow-2xs">
      <h1 className="text-xl font-bold tracking-tight text-neutral-900">
        Tu perfil
      </h1>

      <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
        <button
          type="button"
          onClick={() => openAuthModal("signin")}
          className="min-h-10 rounded-full bg-[var(--primary)] px-6 text-sm font-bold text-white shadow-2xs transition-opacity hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => openAuthModal("signup")}
          className="min-h-10 rounded-full border border-[var(--border)] bg-white px-6 text-sm font-bold text-neutral-800 transition-colors hover:bg-[var(--surface)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        >
          Crear cuenta
        </button>
      </div>
    </div>
  );
}
