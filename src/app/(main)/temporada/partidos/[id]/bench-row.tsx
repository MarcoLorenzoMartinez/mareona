import type { DomainLineupPlayer, DomainPlayerMatchStats } from "@/lib/sports-api/types";
import { getRatingBadgeStyle } from "./rating-color";

interface BenchRowProps {
  readonly player: DomainLineupPlayer;
  readonly isSporting: boolean;
  readonly teamColor: string;
  readonly textColor: string;
  readonly stats: DomainPlayerMatchStats | null;
  readonly onSelect?: () => void;
}

export function BenchRow({
  player,
  isSporting,
  teamColor,
  textColor,
  stats,
  onSelect,
}: BenchRowProps) {
  const ratingStyle = stats?.rating ? getRatingBadgeStyle(stats.rating) : null;

  return (
    <li className="list-none">
      <button
        type="button"
        onClick={onSelect}
        className="w-full flex items-center justify-between text-left transition-colors rounded-lg px-2 hover:bg-[var(--surface)] active:bg-neutral-100 cursor-pointer min-h-[44px] py-1 text-[11px]"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="flex shrink-0 items-center justify-center rounded-full tabular-nums font-bold h-5 w-5 text-[10px] opacity-80"
            style={{ backgroundColor: teamColor, color: textColor }}
          >
            {player.jersey ?? "-"}
          </span>
          <span
            className={`truncate ${
              isSporting
                ? "font-medium text-[var(--foreground)]"
                : "font-normal text-[var(--foreground-muted)]"
            }`}
          >
            {player.name}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {player.subbedIn && (
            <span className="text-[12px] font-bold text-emerald-600" title="Entró al campo">↑</span>
          )}
          {stats?.rating && ratingStyle ? (
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold font-sans tabular-nums shadow-2xs ${ratingStyle.bg} ${ratingStyle.text}`}
            >
              {stats.rating.toFixed(1)}
            </span>
          ) : null}
        </div>
      </button>
    </li>
  );
}
