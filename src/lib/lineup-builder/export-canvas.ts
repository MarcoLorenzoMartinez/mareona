import type { PitchAssignedPlayer, LineupPlayer } from "./types";

interface ExportLineupOptions {
  readonly formationLabel: string;
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
 * Generates a high-definition PNG Blob of the lineup board rendered directly
 * onto an HTML5 Canvas, completely free of external dependencies.
 *
 * @param options Lineup data with starters, formation and team title
 * @returns Promise resolving to a PNG Blob
 */
export async function exportLineupToBlob(options: ExportLineupOptions): Promise<Blob> {
  const {
    formationLabel,
    teamTitle = "Real Sporting",
    starters,
  } = options;

  const width = 1080;
  const height = 1520;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not acquire 2D canvas context");

  // 1. Fondo oscuro elegante
  ctx.fillStyle = "#121212";
  ctx.fillRect(0, 0, width, height);

  // 2. Cabecera visual de Mareona
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 44px sans-serif";
  ctx.fillText("MI ONCE", 60, 80);

  ctx.fillStyle = "#e2001a";
  ctx.fillRect(260, 48, 4, 40);

  ctx.fillStyle = "#a3a3a3";
  ctx.font = "600 28px sans-serif";
  ctx.fillText(`${teamTitle} · ${formationLabel}`, 280, 80);

  // 3. Terreno de juego de césped
  const pitchX = 60;
  const pitchY = 120;
  const pitchW = 960;
  const pitchH = 1320;

  // Fondo césped con franjas
  ctx.save();
  roundRect(ctx, pitchX, pitchY, pitchW, pitchH, 32);
  ctx.clip();

  const stripes = 7;
  const stripeH = pitchH / stripes;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#256e36" : "#216431";
    ctx.fillRect(pitchX, pitchY + i * stripeH, pitchW, stripeH);
  }

  // Líneas reglamentarias del campo
  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = 4;

  // Perímetro
  ctx.strokeRect(pitchX + 30, pitchY + 30, pitchW - 60, pitchH - 60);

  // Medio campo
  const midY = pitchY + pitchH / 2;
  ctx.beginPath();
  ctx.moveTo(pitchX + 30, midY);
  ctx.lineTo(pitchX + pitchW - 30, midY);
  ctx.stroke();

  // Círculo central
  ctx.beginPath();
  ctx.arc(pitchX + pitchW / 2, midY, 110, 0, Math.PI * 2);
  ctx.stroke();

  // Áreas
  const areaW = 440;
  const areaH = 200;
  const areaX = pitchX + (pitchW - areaW) / 2;

  // Área rival (arriba)
  ctx.strokeRect(areaX, pitchY + 30, areaW, areaH);
  // Área propia (abajo)
  ctx.strokeRect(areaX, pitchY + pitchH - 30 - areaH, areaW, areaH);

  // 4. Dibujar jugadores iniciales
  for (const starter of starters) {
    const px = pitchX + (starter.coord.x / 100) * pitchW;
    const py = pitchY + (starter.coord.y / 100) * pitchH;
    const radius = 42;

    // Sombra del token
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;

    // Círculo exterior blanco
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#1e1e1e";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.restore();

    // Foto o iniciales
    if (starter.player?.photoUrl) {
      try {
        const pImg = await loadImage(starter.player.photoUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, radius - 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(pImg, px - radius, py - radius, radius * 2, radius * 2);
        ctx.restore();
      } catch {
        // Fallback iniciales si falla la carga externa
        drawFallbackInitials(ctx, px, py, radius, starter.player.displayName);
      }
    } else if (starter.player) {
      drawFallbackInitials(ctx, px, py, radius, starter.player.displayName);
    }

    // Role badge
    ctx.fillStyle = "#121212";
    roundRect(ctx, px + radius - 26, py - radius - 4, 34, 22, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(starter.role, px + radius - 9, py - radius + 12);

    // Etiqueta del nombre (píldora oscura)
    const name = starter.player ? starter.player.displayName : "Vacante";
    ctx.font = "bold 18px sans-serif";
    const nameWidth = ctx.measureText(name).width + 24;
    const pillH = 30;

    ctx.fillStyle = "rgba(0, 0, 0, 0.88)";
    roundRect(ctx, px - nameWidth / 2, py + radius + 10, nameWidth, pillH, 15);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(name, px, py + radius + 31);

    // Dorsal
    if (starter.player?.shirtNumber !== null && starter.player?.shirtNumber !== undefined) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(`#${starter.player.shirtNumber}`, px, py + radius + 55);
    }
  }

  // Watermark Mareona en esquina inferior del césped
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("MAREONA.COM", pitchX + pitchW - 40, pitchY + pitchH - 45);

  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas conversion to Blob failed"));
    }, "image/png");
  });
}

function drawFallbackInitials(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  radius: number,
  name: string
): void {
  ctx.save();
  ctx.fillStyle = "#2e2e2e";
  ctx.beginPath();
  ctx.arc(px, py, radius - 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(name.slice(0, 2).toUpperCase(), px, py);
  ctx.restore();
}
