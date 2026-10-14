interface SoccerBallIconProps {
  readonly className?: string;
  readonly size?: number;
}

/**
 * Minimalist geometric soccer ball vector icon designed in Lucide line-art aesthetic.
 */
export function SoccerBallIcon({
  className = "h-4 w-4",
  size = 16,
}: SoccerBallIconProps) {
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
      <circle cx="12" cy="12" r="10" />
      <polygon points="12 7 8 10 9.5 15 14.5 15 16 10" />
      <line x1="12" y1="2" x2="12" y2="7" />
      <line x1="8" y1="10" x2="3.5" y2="8" />
      <line x1="9.5" y1="15" x2="6.5" y2="18.5" />
      <line x1="14.5" y1="15" x2="17.5" y2="18.5" />
      <line x1="16" y1="10" x2="20.5" y2="8" />
    </svg>
  );
}
