import type { PitchAssignedPlayer, LineupPlayer } from "./types";
import { getConcisePlayerName } from "./player-name-formatter";
import { areOfficialAssetsEnabled } from "../legal/official-assets";

interface ExportLineupOptions {
  readonly formationLabel?: string;
  readonly teamTitle?: string;
  readonly starters: readonly PitchAssignedPlayer[];
  readonly substitutes?: readonly LineupPlayer[];
}

/**
 * Loads an image from a URL or data URL and returns an HTMLImageElement safely.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Draws rounded rectangle path on Canvas 2D context.
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Generates a modern, clean, full-pitch PNG of the tactical lineup.
 * No ugly black margins or bulky headers: edge-to-edge grass canvas
 * with prominent player cutouts, minimalist name capsules, and subtle branding.
 *
 * @param options Lineup data with starters, formation and team title
 * @returns Promise resolving to a PNG Blob
 */
export async function exportLineupToBlob(options: ExportLineupOptions): Promise<Blob> {
  const {
    starters,
  } = options;

  // Formato vertical óptimo 1080 x 1440 (aspecto 3:4 ideal para Instagram / X / WhatsApp)
  const width = 1080;
  const height = 1440;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not acquire 2D canvas context");

  // 1. Césped de borde a borde (full canvas) con franjas realistas
  const stripes = 7;
  const stripeH = height / stripes;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#256e36" : "#216431";
    ctx.fillRect(0, i * stripeH, width, stripeH);
  }

  // 2. Líneas reglamentarias del campo
  const pad = 48;
  const pW = width - pad * 2;
  const pH = height - pad * 2;

  ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
  ctx.lineWidth = 4;

  // Perímetro
  ctx.strokeRect(pad, pad, pW, pH);

  // Medio campo
  const midY = height / 2;
  ctx.beginPath();
  ctx.moveTo(pad, midY);
  ctx.lineTo(width - pad, midY);
  ctx.stroke();

  // Círculo central
  ctx.beginPath();
  ctx.arc(width / 2, midY, 130, 0, Math.PI * 2);
  ctx.stroke();

  // Punto central
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.beginPath();
  ctx.arc(width / 2, midY, 6, 0, Math.PI * 2);
  ctx.fill();

  // Áreas reglamentarias
  const areaW = 460;
  const areaH = 200;
  const areaX = (width - areaW) / 2;

  // Área rival (arriba)
  ctx.strokeRect(areaX, pad, areaW, areaH);
  // Área propia (abajo)
  ctx.strokeRect(areaX, height - pad - areaH, areaW, areaH);

  // 3. Dibujar jugadores titulares con fotos ampliadas y diseño minimalista
  for (const starter of starters) {
    const px = pad + (starter.coord.x / 100) * pW;
    const py = pad + (starter.coord.y / 100) * pH;
    const radius = 76; // Mayor tamaño de foto para máxima visibilidad

    // Sombra del token
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;

    // Círculo exterior blanco con base clara
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#f3f4f3";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.restore();

    // Foto o silueta atlética
    if (starter.player?.photoUrl && areOfficialAssetsEnabled()) {
      try {
        const pImg = await loadImage(starter.player.photoUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, radius - 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(pImg, px - radius, py - radius, radius * 2, radius * 2);
        ctx.restore();
      } catch {
        drawFallbackSilhouette(ctx, px, py, radius);
      }
    } else if (starter.player) {
      drawFallbackSilhouette(ctx, px, py, radius);
    }

    // Etiqueta del nombre (estilo cápsula blanca con círculo rojo para el dorsal)
    const rawName = starter.player ? starter.player.displayName : "Vacante";
    const displayName = starter.player ? getConcisePlayerName(rawName) : "Vacante";
    const shirtNum = starter.player?.shirtNumber;
    const hasNum = shirtNum !== null && shirtNum !== undefined && shirtNum > 0;

    ctx.font = "bold 22px sans-serif";
    const nameTextWidth = ctx.measureText(displayName).width;
    const numText = hasNum ? String(shirtNum) : "";
    const numCircleDiameter = 24;
    const numGap = 8;
    const leftPad = hasNum ? 6 : 14;
    const rightPad = 14;
    const totalPillWidth = (hasNum ? leftPad + numCircleDiameter + numGap : leftPad) + nameTextWidth + rightPad;
    const pillH = 36;
    const pillX = px - totalPillWidth / 2;
    const pillY = py + radius + 10;

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    // Fondo blanco puro
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, pillX, pillY, totalPillWidth, pillH, pillH / 2);
    ctx.fill();

    // Borde fino suave
    ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
    ctx.lineWidth = 1;
    roundRect(ctx, pillX, pillY, totalPillWidth, pillH, pillH / 2);
    ctx.stroke();
    ctx.restore();

    let textStartX = pillX + leftPad;
    if (hasNum) {
      const circleCenterX = pillX + leftPad + numCircleDiameter / 2;
      const circleCenterY = pillY + pillH / 2;
      ctx.save();
      ctx.fillStyle = "#e2001a";
      ctx.beginPath();
      ctx.arc(circleCenterX, circleCenterY, numCircleDiameter / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = shirtNum >= 10 ? "bold 13px sans-serif" : "bold 15px sans-serif";
      ctx.fillText(numText, circleCenterX, circleCenterY);
      ctx.restore();

      textStartX += numCircleDiameter + numGap;
    }

    ctx.fillStyle = "#171717";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(displayName, textStartX, pillY + pillH / 2 + 1);
  }

  // 4. Marca sutil en el margen de césped inferior derecho
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.font = "900 20px sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText("MAREONA", width - pad - 4, height - pad / 2);
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas conversion to Blob failed"));
    }, "image/png");
  });
}

/**
 * Draws athletic silhouette bust fallback on canvas.
 */
function drawFallbackSilhouette(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  radius: number
): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(px, py, radius - 2, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = "#e5e7eb";
  ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);

  // Silueta cabeza y torso
  ctx.fillStyle = "#9ca3af";
  ctx.beginPath();
  ctx.arc(px, py - radius * 0.15, radius * 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(px, py + radius * 0.9, radius * 0.65, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
