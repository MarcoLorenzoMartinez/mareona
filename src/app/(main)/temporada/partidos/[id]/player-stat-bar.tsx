// Visual completion/accuracy stat bar with fraction and percentage - modern & sober
interface PlayerStatBarProps {
  readonly label: string;
  readonly successful: number;
  readonly total: number;
}

export function PlayerStatBar({
  label,
  successful,
  total,
}: PlayerStatBarProps) {
  const pct = total > 0 ? Math.min(100, Math.round((successful / total) * 100)) : 0;

  return (
    <div className="flex flex-col gap-1.5 py-1.5 border-b border-[var(--border)] last:border-b-0 text-xs">
      <div className="flex items-center justify-between min-w-0">
        <span className="text-[var(--foreground-muted)]">{label}</span>
        <span className="font-semibold font-sans tabular-nums text-[var(--foreground)]">
          {successful}/{total}{" "}
          <span className="text-[10px] text-[var(--foreground-muted)] font-normal">
            ({pct}%)
          </span>
        </span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden" aria-hidden="true">
        <div
          className="h-full rounded-full transition-all duration-300 bg-neutral-800"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
