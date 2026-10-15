// Client: Realistic tactical formation board positioned with real coordinates
"use client";

import { useState } from "react";
import type {
  DomainTacticalStarter,
  DomainLineupPlayer,
  DomainPlayerMatchStats,
} from "@/lib/sports-api/types";

interface TacticalPitchBoardProps {
  readonly starters: readonly DomainTacticalStarter[];
  readonly teamColor: string;
  readonly textColor: string;
  readonly isSporting: boolean;
  readonly domainStarters: readonly DomainLineupPlayer[];
  readonly playerStats?: Readonly<Record<string, DomainPlayerMatchStats>> | null;
  readonly onSelectPlayer?: (
    player: DomainLineupPlayer,
    stats: DomainPlayerMatchStats | null
  ) => void;
}

function PitchPlayerNode({
  starter,
  teamColor,
  textColor,
  isSporting,
  onClick,
}: {
  readonly starter: DomainTacticalStarter;
  readonly teamColor: string;
  readonly textColor: string;
  readonly isSporting: boolean;
  readonly onClick?: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const showPhoto = Boolean(starter.photoUrl && !imgError);

  // Normalizar coordenadas para que nunca se salgan del marco
  const leftPct = Math.max(8, Math.min(92, starter.x * 100));
  const topPct = Math.max(7, Math.min(91, starter.y * 100));

  const shortName = starter.name.split(" ").slice(-1)[0] || starter.name;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
      aria-label={`${starter.name}, dorsal ${starter.shirtNumber}${
        starter.rating ? `, valoración ${starter.rating.toFixed(1)}` : ""
      }`}
      className="group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-full z-10 transition-transform active:scale-95"
    >
      {/* 1. Avatar redondeado con foto real o dorsal */}
      <div
        className="relative flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full border-2 bg-white shadow-xs overflow-hidden transition-shadow group-hover:shadow-md"
        style={{ borderColor: teamColor }}
      >
        {showPhoto ? (
          <>
            <div className="h-full w-full overflow-hidden bg-gradient-to-b from-white to-neutral-100 flex items-end justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={starter.photoUrl}
                alt=""
                onError={() => setImgError(true)}
                className={`h-full w-full ${
                  isSporting
                    ? "object-contain object-bottom pt-0.5"
                    : "object-cover object-top"
                }`}
                loading="lazy"
                decoding="async"
              />
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 sm:h-4.5 sm:w-4.5 items-center justify-center rounded-full text-[9px] font-bold font-sans tabular-nums shadow-xs"
              style={{ backgroundColor: teamColor, color: textColor }}
            >
              {starter.shirtNumber || "-"}
            </span>
          </>
        ) : (
          <div
            className="flex h-full w-full items-center justify-center font-sans font-bold tabular-nums text-xs sm:text-sm select-none"
            style={{ backgroundColor: teamColor, color: textColor }}
          >
            {starter.shirtNumber || "-"}
          </div>
        )}
      </div>

      {/* 2. Píldora de nombre y valoración debajo */}
      <div className="mt-1 flex flex-col items-center max-w-[72px] sm:max-w-[84px]">
        <span className="truncate rounded-full bg-white/95 px-1.5 py-0.2 text-[10px] sm:text-[11px] font-semibold text-[var(--foreground)] shadow-2xs border border-[var(--border)] text-center w-full">
          {shortName}
        </span>
        {starter.rating ? (
          <span className="mt-0.5 rounded px-1 text-[9px] font-bold font-sans tabular-nums text-white bg-neutral-900 shadow-2xs">
            {starter.rating.toFixed(1)}
          </span>
        ) : null}
      </div>
    </button>
  );
}

export function TacticalPitchBoard({
  starters,
  teamColor,
  textColor,
  isSporting,
  domainStarters,
  playerStats,
  onSelectPlayer,
}: TacticalPitchBoardProps) {
  return (
    <div className="relative h-[480px] sm:h-[520px] w-full rounded-2xl border border-[var(--border)] bg-gradient-to-b from-neutral-50/90 via-white to-neutral-50/90 overflow-hidden shadow-2xs">
      {/* Líneas vectoriales sutiles del campo de fútbol */}
      <svg
        className="absolute inset-0 h-full w-full pointer-events-none select-none opacity-40"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Área de portería superior */}
        <rect x="35" y="0" width="30" height="6" fill="none" stroke="var(--border)" strokeWidth="0.8" />
        <rect x="20" y="0" width="60" height="18" fill="none" stroke="var(--border)" strokeWidth="0.8" />
        <path d="M 38 18 A 12 12 0 0 0 62 18" fill="none" stroke="var(--border)" strokeWidth="0.8" strokeDasharray="1.5 1.5" />

        {/* Círculo central en la parte inferior del medio campo */}
        <line x1="0" y1="99" x2="100" y2="99" stroke="var(--border)" strokeWidth="1" />
        <path d="M 32 99 A 18 18 0 0 1 68 99" fill="none" stroke="var(--border)" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
      </svg>

      {/* Jugadores colocados en sus coordenadas tácticas exactas */}
      {starters.map((starter) => {
        const domainMatch = domainStarters.find(
          (p) =>
            (starter.shirtNumber && String(p.jersey) === starter.shirtNumber) ||
            p.name.toLowerCase().includes(starter.name.toLowerCase()) ||
            starter.name.toLowerCase().includes(p.name.toLowerCase())
        );
        const stats = domainMatch && playerStats ? playerStats[domainMatch.name.toLowerCase()] ?? null : null;

        return (
          <PitchPlayerNode
            key={starter.id}
            starter={starter}
            teamColor={teamColor}
            textColor={textColor}
            isSporting={isSporting}
            onClick={
              domainMatch && onSelectPlayer ? () => onSelectPlayer(domainMatch, stats) : undefined
            }
          />
        );
      })}
    </div>
  );
}
