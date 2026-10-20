"use client";

import { useState } from "react";
import Image from "next/image";

interface AuthAvatarProps {
  readonly src: string | null | undefined;
  readonly alt: string;
  readonly size?: "sm" | "md" | "lg" | "xl";
  readonly className?: string;
}

const SIZE_MAP = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-20 w-20 text-xl",
} as const;

const PIXEL_MAP = {
  sm: 28,
  md: 36,
  lg: 48,
  xl: 80,
} as const;

/**
 * Accessible avatar for authenticated users.
 * Supports presets (/avatars/presets/*.svg), remote image URLs, and sports fallback initials.
 */
export function AuthAvatar({
  src,
  alt,
  size = "md",
  className = "",
}: AuthAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const sizeClass = SIZE_MAP[size];
  const pixelDimension = PIXEL_MAP[size];

  // Derive up to 2 uppercase initials from the display name or username
  const cleanAlt = alt.trim() || "Aficionado";
  const initials = cleanAlt
    .replace(/^aficionado_/i, "RSG")
    .slice(0, 2)
    .toUpperCase();

  if (src && !hasError) {
    return (
      <div
        className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-neutral-100 shadow-2xs ${sizeClass} ${className}`}
      >
        <Image
          src={src}
          alt={alt}
          width={pixelDimension}
          height={pixelDimension}
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
          unoptimized={src.endsWith(".svg")}
        />
      </div>
    );
  }

  return (
    <div
      aria-label={alt}
      role="img"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--primary)] font-bold text-white shadow-2xs select-none ${sizeClass} ${className}`}
    >
      <span>{initials}</span>
    </div>
  );
}
