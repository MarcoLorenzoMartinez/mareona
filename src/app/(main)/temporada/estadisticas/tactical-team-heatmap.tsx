"use client";
// Client: Interactive team season touch coordinates heatmap rendered on HTML5 canvas

import { useEffect, useRef } from "react";
import { PitchSvgMarkings } from "../partidos/[id]/pitch-svg-markings";

interface TacticalTeamHeatmapProps {
  readonly circlesSvg?: string;
}

/**
 * Extracts and downsamples raw coordinate points from Opta/FotMob circle tags.
 */
function extractPointsFromSvg(circlesSvg: string): Array<{ x: number; y: number }> {
  const regex = /cx="([^"]+)"\s+cy="([^"]+)"/g;
  const points: Array<{ x: number; y: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(circlesSvg)) !== null) {
    const x = parseFloat(match[1]);
    const y = parseFloat(match[2]);
    if (!isNaN(x) && !isNaN(y)) {
      points.push({ x, y });
    }
  }

  // Downsample if very dense to keep smooth interactive rendering while preserving hotspot density
  const step = points.length > 3000 ? 3 : points.length > 1500 ? 2 : 1;
  if (step === 1) return points;

  const sampled: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < points.length; i += step) {
    sampled.push(points[i]);
  }
  return sampled;
}

/**
 * High-definition tactical football heatmap with light FIFA pitch markings and subtle red density glow.
 * Matches official PlayerSeasonHeatmap styling.
 */
export function TacticalTeamHeatmap({ circlesSvg }: TacticalTeamHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !circlesSvg) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points = extractPointsFromSvg(circlesSvg);
    if (points.length === 0) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Margen perimetral idéntico a PitchSvgMarkings (viewBox 0 0 105 68 con margen de 3m)
    const fieldX = (3 / 105) * width;
    const fieldY = (3 / 68) * height;
    const fieldWidth = (99 / 105) * width;
    const fieldHeight = (62 / 68) * height;

    ctx.save();
    ctx.beginPath();
    ctx.rect(fieldX, fieldY, fieldWidth, fieldHeight);
    ctx.clip();

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
  }, [circlesSvg]);

  return (
    <div className="absolute inset-0 select-none">
      {/* Marcado reglamentario claro de césped alternado */}
      <PitchSvgMarkings />

      {/* Capa de calor sobre el canvas */}
      <canvas
        ref={canvasRef}
        width={630}
        height={408}
        className="absolute inset-0 h-full w-full pointer-events-none mix-blend-multiply"
      />

      {/* Indicador de dirección de ataque sutil */}
      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-neutral-700 shadow-2xs backdrop-blur-xs">
        <span>Ataque</span>
        <span aria-hidden="true" className="font-black text-[#e2001a]">&rarr;</span>
      </div>
    </div>
  );
}
