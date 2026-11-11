// Client: Tabla de entrenadores con tintes sutiles de podio (oro, plata y bronce) y paginación
"use client";

import { useState } from "react";
import type { LegacyCoachRecord } from "@/lib/historical/legacy-types";
import { PlayerPhoto } from "@/components/media/player-photo";
import { LegacyPagination } from "./legacy-pagination";

interface LegacyCoachesTableProps {
  readonly coaches: readonly LegacyCoachRecord[];
}

const PAGE_SIZE = 20;

export function LegacyCoachesTable({ coaches }: LegacyCoachesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(coaches.length / PAGE_SIZE);
  const paginatedCoaches = coaches.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <section aria-label="Ranking histórico de entrenadores" className="flex flex-col gap-3">
      {/* Ranking Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-white shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] bg-neutral-50/70 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              <th scope="col" className="py-2.5 px-2 sm:px-3 text-center w-10 sm:w-12">Pos</th>
              <th scope="col" className="py-2.5 px-2 sm:px-3">Entrenador</th>
              <th scope="col" className="hidden md:table-cell py-2.5 px-3 text-center">Periodos</th>
              <th scope="col" className="hidden sm:table-cell py-2.5 px-3 text-center">Temporadas</th>
              <th scope="col" className="hidden sm:table-cell py-2.5 px-3 text-center w-12" title="Victorias">V</th>
              <th scope="col" className="hidden sm:table-cell py-2.5 px-3 text-center w-12" title="Empates">E</th>
              <th scope="col" className="hidden sm:table-cell py-2.5 px-3 text-center w-12" title="Derrotas">D</th>
              <th scope="col" className="py-2.5 px-2 sm:px-3 text-right">
                <span className="sm:hidden">Partidos</span>
                <span className="hidden sm:inline">Partidos Dirigidos</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/70 font-sans tabular-nums">
            {paginatedCoaches.map((coach) => {
              const rowBg =
                coach.rank === 1
                  ? "bg-amber-50/70 hover:bg-amber-100/60"
                  : coach.rank === 2
                  ? "bg-slate-100/60 hover:bg-slate-200/50"
                  : coach.rank === 3
                  ? "bg-[#fff7ed] hover:bg-[#ffedd5]/60"
                  : "hover:bg-neutral-50/50";

              return (
                <tr key={coach.fullName} className={`transition-colors ${rowBg}`}>
                  <td className="py-2.5 px-2 sm:px-3 text-center font-bold text-neutral-500">
                    {coach.rank <= 3 ? (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-white text-[10px] font-black">
                        {coach.rank}
                      </span>
                    ) : (
                      `${coach.rank}º`
                    )}
                  </td>
                  <td className="py-2.5 px-2 sm:px-3 font-bold text-[var(--foreground)]">
                    <div className="flex items-center gap-2">
                      <PlayerPhoto
                        photoUrl={coach.photoUrl}
                        playerName={coach.fullName}
                        size="sm"
                        className="h-7 w-7 rounded-full object-cover object-top shrink-0"
                      />
                      <span className="truncate">{coach.fullName}</span>
                    </div>
                  </td>
                  <td className="hidden md:table-cell py-2.5 px-3 text-center text-neutral-600 font-medium font-sans tabular-nums">
                    <div className="flex flex-col items-center gap-0.5 whitespace-nowrap text-[11px]">
                      {coach.eras.map((era) => (
                        <span key={era}>{era}</span>
                      ))}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell py-2.5 px-3 text-center font-semibold text-neutral-700">
                    {coach.seasonsCount} temp.
                  </td>
                  <td className="hidden sm:table-cell py-2.5 px-3 text-center font-bold text-neutral-900">
                    {coach.won}
                  </td>
                  <td className="hidden sm:table-cell py-2.5 px-3 text-center font-medium text-neutral-600">
                    {coach.drawn}
                  </td>
                  <td className="hidden sm:table-cell py-2.5 px-3 text-center font-medium text-neutral-500">
                    {coach.lost}
                  </td>
                  <td className="py-2.5 px-2 sm:px-3 text-right font-black text-neutral-900 text-sm">
                    <span className="sm:hidden">{coach.matches}</span>
                    <span className="hidden sm:inline">{coach.matches} {coach.matches === 1 ? "partido" : "partidos"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <LegacyPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={coaches.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        itemLabel="entrenadores"
      />
    </section>
  );
}
