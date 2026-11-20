// Client: Enlace al partido que detiene la propagación en tarjetas interactivas
"use client";

import Link from "next/link";

interface PostOriginBadgeProps {
  readonly matchId?: string | null;
  readonly matchLabel?: string | null;
}

export function PostOriginBadge({ matchId, matchLabel }: PostOriginBadgeProps) {
  if (matchId) {
    const label = matchLabel ? `Grada · ${matchLabel}` : "Grada";
    return (
      <Link
        href={`/temporada/partidos/${matchId}`}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Ver partido de ${label}`}
        className="shrink-0 truncate max-w-[11rem] sm:max-w-[16rem] rounded-sm text-xs font-medium text-neutral-500 underline-offset-2 transition-colors hover:text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        <span className="font-semibold text-[var(--primary)]">Grada</span>
        {matchLabel && <span> · {matchLabel}</span>}
      </Link>
    );
  }

  return (
    <span className="shrink-0 text-xs font-medium text-neutral-400">
      Social
    </span>
  );
}
