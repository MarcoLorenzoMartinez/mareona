// Client: Token estático de futbolista para visualización de alineación en publicaciones
"use client";

import { useMemo } from "react";
import { SafePlayerAvatar } from "./safe-player-avatar";
import { getConcisePlayerName } from "@/lib/lineup-builder/player-name-formatter";
import type { SharedLineupStarter } from "@/lib/lineup-builder/shared-lineup-codec";

interface SharedLineupPlayerTokenProps {
  readonly starter: SharedLineupStarter;
}

/**
 * Renders a crisp read-only player token placed on the tactical grass pitch card.
 * Maintains the exact hand-adjusted coordinate (x, y) with responsive avatar sizing.
 */
export function SharedLineupPlayerToken({ starter }: SharedLineupPlayerTokenProps) {
  const { displayName, photoUrl, coord, role, shirtNumber } = starter;

  const shortName = useMemo(() => {
    return getConcisePlayerName(displayName) || role;
  }, [displayName, role]);

  return (
    <div
      style={{
        left: `${coord.x}%`,
        top: `${coord.y}%`,
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-10"
      aria-hidden="true"
    >
      <div className="flex flex-col items-center">
        {/* Token Circular Avatar Container */}
        <div className="relative flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/95 bg-[#f3f4f3] shadow-md">
          <div className="relative h-full w-full overflow-hidden rounded-full">
            <SafePlayerAvatar
              photoUrl={photoUrl}
              displayName={displayName}
              sizes="(max-width: 640px) 32px, 44px"
              isToken
            />
          </div>

          {/* Dorsal badge if available */}
          {shirtNumber !== null && shirtNumber > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-[#e2001a] text-[8px] sm:text-[9px] font-bold text-white shadow-xs tabular-nums">
              {shirtNumber}
            </span>
          )}
        </div>

        {/* Minimalist Player Name Label */}
        <div className="mt-0.5 flex flex-col items-center max-w-[62px] sm:max-w-[78px]">
          <span className="rounded-full px-1.5 py-0.2 sm:px-2 sm:py-0.5 text-center text-[8px] sm:text-[9.5px] font-bold shadow-xs truncate w-full border border-white/15 bg-black/85 text-white backdrop-blur-xs">
            {shortName}
          </span>
        </div>
      </div>
    </div>
  );
}
