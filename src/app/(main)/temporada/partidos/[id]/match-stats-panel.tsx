import type {
  DomainMatchDetail,
  DomainMatchStatGroup,
  DomainMatchStatItem,
} from "@/lib/sports-api/types";
import { getTeamPrimaryColor } from "@/lib/sports-api/team-colors";
import { getDictionary } from "@/i18n";

interface MatchStatsPanelProps {
  readonly match: DomainMatchDetail;
}

function StatBar({
  stat,
  isHomeSporting,
  homeColor,
  awayColor,
}: {
  readonly stat: DomainMatchStatItem;
  readonly isHomeSporting: boolean;
  readonly homeColor: string;
  readonly awayColor: string;
}) {
  const hNum = stat.homeNumeric;
  const aNum = stat.awayNumeric;
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
          {stat.homeValue}
        </span>
        <span className="text-center font-medium text-[var(--foreground-muted)] text-[11px] sm:text-xs">
          {stat.label}
        </span>
        <span
          className={`font-sans text-sm font-bold tabular-nums ${
            !isHomeSporting ? "text-[var(--primary)] font-black" : "text-[var(--foreground)]"
          }`}
        >
          {stat.awayValue}
        </span>
      </div>

      {/* Barra de progreso comparativo con colores oficiales */}
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface)] border border-[var(--border)]/40">
        <div
          style={{ width: `${hPct}%`, backgroundColor: homeColor }}
          className="h-full transition-all duration-300"
        />
        <div
          style={{ width: `${aPct}%`, backgroundColor: awayColor }}
          className="h-full transition-all duration-300"
        />
      </div>
    </div>
  );
}

function StatGroupCard({
  group,
  isHomeSporting,
  homeColor,
  awayColor,
}: {
  readonly group: DomainMatchStatGroup;
  readonly isHomeSporting: boolean;
  readonly homeColor: string;
  readonly awayColor: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
      <h3 className="border-b border-[var(--border)] pb-2.5 text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
        {group.title}
      </h3>
      <div className="mt-2 divide-y divide-[var(--border)]/40">
        {group.stats.map((stat) => (
          <StatBar
            key={stat.key}
            stat={stat}
            isHomeSporting={isHomeSporting}
            homeColor={homeColor}
            awayColor={awayColor}
          />
        ))}
      </div>
    </div>
  );
}

export function MatchStatsPanel({ match }: MatchStatsPanelProps) {
  const dict = getDictionary();
  const t = dict.season.matchDetail.stats;

  if (match.statGroups.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center shadow-2xs">
        <p className="text-sm font-medium text-[var(--foreground-muted)]">
          {match.status === "scheduled" ? t.pendingStats : t.noStats}
        </p>
      </div>
    );
  }

  const isHomeSporting = match.homeTeam.isSporting;
  const homeColor = getTeamPrimaryColor({
    teamExternalId: match.homeTeam.externalId,
    teamName: match.homeTeam.name,
    isSporting: match.homeTeam.isSporting,
  });
  const awayColor = getTeamPrimaryColor({
    teamExternalId: match.awayTeam.externalId,
    teamName: match.awayTeam.name,
    isSporting: match.awayTeam.isSporting,
  });

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {match.statGroups.map((group) => (
        <StatGroupCard
          key={group.groupKey}
          group={group}
          isHomeSporting={isHomeSporting}
          homeColor={homeColor}
          awayColor={awayColor}
        />
      ))}
    </div>
  );
}
