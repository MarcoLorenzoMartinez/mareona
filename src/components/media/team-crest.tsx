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
  const sizeClass = SIZE_CLASSES[size];
  const acronym = teamName.slice(0, 3).toUpperCase();

  if (!crestUrl) {
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
      src={crestUrl}
      alt={isDecorative ? "" : teamName}
      loading="lazy"
      className={`shrink-0 rounded-full object-contain ${sizeClass}`}
    />
  );
}
