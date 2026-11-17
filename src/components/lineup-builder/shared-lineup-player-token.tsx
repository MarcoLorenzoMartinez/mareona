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
 * Maintains the exact hand-adjusted coordinate (x, y) with a pure white name capsule and red circular dorsal.
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
        </div>

        {/* Modern Pure White Player Name Capsule */}
        <div className="mt-0.5 flex flex-col items-center max-w-[76px] sm:max-w-[95px]">
          <div
            className={`flex items-center overflow-hidden rounded-full shadow-sm border border-neutral-200/90 bg-white text-neutral-900 ${
              shirtNumber !== null && shirtNumber > 0
                ? "pl-0.5 pr-1.5 py-0.2 sm:pl-1 sm:pr-2 sm:py-0.5 gap-1"
                : "px-1.5 py-0.2 sm:px-2 sm:py-0.5"
            }`}
          >
            {shirtNumber !== null && shirtNumber > 0 ? (
              <span
                className={`flex h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 items-center justify-center rounded-full bg-[#e2001a] font-bold text-white tabular-nums leading-none shadow-2xs ${
                  shirtNumber >= 10
                    ? "text-[6.5px] sm:text-[7.5px] tracking-tight"
                    : "text-[7.5px] sm:text-[8.5px]"
                }`}
              >
                <span className="leading-none -translate-y-[0.5px]">
                  {shirtNumber}
                </span>
              </span>
            ) : null}
            <span className="text-[8px] sm:text-[9.5px] font-bold truncate text-neutral-900">
              {shortName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
