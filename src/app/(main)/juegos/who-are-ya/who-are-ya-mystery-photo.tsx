import React from 'react';
import Image from 'next/image';
import { getBlurAmount } from '@/lib/who-are-ya/engine';

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
  const currentBlur = getBlurAmount(attemptsCount, isGameOver);

  return (
    <div className="relative mx-auto flex flex-col items-center select-none">
      <div className="relative h-48 w-48 overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] shadow-md sm:h-56 sm:w-56">
        <div
          className="relative h-full w-full pointer-events-none transition-all duration-700 ease-out"
          style={{ filter: `blur(${currentBlur})` }}
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

        {/* Capa de protección transparente para evitar arrastre, clic derecho e inspección de imagen */}
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
