// Client: Filtro táctico interactivo y ordenación dinámica por columnas
"use client";

import { useState, useMemo } from "react";
import type { HistoricalPlayer } from "@/lib/historical/types";

interface SeasonSquadProps {
  readonly players: readonly HistoricalPlayer[];
  readonly seasonLabel: string;
}

type PositionFilter = "all" | "Portero" | "Defensa" | "Centrocampista" | "Delantero";
type SortColumn = "dorsal" | "alias" | "position" | "played" | "minutes" | "goals";

const FILTERS: readonly { readonly id: PositionFilter; readonly label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "Portero", label: "Porteros" },
  { id: "Defensa", label: "Defensas" },
  { id: "Centrocampista", label: "Medios" },
  { id: "Delantero", label: "Delanteros" },
];

const POS_ORDER: Record<string, number> = { Portero: 1, Defensa: 2, Centrocampista: 3, Delantero: 4 };

function renderSortArrow(currentCol: SortColumn, targetCol: SortColumn, isAsc: boolean) {
  if (currentCol !== targetCol) return null;
  return (
    <span className="inline-block w-3 text-center text-[10px] text-[var(--primary)] font-bold" aria-hidden="true">
      {isAsc ? "▲" : "▼"}
    </span>
  );
}

/**
 * Dynamic official squad roster for Real Sporting with tactical position filtering
 * and interactive column sorting (dorsal, name, position, played, minutes, goals).
 */
export function HistoricalSeasonSquadTable({ players, seasonLabel }: SeasonSquadProps) {
  const [filter, setFilter] = useState<PositionFilter>("all");
  const [sortCol, setSortCol] = useState<SortColumn>("position");
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortAsc((prev) => !prev);
    } else {
      setSortCol(col);
      setSortAsc(col === "dorsal" || col === "alias" || col === "position");
    }
  };

  const processedPlayers = useMemo(() => {
    const list = filter === "all" ? [...players] : players.filter((p) => p.position === filter);
    return list.sort((a, b) => {
      let diff = 0;
      if (sortCol === "position") {
        diff = (POS_ORDER[a.position] ?? 9) - (POS_ORDER[b.position] ?? 9) || (a.dorsal ?? 999) - (b.dorsal ?? 999);
      } else if (sortCol === "dorsal") {
        diff = (a.dorsal ?? 999) - (b.dorsal ?? 999);
      } else if (sortCol === "alias") {
        diff = a.alias.localeCompare(b.alias);
      } else if (sortCol === "played") {
        diff = a.played - b.played || a.minutes - b.minutes;
      } else if (sortCol === "minutes") {
        diff = a.minutes - b.minutes;
      } else if (sortCol === "goals") {
        diff = a.goals - b.goals || a.played - b.played;
      }
      return sortAsc ? diff : -diff;
    });
  }, [players, filter, sortCol, sortAsc]);

  return (
    <section aria-label={`Plantilla oficial del Real Sporting ${seasonLabel}`} className="w-full rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <h3 className="text-base font-bold text-[var(--foreground)]">Plantilla Oficial</h3>
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filtrar por posición">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-3 py-1 text-xs cursor-pointer transition-colors ${
                filter === item.id ? "bg-[var(--primary)] text-white font-bold" : "bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs font-semibold text-[var(--foreground-muted)] uppercase select-none">
              <th scope="col" onClick={() => handleSort("dorsal")} className="w-12 py-2.5 pl-3 text-center cursor-pointer hover:text-[var(--foreground)]">
                #{renderSortArrow(sortCol, "dorsal", sortAsc)}
              </th>
              <th scope="col" onClick={() => handleSort("alias")} className="py-2.5 pl-2 pr-2 cursor-pointer hover:text-[var(--foreground)]">
                Jugador{renderSortArrow(sortCol, "alias", sortAsc)}
              </th>
              <th scope="col" onClick={() => handleSort("position")} className="w-28 py-2.5 text-center hidden sm:table-cell cursor-pointer hover:text-[var(--foreground)]">
                Pos{renderSortArrow(sortCol, "position", sortAsc)}
              </th>
              <th scope="col" onClick={() => handleSort("played")} className="w-16 py-2.5 text-center cursor-pointer hover:text-[var(--foreground)] font-bold">
                PJ{renderSortArrow(sortCol, "played", sortAsc)}
              </th>
              <th scope="col" onClick={() => handleSort("minutes")} className="w-20 py-2.5 text-center hidden md:table-cell cursor-pointer hover:text-[var(--foreground)]">
                Min{renderSortArrow(sortCol, "minutes", sortAsc)}
              </th>
              <th scope="col" onClick={() => handleSort("goals")} className="w-16 py-2.5 pr-3 text-right cursor-pointer hover:text-[var(--foreground)] font-black">
                Goles{renderSortArrow(sortCol, "goals", sortAsc)}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {processedPlayers.map((player) => (
              <tr key={`${player.alias}-${player.dorsal ?? player.fullName}`} className="hover:bg-[var(--surface)] transition-colors text-sm">
                <td className="py-2.5 pl-3 text-center tabular-nums text-xs font-bold text-[var(--foreground-muted)]">{player.dorsal ?? "—"}</td>
                <td className="py-2.5 pl-2 pr-2">
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-[var(--foreground)] truncate">{player.alias}</span>
                    {player.fullName !== player.alias && <span className="text-[11px] text-[var(--foreground-muted)] truncate max-w-[200px] sm:max-w-[320px]">{player.fullName}</span>}
                  </div>
                </td>
                <td className="py-2.5 text-center hidden sm:table-cell">
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">{player.position}</span>
                </td>
                <td className="py-2.5 text-center tabular-nums font-bold text-[var(--foreground)]">{player.played}</td>
                <td className="py-2.5 text-center tabular-nums text-xs text-[var(--foreground-muted)] hidden md:table-cell">{player.minutes > 0 ? `${player.minutes}'` : "—"}</td>
                <td className="py-2.5 pr-3 text-right tabular-nums font-black text-sm">
                  {player.goals > 0 ? <span className="text-[var(--primary)]">{player.goals}</span> : <span className="text-neutral-400 font-normal">0</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
