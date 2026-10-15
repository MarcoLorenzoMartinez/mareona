"use client";
// Client: Interactive match player statistics modal with keyboard navigation

import { useEffect } from "react";
import type { DomainPlayerMatchStats, DomainLineupPlayer } from "@/lib/sports-api/types";
import { TeamCrest } from "@/components/media/team-crest";

interface PlayerMatchStatsModalProps {
  readonly player: DomainLineupPlayer;
  readonly stats: DomainPlayerMatchStats | null;
  readonly team: { readonly name: string; readonly crestUrl?: string | null; readonly isSporting: boolean };
  readonly teamColor: string;
  readonly textColor: string;
  readonly onClose: () => void;
}

function StatItem({ label, value }: { readonly label: string; readonly value: string | number }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-[var(--border)] last:border-b-0 text-xs">
      <span className="text-[var(--foreground-muted)]">{label}</span>
      <span className="font-semibold font-sans tabular-nums text-[var(--foreground)]">{value}</span>
    </div>
  );
}

function StatGroupCard({ title, children }: { readonly title: string; readonly children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-3 shadow-2xs">
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-1.5">
        {title}
      </h4>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function RatingBadge({ rating }: { readonly rating: number | null }) {
  if (rating === null) return null;
  const ratingColor = rating >= 7.5 ? "bg-emerald-600" : rating >= 6.5 ? "bg-emerald-700" : "bg-neutral-800";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-bold font-sans tabular-nums text-white shadow-2xs ${ratingColor}`}
      title="Calificación del partido"
    >
      {rating.toFixed(1)}
    </span>
  );
}

export function PlayerMatchStatsModal({
  player, stats, team, teamColor, textColor, onClose,
}: PlayerMatchStatsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const hasStats = Boolean(stats);
  const isGk = stats?.isGoalkeeper ?? player.position === "goalkeeper";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-stats-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6 shadow-xl max-h-[85vh] overflow-y-auto flex flex-col gap-4">
        {/* Mobile handle indicator */}
        <div className="mx-auto h-1 w-10 rounded-full bg-neutral-300 sm:hidden" aria-hidden="true" />

        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold font-sans tabular-nums shadow-2xs"
              style={{ backgroundColor: teamColor, color: textColor }}
            >
              {player.jersey ?? "-"}
            </span>
            <div className="min-w-0">
              <h3 id="player-stats-modal-title" className="text-base font-bold text-[var(--foreground)] truncate">
                {player.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
                <TeamCrest crestUrl={team.crestUrl} teamName={team.name} size="sm" />
                <span>{player.positionLabel}</span>
                {stats?.minutesPlayed ? <span>· {stats.minutesPlayed}&apos;</span> : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {stats && <RatingBadge rating={stats.rating} />}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar ficha de jugador"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--surface)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {!stats ? (
          <div className="py-8 text-center text-xs text-[var(--foreground-muted)]">
            No se dispone de estadísticas detalladas para este jugador en este partido.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isGk ? (
              <StatGroupCard title="Portería">
                <StatItem label="Paradas" value={stats.saves ?? 0} />
                <StatItem label="Paradas en área" value={stats.savesInsideBox ?? 0} />
                <StatItem label="Goles encajados" value={stats.goalsConceded ?? 0} />
                <StatItem label="Goles evitados" value={stats.goalsPrevented !== null && stats.goalsPrevented !== undefined ? (stats.goalsPrevented > 0 ? `+${stats.goalsPrevented}` : String(stats.goalsPrevented)) : "—"} />
                <StatItem label="Salidas por alto" value={stats.highClaims ?? 0} />
                <StatItem label="Despejes de puño" value={stats.punches ?? 0} />
              </StatGroupCard>
            ) : (
              <StatGroupCard title="Ataque">
                <StatItem label="Goles / Asistencias" value={`${stats.goals} / ${stats.assists}`} />
                <StatItem label="xG (Goles esperados)" value={stats.expectedGoals !== null ? stats.expectedGoals.toFixed(2) : "—"} />
                <StatItem label="xGOT (Calidad remate)" value={stats.expectedGoalsOnTarget !== null ? stats.expectedGoalsOnTarget.toFixed(2) : "—"} />
                <StatItem label="Ocasiones creadas" value={stats.chancesCreated} />
                <StatItem label="Tiros (a puerta)" value={`${stats.shotsOnTarget} / ${stats.totalShots}`} />
                <StatItem label="Toques en área rival" value={stats.touchesInBox} />
              </StatGroupCard>
            )}

            <StatGroupCard title="Pase y Toques">
              <StatItem
                label="Pases precisos"
                value={`${stats.accuratePasses}/${stats.totalPasses} (${stats.totalPasses > 0 ? Math.round((stats.accuratePasses / stats.totalPasses) * 100) : 0}%)`}
              />
              <StatItem
                label="Pases largos"
                value={`${stats.accurateLongBalls}/${stats.totalLongBalls}`}
              />
              <StatItem label="Pases último tercio" value={stats.passesFinalThird} />
              <StatItem label="Toques totales" value={stats.touches} />
              <StatItem label="Pérdidas de balón" value={stats.dispossessed} />
            </StatGroupCard>

            <StatGroupCard title="Defensa">
              <StatItem label="Acciones defensivas" value={stats.defensiveActions} />
              <StatItem label="Entradas realizadas" value={stats.tacklesWon} />
              <StatItem label="Intercepciones" value={stats.interceptions} />
              <StatItem label="Recuperaciones" value={stats.recoveries} />
              <StatItem label="Despejes" value={stats.clearances} />
              <StatItem label="Tiros bloqueados" value={stats.blocks} />
            </StatGroupCard>

            <StatGroupCard title="Duelos">
              <StatItem label="Duelos en suelo" value={`${stats.groundDuelsWon}/${stats.totalGroundDuels} (${stats.totalGroundDuels > 0 ? Math.round((stats.groundDuelsWon / stats.totalGroundDuels) * 100) : 0}%)`} />
              <StatItem label="Duelos aéreos" value={`${stats.aerialDuelsWon}/${stats.totalAerialDuels} (${stats.totalAerialDuels > 0 ? Math.round((stats.aerialDuelsWon / stats.totalAerialDuels) * 100) : 0}%)`} />
              <StatItem label="Duelos totales" value={`${stats.duelsWon} ganados / ${stats.duelsLost} perdidos`} />
              <StatItem label="Faltas recibidas" value={stats.wasFouled} />
              <StatItem label="Faltas cometidas" value={stats.foulsCommitted} />
            </StatGroupCard>
          </div>
        )}
      </div>
    </div>
  );
}
