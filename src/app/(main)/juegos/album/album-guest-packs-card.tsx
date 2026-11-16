"use client"; // Client: Tarjeta de bienvenida e incentivo de inicio de sesión para abrir sobres

import { PackCard } from "@/components/cards/pack-card";

interface AlbumGuestPacksCardProps {
  readonly onOpenAuth: () => void;
}

/**
 * Guest card for the "Mis Sobres" tab.
 * Prompts unauthenticated visitors to sign in to access starter packs and build their collection.
 */
export function AlbumGuestPacksCard({ onOpenAuth }: AlbumGuestPacksCardProps) {
  return (
    <section
      aria-label="Colección de cromos"
      className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-10 text-center shadow-xs select-none"
    >
      {/* Main headline */}
      <h2 className="font-sans text-base sm:text-lg font-bold text-[var(--foreground)]">
        Colección histórica de cromos
      </h2>
      <p className="mt-1 text-xs sm:text-sm text-[var(--foreground-muted)] max-w-sm">
        Inicia sesión para abrir tus primeros sobres y guardar tu progreso.
      </p>

      {/* Physical packs showcase */}
      <div className="my-6 flex w-full max-w-sm sm:max-w-md items-center justify-center gap-4 sm:gap-6">
        <div className="w-1/2 max-w-[170px] sm:max-w-[190px]">
          <PackCard tier="aficionado" onOpen={onOpenAuth} />
        </div>
        <div className="w-1/2 max-w-[170px] sm:max-w-[190px]">
          <PackCard tier="rojiblanco" onOpen={onOpenAuth} />
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={onOpenAuth}
        className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--primary)] px-8 py-2.5 font-sans text-sm font-bold text-white shadow-2xs transition-colors hover:bg-[var(--primary-strong)] active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
      >
        Iniciar sesión
      </button>
    </section>
  );
}
