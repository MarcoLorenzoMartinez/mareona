"use client"; // Client: Vista de inventario de sobres (Mis Sobres) y expositor estilo FUT

import type { DailyMissionState, PackTier, UserPackInventory } from "@/lib/cards/types";
import { PackCard } from "@/components/cards/pack-card";
import { PackMissionsPanel } from "./pack-missions-panel";

interface MyPacksViewProps {
  readonly packInventory: UserPackInventory;
  readonly missionState: DailyMissionState;
  readonly duplicateCount: number;
  readonly onOpenPack: (tier: PackTier) => void;
  readonly onClaimLogin: () => void;
  readonly onRecycleDuplicates: () => void;
  readonly isOpening?: boolean;
}

/**
 * "Mis Sobres" inventory view for Mareona's official card collection.
 * Displays user's available pack stock in a clean minimal grid alongside live missions.
 */
export function MyPacksView({
  packInventory,
  missionState,
  duplicateCount,
  onOpenPack,
  onClaimLogin,
  onRecycleDuplicates,
  isOpening = false,
}: MyPacksViewProps) {
  const totalPacks =
    packInventory.aficionado + packInventory.rojiblanco + packInventory.leyenda;

  // Lista concreta de cada uno de los sobres reales que posee el aficionado
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
    <div className="flex flex-col gap-6 select-none">
      {/* Vitrina de Sobres disponibles */}
      <section
        aria-label="Tus Sobres Disponibles"
        className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-gradient-to-b from-neutral-50 to-white p-5 shadow-2xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
              Vitrina de Sobres
            </h2>
            <p className="text-xs text-[var(--foreground-muted)]">
              Toca directamente sobre cualquier sobre para rasgarlo y descubrir tus cartas.
            </p>
          </div>
          <span className="self-start sm:self-auto rounded-full bg-neutral-100 px-3 py-1 font-sans text-xs font-bold tabular-nums text-neutral-700">
            {totalPacks} {totalPacks === 1 ? "sobre disponible" : "sobres disponibles"}
          </span>
        </div>

        {totalPacks === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-white py-12 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-xl">
              📦
            </div>
            <h3 className="mt-3 text-sm font-bold text-neutral-800">
              No tienes sobres en tu inventario
            </h3>
            <p className="mt-1 max-w-md text-xs text-neutral-500">
              Cumple las misiones de abajo, supera el reto diario de juegos o pronostica en La Porra para conseguir más sobres.
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

      {/* Panel de Misiones & Reciclaje */}
      <PackMissionsPanel
        missionState={missionState}
        duplicateCount={duplicateCount}
        onClaimLogin={onClaimLogin}
        onRecycleDuplicates={onRecycleDuplicates}
      />
    </div>
  );
}
