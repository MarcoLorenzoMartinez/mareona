// Client: Canvas-based pixelated photo for Who Are Ya
'use client';

import React, { useRef, useEffect } from 'react';
import { getPixelationFactor } from '@/lib/who-are-ya/engine';

interface WhoAreYaMysteryPhotoProps {
  imageUrl: string;
  name: string;
  attemptsCount: number;
  isGameOver: boolean;
  isKit?: boolean;
}

export function WhoAreYaMysteryPhoto({
  imageUrl,
  name,
  attemptsCount,
  isGameOver,
  isKit = false,
}: WhoAreYaMysteryPhotoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const factor = getPixelationFactor(attemptsCount, isGameOver);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      if (factor <= 1) {
        // Full resolution
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, w, h);
        return;
      }

      // Pixelation technique: draw to miniature offscreen canvas without smoothing,
      // then scale back up to main canvas with imageSmoothingEnabled = false.
      const scaledW = Math.max(1, Math.floor(w / factor));
      const scaledH = Math.max(1, Math.floor(h / factor));

      const offscreen = document.createElement('canvas');
      offscreen.width = scaledW;
      offscreen.height = scaledH;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      offCtx.imageSmoothingEnabled = true;
      offCtx.drawImage(img, 0, 0, scaledW, scaledH);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offscreen, 0, 0, scaledW, scaledH, 0, 0, w, h);
    };
  }, [imageUrl, factor]);

  return (
    <div className="relative mx-auto flex flex-col items-center select-none">
      <div className="relative h-48 w-48 overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] shadow-md sm:h-56 sm:w-56 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={224}
          height={224}
          className={`h-full w-full pointer-events-none ${
            isKit ? 'object-contain p-2' : 'object-cover'
          }`}
          aria-label={isGameOver ? name : 'Reto misterioso'}
        />

        {/* Capa de protección transparente para evitar arrastre y clic derecho */}
        {!isGameOver && (
          <div
            className="absolute inset-0 z-10 select-none"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        )}
      </div>

      {isGameOver && (
        <div className="mt-3 text-center animate-in fade-in duration-300">
          <h2 className="text-base font-bold text-[var(--foreground)]">{name}</h2>
        </div>
      )}
    </div>
  );
}
