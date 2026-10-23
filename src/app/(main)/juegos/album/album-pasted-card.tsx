"use client"; // Client: Animación de pegado de cromo sobre cartón de álbum

import { useEffect, useState, type ReactNode } from "react";

interface AlbumPastedCardProps {
  readonly children: ReactNode;
  /** Deterministic seed so the rotation is stable between renders */
  readonly rotationSeed: number;
  /** Whether this card was just acquired (triggers paste animation) */
  readonly isNew?: boolean;
}

/**
 * Wraps a HistoricalCard to simulate it being physically pasted into an album.
 * - Applies a subtle, deterministic rotation so cards look hand-placed.
 * - Adds a slightly uneven drop-shadow that mimics cardstock thickness on paper.
 * - If `isNew` is true, animates a "landing" entrance from above (cromo falling onto the page).
 */
export function AlbumPastedCard({
  children,
  rotationSeed,
  isNew = false,
}: AlbumPastedCardProps) {
  const [landed, setLanded] = useState(!isNew);

  useEffect(() => {
    if (isNew) {
      const t = setTimeout(() => setLanded(true), 40);
      return () => clearTimeout(t);
    }
  }, [isNew]);

  // Deterministic tilt: alternates between small CW and CCW angles based on seed
  // range: -1.8° to +1.8°, skipping near-zero so nothing looks perfectly aligned
  const tiltAngles = [-1.8, -1.2, -0.6, 0.6, 1.2, 1.8];
  const rotation = tiltAngles[Math.abs(rotationSeed) % tiltAngles.length];

  const style: React.CSSProperties = {
    transform: `rotate(${rotation}deg)`,
    // Three-layer shadow: (1) soft wide halo, (2) crisp edge, (3) hot-spot near top-left
    filter:
      "drop-shadow(0 4px 12px rgba(80,50,10,0.28)) drop-shadow(0 1px 2px rgba(60,30,0,0.40))",
    transition: landed
      ? "transform 150ms ease-out, filter 150ms ease-out"
      : "none",
    ...(isNew && !landed
      ? { opacity: 0, transform: `rotate(${rotation}deg) translateY(-18px) scale(0.94)` }
      : {}),
    ...(isNew && landed
      ? { opacity: 1, transform: `rotate(${rotation}deg) translateY(0) scale(1)`,
          transition: "opacity 220ms ease-out, transform 260ms cubic-bezier(0.22,1,0.36,1)" }
      : {}),
  };

  return (
    <div
      className="relative hover:z-10 hover:scale-[1.03] transition-transform duration-150"
      style={style}
    >
      {/* Tiny adhesive strip glow at the top of the card (simulates glue edge) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-2 top-0 h-px rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,200,0.45), transparent)",
        }}
      />
      {children}
    </div>
  );
}
