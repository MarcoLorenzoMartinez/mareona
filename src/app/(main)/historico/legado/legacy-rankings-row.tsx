// Client: Fila de futbolista en la tabla con tintes sutiles de podio (oro, plata y bronce)
"use client";

import type { LegacyPlayerRecord } from "@/lib/historical/legacy-types";
import { PlayerPhoto } from "@/components/media/player-photo";

interface LegacyRankingsRowProps {
  readonly player: LegacyPlayerRecord;
  readonly category: "appearances" | "scorers" | "seasons";
}

export function LegacyRankingsRow({ player, category }: LegacyRankingsRowProps) {
  const goalRatio =
    player.totalPlayed > 0
      ? (player.totalGoals / player.totalPlayed).toFixed(2)
      : "0.00";

  const rowBg =
    player.rank === 1
      ? "bg-amber-50/70 hover:bg-amber-100/60"
      : player.rank === 2
      ? "bg-slate-100/60 hover:bg-slate-200/50"
      : player.rank === 3
      ? "bg-[#fff7ed] hover:bg-[#ffedd5]/60"
      : "hover:bg-neutral-50/50";

  const seasonRangeLabel =
    player.startSeason === player.endSeason
      ? player.startSeason
      : `${player.startSeason} – ${player.endSeason}`;

  return (
    <tr className={`transition-colors ${rowBg}`}>
      {/* Position */}
      <td className="py-2.5 px-3 text-center font-bold text-neutral-500">
        {player.rank <= 3 ? (
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-white text-[10px] font-black">
            {player.rank}
          </span>
        ) : (
          `${player.rank}º`
        )}
      </td>

      {/* Player photo & name */}
      <td className="py-2.5 px-3 font-bold text-[var(--foreground)]">
        <div className="flex items-center gap-2">
          <PlayerPhoto
            photoUrl={player.photoUrl}
            playerName={player.name}
            size="sm"
            className="h-7 w-7 rounded-full object-cover object-top shrink-0"
          />
          <span className="truncate">{player.name}</span>
        </div>
      </td>

      {/* Scorers */}
      {category === "scorers" && (
        <>
          <td className="py-2.5 px-2 sm:px-3 text-center text-neutral-700 font-semibold">
            {player.totalPlayed}
          </td>
          <td className="hidden sm:table-cell py-2.5 px-3 text-center font-semibold text-neutral-600">
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-800">
              {goalRatio}
            </span>
          </td>
          <td className="py-2.5 px-2 sm:px-3 text-right font-black text-neutral-900 text-sm">
            <span className="sm:hidden">{player.totalGoals}</span>
            <span className="hidden sm:inline">{player.totalGoals} {player.totalGoals === 1 ? "gol" : "goles"}</span>
          </td>
        </>
      )}

      {/* Appearances */}
      {category === "appearances" && (
        <>
          <td className="hidden sm:table-cell py-2.5 px-3 text-neutral-600 font-medium">{player.position}</td>
          <td className="hidden md:table-cell py-2.5 px-3 text-center font-medium">
            <div className="flex flex-col items-center">
              <span className="font-bold text-neutral-800">{player.seasonCount} temp.</span>
              <span className="text-[10px] text-neutral-400">{seasonRangeLabel}</span>
            </div>
          </td>
          <td className="hidden sm:table-cell py-2.5 px-3 text-center text-neutral-600 font-medium">
            {player.totalMinutes.toLocaleString("es-ES")} min
          </td>
          <td className="py-2.5 px-2 sm:px-3 text-right font-black text-neutral-900 text-sm">
            <span className="sm:hidden">{player.totalPlayed}</span>
            <span className="hidden sm:inline">{player.totalPlayed} {player.totalPlayed === 1 ? "partido" : "partidos"}</span>
          </td>
        </>
      )}

      {/* Seasons */}
      {category === "seasons" && (
        <>
          <td className="hidden sm:table-cell py-2.5 px-3 text-neutral-600 font-medium">{player.position}</td>
          <td className="hidden sm:table-cell py-2.5 px-3 text-center text-neutral-600 font-medium">
            {seasonRangeLabel}
          </td>
          <td className="hidden md:table-cell py-2.5 px-3 text-center text-neutral-700 font-semibold">
            {player.totalPlayed}
          </td>
          <td className="py-2.5 px-2 sm:px-3 text-right font-black text-neutral-900 text-sm">
            <span className="sm:hidden">{player.seasonCount}</span>
            <span className="hidden sm:inline">{player.seasonCount} {player.seasonCount === 1 ? "temporada" : "temporadas"}</span>
          </td>
        </>
      )}
    </tr>
  );
}
