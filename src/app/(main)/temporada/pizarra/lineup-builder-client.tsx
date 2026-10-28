// Client: Estado interactivo de la pizarra, formaciones, arrastre y exportación PNG
"use client";

import { useState, useMemo, useCallback } from "react";
import { PitchBoard } from "@/components/lineup-builder/pitch-board";
import { RosterDrawer } from "@/components/lineup-builder/roster-drawer";
import { TACTICAL_FORMATIONS } from "@/lib/lineup-builder/formations";
import { exportLineupToBlob } from "@/lib/lineup-builder/export-canvas";
import type {
  LineupPlayer,
  TacticalFormationKey,
  PitchAssignedPlayer,
  PitchCoordinate,
} from "@/lib/lineup-builder/types";

interface LineupBuilderClientProps {
  readonly initialRoster: readonly LineupPlayer[];
}

export function LineupBuilderClient({ initialRoster }: LineupBuilderClientProps) {
  const [formationKey, setFormationKey] = useState<TacticalFormationKey>("4-2-3-1");
  const [customPlayers, setCustomPlayers] = useState<readonly LineupPlayer[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>("s-por");
  const [isExporting, setIsExporting] = useState(false);

  // Combina plantilla inicial con jugadores personalizados añadidos por el usuario
  const allPlayers = useMemo(
    () => [...customPlayers, ...initialRoster],
    [customPlayers, initialRoster]
  );

  // Inicializa los slots según la formación táctica elegida
  const [assignedSlots, setAssignedSlots] = useState<PitchAssignedPlayer[]>(() => {
    const formation = TACTICAL_FORMATIONS["4-2-3-1"];
    return formation.slots.map((slot) => ({
      slotId: slot.id,
      role: slot.defaultRole,
      coord: slot.defaultCoord,
      player: null,
    }));
  });

  const handleFormationChange = (newKey: TacticalFormationKey) => {
    setFormationKey(newKey);
    const formation = TACTICAL_FORMATIONS[newKey];
    setAssignedSlots((prev) => {
      return formation.slots.map((slot, index) => {
        const existing = prev[index];
        return {
          slotId: slot.id,
          role: slot.defaultRole,
          coord: slot.defaultCoord,
          player: existing?.player ?? null,
        };
      });
    });
  };

  const handleResetLineup = () => {
    const formation = TACTICAL_FORMATIONS[formationKey];
    setAssignedSlots(
      formation.slots.map((slot) => ({
        slotId: slot.id,
        role: slot.defaultRole,
        coord: slot.defaultCoord,
        player: null,
      }))
    );
  };

  const handleMoveSlot = useCallback((slotId: string, newCoord: PitchCoordinate) => {
    setAssignedSlots((prev) =>
      prev.map((s) => (s.slotId === slotId ? { ...s, coord: newCoord } : s))
    );
  }, []);

  const handleAssignPlayer = (player: LineupPlayer) => {
    if (!selectedSlotId) return;
    setAssignedSlots((prev) => {
      // Si el jugador ya estaba en otra posición, intercambiar o liberar
      return prev.map((s) => {
        if (s.slotId === selectedSlotId) {
          return { ...s, player };
        }
        if (s.player?.id === player.id) {
          return { ...s, player: null };
        }
        return s;
      });
    });

    // Auto-avanza al siguiente slot vacío si existe
    const nextEmpty = assignedSlots.find(
      (s) => s.slotId !== selectedSlotId && !s.player
    );
    if (nextEmpty) {
      setSelectedSlotId(nextEmpty.slotId);
    }
  };

  const handleAddCustomPlayer = (player: LineupPlayer) => {
    setCustomPlayers((prev) => [player, ...prev]);
    handleAssignPlayer(player);
  };

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const blob = await exportLineupToBlob({
        formationLabel: formationKey,
        teamTitle: "Real Sporting",
        starters: assignedSlots,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `once-real-sporting-${formationKey.toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al exportar pizarra:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const assignedPlayerIds = useMemo(
    () => new Set(assignedSlots.map((s) => s.player?.id).filter(Boolean) as string[]),
    [assignedSlots]
  );

  const activeSlot = assignedSlots.find((s) => s.slotId === selectedSlotId);

  return (
    <div className="flex flex-col gap-6">
      {/* Barra superior de controles tácticos (Esquema + Acciones) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-2xs">
        {/* Selector de esquema tipo píldora */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Esquema:
          </span>
          {(["4-2-3-1", "4-4-2", "4-3-3", "5-3-2", "3-4-3", "3-5-2"] as const).map(
            (key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleFormationChange(key)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                  formationKey === key
                    ? "bg-[#e2001a] text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {key}
              </button>
            )
          )}
        </div>

        {/* Acciones principales */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleResetLineup}
            className="rounded-full border border-neutral-300 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Reiniciar
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#e2001a] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#b30015] disabled:opacity-50 transition-colors"
          >
            {isExporting ? "Generando..." : "Descargar Imagen"}
          </button>
        </div>
      </div>

      {/* Grid: Campo de fútbol interactivo + Drawer lateral de futbolistas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 flex justify-center">
          <PitchBoard
            starters={assignedSlots}
            selectedSlotId={selectedSlotId}
            onSelectSlot={setSelectedSlotId}
            onMoveSlot={handleMoveSlot}
            pitchTitle="Real Sporting"
            formationLabel={formationKey}
          />
        </div>

        <div className="lg:col-span-5">
          <RosterDrawer
            players={allPlayers}
            assignedPlayerIds={assignedPlayerIds}
            activeSlotRole={activeSlot ? activeSlot.role : null}
            onAssignPlayer={handleAssignPlayer}
            onAddCustomPlayer={handleAddCustomPlayer}
          />
        </div>
      </div>
    </div>
  );
}
