// Client: Tarjeta de alineación táctica visualmente idéntica a la pizarra de Mi Once
"use client";

import { TacticalGrassMarkings } from "./tactical-grass-markings";
import { SharedLineupPlayerToken } from "./shared-lineup-player-token";
import type { SharedLineupData } from "@/lib/lineup-builder/shared-lineup-codec";

interface SharedLineupPitchCardProps {
  readonly lineup: SharedLineupData;
  readonly className?: string;
}

/**
 * Visual screenshot-like pitch board card embedded inside social posts and match threads.
 * Replicates the authentic grass markings, watermark branding, and exact coordinates
 * of the 11 footballers positioned by the user in Mi Once.
 */
export function SharedLineupPitchCard({
  lineup,
  className = "",
}: SharedLineupPitchCardProps) {
  const { formationKey, teamTitle = "Real Sporting", starters } = lineup;

  return (
    <div className={`my-2.5 w-full max-w-[380px] sm:max-w-[420px] mx-auto select-none ${className}`}>
      {/* Outer Pitch Frame mimicking a live screenshot */}
      <div
        className="relative w-full aspect-[68/105] overflow-hidden rounded-2xl border-2 sm:border-[3px] border-neutral-800 bg-[#256e36] shadow-md"
        role="region"
        aria-label={`Alineación táctica ${formationKey} del ${teamTitle}`}
      >
        {/* SVG Striped Grass and Tactical Markings */}
        <TacticalGrassMarkings />

        {/* Pitch Watermark Header (identical to Mi Once canvas) */}
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-0.5 backdrop-blur-xs border border-white/15 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-white uppercase">
            {teamTitle}
          </span>
          <span className="text-[9px] sm:text-[10px] font-semibold text-white/75 tabular-nums">
            ({formationKey})
          </span>
        </div>

        {/* Badge "Mi Once" indicator in top right */}
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 rounded-full bg-[#e2001a] px-2 py-0.5 shadow-xs border border-white/20">
          <span className="text-[9px] sm:text-[10px] font-bold text-white tracking-wide">
            Mi Once
          </span>
        </div>

        {/* 11 Starter Tokens in Exact Coordinates */}
        {starters.map((starter, index) => (
          <SharedLineupPlayerToken
            key={`${starter.role}-${index}-${starter.displayName}`}
            starter={starter}
          />
        ))}
      </div>
    </div>
  );
}
