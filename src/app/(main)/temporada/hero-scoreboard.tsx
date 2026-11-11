import { getDictionary } from "@/i18n";

interface HeroScoreboardProps {
  readonly dateLabel: string;
  readonly timeLabel: string;
  readonly homeScore: number | null;
  readonly awayScore: number | null;
  readonly isLive: boolean;
  readonly isFinished: boolean;
  readonly isTimeConfirmed: boolean;
}

/**
 * Center scoreboard inside NextFixtureHero showing date, live/finished score or kickoff time.
 */
export function HeroScoreboard({
  dateLabel,
  timeLabel,
  homeScore,
  awayScore,
  isLive,
  isFinished,
  isTimeConfirmed,
}: HeroScoreboardProps) {
  const dict = getDictionary();
  const hasScore = isFinished || isLive;

  return (
    <div className="col-span-1 relative flex flex-col items-center justify-center shrink-0">
      <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[var(--muted-foreground)] uppercase whitespace-nowrap mb-1 md:mb-0 md:absolute md:-top-5 md:left-1/2 md:-translate-x-1/2">
        {dateLabel}
      </span>
      <div
        className={`flex h-10 md:h-12 min-w-[64px] md:min-w-[76px] items-center justify-center rounded-md backdrop-blur-xs px-2.5 md:px-3.5 text-center shadow-2xs border ${
          isLive
            ? "bg-red-50/80 border-[var(--primary)]/30 animate-pulse"
            : "bg-[var(--surface)]/90 border-[var(--border)]/40"
        }`}
      >
        <span
          className={`text-xl md:text-2xl font-black tracking-tight font-sans tabular-nums leading-none whitespace-nowrap ${
            isLive ? "text-[var(--primary)]" : "text-[var(--foreground)]"
          }`}
        >
          {hasScore
            ? `${homeScore ?? 0} - ${awayScore ?? 0}`
            : !isTimeConfirmed
            ? dict.season.match.vs
            : timeLabel}
        </span>
      </div>
    </div>
  );
}
