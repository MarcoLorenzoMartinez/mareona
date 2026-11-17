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
        <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-white/95 bg-[#f3f4f3] shadow-xs">
          <div className="relative h-full w-full overflow-hidden rounded-full">
            <SafePlayerAvatar
              photoUrl={photoUrl}
              displayName={displayName}
              sizes="(max-width: 640px) 28px, 32px"
              isToken
            />
          </div>
        </div>

        {/* Modern Pure White Player Name Capsule */}
        <div className="mt-0.5 flex flex-col items-center max-w-[64px] sm:max-w-[72px]">
          <div
            className={`flex items-center overflow-hidden rounded-full shadow-2xs border border-neutral-200/90 bg-white text-neutral-900 ${
              shirtNumber !== null && shirtNumber > 0
                ? "pl-0.5 pr-1 py-0 sm:pl-0.5 sm:pr-1.5 sm:py-0.2 gap-0.5"
                : "px-1 py-0 sm:px-1.5 sm:py-0.2"
            }`}
          >
            {shirtNumber !== null && shirtNumber > 0 ? (
              <span
                className={`flex h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 items-center justify-center rounded-full bg-[#e2001a] font-bold text-white tabular-nums leading-none shadow-2xs ${
                  shirtNumber >= 10
                    ? "text-[5.5px] sm:text-[6.5px] tracking-tight"
                    : "text-[6.5px] sm:text-[7.5px]"
                }`}
              >
                <span className="leading-none -translate-y-[0.5px]">
                  {shirtNumber}
                </span>
              </span>
            ) : null}
            <span className="text-[7px] sm:text-[8px] font-bold truncate text-neutral-900">
              {shortName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
