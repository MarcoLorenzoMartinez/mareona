// Client: Gestiona la carga de la fotografía y el fallback visual automático
"use client";

import { useState } from "react";

interface PlayerPhotoProps {
  readonly photoUrl: string | null | undefined;
  readonly playerName: string;
  readonly shirtNumber?: number | null;
  readonly size?: "sm" | "md" | "lg" | "card";
  readonly className?: string;
  readonly isDecorative?: boolean;
}

const SIZE_CLASSES = {
  sm: "h-10 w-10",
  md: "h-16 w-16",
  lg: "h-24 w-24",
  card: "h-52 sm:h-60 w-full",
} as const;

/**
 * Standard player photo component conforming to AGENTS.md rule 3 and LEGAL-ASSETS.md.
 * Displays official player cutout photography with a graceful athletic bust silhouette
 * fallback if the image file is not found in public/images/players/ or fails to load.
 *
 * @param photoUrl Local or remote URL of the player's photo.
 * @param playerName Full display name of the footballer.
 * @param shirtNumber Optional jersey number.
 * @param size Dimension preset (sm, md, lg, card).
 * @param isDecorative When true (default alongside text), alt="" is applied.
 */
export function PlayerPhoto({
  photoUrl,
  playerName,
  shirtNumber: _shirtNumber,
  size = "card",
  className = "",
  isDecorative = true,
}: PlayerPhotoProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const sizeClass = SIZE_CLASSES[size];

  // Global legal killswitch from docs/LEGAL-ASSETS.md
  const allowOfficialAssets =
    process.env.NEXT_PUBLIC_SHOW_OFFICIAL_ASSETS !== "false";

  const hasError = Boolean(photoUrl && failedUrl === photoUrl);
  const showImage = Boolean(photoUrl && allowOfficialAssets && !hasError);

  if (!showImage) {
    return (
      <div
        aria-hidden={isDecorative ? "true" : undefined}
        aria-label={!isDecorative ? playerName : undefined}
        className={`flex shrink-0 items-end justify-center overflow-hidden select-none rounded-xl bg-gradient-to-b from-red-50/60 to-transparent ${sizeClass} ${className}`}
      >
        {/* Minimalist athletic silhouette in Sporting red tone */}
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-28 w-28 text-[var(--primary)] opacity-30"
          aria-hidden="true"
        >
          {/* Minimalist head */}
          <circle cx="32" cy="20" r="9" fill="currentColor" />
          {/* Minimalist shoulders */}
          <path
            d="M14 52c0-9.941 8.059-18 18-18s18 8.059 18 18v6H14v-6z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  const isLocal = Boolean(photoUrl?.startsWith("/"));

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl ?? ""}
      alt={isDecorative ? "" : playerName}
      loading={isLocal ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailedUrl(photoUrl ?? "")}
      className={`shrink-0 object-contain object-bottom ${sizeClass} ${className}`}
    />
  );
}
