// Client: Tabla y podio de entrenadores con más partidos dirigidos en la historia del club
"use client";

import type { LegacyCoachRecord } from "@/lib/historical/legacy-types";
import { PlayerPhoto } from "@/components/media/player-photo";

interface LegacyCoachesTableProps {
  readonly coaches: readonly LegacyCoachRecord[];
}

const PODIUM_ORDER = [1, 0, 2] as const;

export function LegacyCoachesTable({ coaches }: LegacyCoachesTableProps) {
  const topThree = coaches.slice(0, 3);

  return (
    <section aria-label="Ranking histórico de entrenadores" className="flex flex-col gap-6">
      {/* Podium for top 3 coaches */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 pb-2">
          {PODIUM_ORDER.map((idx) => {
            const coach = topThree[idx];
            if (!coach) return null;

            const isFirst = idx === 0;
            const rankNumber = idx + 1;

            return (
              <div
                key={coach.name}
                className={`flex flex-col items-center text-center rounded-xl border bg-white p-3 sm:p-4 shadow-2xs transition-all ${
                  isFirst
                    ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/10 -translate-y-2 sm:-translate-y-3"
                    : "border-[var(--border)]"
                }`}
              >
                <span
                  className={`inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs font-black font-sans tabular-nums shadow-2xs mb-2 ${
                    isFirst
                      ? "bg-[var(--primary)] text-white"
                      : "bg-neutral-100 text-neutral-800 border border-neutral-200"
                  }`}
                >
                  {rankNumber}º
                </span>

                <div className="overflow-hidden rounded-full border-2 border-white shadow-xs">
                  <PlayerPhoto
                    photoUrl={coach.photoUrl}
                    playerName={coach.fullName}
                    size="md"
                    className="h-14 w-14 sm:h-16 sm:w-16 object-cover object-top"
                  />
                </div>

                <h4 className="mt-2 text-xs sm:text-sm font-bold text-[var(--foreground)] truncate max-w-full">
                  {coach.fullName}
                </h4>
                <span className="text-[10px] text-[var(--muted-foreground)] truncate">
                  {coach.seasonsCount} temporadas ({coach.startSeason}–{coach.endSeason})
                </span>

                <div className="mt-2 flex flex-col items-center">
                  <span className="text-lg sm:text-2xl font-black text-neutral-900 font-sans tabular-nums">
                    {coach.matches}
                  </span>
                  <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                    partidos dirigidos
                  </span>
                  <span className="mt-1 text-[10px] font-medium text-neutral-400 font-sans tabular-nums">
                    {coach.won}V · {coach.drawn}E · {coach.lost}D
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ranking Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-white shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] bg-neutral-50/70 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              <th scope="col" className="py-2.5 px-3 text-center w-12">Pos</th>
              <th scope="col" className="py-2.5 px-3">Entrenador</th>
              <th scope="col" className="py-2.5 px-3 text-center">Periodo</th>
              <th scope="col" className="py-2.5 px-3 text-center">Temporadas</th>
              <th scope="col" className="py-2.5 px-3 text-center">Balance (V · E · D)</th>
              <th scope="col" className="py-2.5 px-3 text-right">Partidos Dirigidos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/70 font-sans tabular-nums">
            {coaches.map((coach) => (
              <tr key={coach.fullName} className="hover:bg-neutral-50/50 transition-colors">
                <td className="py-2.5 px-3 text-center font-bold text-neutral-500">
                  {coach.rank <= 3 ? (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-white text-[10px] font-black">
                      {coach.rank}
                    </span>
                  ) : (
                    `${coach.rank}º`
                  )}
                </td>
                <td className="py-2.5 px-3 font-bold text-[var(--foreground)]">
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
                <td className="py-2.5 px-3 text-center text-neutral-600 font-medium">
                  {coach.startSeason} – {coach.endSeason}
                </td>
                <td className="py-2.5 px-3 text-center font-semibold text-neutral-700">
                  {coach.seasonsCount} temp.
                </td>
                <td className="py-2.5 px-3 text-center font-semibold text-neutral-600">
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-800">
                    {coach.won}V · {coach.drawn}E · {coach.lost}D
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-black text-neutral-900 text-sm">
                  {coach.matches} partidos
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
