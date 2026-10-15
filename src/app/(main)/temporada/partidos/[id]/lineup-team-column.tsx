import type {
  DomainMatchLineup,
  DomainLineupPlayer,
  DomainPlayerMatchStats,
  DomainTacticalLineup,
} from "@/lib/sports-api/types";
import { TeamCrest } from "@/components/media/team-crest";
import { getTeamPrimaryColor } from "@/lib/sports-api/team-colors";
import { TacticalPlayerCard } from "./tactical-player-card";
import { TacticalPitchBoard } from "./tactical-pitch-board";
import { BenchRow } from "./bench-row";

interface LineupTeamColumnProps {
  readonly lineup: DomainMatchLineup | null;
  readonly team: { readonly externalId?: string; readonly name: string; readonly crestUrl?: string | null; readonly isSporting: boolean };
  readonly playerStats?: Readonly<Record<string, DomainPlayerMatchStats>> | null;
  readonly tacticalLineup?: DomainTacticalLineup | null;
  readonly onSelectPlayer?: (
    player: DomainLineupPlayer, stats: DomainPlayerMatchStats | null,
    team: LineupTeamColumnProps["team"], teamColor: string, textColor: string
  ) => void;
}

function getContrastTextColor(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length !== 6) return "#ffffff";
  const r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? "#18181b" : "#ffffff";
}

function lookupPlayerStats(
  player: DomainLineupPlayer,
  stats?: Readonly<Record<string, DomainPlayerMatchStats>> | null
): DomainPlayerMatchStats | null {
  if (!stats) return null;
  return stats[player.name.toLowerCase()] ?? (player.jersey ? stats[`jersey_${player.jersey}`] : null) ?? null;
}

function groupStartersByLine(starters: readonly DomainLineupPlayer[]) {
  const gks = starters.filter((p) => p.position === "goalkeeper");
  const defs = starters.filter((p) => p.position === "defender");
  const mids = starters.filter((p) => p.position === "midfielder");
  const fwds = starters.filter((p) => p.position === "forward");
  const others = starters.filter((p) => !["goalkeeper", "defender", "midfielder", "forward"].includes(p.position));

  const allMids = [...mids, ...others];
  const lines: Array<{ readonly key: string; readonly label: string; readonly players: readonly DomainLineupPlayer[] }> = [];
  if (gks.length > 0) lines.push({ key: "gk", label: "Portería", players: gks });
  if (defs.length > 0) lines.push({ key: "def", label: "Defensa", players: defs });
  if (allMids.length > 0) lines.push({ key: "mid", label: "Mediocampo", players: allMids });
  if (fwds.length > 0) lines.push({ key: "fwd", label: "Delantera", players: fwds });

  return lines;
}

export function LineupTeamColumn({ lineup, team, playerStats, tacticalLineup, onSelectPlayer }: LineupTeamColumnProps) {
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
  const activeFormation = tacticalLineup?.formation || lineup.formation;

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Tarjeta principal: Once Titular con formación táctica */}
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
          {activeFormation && (
            <span className="rounded-full bg-[var(--surface)] px-2.5 py-0.5 text-[10px] font-bold font-sans tabular-nums text-[var(--foreground-muted)] border border-[var(--border)]">
              {activeFormation}
            </span>
          )}
        </div>

        {/* Campo táctico realista de FotMob con coordenadas reales */}
        {tacticalLineup?.starters && tacticalLineup.starters.length > 0 ? (
          <TacticalPitchBoard
            starters={tacticalLineup.starters}
            teamColor={teamColor}
            textColor={textColor}
            isSporting={team.isSporting}
            domainStarters={lineup.starters}
            playerStats={playerStats}
            onSelectPlayer={(p, s) => onSelectPlayer?.(p, s, team, teamColor, textColor)}
          />
        ) : (
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
                      onSelect={onSelectPlayer ? () => onSelectPlayer(player, stats, team, teamColor, textColor) : undefined}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Tarjeta secundaria: Banquillo */}
      <div className="rounded-xl border border-[var(--border)]/60 bg-white/70 p-4 shadow-2xs">
        <div className="border-b border-[var(--border)]/40 pb-2 mb-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
            Banquillo
          </h4>
        </div>

        {lineup.substitutes.length > 0 ? (
          <ul className="divide-y divide-[var(--border)]/30">
            {lineup.substitutes.map((player) => {
              const stats = lookupPlayerStats(player, playerStats);
              return (
                <BenchRow
                  key={player.id}
                  player={player}
                  isSporting={team.isSporting}
                  teamColor={teamColor}
                  textColor={textColor}
                  stats={stats}
                  onSelect={onSelectPlayer ? () => onSelectPlayer(player, stats, team, teamColor, textColor) : undefined}
                />
              );
            })}
          </ul>
        ) : (
          <p className="text-[11px] text-[var(--foreground-muted)] py-2 text-center">Sin suplentes registrados</p>
        )}
      </div>
    </div>
  );
}
