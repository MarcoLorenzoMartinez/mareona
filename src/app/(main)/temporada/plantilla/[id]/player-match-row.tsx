"use client";
// Client: Fila de partido interactiva para el historial de la temporada

import { SportShoe } from "lucide-react";
import type { PlayerSeasonMatchLog } from "@/lib/sports-api/fotmob-player-profile-types";
import { SoccerBallIcon } from "@/components/icons/soccer-ball-icon";
import { TeamCrest } from "@/components/media/team-crest";
import { getRatingBadgeStyle } from "../../partidos/[id]/rating-color";

interface PlayerMatchRowProps {
  readonly match: PlayerSeasonMatchLog;
  readonly onSelect: (m: PlayerSeasonMatchLog) => void;
}

export function PlayerMatchRow({ match: m, onSelect }: PlayerMatchRowProps) {
  const dateStr = m.date
    ? new Date(m.date).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
      })
    : "";
  const badge = m.rating !== null ? getRatingBadgeStyle(m.rating) : null;
  const opponentCrestUrl =
    m.opponentTeamId > 0
      ? `https://images.fotmob.com/image_resources/logo/teamlogo/${m.opponentTeamId}.png`
      : null;

  return (
    <button
      type="button"
      disabled={!m.playedInMatch}
      onClick={() => onSelect(m)}
      className={`flex items-center justify-between py-3 px-2 rounded-xl text-left transition-colors ${
        m.playedInMatch
          ? "hover:bg-neutral-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
          : "opacity-60 cursor-default"
      }`}
    >
      {/* 1. Fecha, Resultado (V/E/D), Rival con Escudo y Condición */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-9 text-xs font-semibold text-neutral-600 tabular-nums shrink-0">
          {dateStr}
        </span>

        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-black shrink-0 ${
              m.result === "W"
                ? "bg-emerald-100 text-emerald-800"
                : m.result === "D"
                ? "bg-neutral-200 text-neutral-700"
                : "bg-red-100 text-red-800"
            }`}
          >
            {m.result === "W" ? "V" : m.result === "D" ? "E" : "D"}
          </span>
          <div className="shrink-0">
            <TeamCrest
              crestUrl={opponentCrestUrl}
              teamName={m.opponentName}
              size="sm"
              isSporting={false}
            />
          </div>
          <span className="text-xs font-bold text-neutral-900 truncate">
            {m.opponentName}
          </span>
          <span className="text-[10px] font-semibold text-neutral-600 shrink-0">
            {m.isHome ? "(C)" : "(F)"}
          </span>
        </div>
      </div>

      {/* 2. Goles/Asistencias, Marcador, Minutos y Nota */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 ml-2">
        {/* Iconos de Goles (balón) y Asistencias (bota) a la izquierda del resultado */}
        {(m.goals > 0 || m.assists > 0) && (
          <div className="flex items-center gap-1 shrink-0" aria-label={`${m.goals} goles, ${m.assists} asistencias`}>
            {Array.from({ length: m.goals }).map((_, i) => (
              <span
                key={`goal-${i}`}
                className="flex items-center justify-center text-neutral-900"
                title="Gol"
              >
                <SoccerBallIcon className="h-3.5 w-3.5 shrink-0" size={14} />
              </span>
            ))}
            {Array.from({ length: m.assists }).map((_, i) => (
              <span
                key={`assist-${i}`}
                className="flex items-center justify-center text-neutral-700"
                title="Asistencia"
              >
                <SportShoe className="h-3.5 w-3.5 shrink-0" />
              </span>
            ))}
          </div>
        )}

        {/* Marcador del partido */}
        <span className="text-xs font-bold text-neutral-700 tabular-nums whitespace-nowrap">
          {m.homeScore} - {m.awayScore}
        </span>

        {/* Minutos jugados */}
        <span className="w-8 text-right text-xs font-semibold text-neutral-600 tabular-nums">
          {m.playedInMatch ? `${m.minutesPlayed}'` : "—"}
        </span>

        {/* Nota o guión neutro */}
        {badge && m.rating !== null ? (
          <span
            className={`flex h-6 w-8 items-center justify-center rounded-lg text-xs font-black tabular-nums shadow-2xs ${badge.bg} ${badge.text}`}
          >
            {m.rating.toFixed(1)}
          </span>
        ) : (
          <span className="flex h-6 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400 text-xs font-bold tabular-nums">
            —
          </span>
        )}
      </div>
    </button>
  );
}
