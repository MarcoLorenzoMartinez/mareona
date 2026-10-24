"use client"; // Client: Contenedor con escala proporcional uniforme para cromos coleccionables

import { useRef, useState, useEffect, type ReactNode } from "react";

export const CARD_CANONICAL_WIDTH = 176;
export const CARD_CANONICAL_HEIGHT = 251.4285; // Proporción exacta 63/90 (176 * 90 / 63)

interface CardScaleFrameProps {
  readonly children: ReactNode;
  readonly size?: "sm" | "md" | "lg" | "fill";
  readonly className?: string;
}

/**
 * CardScaleFrame renders cards at their authentic canonical dimensions (176x251.43)
 * providing maximum photo height and compact stats matching the original album design 1:1,
 * scaling uniformly via CSS transform: scale() to fit any container width like an image.
 */
export function CardScaleFrame({
  children,
  size = "md",
  className = "",
}: CardScaleFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(() => {
    if (size === "sm") return 1;
    if (size === "lg") return 256 / CARD_CANONICAL_WIDTH;
    if (size === "md") return 208 / CARD_CANONICAL_WIDTH;
    return 1;
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) {
        setScale(w / CARD_CANONICAL_WIDTH);
      }
    };

    updateScale();

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.contentRect.width > 0) {
        setScale(entry.contentRect.width / CARD_CANONICAL_WIDTH);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const widthClass =
    size === "fill"
      ? "w-full"
      : size === "sm"
        ? "w-44 max-w-full"
        : size === "lg"
          ? "w-64 max-w-full"
          : "w-52 max-w-full";

  return (
    <div
      ref={containerRef}
      className={`relative aspect-[63/90] ${widthClass} shrink-0 select-none ${className}`}
    >
      <div
        className="absolute top-0 left-0"
        style={{
          width: CARD_CANONICAL_WIDTH,
          height: CARD_CANONICAL_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
