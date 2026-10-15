import type {
  DomainMatchLineup,
  DomainLineupPlayer,
  DomainPlayerMatchStats,
} from "@/lib/sports-api/types";
import { TeamCrest } from "@/components/media/team-crest";
import { getTeamPrimaryColor } from "@/lib/sports-api/team-colors";
import { TacticalPlayerCard } from "./tactical-player-card";
import { LineupBenchCard } from "./lineup-bench-card";
import { lookupPlayerStats } from "@/lib/sports-api/player-stats-matcher";

interface LineupTeamColumnProps {
  readonly lineup: DomainMatchLineup | null;
  readonly team: {
    readonly externalId?: string;
    readonly name: string;
    readonly crestUrl?: string | null;
    readonly isSporting: boolean;
  };
  readonly playerStats?: Readonly<Record<string, DomainPlayerMatchStats>> | null;
  readonly onSelectPlayer?: (
    player: DomainLineupPlayer,
    stats: DomainPlayerMatchStats | null,
    team: LineupTeamColumnProps["team"],
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

function groupStartersByLine(starters: readonly DomainLineupPlayer[]) {
  const gks = starters.filter((p) => p.position === "goalkeeper");
  const defs = starters.filter((p) => p.position === "defender");
  const mids = starters.filter((p) => p.position === "midfielder");
  const fwds = starters.filter((p) => p.position === "forward");
  const others = starters.filter(
    (p) => !["goalkeeper", "defender", "midfielder", "forward"].includes(p.position)
  );

  const allMids = [...mids, ...others];
  const lines: Array<{
    readonly key: string;
    readonly label: string;
    readonly players: readonly DomainLineupPlayer[];
  }> = [];
  if (gks.length > 0) lines.push({ key: "gk", label: "Portería", players: gks });
  if (defs.length > 0) lines.push({ key: "def", label: "Defensa", players: defs });
  if (allMids.length > 0) lines.push({ key: "mid", label: "Mediocampo", players: allMids });
  if (fwds.length > 0) lines.push({ key: "fwd", label: "Delantera", players: fwds });

  return lines;
}

export function LineupTeamColumn({
  lineup,
  team,
  playerStats,
  onSelectPlayer,
}: LineupTeamColumnProps) {
  const teamColor = getTeamPrimaryColor({
    teamExternalId: team.externalId,
    teamName: team.name,
    isSporting: team.isSporting,
  });
  const textColor = getContrastTextColor(teamColor);

  if (!lineup) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 text-center shadow-2xs">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <TeamCrest crestUrl={team.crestUrl} teamName={team.name} size="sm" isSporting={team.isSporting} />
          <span className="font-bold text-sm text-[var(--foreground)]">{team.name}</span>
        </div>
        <p className="text-xs text-[var(--foreground-muted)]">Alineación no disponible aún</p>
      </div>
    );
  }

  const lines = groupStartersByLine(lineup.starters);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <TeamCrest crestUrl={team.crestUrl} teamName={team.name} size="sm" isSporting={team.isSporting} />
            <span
              className={`text-sm truncate ${
                team.isSporting ? "font-bold text-[var(--primary)]" : "font-bold text-[var(--foreground)]"
              }`}
            >
              {team.name}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 rounded-xl bg-neutral-50/70 p-3 sm:p-4 border border-[var(--border)]/70">
          {lines.map((line) => (
            <div key={line.key} className="flex flex-wrap items-start justify-center gap-2 sm:gap-4">
              {line.players.map((player) => {
                const stats = lookupPlayerStats(player, playerStats);
                return (
                  <TacticalPlayerCard
                    key={player.id}
                    player={player}
                    teamColor={teamColor}
                    textColor={textColor}
                    stats={stats}
                    isSporting={team.isSporting}
                    onSelect={
                      onSelectPlayer
                        ? () => onSelectPlayer(player, stats, team, teamColor, textColor)
                        : undefined
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <LineupBenchCard
        team={team}
        substitutes={lineup.substitutes}
        playerStats={playerStats}
        onSelectPlayer={onSelectPlayer}
      />
    </div>
  );
}
