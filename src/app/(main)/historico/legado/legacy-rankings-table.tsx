// Client: Tabla de rankings con columnas contextuales y paginación
"use client";

import { useState } from "react";
import type { LegacyPlayerRecord } from "@/lib/historical/legacy-types";
import { LegacyRankingsRow } from "./legacy-rankings-row";
import { LegacyPagination } from "./legacy-pagination";

interface LegacyRankingsTableProps {
  readonly players: readonly LegacyPlayerRecord[];
  readonly category: "appearances" | "scorers" | "seasons";
}

const PAGE_SIZE = 20;

export function LegacyRankingsTable({ players, category }: LegacyRankingsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(players.length / PAGE_SIZE);
  const paginatedPlayers = players.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-white shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] bg-neutral-50/70 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              <th scope="col" className="py-2.5 px-3 text-center w-12">Pos</th>
              <th scope="col" className="py-2.5 px-3">Futbolista</th>
              {category === "scorers" && (
                <>
                  <th scope="col" className="py-2.5 px-3 text-center">Partidos</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Promedio (gol/partido)</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Total Goles</th>
                </>
              )}
              {category === "appearances" && (
                <>
                  <th scope="col" className="py-2.5 px-3">Posición</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Temporadas</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Minutos Jugados</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Total Partidos</th>
                </>
              )}
              {category === "seasons" && (
                <>
                  <th scope="col" className="py-2.5 px-3">Posición</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Periodo Activo</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Partidos</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Total Temporadas</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/70 font-sans tabular-nums">
            {paginatedPlayers.map((player) => (
              <LegacyRankingsRow
                key={player.name}
                player={player}
                category={category}
              />
            ))}
          </tbody>
        </table>
      </div>

      <LegacyPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={players.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        itemLabel="futbolistas"
      />
    </div>
  );
}
