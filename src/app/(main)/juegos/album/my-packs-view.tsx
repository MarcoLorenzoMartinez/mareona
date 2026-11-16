"use client"; // Client: Vista de inventario de sobres (Mis Sobres) minimalista y adaptada al diseño de Mareona

import type { DailyMissionState, PackTier, UserPackInventory } from "@/lib/cards/types";
import { PackCard } from "@/components/cards/pack-card";
import { PackMissionsPanel } from "./pack-missions-panel";
import { AlbumGuestPacksCard } from "./album-guest-packs-card";

interface MyPacksViewProps {
  readonly isAuthenticated: boolean;
  readonly onOpenAuth: () => void;
  readonly packInventory: UserPackInventory;
  readonly missionState: DailyMissionState;
  readonly duplicateCount: number;
  readonly onOpenPack: (tier: PackTier) => void;
  readonly onClaimLogin: () => void;
  readonly onClaimDailyGame?: () => void;
  readonly onRecycleDuplicates: () => void;
  readonly isOpening?: boolean;
}

/**
 * Modern, minimalist "Mis Sobres" view.
 * Requires authenticated session to open packs, prompting guests with a welcome card.
 */
export function MyPacksView({
  isAuthenticated,
  onOpenAuth,
  packInventory,
  missionState,
  duplicateCount,
  onOpenPack,
  onClaimLogin,
  onClaimDailyGame,
  onRecycleDuplicates,
  isOpening = false,
}: MyPacksViewProps) {
  const totalPacks =
    packInventory.aficionado + packInventory.rojiblanco + packInventory.leyenda;

  // Lista concreta de sobres reales que posee el aficionado
  const ownedPacks: Array<{ id: string; tier: PackTier }> = [];
  for (let i = 0; i < packInventory.aficionado; i++) {
    ownedPacks.push({ id: `aficionado-${i}`, tier: "aficionado" });
  }
  for (let i = 0; i < packInventory.rojiblanco; i++) {
    ownedPacks.push({ id: `rojiblanco-${i}`, tier: "rojiblanco" });
  }
  for (let i = 0; i < packInventory.leyenda; i++) {
    ownedPacks.push({ id: `leyenda-${i}`, tier: "leyenda" });
  }

  return (
    <div className="flex flex-col gap-8 select-none">
      {!isAuthenticated ? (
        <AlbumGuestPacksCard onOpenAuth={onOpenAuth} />
      ) : (
        /* Área principal: Sobres en posesión */
        <section aria-label="Tus sobres" className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <h2 className="font-sans text-xs font-black uppercase tracking-wider text-[var(--foreground-muted)]">
              Tus sobres
            </h2>
            <span className="font-sans text-xs font-bold tabular-nums text-neutral-600">
              {totalPacks} {totalPacks === 1 ? "sobre" : "sobres"}
            </span>
          </div>

          {totalPacks === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-neutral-50/50 py-12 px-4 text-center">
              <p className="text-sm font-bold text-neutral-800">
                No tienes sobres pendientes de abrir
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Reclama tu visita diaria o juega los retos del día para conseguir más.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center py-2">
              {ownedPacks.map((pack) => (
                <PackCard
                  key={pack.id}
                  tier={pack.tier}
                  onOpen={onOpenPack}
                  isOpening={isOpening}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Lista sobria de formas de conseguir sobres */}
      <PackMissionsPanel
        missionState={missionState}
        duplicateCount={duplicateCount}
        onClaimLogin={onClaimLogin}
        onClaimDailyGame={onClaimDailyGame}
        onRecycleDuplicates={onRecycleDuplicates}
      />
    </div>
  );
}
