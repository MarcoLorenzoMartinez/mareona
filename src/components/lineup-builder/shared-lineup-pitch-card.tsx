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
  const { starters } = lineup;

  return (
    <div className={`my-2.5 w-full max-w-[380px] sm:max-w-[420px] mx-auto select-none ${className}`}>
      {/* Outer Pitch Frame mimicking a live screenshot */}
      <div
        className="relative w-full aspect-[68/105] overflow-hidden rounded-2xl border-2 sm:border-[3px] border-neutral-800 bg-[#256e36] shadow-md select-none"
        role="region"
        aria-label="Alineación táctica en Mareona"
      >
        {/* SVG Striped Grass and Tactical Markings */}
        <TacticalGrassMarkings />

        {/* Subtle Watermark Branding in the bottom-right grass margin */}
        <div className="absolute inset-x-3 bottom-0.5 z-10 flex items-center justify-end pointer-events-none select-none">
          <span className="text-[9px] sm:text-[10px] font-extrabold tracking-widest text-white/45 uppercase leading-none">
            mareona
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
