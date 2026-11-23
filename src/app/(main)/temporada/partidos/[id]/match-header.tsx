import Image from "next/image";
import { TeamCrest } from "@/components/media/team-crest";
import { formatMatchDate, formatMatchTime } from "@/lib/sports-api/dates";
import { getStadiumAsset } from "@/lib/sports-api/stadiums";
import { areOfficialAssetsEnabled } from "@/lib/legal/official-assets";
import type { DomainMatchDetail } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { MatchHeaderMeta } from "./match-header-meta";

interface MatchHeaderTeamCellProps {
  readonly team: DomainMatchDetail["homeTeam"];
  readonly isHome: boolean;
}

function MatchHeaderTeamCell({ team, isHome }: MatchHeaderTeamCellProps) {
  const layoutClass = isHome
    ? "justify-center md:justify-end text-center md:text-right"
    : "justify-center md:justify-start text-center md:text-left";
  const nameOrderClass = isHome ? "order-2 md:order-1" : "order-2";
  const crestOrderClass = isHome ? "order-1 md:order-2" : "order-1";

  return (
    <div className={`col-span-3 flex flex-col md:flex-row items-center gap-1.5 md:gap-3.5 min-w-0 ${layoutClass}`}>
      <span
        className={`${nameOrderClass} text-xs sm:text-sm font-bold truncate max-w-full md:text-xl ${
          team.isSporting ? "text-[var(--primary)]" : "text-[var(--foreground)]"
        }`}
      >
        {team.name}
      </span>
      <div className={`${crestOrderClass} shrink-0 md:hidden`}>
        <TeamCrest crestUrl={team.crestUrl} teamName={team.name} size="md" isSporting={team.isSporting} />
      </div>
      <div className={`${crestOrderClass} shrink-0 hidden md:block`}>
        <TeamCrest crestUrl={team.crestUrl} teamName={team.name} size="lg" isSporting={team.isSporting} />
      </div>
    </div>
  );
}

interface MatchHeaderProps {
  readonly match: DomainMatchDetail;
  readonly isSyncStale?: boolean;
}

/**
 * Scoreboard hero card presenting match status, official club crests,
 * result/kickoff time and subtle stadium photography backdrop.
 */
export function MatchHeader({ match, isSyncStale = false }: MatchHeaderProps) {
  const dict = getDictionary();
  const t = dict.season.matchDetail;
  const matchT = dict.season.match;
  const kickoffDate = formatMatchDate(
    match.kickoffAt,
    match.isTimeConfirmed,
    false
  );
  const kickoffTime = formatMatchTime(match.kickoffAt);

  const stadiumAsset = areOfficialAssetsEnabled()
    ? getStadiumAsset({
        teamExternalId: match.homeTeam.externalId,
        teamName: match.homeTeam.name,
        isSporting: match.homeTeam.isSporting,
        venueName: match.venue?.name,
      })
    : null;

  const isFinished =
    match.status === "finished" &&
    match.homeScore !== null &&
    match.awayScore !== null;
  const isLive = match.status === "live";
  const hasScore = isFinished || isLive;
  const scoreDisplay = hasScore
    ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`
    : match.isTimeConfirmed
    ? kickoffTime
    : matchT.vs;

  return (
    <section
      aria-label={`${match.homeTeam.name} contra ${match.awayTeam.name}`}
      className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-white p-6 shadow-2xs"
    >
      {stadiumAsset && (
        <div
          className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden"
          aria-hidden="true"
        >
          <Image
            src={stadiumAsset.imagePath}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 900px"
            className="object-cover opacity-15"
            priority
          />
        </div>
      )}

      {/* Cabecera superior con competición y estado */}
      <div className="relative z-10 flex items-center justify-between border-b border-[var(--border)] pb-3">
        <span className="text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">
          {match.roundName
            ? `${match.roundName} · `
            : match.matchday
            ? `${matchT.matchday} ${match.matchday} · `
            : ""}
          {match.competition}
        </span>
        <div className="flex items-center gap-2">
          {match.status === "live" && (
            <span className="rounded-xs bg-[var(--primary)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white animate-pulse">
              {t.status.live}
            </span>
          )}
          {isSyncStale && (
            <span
              role="status"
              className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-950"
            >
              {t.syncStale}
            </span>
          )}
        </div>
      </div>

      {/* Marcador principal y equipos */}
      <div className="relative z-10 grid grid-cols-7 items-center gap-2 py-4 md:gap-6 md:py-6">
        <MatchHeaderTeamCell team={match.homeTeam} isHome={true} />

        {/* Marcador central */}
        <div className="col-span-1 relative flex flex-col items-center justify-center shrink-0">
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[var(--foreground-muted)] uppercase whitespace-nowrap mb-1 md:mb-0 md:absolute md:-top-5 md:left-1/2 md:-translate-x-1/2">
            {kickoffDate}
          </span>
          <div
            className={`flex h-10 md:h-12 min-w-[64px] md:min-w-[76px] items-center justify-center rounded-md backdrop-blur-xs px-2.5 md:px-3.5 text-center shadow-2xs border ${
              isLive
                ? "bg-red-50/80 border-[var(--primary)]/30"
                : "bg-[var(--surface)]/90 border-[var(--border)]/40"
            }`}
          >
            <span
              className={`text-xl md:text-2xl font-black tracking-tight tabular-nums leading-none whitespace-nowrap ${
                isLive ? "text-[var(--primary)]" : "text-[var(--foreground)]"
              }`}
            >
              {scoreDisplay}
            </span>
          </div>
        </div>

        <MatchHeaderTeamCell team={match.awayTeam} isHome={false} />
      </div>

      <MatchHeaderMeta match={match} stadiumAsset={stadiumAsset} />
    </section>
  );
}
