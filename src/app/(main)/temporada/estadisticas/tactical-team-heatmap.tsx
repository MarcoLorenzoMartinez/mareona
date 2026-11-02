import React from "react";
import { TacticalHeatmapDefs } from "./tactical-heatmap-defs";

interface TacticalTeamHeatmapProps {
  readonly circlesSvg?: string;
}

/**
 * Authentic tactical football heatmap rendered via official optical convolution filter.
 * Accumulates real collective touch coordinates across all Sporting matches.
 */
export function TacticalTeamHeatmap({ circlesSvg }: TacticalTeamHeatmapProps) {
  if (!circlesSvg) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white/70">
        No se dispone de mapa de calor colectivo en este momento
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        viewBox="0 0 105 68"
        preserveAspectRatio="none"
        className="h-full w-full select-none"
        aria-hidden="true"
      >
        <TacticalHeatmapDefs />
        <g
          filter="url(#h)"
          fill="url(#g)"
          opacity="0.88"
          dangerouslySetInnerHTML={{ __html: circlesSvg }}
        />
      </svg>

      {/* Leyenda y dirección de ataque integrada */}
      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2.5 py-0.5 text-[10px] font-medium text-white/95 backdrop-blur-xs">
        <span>Ataque</span>
        <span aria-hidden="true" className="font-bold text-emerald-300">&rarr;</span>
      </div>
    </div>
  );
}
