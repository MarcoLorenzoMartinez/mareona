import { TeamCrest } from "@/components/media/team-crest";
import type { DomainMatchSummary } from "@/lib/sports-api/types";

interface HeroTeamCellProps {
  readonly team: DomainMatchSummary["homeTeam"];
  readonly isHome: boolean;
}

/**
 * Team cell inside NextFixtureHero showing responsive crest and truncated name.
 */
export function HeroTeamCell({ team, isHome }: HeroTeamCellProps) {
  const alignmentClass = isHome
    ? "flex-col md:flex-row items-center justify-center md:justify-end text-center md:text-right"
    : "flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-left";

  const nameOrderClass = isHome ? "order-2 md:order-1" : "";
  const crestOrderClass = isHome ? "order-1 md:order-2" : "";

  return (
    <div className={`col-span-3 flex ${alignmentClass} gap-1.5 md:gap-3.5 min-w-0`}>
      <span
        className={`${nameOrderClass} text-xs sm:text-sm font-bold text-[var(--foreground)] md:text-xl truncate max-w-full`}
      >
        {team.name}
      </span>
      <div className={`${crestOrderClass} shrink-0 md:hidden`}>
        <TeamCrest
          crestUrl={team.crestUrl}
          teamName={team.name}
          size="md"
          isSporting={team.isSporting}
          priority
        />
      </div>
      <div className={`${crestOrderClass} shrink-0 hidden md:block`}>
        <TeamCrest
          crestUrl={team.crestUrl}
          teamName={team.name}
          size="lg"
          isSporting={team.isSporting}
          priority
        />
      </div>
    </div>
  );
}
