interface MissedPenaltyIconProps {
  readonly className?: string;
  readonly size?: number;
}

/**
 * Minimalist soccer ball icon with a distinct red diagonal strike-through,
 * clearly representing a missed or saved penalty in match events.
 */
export function MissedPenaltyIcon({
  className = "h-4 w-4",
  size = 16,
}: MissedPenaltyIconProps) {
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
      <circle cx="12" cy="12" r="9" />
      <polygon points="12 7.5 9 10 10 14 14 14 15 10" />
      <line x1="5" y1="5" x2="19" y2="19" stroke="#dc2626" strokeWidth="2.5" />
    </svg>
  );
}
