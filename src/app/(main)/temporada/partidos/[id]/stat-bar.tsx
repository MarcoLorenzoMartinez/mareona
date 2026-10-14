export interface StatBarProps {
  readonly label: string;
  readonly homeVal: string | number;
  readonly awayVal: string | number;
  readonly homeNumeric?: number;
  readonly awayNumeric?: number;
  readonly isHomeSporting: boolean;
  readonly homeColor: string;
  readonly awayColor: string;
}

export function StatBar({
  label,
  homeVal,
  awayVal,
  homeNumeric,
  awayNumeric,
  isHomeSporting,
  homeColor,
  awayColor,
}: StatBarProps) {
  const hNum = homeNumeric ?? (typeof homeVal === "number" ? homeVal : parseFloat(String(homeVal)) || 0);
  const aNum = awayNumeric ?? (typeof awayVal === "number" ? awayVal : parseFloat(String(awayVal)) || 0);
  const total = hNum + aNum;
  const hPct = total > 0 ? (hNum / total) * 100 : 50;
  const aPct = total > 0 ? (aNum / total) * 100 : 50;

  return (
    <div className="flex flex-col gap-1.5 py-2.5">
      <div className="flex items-center justify-between text-xs">
        <span
          className={`font-sans text-sm font-bold tabular-nums ${
            isHomeSporting ? "text-[var(--primary)] font-black" : "text-[var(--foreground)]"
          }`}
        >
          {homeVal}
        </span>
        <span className="text-center font-medium text-[var(--foreground-muted)] text-[11px] sm:text-xs">
          {label}
        </span>
        <span
          className={`font-sans text-sm font-bold tabular-nums ${
            !isHomeSporting ? "text-[var(--primary)] font-black" : "text-[var(--foreground)]"
          }`}
        >
          {awayVal}
        </span>
      </div>
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface)] border border-[var(--border)]/40">
        <div style={{ width: `${hPct}%`, backgroundColor: homeColor }} className="h-full transition-all duration-300" />
        <div style={{ width: `${aPct}%`, backgroundColor: awayColor }} className="h-full transition-all duration-300" />
      </div>
    </div>
  );
}
