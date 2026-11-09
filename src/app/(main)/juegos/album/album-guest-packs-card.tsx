"use client"; // Client: Tarjeta de bienvenida e incentivo de inicio de sesión para abrir sobres

import { PackCard } from "@/components/cards/pack-card";

interface AlbumGuestPacksCardProps {
  readonly onOpenAuth: () => void;
}

/**
 * Guest welcome banner for the "Mis Sobres" tab.
 * Prompts anonymous fans to sign in to claim their 2 welcome booster packs permanently,
 * preventing orphan cards and rerolling exploits.
 */
export function AlbumGuestPacksCard({ onOpenAuth }: AlbumGuestPacksCardProps) {
  return (
    <section
      aria-label="Bienvenida al Álbum"
      className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-10 text-center shadow-xs select-none"
    >
      {/* Pill header */}
      <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e2001a]/10 px-3 py-1 font-sans text-xs font-bold text-[#e2001a]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#e2001a]" aria-hidden="true" />
        <span>2 sobres de regalo</span>
      </div>

      {/* Main headline */}
      <h2 className="mt-3.5 max-w-lg font-sans text-base sm:text-xl font-black text-[var(--foreground)] leading-snug">
        Inicia sesión para recibir tus 2 sobres de bienvenida y empezar tu colección rojiblanca.
      </h2>

      {/* Physical packs showcase */}
      <div className="my-6 sm:my-8 flex w-full max-w-sm sm:max-w-md items-center justify-center gap-4 sm:gap-6">
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
        className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#e2001a] px-8 py-3 font-sans text-sm sm:text-base font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#b30015] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2001a] cursor-pointer"
      >
        Abrir sobre
      </button>

      {/* Security footnote */}
      <p className="mt-3 text-xs text-neutral-400">
        Tus cartas quedarán guardadas en tu cuenta para verlas y completarlas desde cualquier dispositivo.
      </p>
    </section>
  );
}
