// Client: Fotografía con pixelado progresivo auténtico (Canvas 2D) para ¿Quién es?
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { getPixelationFactor } from '@/lib/who-are-ya/engine';
import { PlayerAvatarFallback } from '@/components/media/player-avatar-fallback';
import { areOfficialAssetsEnabled } from '@/lib/legal/official-assets';
import { getDictionary } from '@/i18n';

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
}: WhoAreYaMysteryPhotoProps) {
  const dict = getDictionary();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cachedImgRef = useRef<HTMLImageElement | null>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const assetsEnabled = areOfficialAssetsEnabled();
  const factor = getPixelationFactor(attemptsCount, isGameOver);
  const isLoaded = loadedUrl === imageUrl && !hasError;
  const showUnavailable = !assetsEnabled || hasError;

  // Renderiza el pixelado auténtico redibujando a baja resolución sin suavizado
  const drawPixelated = useCallback((img: HTMLImageElement, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (factor <= 1 || isGameOver) {
      // Resolución nativa nítida
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, w, h);
      return;
    }

    // Técnica de pixelado: dibujar a escala miniatura y ampliar con interpolación desactivada
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
  }, [factor, isGameOver]);

  useEffect(() => {
    if (!assetsEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Si la imagen ya está en memoria para esta URL, redibujamos inmediatamente con el nuevo factor
    if (cachedImgRef.current && loadedUrl === imageUrl) {
      drawPixelated(cachedImgRef.current, canvas);
      return;
    }

    let isMounted = true;
    const img = new window.Image();

    // No se añade crossOrigin='anonymous' para evitar rechazo CORS de servidores externos
    img.src = imageUrl;

    img.onload = () => {
      if (!isMounted) return;
      cachedImgRef.current = img;
      setLoadedUrl(imageUrl);
      setHasError(false);
      drawPixelated(img, canvas);
    };

    img.onerror = () => {
      if (!isMounted) return;
      setHasError(true);
      setLoadedUrl(imageUrl);
    };

    return () => {
      isMounted = false;
    };
  }, [assetsEnabled, imageUrl, loadedUrl, drawPixelated]);

  return (
    <div className="relative mx-auto flex flex-col items-center select-none">
      <div className="relative h-48 w-48 overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-neutral-100 shadow-md sm:h-56 sm:w-56 flex items-center justify-center">
        {/* Esqueleto de carga mientras se descarga la imagen */}
        {!showUnavailable && !isLoaded && (
          <div
            className="absolute inset-0 bg-neutral-200/80 animate-pulse flex items-center justify-center z-0"
            aria-hidden="true"
          />
        )}

        {showUnavailable ? (
          <div className="flex flex-col items-center justify-center p-4 text-center z-10 w-full h-full">
            <div className="h-24 w-24 mb-2">
              <PlayerAvatarFallback teamColor="#e2001a" />
            </div>
            <span className="text-[11px] font-semibold text-neutral-500">
              {isGameOver ? name : dict.games.whoAreYa.mysteryPhoto.unavailable}
            </span>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={448}
            height={448}
            className={`h-full w-full object-cover pointer-events-none transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            aria-label={isGameOver ? name : dict.games.whoAreYa.mysteryPhoto.pixelatedAria}
          />
        )}

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
