// Client: Panel accesible para filtrar y seleccionar jugadores de la plantilla
"use client";

import React, { useState, useMemo } from "react";
import { X } from "lucide-react";
import { PlayerRowItem } from "./player-row-item";
import { CustomPlayerModal } from "./custom-player-modal";
import { RosterFilterPills } from "./roster-filter-pills";
import {
  getTargetPositionFromRole,
  filterAndSortRosterPlayers,
  calculateDividerIndex,
} from "@/lib/lineup-builder/roster-filter";
import type { LineupPlayer, PlayerCategory } from "@/lib/lineup-builder/types";
import { getDictionary } from "@/i18n";

interface RosterDrawerProps {
  readonly players: readonly LineupPlayer[];
  readonly assignedPlayerIds: ReadonlySet<string>;
  readonly activeSlotRole: string | null;
  readonly activePlayer?: LineupPlayer | null;
  readonly stagedPlayerId?: string | null;
  readonly onAssignPlayer: (player: LineupPlayer) => void;
  readonly onClearSlot?: () => void;
  readonly onAddCustomPlayer: (player: LineupPlayer) => void;
  readonly onClose?: () => void;
  readonly isModal?: boolean;
}

export function RosterDrawer({
  players,
  assignedPlayerIds,
  activeSlotRole,
  activePlayer,
  stagedPlayerId,
  onAssignPlayer,
  onClearSlot,
  onAddCustomPlayer,
  onClose,
  isModal = false,
}: RosterDrawerProps) {
  const dict = getDictionary();
  const [selectedCategory, setSelectedCategory] = useState<PlayerCategory | "all">("first_team");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const targetPosition = useMemo(
    () => getTargetPositionFromRole(activeSlotRole),
    [activeSlotRole]
  );

  const sortedAndFilteredPlayers = useMemo(
    () =>
      filterAndSortRosterPlayers({
        players,
        assignedPlayerIds,
        selectedCategory,
        selectedPosition,
        searchQuery,
        targetPosition,
      }),
    [players, assignedPlayerIds, selectedCategory, selectedPosition, searchQuery, targetPosition]
  );

  const dividerIndex = useMemo(
    () => calculateDividerIndex(sortedAndFilteredPlayers, targetPosition, selectedPosition),
    [sortedAndFilteredPlayers, targetPosition, selectedPosition]
  );

  return (
    <aside
      aria-label={dict.lineupBuilder.roster.asideAria}
      className={`flex flex-col w-full bg-white ${
        isModal ? "p-4" : "rounded-2xl border border-[var(--border)] p-4 shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-bold text-neutral-900">
          {dict.lineupBuilder.roster.title}
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.lineupBuilder.roster.closeAria}
            className="rounded-full p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2001a]"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="mt-3">
        <input
          type="search"
          placeholder={dict.lineupBuilder.roster.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs focus:border-[#e2001a] focus:bg-white focus:outline-none"
        />
      </div>

      <RosterFilterPills
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedPosition={selectedPosition}
        onSelectPosition={setSelectedPosition}
      />

      <ul
        className={`mt-3 flex flex-col gap-2 overflow-y-auto pr-1 ${
          isModal ? "max-h-[50vh] sm:max-h-[420px]" : "max-h-[460px]"
        }`}
      >
        {sortedAndFilteredPlayers.length > 0 ? (
          sortedAndFilteredPlayers.map((player, index) => (
            <React.Fragment key={player.id}>
              {index === dividerIndex && (
                <li
                  role="separator"
                  className="my-1.5 flex items-center gap-2"
                  aria-label={dict.lineupBuilder.roster.otherPositionsAria}
                >
                  <div className="h-[1px] flex-1 bg-linear-to-r from-transparent via-[#e2001a]/40 to-transparent" />
                  <span className="text-[10px] font-semibold text-[#e2001a]/80 uppercase tracking-wider">
                    {dict.lineupBuilder.roster.otherPositionsLabel}
                  </span>
                  <div className="h-[1px] flex-1 bg-linear-to-r from-transparent via-[#e2001a]/40 to-transparent" />
                </li>
              )}
              <PlayerRowItem
                player={player}
                isAssigned={assignedPlayerIds.has(player.id)}
                isCurrentSlotPlayer={activePlayer?.id === player.id}
                isStaged={player.id === stagedPlayerId}
                onAssign={onAssignPlayer}
                onUnassign={onClearSlot}
              />
            </React.Fragment>
          ))
        ) : (
          <li className="py-8 text-center text-xs text-neutral-400">
            {dict.lineupBuilder.roster.emptySearch}
          </li>
        )}
      </ul>

      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex justify-center">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="text-[11px] font-medium text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          {dict.lineupBuilder.roster.addPlayerButton}
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
