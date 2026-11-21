"use client";
// Client: Interactive touch coordinates heatmap rendered on HTML5 canvas

import { useEffect, useRef } from "react";
import type { PlayerHeatmapPoint } from "@/lib/sports-api/fotmob-player-profile-types";
import { PitchSvgMarkings } from "../../partidos/[id]/pitch-svg-markings";

interface PlayerSeasonHeatmapProps {
  readonly points: readonly PlayerHeatmapPoint[];
  readonly playerName?: string;
}

/**
 * Visual season heatmap rendered on official FIFA proportions (105m x 68m).
 * Accumulates touch coordinates with soft radial gradients over field markings.
 */
export function PlayerSeasonHeatmap({ points }: PlayerSeasonHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Límites reglamentarios del campo según PitchSvgMarkings (viewBox 0 0 105 68 con margen perimetral de 3m)
    const fieldX = (3 / 105) * width;
    const fieldY = (3 / 68) * height;
    const fieldWidth = (99 / 105) * width;
    const fieldHeight = (62 / 68) * height;

    ctx.save();
    // Restringe cualquier renderizado estrictamente al interior de las líneas del campo
    ctx.beginPath();
    ctx.rect(fieldX, fieldY, fieldWidth, fieldHeight);
    ctx.clip();

    // Dibuja cada punto de toque mapeado a las dimensiones del campo
    const radius = Math.max(16, width * 0.05);

    for (const pt of points) {
      const cx = fieldX + (pt.x / 105) * fieldWidth;
      const cy = fieldY + (pt.y / 68) * fieldHeight;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, "rgba(226, 0, 26, 0.22)");
      grad.addColorStop(0.5, "rgba(226, 0, 26, 0.08)");
      grad.addColorStop(1, "rgba(226, 0, 26, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, [points]);

  return (
    <div className="flex flex-col rounded-3xl border border-[var(--border)] bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-neutral-100">
        <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900">
          Mapa de Calor de la Temporada
        </h2>

        <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-bold text-neutral-600">
          <span>Ataque</span>
          <span aria-hidden="true" className="text-[var(--primary)] font-black">&rarr;</span>
        </div>
      </div>

      <div className="pt-5">
        {points.length > 0 ? (
          <div className="relative aspect-[105/68] w-full rounded-2xl overflow-hidden border border-neutral-200 bg-[#edf3ed] shadow-inner select-none">
            {/* Marcado reglamentario del campo de fútbol */}
            <PitchSvgMarkings />

            {/* Capa de calor con puntos acumulados */}
            <canvas
              ref={canvasRef}
              width={630}
              height={408}
              className="absolute inset-0 h-full w-full pointer-events-none mix-blend-multiply"
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-xs text-neutral-600">
            No se dispone de coordenadas de mapa de calor registradas para este jugador.
          </div>
        )}
      </div>
    </div>
  );
}
