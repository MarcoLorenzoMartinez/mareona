// Client: CSS SVG Pixelated photo for Who Are Ya
'use client';

import React from 'react';
import Image from 'next/image';
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
  const factor = getPixelationFactor(attemptsCount, isGameOver);
  const filterId = `pixelate-filter-${factor}`;

  return (
    <div className="relative mx-auto flex flex-col items-center select-none">
      {/* SVG Pixelation Filter inline */}
      {!isGameOver && factor > 1 && (
        <svg className="sr-only" aria-hidden="true" width="0" height="0">
          <filter id={filterId} x="0" y="0" width="100%" height="100%">
            <feFlood x="4" y="4" height="2" width="2" />
            <feComposite width={factor} height={factor} />
            <feTile result="a" />
            <feComposite in="SourceGraphic" in2="a" operator="in" />
            <feMorphology operator="dilate" radius={factor / 2} />
          </filter>
        </svg>
      )}

      <div className="relative h-48 w-48 overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] shadow-md sm:h-56 sm:w-56 flex items-center justify-center">
        <div
          className="relative h-full w-full pointer-events-none transition-all duration-500 ease-out"
          style={{
            filter: !isGameOver && factor > 1 ? `url(#${filterId})` : 'none',
          }}
        >
          {isKit ? (
            <Image
              src={imageUrl}
              alt={isGameOver ? name : 'Camiseta misteriosa'}
              fill
              draggable={false}
              className="object-contain p-4 select-none pointer-events-none"
              sizes="(max-width: 640px) 192px, 224px"
              priority
            />
          ) : (
            <Image
              src={imageUrl}
              alt={isGameOver ? name : 'Jugador misterioso'}
              fill
              unoptimized
              draggable={false}
              className="object-cover select-none pointer-events-none"
              sizes="(max-width: 640px) 192px, 224px"
              priority
            />
          )}
        </div>

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
