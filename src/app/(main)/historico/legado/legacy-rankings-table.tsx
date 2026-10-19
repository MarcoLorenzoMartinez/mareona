// Client: Tabla de rankings con columnas contextuales según la categoría seleccionada
"use client";

import type { LegacyPlayerRecord } from "@/lib/historical/legacy-types";
import { PlayerPhoto } from "@/components/media/player-photo";

interface LegacyRankingsTableProps {
  readonly players: readonly LegacyPlayerRecord[];
  readonly category: "appearances" | "scorers" | "seasons";
}

export function LegacyRankingsTable({ players, category }: LegacyRankingsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-white shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-[var(--border)] bg-neutral-50/70 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            <th scope="col" className="py-2.5 px-3 text-center w-12">Pos</th>
            <th scope="col" className="py-2.5 px-3">Futbolista</th>
            {category === "scorers" && (
              <>
                <th scope="col" className="py-2.5 px-3 text-center">Partidos (PJ)</th>
                <th scope="col" className="py-2.5 px-3 text-center">Promedio (Gol/PJ)</th>
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
                <th scope="col" className="py-2.5 px-3 text-center">Partidos (PJ)</th>
                <th scope="col" className="py-2.5 px-3 text-right">Total Temporadas</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]/70 font-sans tabular-nums">
          {players.map((player) => {
            const goalRatio = player.totalPlayed > 0
              ? (player.totalGoals / player.totalPlayed).toFixed(2)
              : "0.00";

            return (
              <tr key={player.name} className="hover:bg-neutral-50/50 transition-colors">
                <td className="py-2.5 px-3 text-center font-bold text-neutral-500">
                  {player.rank <= 3 ? (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-white text-[10px] font-black">
                      {player.rank}
                    </span>
                  ) : (
                    `${player.rank}º`
                  )}
                </td>
                <td className="py-2.5 px-3 font-bold text-[var(--foreground)]">
                  <div className="flex items-center gap-2">
                    <PlayerPhoto
                      photoUrl={player.photoUrl}
                      playerName={player.name}
                      size="sm"
                      className="h-7 w-7 rounded-full object-cover object-top shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{player.name}</span>
                      {player.fullName && player.fullName !== player.name && (
                        <span className="text-[10px] font-normal text-neutral-400 truncate">
                          {player.fullName}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {category === "scorers" && (
                  <>
                    <td className="py-2.5 px-3 text-center text-neutral-700 font-semibold">
                      {player.totalPlayed} PJ
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-neutral-600">
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-800">
                        {goalRatio} / PJ
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-neutral-900 text-sm">
                      {player.totalGoals} goles
                    </td>
                  </>
                )}

                {category === "appearances" && (
                  <>
                    <td className="py-2.5 px-3 text-neutral-600 font-medium">{player.position}</td>
                    <td className="py-2.5 px-3 text-center font-medium">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-neutral-800">{player.seasonCount} temp.</span>
                        <span className="text-[10px] text-neutral-400">
                          {player.startSeason} – {player.endSeason}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center text-neutral-600 font-medium">
                      {player.totalMinutes.toLocaleString("es-ES")} min
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-neutral-900 text-sm">
                      {player.totalPlayed} partidos
                    </td>
                  </>
                )}

                {category === "seasons" && (
                  <>
                    <td className="py-2.5 px-3 text-neutral-600 font-medium">{player.position}</td>
                    <td className="py-2.5 px-3 text-center text-neutral-600 font-medium">
                      {player.startSeason} – {player.endSeason}
                    </td>
                    <td className="py-2.5 px-3 text-center text-neutral-700 font-semibold">
                      {player.totalPlayed} PJ
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-neutral-900 text-sm">
                      {player.seasonCount} temporadas
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
