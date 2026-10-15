import type { DomainLineupPlayer, DomainPlayerMatchStats } from "@/lib/sports-api/types";
import { TeamCrest } from "@/components/media/team-crest";
import { getTeamPrimaryColor } from "@/lib/sports-api/team-colors";
import { BenchRow } from "./bench-row";
import { lookupPlayerStats } from "@/lib/sports-api/player-stats-matcher";

interface LineupBenchCardProps {
  readonly team: {
    readonly name: string;
    readonly crestUrl?: string | null;
    readonly isSporting: boolean;
    readonly externalId?: string;
  };
  readonly substitutes: readonly DomainLineupPlayer[];
  readonly playerStats?: Readonly<Record<string, DomainPlayerMatchStats>> | null;
  readonly onSelectPlayer?: (
    player: DomainLineupPlayer,
    stats: DomainPlayerMatchStats | null,
    team: LineupBenchCardProps["team"],
    teamColor: string,
    textColor: string
  ) => void;
}

function getContrastTextColor(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length !== 6) return "#ffffff";
  const r = parseInt(c.slice(0, 2), 16),
    g = parseInt(c.slice(2, 4), 16),
    b = parseInt(c.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? "#18181b" : "#ffffff";
}

export function LineupBenchCard({
  team,
  substitutes,
  playerStats,
  onSelectPlayer,
}: LineupBenchCardProps) {
  const teamColor = getTeamPrimaryColor({
    teamExternalId: team.externalId,
    teamName: team.name,
    isSporting: team.isSporting,
  });
  const textColor = getContrastTextColor(teamColor);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <TeamCrest crestUrl={team.crestUrl} teamName={team.name} size="sm" isSporting={team.isSporting} />
          <span
            className={`text-xs truncate ${
              team.isSporting ? "font-bold text-[var(--primary)]" : "font-bold text-[var(--foreground)]"
            }`}
          >
            {team.name}
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
          Banquillo
        </span>
      </div>

      {substitutes.length > 0 ? (
        <ul className="divide-y divide-[var(--border)]/30">
          {substitutes.map((player) => {
            const stats = lookupPlayerStats(player, playerStats);
            return (
              <BenchRow
                key={player.id}
                player={player}
                isSporting={team.isSporting}
                teamColor={teamColor}
                textColor={textColor}
                stats={stats}
                onSelect={
                  onSelectPlayer
                    ? () => onSelectPlayer(player, stats, team, teamColor, textColor)
                    : undefined
                }
              />
            );
          })}
        </ul>
      ) : (
        <p className="text-[11px] text-[var(--foreground-muted)] py-3 text-center">
          Sin suplentes registrados
        </p>
      )}
    </div>
  );
}
