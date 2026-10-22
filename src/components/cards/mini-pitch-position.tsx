import type { CardPosition } from "@/lib/cards/types";

interface MiniPitchPositionProps {
  readonly position: CardPosition;
  readonly className?: string;
}

/**
 * Renders an authentic Adrenalyn XL style mini tactical pitch diagram
 * indicating the player's zone on the football field.
 */
export function MiniPitchPosition({ position, className = "" }: MiniPitchPositionProps) {
  const isGK = position === "goalkeeper";
  const isDef = position === "defender";
  const isMid = position === "midfielder";
  const isFwd = position === "forward";

  return (
    <div
      aria-label={`Demarcación en campo: ${position}`}
      className={`relative flex flex-col items-center justify-between overflow-hidden rounded-xs border border-white/60 bg-emerald-600/90 p-0.5 shadow-2xs ${className}`}
    >
      {/* Field Lines: Halfway and Penalty Areas */}
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/40" />
      <div className="absolute top-1/2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40" />

      {/* Attacking Box (Top) */}
      <div
        className={`relative z-10 h-3 w-full rounded-t-xs transition-colors ${
          isFwd ? "bg-[#e2001a]/90 shadow-xs" : "bg-transparent"
        }`}
      />

      {/* Midfield Zone (Center) */}
      <div
        className={`relative z-10 h-3.5 w-full transition-colors ${
          isMid ? "bg-amber-400/90 shadow-xs" : "bg-transparent"
        }`}
      />

      {/* Defensive Third (Bottom) */}
      <div
        className={`relative z-10 h-3 w-full rounded-b-xs transition-colors ${
          isDef ? "bg-[#e2001a]/90 shadow-xs" : isGK ? "bg-amber-500/90 shadow-xs" : "bg-transparent"
        }`}
      />

      {/* Silhouette Icon Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white/90 drop-shadow-xs" fill="currentColor">
          <circle cx="8" cy="3.5" r="2" />
          <path d="M5.5 7 L10.5 7 L9.5 11 L11.5 15 L9.5 15 L8 12 L6.5 15 L4.5 15 L6.5 11 Z" />
        </svg>
      </div>
    </div>
  );
}
