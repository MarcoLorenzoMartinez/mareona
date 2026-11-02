"use client";
// Client: Authentic multi-color football heat map (green -> yellow -> orange -> red)

import { useEffect, useRef } from "react";
import { PitchSvgMarkings } from "../partidos/[id]/pitch-svg-markings";

interface TacticalTeamHeatmapProps {
  readonly circlesSvg?: string;
}

/**
 * Extracts coordinate points from Opta/FotMob circle elements.
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

  // Sample to ~600-800 points for crisp tactical thermal contrast
  const step = Math.max(1, Math.round(points.length / 750));
  const sampled: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < points.length; i += step) {
    sampled.push(points[i]);
  }
  return sampled;
}

/**
 * Creates an offscreen 256x1 gradient palette from transparent green -> yellow -> orange -> sporting red.
 */
function createHeatmapPalette(): Uint8ClampedArray {
  const pCanvas = document.createElement("canvas");
  pCanvas.width = 256;
  pCanvas.height = 1;
  const pCtx = pCanvas.getContext("2d");
  if (!pCtx) return new Uint8ClampedArray(256 * 4);

  const grad = pCtx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0.0, "rgba(34, 197, 94, 0)");      // Transparente
  grad.addColorStop(0.18, "rgba(34, 197, 94, 0.45)");   // Verde suave (actividad baja)
  grad.addColorStop(0.42, "rgba(234, 179, 8, 0.70)");   // Amarillo (actividad media)
  grad.addColorStop(0.70, "rgba(249, 115, 22, 0.85)");  // Naranja (actividad alta)
  grad.addColorStop(0.92, "rgba(226, 0, 26, 0.95)");    // Rojo Sporting (máxima concentración)

  pCtx.fillStyle = grad;
  pCtx.fillRect(0, 0, 256, 1);
  return pCtx.getImageData(0, 0, 256, 1).data;
}

/**
 * Standard thermal density color map (Green -> Amber -> Orange -> Red) over pitch markings.
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

    // Margen reglamentario 3m en FIFA (105m x 68m)
    const fieldX = (3 / 105) * width;
    const fieldY = (3 / 68) * height;
    const fieldWidth = (99 / 105) * width;
    const fieldHeight = (62 / 68) * height;

    // 1. Dibuja densidad en escala de grises / alfa sobre un canvas auxiliar
    const alphaCanvas = document.createElement("canvas");
    alphaCanvas.width = width;
    alphaCanvas.height = height;
    const alphaCtx = alphaCanvas.getContext("2d");
    if (!alphaCtx) return;

    alphaCtx.save();
    alphaCtx.beginPath();
    alphaCtx.rect(fieldX, fieldY, fieldWidth, fieldHeight);
    alphaCtx.clip();

    const radius = Math.max(14, width * 0.042);

    for (const pt of points) {
      const cx = fieldX + (pt.x / 105) * fieldWidth;
      const cy = fieldY + (pt.y / 68) * fieldHeight;

      const grad = alphaCtx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, "rgba(0, 0, 0, 0.14)");
      grad.addColorStop(0.5, "rgba(0, 0, 0, 0.05)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");

      alphaCtx.fillStyle = grad;
      alphaCtx.beginPath();
      alphaCtx.arc(cx, cy, radius, 0, Math.PI * 2);
      alphaCtx.fill();
    }
    alphaCtx.restore();

    // 2. Colorea el mapa térmico usando la paleta (de baja densidad verde a alta densidad roja)
    const imgData = alphaCtx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    const palette = createHeatmapPalette();

    for (let i = 0; i < pixels.length; i += 4) {
      const alpha = pixels[i + 3];
      if (alpha > 0) {
        const pIndex = alpha * 4;
        pixels[i] = palette[pIndex];         // R
        pixels[i + 1] = palette[pIndex + 1]; // G
        pixels[i + 2] = palette[pIndex + 2]; // B
        pixels[i + 3] = palette[pIndex + 3]; // A
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [circlesSvg]);

  return (
    <div className="absolute inset-0 select-none">
      {/* Césped reglamentario con franjas claras */}
      <PitchSvgMarkings />

      {/* Capa de calor térmica multicolor */}
      <canvas
        ref={canvasRef}
        width={630}
        height={408}
        className="absolute inset-0 h-full w-full pointer-events-none"
      />

      {/* Leyenda térmica y dirección de ataque */}
      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2 rounded-full border border-neutral-300 bg-white/95 px-3 py-1 text-[10px] font-bold text-neutral-700 shadow-2xs backdrop-blur-xs">
        <div className="flex items-center gap-1">
          <span className="text-neutral-500 font-medium">Densidad</span>
          <div className="h-2 w-12 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-[#e2001a]" />
        </div>
        <span className="text-neutral-300">|</span>
        <div className="flex items-center gap-1">
          <span>Ataque</span>
          <span aria-hidden="true" className="font-black text-[#e2001a]">&rarr;</span>
        </div>
      </div>
    </div>
  );
}
