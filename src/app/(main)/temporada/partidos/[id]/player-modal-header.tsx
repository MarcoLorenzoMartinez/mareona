// Client: Visual hero header for player statistics modal featuring player photo and rating
"use client";

import Image from "next/image";
import { useState } from "react";
import type { DomainPlayerMatchStats, DomainLineupPlayer } from "@/lib/sports-api/types";
import { TeamCrest } from "@/components/media/team-crest";
import { PlayerAvatarFallback } from "@/components/media/player-avatar-fallback";
import { areOfficialAssetsEnabled } from "@/lib/legal/official-assets";
import { getRatingBadgeStyle } from "./rating-color";

interface PlayerModalHeaderProps {
  readonly player: DomainLineupPlayer;
  readonly stats: DomainPlayerMatchStats | null;
  readonly team: { readonly name: string; readonly crestUrl?: string | null; readonly isSporting: boolean };
  readonly teamColor: string;
  readonly textColor: string;
  readonly onClose: () => void;
}

function getRatingDescription(rating: number): string {
  if (rating >= 8.5) return "Estelar";
  if (rating >= 8.0) return "Excelente";
  if (rating >= 7.0) return "Notable";
  if (rating >= 6.0) return "Aprobado";
  return "Insuficiente";
}

export function PlayerModalHeader({
  player,
  stats,
  team,
  teamColor,
  textColor,
  onClose,
}: PlayerModalHeaderProps) {
  const [imgError, setImgError] = useState(false);
  const rating = stats?.rating ?? null;
  const ratingStyle = rating ? getRatingBadgeStyle(rating) : null;
  const showPhoto = Boolean(player.photoUrl && areOfficialAssetsEnabled() && !imgError);

  return (
    <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-4">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Retrato del jugador en alta resolución */}
        <div
          className="relative h-16 w-16 sm:h-18 sm:w-18 shrink-0 rounded-full border-2 sm:border-[2.5px] bg-neutral-100 shadow-sm overflow-hidden flex items-center justify-center"
          style={{ borderColor: teamColor }}
        >
          {showPhoto ? (
            <Image
              src={player.photoUrl ?? ""}
              alt={player.name}
              width={72}
              height={72}
              unoptimized
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <PlayerAvatarFallback teamColor={teamColor} />
          )}
        </div>

        {/* Club y nombre con dorsal */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)] mb-1">
            <TeamCrest crestUrl={team.crestUrl} teamName={team.name} size="sm" isSporting={team.isSporting} />
            <span className="truncate max-w-[160px] font-medium">{team.name}</span>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <span
              className="inline-flex shrink-0 items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-bold font-sans tabular-nums shadow-2xs"
              style={{ backgroundColor: teamColor, color: textColor }}
            >
              {player.jersey ?? "-"}
            </span>
            <h3 id="player-stats-modal-title" className="text-base sm:text-lg font-bold text-[var(--foreground)] truncate">
              {player.name}
            </h3>
          </div>
        </div>
      </div>

      {/* Minutos jugados, nota del partido y botón de cierre */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {stats?.minutesPlayed ? (
          <div className="flex flex-col items-center justify-center rounded-xl px-2.5 py-1 bg-neutral-50/90 border border-[var(--border)] shadow-2xs text-center">
            <span className="text-base sm:text-lg font-bold font-sans tabular-nums text-[var(--foreground)] leading-none">
              {stats.minutesPlayed}&apos;
            </span>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-semibold text-[var(--foreground-muted)] mt-0.5">
              Minutos
            </span>
          </div>
        ) : null}

        {rating && ratingStyle && (
          <div
            className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1 shadow-2xs border border-white/60 ${ratingStyle.bg} ${ratingStyle.text}`}
          >
            <span className="text-base sm:text-lg font-black font-sans tabular-nums leading-none">
              {rating.toFixed(1)}
            </span>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-bold opacity-90 mt-0.5">
              {getRatingDescription(rating)}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ficha de jugador"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--surface)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
