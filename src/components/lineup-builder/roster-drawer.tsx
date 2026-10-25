// Client: Panel lateral y cajón accesible para filtrar y seleccionar jugadores
"use client";

import { useState, useMemo } from "react";
import { PlayerRowItem } from "./player-row-item";
import { CustomPlayerModal } from "./custom-player-modal";
import type { LineupPlayer, PlayerCategory } from "@/lib/lineup-builder/types";

interface RosterDrawerProps {
  readonly players: readonly LineupPlayer[];
  readonly assignedPlayerIds: ReadonlySet<string>;
  readonly activeSlotRole: string | null;
  readonly onAssignPlayer: (player: LineupPlayer) => void;
  readonly onAddCustomPlayer: (player: LineupPlayer) => void;
}

/**
 * Maps granular tactical role (e.g. LI, DFC, MCD, DC) to high-level squad line.
 */
function getTargetPositionFromRole(role: string | null): "POR" | "DEF" | "MED" | "DEL" | null {
  if (!role) return null;
  if (role === "POR") return "POR";
  if (["LI", "LD", "DFC", "CAD", "CAI"].includes(role)) return "DEF";
  if (["MCD", "MC", "MCO"].includes(role)) return "MED";
  if (["EI", "ED", "DC"].includes(role)) return "DEL";
  return null;
}

export function RosterDrawer({
  players,
  assignedPlayerIds,
  activeSlotRole,
  onAssignPlayer,
  onAddCustomPlayer,
}: RosterDrawerProps) {
  const [selectedCategory, setSelectedCategory] = useState<PlayerCategory | "all">("all");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const targetPosition = useMemo(
    () => getTargetPositionFromRole(activeSlotRole),
    [activeSlotRole]
  );

  const sortedAndFilteredPlayers = useMemo(() => {
    // 1. Filtrar jugadores según filtros activos y búsqueda
    const filtered = players.filter((player) => {
      if (selectedCategory !== "all" && player.category !== selectedCategory) return false;
      if (selectedPosition !== "all" && player.defaultPosition !== selectedPosition) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName =
          player.displayName.toLowerCase().includes(query) ||
          player.fullName.toLowerCase().includes(query);
        const matchesNumber = player.shirtNumber?.toString() === query;
        if (!matchesName && !matchesNumber) return false;
      }
      return true;
    });

    // 2. Ordenar priorizando la demarcación de la posición activa y los no asignados
    return filtered.slice().sort((a, b) => {
      // Prioridad 1: Coincidencia con la demarcación de la posición que se está asignando
      if (targetPosition) {
        const aMatches = a.defaultPosition === targetPosition;
        const bMatches = b.defaultPosition === targetPosition;
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
      }

      // Prioridad 2: Jugadores que aún no están en el campo primero
      const aAssigned = assignedPlayerIds.has(a.id);
      const bAssigned = assignedPlayerIds.has(b.id);
      if (!aAssigned && bAssigned) return -1;
      if (aAssigned && !bAssigned) return 1;

      // Prioridad 3: Primer equipo antes que filial y juvenil
      const categoryOrder: Record<string, number> = {
        first_team: 0,
        custom: 1,
        filial: 2,
        juvenil: 3,
      };
      const catA = categoryOrder[a.category] ?? 99;
      const catB = categoryOrder[b.category] ?? 99;
      if (catA !== catB) return catA - catB;

      // Prioridad 4: Dorsal más bajo
      const numA = a.shirtNumber ?? 999;
      const numB = b.shirtNumber ?? 999;
      return numA - numB;
    });
  }, [players, selectedCategory, selectedPosition, searchQuery, targetPosition, assignedPlayerIds]);

  return (
    <aside
      aria-label="Selección de plantilla"
      className="flex flex-col w-full rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-bold text-neutral-900">
          Plantilla
        </h2>
      </div>

      {/* Buscador */}
      <div className="mt-3">
        <input
          type="search"
          placeholder="Buscar por nombre o dorsal..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs focus:border-[#e2001a] focus:bg-white focus:outline-none"
        />
      </div>

      {/* Selector de categoría (Píldoras) */}
      <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
        {[
          { key: "all", label: "Todos" },
          { key: "first_team", label: "1er Equipo" },
          { key: "filial", label: "Sporting At." },
          { key: "juvenil", label: "Juvenil DH" },
        ].map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCategory(cat.key as PlayerCategory | "all")}
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat.key
                ? "bg-[#e2001a] text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Selector de demarcación */}
      <div className="mt-2 flex items-center gap-1">
        {["all", "POR", "DEF", "MED", "DEL"].map((pos) => (
          <button
            key={pos}
            type="button"
            onClick={() => setSelectedPosition(pos)}
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors ${
              selectedPosition === pos
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
            }`}
          >
            {pos === "all" ? "Líneas" : pos}
          </button>
        ))}
      </div>

      {/* Lista de futbolistas ordenados con prioridad inteligente */}
      <ul className="mt-3 flex flex-col gap-2 max-h-[460px] overflow-y-auto pr-1">
        {sortedAndFilteredPlayers.length > 0 ? (
          sortedAndFilteredPlayers.map((player) => (
            <PlayerRowItem
              key={player.id}
              player={player}
              isAssigned={assignedPlayerIds.has(player.id)}
              onAssign={onAssignPlayer}
            />
          ))
        ) : (
          <li className="py-8 text-center text-xs text-neutral-400">
            No se encontraron jugadores con ese filtro
          </li>
        )}
      </ul>

      {/* Acción secundaria discreta para dar de alta jugador */}
      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex justify-center">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="text-[11px] font-medium text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          + Añadir jugador
        </button>
      </div>

      <CustomPlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddPlayer={onAddCustomPlayer}
      />
    </aside>
  );
}
