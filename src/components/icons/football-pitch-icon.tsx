interface FootballPitchIconProps {
  readonly className?: string;
  readonly size?: number;
}

/**
 * Minimalist geometric football pitch vector icon designed in Lucide line-art aesthetic.
 * Represents the tactical board and user lineup ("Mi Once").
 */
export function FootballPitchIcon({
  className = "h-4 w-4",
  size = 16,
}: FootballPitchIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="2.5" width="16" height="19" rx="1.5" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <circle cx="12" cy="12" r="3" />
      <path d="M8.5 2.5v3.5h7V2.5" />
      <path d="M8.5 21.5v-3.5h7v3.5" />
    </svg>
  );
}
