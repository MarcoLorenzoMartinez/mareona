import type { DomainMatchDetail, DomainMatchStatItem } from "@/lib/sports-api/types";
import { getTeamPrimaryColor } from "@/lib/sports-api/team-colors";
import { getDictionary } from "@/i18n";
import { ShotMapCanvas } from "./shot-map-canvas";
import { AttackingZonesPitch } from "./attacking-zones-pitch";
import { MatchMomentumChart } from "./match-momentum-chart";
import { StatBar } from "./stat-bar";

interface StatItem {
  readonly label: string;
  readonly homeVal: string | number;
  readonly awayVal: string | number;
  readonly homeNumeric?: number;
  readonly awayNumeric?: number;
}

interface StatGroupCard {
  readonly title: string;
  readonly stats: readonly StatItem[];
}

const toItem = (s: DomainMatchStatItem): StatItem => ({
  label: s.label, homeVal: s.homeValue, awayVal: s.awayValue,
  homeNumeric: s.homeNumeric, awayNumeric: s.awayNumeric,
});

export function MatchStatsPanel({ match }: { readonly match: DomainMatchDetail }) {
  const dict = getDictionary();
  const t = dict.season.matchDetail.stats;
  const adv = match.advancedStats;
  const hasStats = match.statGroups.length > 0 || Boolean(adv);

  if (!hasStats) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center shadow-2xs">
        <p className="text-sm font-medium text-[var(--foreground-muted)]">{match.status === "scheduled" ? t.pendingStats : t.noStats}</p>
      </div>
    );
  }

  const isHomeSporting = match.homeTeam.isSporting;
  const homeColor = getTeamPrimaryColor({ teamExternalId: match.homeTeam.externalId, teamName: match.homeTeam.name, isSporting: match.homeTeam.isSporting });
  const awayColor = getTeamPrimaryColor({ teamExternalId: match.awayTeam.externalId, teamName: match.awayTeam.name, isSporting: match.awayTeam.isSporting });

  const attackGrp = match.statGroups.find((g) => g.groupKey === "attack");
  const controlGrp = match.statGroups.find((g) => g.groupKey === "control");
  const defenseGrp = match.statGroups.find((g) => g.groupKey === "defense");
  const discGrp = match.statGroups.find((g) => g.groupKey === "discipline");

  // Grupos balanceados con títulos simples de 1 palabra y alturas uniformes
  const cards: StatGroupCard[] = adv
    ? [
        {
          title: "Remates",
          stats: [
            ...(attackGrp?.stats.filter((s) => s.key === "totalShots" || s.key === "shotsOnTarget").map(toItem) ?? []),
            ...(adv.homeShotsInsideBox !== undefined ? [{ label: "Tiros dentro del área", homeVal: adv.homeShotsInsideBox, awayVal: adv.awayShotsInsideBox ?? 0 }] : []),
            ...(adv.homeShotsOutsideBox !== undefined ? [{ label: "Tiros fuera del área", homeVal: adv.homeShotsOutsideBox, awayVal: adv.awayShotsOutsideBox ?? 0 }] : []),
            ...(attackGrp?.stats.filter((s) => s.key === "blockedShots" || s.key === "wonCorners").map(toItem) ?? []),
          ],
        },
        {
          title: "Ocasiones",
          stats: [
            { label: "Expected Goals (xG)", homeVal: adv.homeXg, awayVal: adv.awayXg },
            ...(adv.homeXgot !== undefined ? [{ label: "xG a Puerta (xGOT)", homeVal: adv.homeXgot, awayVal: adv.awayXgot ?? 0 }] : []),
            ...(adv.homeXgOpenPlay !== undefined ? [{ label: "xG en Juego Abierto", homeVal: adv.homeXgOpenPlay, awayVal: adv.awayXgOpenPlay ?? 0 }] : []),
            ...(adv.homeXgSetPlay !== undefined ? [{ label: "xG a Balón Parado", homeVal: adv.homeXgSetPlay, awayVal: adv.awayXgSetPlay ?? 0 }] : []),
            { label: "Grandes Ocasiones", homeVal: adv.homeBigChances, awayVal: adv.awayBigChances },
            { label: "Toques en Área Rival", homeVal: adv.homeBoxTouches, awayVal: adv.awayBoxTouches },
          ],
        },
        {
          title: "Posesión",
          stats: controlGrp?.stats.map(toItem) ?? [],
        },
        {
          title: "Defensa",
          stats: defenseGrp?.stats.filter((s) => s.key !== "tacklePct").map(toItem) ?? [],
        },
        {
          title: "Duelos",
          stats: [
            { label: "Duelos ganados", homeVal: adv.homeDuelsWon, awayVal: adv.awayDuelsWon },
            ...(adv.homeGroundDuelsWon !== undefined ? [{ label: "Duelos terrestres", homeVal: adv.homeGroundDuelsWon, awayVal: adv.awayGroundDuelsWon ?? 0 }] : []),
            ...(adv.homeAerialDuelsWon !== undefined ? [{ label: "Duelos aéreos", homeVal: adv.homeAerialDuelsWon, awayVal: adv.awayAerialDuelsWon ?? 0 }] : []),
            ...(adv.homeDribblesWon !== undefined ? [{ label: "Regates con éxito", homeVal: adv.homeDribblesWon, awayVal: adv.awayDribblesWon ?? 0 }] : []),
          ],
        },
        {
          title: "Disciplina",
          stats: discGrp?.stats.map(toItem) ?? [],
        },
      ]
    : match.statGroups.map((g) => ({ title: g.title, stats: g.stats.map(toItem) }));

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Mapa de Tiros y xG interactivo con porterías frontales sincronizadas */}
      {adv?.shots && adv.shots.length > 0 && (
        <ShotMapCanvas
          shots={adv.shots}
          homeTeamName={match.homeTeam.name}
          awayTeamName={match.awayTeam.name}
          rivalName={match.homeTeam.isSporting ? match.awayTeam.name : match.homeTeam.name}
        />
      )}

      {/* 2. Dinámica del Partido (Match Momentum) */}
      {adv?.momentum && adv.momentum.length > 0 && (
        <MatchMomentumChart
          momentum={adv.momentum}
          homeTeamName={match.homeTeam.name}
          awayTeamName={match.awayTeam.name}
          isHomeSporting={isHomeSporting}
          homeColor={homeColor}
          awayColor={awayColor}
        />
      )}

      {/* 3. Cuadrícula comparativa con alturas balanceadas y títulos de 1 palabra */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {cards.map((card) => (
          <div key={card.title} className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
            <h3 className="border-b border-[var(--border)] pb-2.5 text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
              {card.title}
            </h3>
            <div className="mt-2 divide-y divide-[var(--border)]/40">
              {card.stats.map((stat) => (
                <StatBar
                  key={stat.label}
                  label={stat.label}
                  homeVal={stat.homeVal}
                  awayVal={stat.awayVal}
                  homeNumeric={stat.homeNumeric}
                  awayNumeric={stat.awayNumeric}
                  homeColor={homeColor}
                  awayColor={awayColor}
                  isHomeSporting={isHomeSporting}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Zonas de Ataque */}
      {adv?.attackingZones && (
        <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <h3 className="border-b border-[var(--border)] pb-2.5 text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
            Zonas de Ataque
          </h3>
          <div className="mt-3">
            <AttackingZonesPitch
              homeTeamName={match.homeTeam.name}
              awayTeamName={match.awayTeam.name}
              homeColor={homeColor}
              awayColor={awayColor}
              homeZones={adv.attackingZones.home}
              awayZones={adv.attackingZones.away}
            />
          </div>
        </div>
      )}
    </div>
  );
}
