import type {
  DomainMatchLineup,
  DomainLineupPlayer,
  DomainPlayerMatchStats,
} from "@/lib/sports-api/types";
import { TeamCrest } from "@/components/media/team-crest";
import { getTeamPrimaryColor } from "@/lib/sports-api/team-colors";

interface LineupTeamColumnProps {
  readonly lineup: DomainMatchLineup | null;
  readonly team: { readonly externalId?: string; readonly name: string; readonly crestUrl?: string | null; readonly isSporting: boolean };
  readonly playerStats?: Readonly<Record<string, DomainPlayerMatchStats>> | null;
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

function PlayerRow({
  player, isSporting, teamColor, textColor, isBench = false, stats, onSelect,
}: {
  readonly player: DomainLineupPlayer; readonly isSporting: boolean;
  readonly teamColor: string; readonly textColor: string; readonly isBench?: boolean;
  readonly stats: DomainPlayerMatchStats | null; readonly onSelect?: () => void;
}) {
  return (
    <li className="list-none">
      <button
        type="button"
        onClick={onSelect}
        className={`w-full flex items-center justify-between text-left transition-colors rounded-lg px-2 hover:bg-[var(--surface)] active:bg-neutral-100 cursor-pointer min-h-[44px] ${
          isBench ? "py-1 text-[11px]" : "py-1.5 text-xs"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`flex shrink-0 items-center justify-center rounded-full tabular-nums font-bold ${
              isBench
                ? "h-5 w-5 text-[10px] opacity-80"
                : "h-6 w-6 text-[11px] shadow-2xs"
            }`}
            style={{ backgroundColor: teamColor, color: textColor }}
          >
            {player.jersey ?? "-"}
          </span>
          <span
            className={`truncate ${
              isBench
                ? "font-normal text-[var(--foreground-muted)]"
                : isSporting
                ? "font-semibold text-[var(--foreground)]"
                : "font-medium text-[var(--foreground)]"
            }`}
          >
            {player.name}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {player.subbedOut && !isBench && (
            <span className="text-[12px] font-bold text-amber-600" title="Sustituido">↓</span>
          )}
          {player.subbedIn && isBench && (
            <span className="text-[12px] font-bold text-emerald-600" title="Entró">↑</span>
          )}
          {stats?.rating ? (
            <span className="rounded px-1.5 py-0.5 text-[10px] font-bold font-sans tabular-nums text-white bg-neutral-800 shadow-2xs">
              {stats.rating.toFixed(1)}
            </span>
          ) : null}
        </div>
      </button>
    </li>
  );
}

export function LineupTeamColumn({ lineup, team, playerStats, onSelectPlayer }: LineupTeamColumnProps) {
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

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Tarjeta principal: Once Titular */}
      <div className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center gap-2.5 border-b border-[var(--border)] pb-3 mb-2 min-w-0">
          <TeamCrest crestUrl={team.crestUrl} teamName={team.name} size="sm" isSporting={team.isSporting} />
          <span
            className={`text-sm truncate ${
              team.isSporting ? "font-bold text-[var(--primary)]" : "font-bold text-[var(--foreground)]"
            }`}
          >
            {team.name}
          </span>
        </div>

        <ol className="divide-y divide-[var(--border)]/40">
          {lineup.starters.map((player) => {
            const stats = lookupPlayerStats(player, playerStats);
            return (
              <PlayerRow
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
        </ol>
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
                <PlayerRow
                  key={player.id}
                  player={player}
                  isSporting={team.isSporting}
                  teamColor={teamColor}
                  textColor={textColor}
                  isBench={true}
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
