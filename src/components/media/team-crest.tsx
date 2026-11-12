"use client"; // Client: Fallback automático ante fallos de carga de imágenes externas

import { useState } from "react";

interface TeamCrestProps {
  readonly crestUrl: string | null | undefined;
  readonly teamName: string;
  readonly size?: "sm" | "md" | "lg";
  readonly isDecorative?: boolean;
  readonly isSporting?: boolean;
}

const SIZE_CLASSES = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-12 w-12 text-sm",
} as const;

/**
 * Standard team crest component conforming to AGENTS.md rule 3.
 * Preserves external club branding colors while ensuring WCAG 2.2 AA accessibility.
 * Automatically falls back to an accessible acronym badge if the remote crest fails to load.
 *
 * @param crestUrl Remote URL for the club crest image.
 * @param teamName Full name of the football team.
 * @param size Predefined dimension (sm: 24px, md: 32px, lg: 48px).
 * @param isDecorative When true (default when rendered alongside text), alt="" is applied.
 * @param isSporting Highlights Sporting crest with corporate brand token when fallback is used.
 */
export function TeamCrest({
  crestUrl,
  teamName,
  size = "md",
  isDecorative = true,
  isSporting = false,
}: TeamCrestProps) {
  const effectiveCrestUrl = crestUrl ?? (isSporting ? "/crests/historical/sporting-modern.png" : null);
  const [prevCrestUrl, setPrevCrestUrl] = useState(effectiveCrestUrl);
  const [hasError, setHasError] = useState(false);
  const sizeClass = SIZE_CLASSES[size];
  const acronym = isSporting ? "RSG" : teamName.slice(0, 3).toUpperCase();

  // Reset error state if the URL prop changes between renders
  if (prevCrestUrl !== effectiveCrestUrl) {
    setPrevCrestUrl(effectiveCrestUrl);
    setHasError(false);
  }

  if (!effectiveCrestUrl || hasError) {
    return (
      <div
        aria-hidden={isDecorative ? "true" : undefined}
        aria-label={!isDecorative ? teamName : undefined}
        className={`flex shrink-0 items-center justify-center rounded-full border font-black tracking-wider select-none ${sizeClass} ${
          isSporting
            ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-xs"
            : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
        }`}
      >
        {acronym}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={effectiveCrestUrl}
      alt={isDecorative ? "" : teamName}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`shrink-0 object-contain ${sizeClass}`}
    />
  );
}
