// Client: Interactive tactical player node positioned precisely on the horizontal pitch board
"use client";

import Image from "next/image";
import { useState } from "react";
import type { DomainTacticalStarter } from "@/lib/sports-api/types";
import { PlayerAvatarFallback } from "@/components/media/player-avatar-fallback";
import { getRatingBadgeStyle } from "./rating-color";

interface PitchPlayerNodeProps {
  readonly starter: DomainTacticalStarter;
  readonly teamColor: string;
  readonly textColor: string;
  readonly isSporting: boolean;
  readonly pitchX: number;
  readonly pitchY: number;
  readonly onClick?: () => void;
}

function getPlayerLastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0] ?? "";
  return parts[parts.length - 1] ?? fullName;
}

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace("#", "");
  if (c.length !== 6) return `rgba(0, 0, 0, ${alpha})`;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function PitchPlayerNode({
  starter,
  teamColor,
  textColor,
  isSporting,
  pitchX,
  pitchY,
  onClick,
}: PitchPlayerNodeProps) {
  const [hasImgError, setHasImgError] = useState(false);
  const rating = starter.rating;
  const ratingStyle = rating ? getRatingBadgeStyle(rating) : null;
  const displayName = getPlayerLastName(starter.name);
  const showPhoto = Boolean(starter.photoUrl && !hasImgError);

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer focus:outline-none z-10"
      style={{ left: `${pitchX}%`, top: `${pitchY}%` }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${starter.name}${starter.shirtNumber ? ` #${starter.shirtNumber}` : ""}${
        rating ? `, Nota: ${rating.toFixed(1)}` : ""
      }`}
    >
      {/* 1. Ficha circular con borde del color del equipo */}
      <div
        className="relative h-9 w-9 sm:h-13 sm:w-13 md:h-15 md:w-15 rounded-full bg-white shadow-sm border-2 sm:border-[2.5px] group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-[var(--primary)] transition-all flex items-center justify-center overflow-visible"
        style={{ borderColor: teamColor }}
      >
        {showPhoto ? (
          <Image
            src={starter.photoUrl ?? ""}
            alt={starter.name}
            width={60}
            height={60}
            unoptimized
            onError={() => setHasImgError(true)}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <PlayerAvatarFallback teamColor={teamColor} />
        )}

        {/* 2. Badge de nota con escala de color semántica en la esquina superior derecha */}
        {rating && ratingStyle && (
          <span
            className={`absolute -top-1 -right-1 flex items-center justify-center rounded-full px-1.5 py-0.2 text-[8px] sm:text-[9px] md:text-[10px] font-bold font-sans tabular-nums border border-white shadow-xs z-20 ${ratingStyle.bg} ${ratingStyle.text}`}
          >
            {rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* 3. Tarjeta inferior con tinte del color del equipo, dorsal antes del nombre */}
      <div
        className="mt-1 flex items-center justify-center rounded-md px-1.5 py-0.5 text-[8px] sm:text-[10px] md:text-[11px] border shadow-2xs backdrop-blur-xs max-w-[56px] sm:max-w-[84px] md:max-w-[96px] truncate transition-colors group-hover:shadow-xs"
        style={{
          backgroundColor: hexToRgba(teamColor, 0.12),
          borderColor: hexToRgba(teamColor, 0.45),
        }}
      >
        {starter.shirtNumber && (
          <span
            className="mr-1 inline-flex shrink-0 items-center justify-center rounded px-1 py-0.2 text-[7px] sm:text-[8px] md:text-[9px] font-bold font-sans tabular-nums shadow-2xs"
            style={{ backgroundColor: teamColor, color: textColor }}
          >
            {starter.shirtNumber}
          </span>
        )}
        <span className="truncate font-semibold text-[var(--foreground)]">
          {displayName}
        </span>
      </div>
    </div>
  );
}
