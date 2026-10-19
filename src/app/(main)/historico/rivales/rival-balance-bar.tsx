// Client: Barra visual tripartita de balance deportivo (victorias, empates y derrotas)
"use client";

interface RivalBalanceBarProps {
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly played: number;
  readonly winPercentage: number;
}

/**
 * Tri-color segmented micro-bar representing match balance:
 * - Red (#e2001a): Sporting victories
 * - Light gray (neutral-300): Draws
 * - Dark gray (neutral-600): Opponent victories
 * Complies with AGENTS.md rules 2, 3, 5, 8 and 9.
 */
export function RivalBalanceBar({
  won,
  drawn,
  lost,
  played,
  winPercentage,
}: RivalBalanceBarProps) {
  const wonPct = played > 0 ? (won / played) * 100 : 0;
  const drawnPct = played > 0 ? (drawn / played) * 100 : 0;
  const lostPct = played > 0 ? (lost / played) * 100 : 0;

  return (
    <div
      className="hidden sm:flex h-1.5 w-12 rounded-full bg-neutral-200 overflow-hidden shrink-0"
      title={`${won}V · ${drawn}E · ${lost}D (${winPercentage}% victoria)`}
      aria-label={`${won} victorias, ${drawn} empates, ${lost} derrotas`}
    >
      <div
        className="h-full bg-[var(--primary)] shrink-0 transition-all"
        style={{ width: `${wonPct}%` }}
      />
      <div
        className="h-full bg-neutral-300 shrink-0 transition-all"
        style={{ width: `${drawnPct}%` }}
      />
      <div
        className="h-full bg-neutral-600 shrink-0 transition-all"
        style={{ width: `${lostPct}%` }}
      />
    </div>
  );
}
