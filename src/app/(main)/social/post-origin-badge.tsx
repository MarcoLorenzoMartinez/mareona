// Client: Enlace al partido que detiene la propagación en tarjetas interactivas
"use client";

import Link from "next/link";
import { getDictionary } from "@/i18n";

interface PostOriginBadgeProps {
  readonly matchId?: string | null;
  readonly matchLabel?: string | null;
}

export function PostOriginBadge({ matchId, matchLabel }: PostOriginBadgeProps) {
  const dict = getDictionary();
  if (matchId) {
    const label = matchLabel
      ? `${dict.social.post.originGrada} · ${matchLabel}`
      : dict.social.post.originGrada;
    return (
      <Link
        href={`/temporada/partidos/${matchId}`}
        onClick={(e) => e.stopPropagation()}
        aria-label={`${dict.social.post.viewMatchAriaPrefix} ${label}`}
        className="shrink-0 truncate max-w-[11rem] sm:max-w-[16rem] rounded-sm text-xs font-medium text-neutral-500 underline-offset-2 transition-colors hover:text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        <span className="font-semibold text-[var(--primary)]">{dict.social.post.originGrada}</span>
        {matchLabel && <span> · {matchLabel}</span>}
      </Link>
    );
  }

  return (
    <span className="shrink-0 text-xs font-medium text-neutral-600">
      {dict.social.post.originSocial}
    </span>
  );
}
