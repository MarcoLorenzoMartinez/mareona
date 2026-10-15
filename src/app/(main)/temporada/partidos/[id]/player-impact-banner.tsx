import type { DomainPlayerMatchStats } from "@/lib/sports-api/types";

interface PlayerImpactBannerProps {
  readonly stats: DomainPlayerMatchStats;
  readonly isGk: boolean;
}

export function PlayerImpactBanner({ stats, isGk }: PlayerImpactBannerProps) {
  if (isGk) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-lg border border-[var(--border)] bg-neutral-50/70 p-2.5 text-center">
          <span className="text-[10px] text-[var(--foreground-muted)] block font-medium">Paradas</span>
          <span className="text-base sm:text-lg font-bold font-sans tabular-nums text-[var(--foreground)]">{stats.saves ?? 0}</span>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-neutral-50/70 p-2.5 text-center">
          <span className="text-[10px] text-[var(--foreground-muted)] block font-medium">En área</span>
          <span className="text-base sm:text-lg font-bold font-sans tabular-nums text-[var(--foreground)]">{stats.savesInsideBox ?? 0}</span>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-neutral-50/70 p-2.5 text-center">
          <span className="text-[10px] text-[var(--foreground-muted)] block font-medium">Goles evitados</span>
          <span className="text-base sm:text-lg font-bold font-sans tabular-nums text-[var(--foreground)]">
            {stats.goalsPrevented !== null && stats.goalsPrevented !== undefined
              ? (stats.goalsPrevented > 0 ? `+${stats.goalsPrevented.toFixed(2)}` : stats.goalsPrevented.toFixed(2))
              : "—"}
          </span>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-neutral-50/70 p-2.5 text-center">
          <span className="text-[10px] text-[var(--foreground-muted)] block font-medium">Encajados</span>
          <span className="text-base sm:text-lg font-bold font-sans tabular-nums text-[var(--foreground)]">{stats.goalsConceded ?? 0}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div className="rounded-lg border border-[var(--border)] bg-neutral-50/70 p-2.5 text-center">
        <span className="text-[10px] text-[var(--foreground-muted)] block font-medium">Goles / Asist.</span>
        <span className="text-base sm:text-lg font-bold font-sans tabular-nums text-[var(--foreground)]">
          {stats.goals} <span className="text-xs font-normal text-[var(--foreground-muted)]">/</span> {stats.assists}
        </span>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-neutral-50/70 p-2.5 text-center">
        <span className="text-[10px] text-[var(--foreground-muted)] block font-medium">xG (Esperado)</span>
        <span className="text-base sm:text-lg font-bold font-sans tabular-nums text-[var(--foreground)]">
          {stats.expectedGoals !== null ? stats.expectedGoals.toFixed(2) : "0.00"}
        </span>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-neutral-50/70 p-2.5 text-center">
        <span className="text-[10px] text-[var(--foreground-muted)] block font-medium">Tiros (Puerta)</span>
        <span className="text-base sm:text-lg font-bold font-sans tabular-nums text-[var(--foreground)]">
          {stats.shotsOnTarget} <span className="text-xs font-normal text-[var(--foreground-muted)]">/</span> {stats.totalShots}
        </span>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-neutral-50/70 p-2.5 text-center">
        <span className="text-[10px] text-[var(--foreground-muted)] block font-medium">Ocasiones</span>
        <span className="text-base sm:text-lg font-bold font-sans tabular-nums text-[var(--foreground)]">
          {stats.chancesCreated}
        </span>
      </div>
    </div>
  );
}
