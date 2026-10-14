import type { DomainAdvancedStats } from "@/lib/sports-api/types";
import { getTeamPrimaryColor } from "@/lib/sports-api/team-colors";
import { ShotMapCanvas } from "./shot-map-canvas";
import { AttackingZonesPitch } from "./attacking-zones-pitch";

interface MatchAdvancedStatsProps {
  readonly advancedStats?: DomainAdvancedStats | null;
  readonly homeTeam: { readonly externalId: string; readonly name: string; readonly isSporting: boolean };
  readonly awayTeam: { readonly externalId: string; readonly name: string; readonly isSporting: boolean };
}

function StatBarRow({
  label,
  homeVal,
  awayVal,
  homeColor,
  awayColor,
}: {
  readonly label: string;
  readonly homeVal: number;
  readonly awayVal: number;
  readonly homeColor: string;
  readonly awayColor: string;
}) {
  const total = homeVal + awayVal;
  const hPct = total > 0 ? (homeVal / total) * 100 : 50;
  const aPct = total > 0 ? (awayVal / total) * 100 : 50;

  return (
    <div className="flex flex-col gap-1.5 py-2">
      <div className="flex items-center justify-between text-xs font-sans tabular-nums">
        <span className="font-bold text-[var(--foreground)]">{homeVal}</span>
        <span className="text-center text-[11px] font-medium text-[var(--foreground-muted)]">{label}</span>
        <span className="font-bold text-[var(--foreground)]">{awayVal}</span>
      </div>
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface)] border border-[var(--border)]/40">
        <div style={{ width: `${hPct}%`, backgroundColor: homeColor }} className="h-full transition-all duration-300" />
        <div style={{ width: `${aPct}%`, backgroundColor: awayColor }} className="h-full transition-all duration-300" />
      </div>
    </div>
  );
}

export function MatchAdvancedStats({ advancedStats, homeTeam, awayTeam }: MatchAdvancedStatsProps) {
  if (!advancedStats || (advancedStats.shots.length === 0 && !advancedStats.homeXg && !advancedStats.awayXg)) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center text-xs text-[var(--foreground-muted)] shadow-2xs">
        No se dispone de mapa de tiros ni métricas avanzadas para este encuentro.
      </div>
    );
  }

  const homeColor = getTeamPrimaryColor({
    teamExternalId: homeTeam.externalId,
    teamName: homeTeam.name,
    isSporting: homeTeam.isSporting,
  });
  const awayColor = getTeamPrimaryColor({
    teamExternalId: awayTeam.externalId,
    teamName: awayTeam.name,
    isSporting: awayTeam.isSporting,
  });

  const az = advancedStats.attackingZones;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Mapa interactivo de tiros */}
      {advancedStats.shots.length > 0 && (
        <ShotMapCanvas
          shots={advancedStats.shots}
          homeTeamName={homeTeam.name}
          awayTeamName={awayTeam.name}
        />
      )}

      {/* 2. Métricas avanzadas clave (xG, grandes ocasiones, toques en área) */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <h3 className="border-b border-[var(--border)] pb-2.5 text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
            Peligro y Goles Esperados
          </h3>
          <div className="mt-2 divide-y divide-[var(--border)]/40">
            <StatBarRow
              label="Expected Goals (xG)"
              homeVal={advancedStats.homeXg}
              awayVal={advancedStats.awayXg}
              homeColor={homeColor}
              awayColor={awayColor}
            />
            <StatBarRow
              label="Grandes Ocasiones"
              homeVal={advancedStats.homeBigChances}
              awayVal={advancedStats.awayBigChances}
              homeColor={homeColor}
              awayColor={awayColor}
            />
            <StatBarRow
              label="Grandes Ocasiones Falladas"
              homeVal={advancedStats.homeBigChancesMissed}
              awayVal={advancedStats.awayBigChancesMissed}
              homeColor={homeColor}
              awayColor={awayColor}
            />
            <StatBarRow
              label="Toques en Área Rival"
              homeVal={advancedStats.homeBoxTouches}
              awayVal={advancedStats.awayBoxTouches}
              homeColor={homeColor}
              awayColor={awayColor}
            />
          </div>
        </div>

        {/* 3. Duelos y Zonas de Ataque */}
        <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <h3 className="border-b border-[var(--border)] pb-2.5 text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
            Duelos y Zonas de Ataque
          </h3>
          <div className="mt-2 divide-y divide-[var(--border)]/40">
            <StatBarRow
              label="Duelos Ganados"
              homeVal={advancedStats.homeDuelsWon}
              awayVal={advancedStats.awayDuelsWon}
              homeColor={homeColor}
              awayColor={awayColor}
            />
            {az && (
              <AttackingZonesPitch
                homeTeamName={homeTeam.name}
                awayTeamName={awayTeam.name}
                homeColor={homeColor}
                awayColor={awayColor}
                homeZones={az.home}
                awayZones={az.away}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
