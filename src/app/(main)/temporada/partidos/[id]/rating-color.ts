export interface RatingBadgeStyle {
  readonly bg: string;
  readonly text: string;
}

/**
 * Returns accessible styling for FotMob/Sofascore match rating badges.
 * WCAG 2.2 AA compliant contrast.
 * - >= 8.0: Emerald green (Outstanding)
 * - >= 7.0: Green (Good)
 * - >= 6.0: Amber with high contrast dark text (Average)
 * - < 6.0: Rose red (Below average)
 */
export function getRatingBadgeStyle(rating: number): RatingBadgeStyle {
  if (rating >= 8.0) {
    return { bg: "bg-emerald-600", text: "text-white" };
  }
  if (rating >= 7.0) {
    return { bg: "bg-green-600", text: "text-white" };
  }
  if (rating >= 6.0) {
    return { bg: "bg-amber-500", text: "text-neutral-950" };
  }
  return { bg: "bg-rose-600", text: "text-white" };
}
