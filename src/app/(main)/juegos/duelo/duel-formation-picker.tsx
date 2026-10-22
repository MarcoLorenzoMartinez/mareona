"use client"; // Client: Selección interactiva de formación táctica y asignación de cartas

import { useState } from "react";
import type { Card, TacticalFormation } from "@/lib/cards/types.ts";
import { TACTICAL_FORMATIONS } from "@/lib/cards/schemas.ts";
import { FORMATION_REQUIREMENTS } from "@/lib/cards/combat.ts";

interface DuelFormationPickerProps {
  readonly availableCards: readonly Card[];
  readonly onConfirmLineup: (formation: TacticalFormation, lineup: Card[]) => void;
}

export function DuelFormationPicker({
  availableCards,
  onConfirmLineup,
}: DuelFormationPickerProps) {
  const [selectedFormation, setSelectedFormation] = useState<TacticalFormation>("4-3-3");

  const req = FORMATION_REQUIREMENTS[selectedFormation];

  const handleStart = () => {
    // Autocompletar con las mejores cartas de la colección que satisfacen la formación
    const gks = availableCards.filter((c) => c.position === "goalkeeper").sort((a, b) => b.ovr - a.ovr);
    const defs = availableCards.filter((c) => c.position === "defender").sort((a, b) => b.ovr - a.ovr);
    const mids = availableCards.filter((c) => c.position === "midfielder").sort((a, b) => b.ovr - a.ovr);
    const fwds = availableCards.filter((c) => c.position === "forward").sort((a, b) => b.ovr - a.ovr);

    const lineup: Card[] = [
      ...gks.slice(0, req.goalkeepers),
      ...defs.slice(0, req.defenders),
      ...mids.slice(0, req.midfielders),
      ...fwds.slice(0, req.forwards),
    ];

    onConfirmLineup(selectedFormation, lineup);
  };

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xs">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
          Configura tu Once Histórico
        </h2>
        <p className="mt-1 text-xs text-[var(--foreground-muted)]">
          Elige tu formación táctica para el duelo de 11 cartas. Podrás jugar cada futbolista en el momento más oportuno.
        </p>
      </div>

      {/* Selector de Formación Táctica */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[var(--foreground)]">
          Sistema Táctico
        </label>
        <div className="flex flex-wrap gap-2">
          {TACTICAL_FORMATIONS.map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setSelectedFormation(fmt)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                selectedFormation === fmt
                  ? "bg-[#e2001a] text-white shadow-2xs"
                  : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[#e2001a]/50"
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Resumen de Demarcaciones de la Formación */}
      <div className="grid grid-cols-4 gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-center">
        <div>
          <span className="block text-[10px] font-bold text-[var(--foreground-muted)]">PORTERO</span>
          <span className="font-sans font-black tabular-nums text-sm text-[var(--foreground)]">
            {req.goalkeepers}
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-bold text-[var(--foreground-muted)]">DEFENSAS</span>
          <span className="font-sans font-black tabular-nums text-sm text-[var(--foreground)]">
            {req.defenders}
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-bold text-[var(--foreground-muted)]">MEDIOS</span>
          <span className="font-sans font-black tabular-nums text-sm text-[var(--foreground)]">
            {req.midfielders}
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-bold text-[var(--foreground-muted)]">DELANTEROS</span>
          <span className="font-sans font-black tabular-nums text-sm text-[var(--foreground)]">
            {req.forwards}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleStart}
        className="mt-2 inline-flex items-center justify-center rounded-full bg-[#e2001a] py-3 text-sm font-bold text-white shadow-md hover:bg-[#b30015] transition-colors"
      >
        Saltar al Terreno de Juego (11 vs 11)
      </button>
    </div>
  );
}
