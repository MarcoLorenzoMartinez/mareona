"use client";
// Client: Redesigned interactive match player statistics modal with photo, key highlights and visual stat bars

import { useEffect } from "react";
import type { DomainPlayerMatchStats, DomainLineupPlayer } from "@/lib/sports-api/types";
import { PlayerModalHeader } from "./player-modal-header";
import { PlayerStatBar } from "./player-stat-bar";
import { PlayerImpactBanner } from "./player-impact-banner";

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

function StatCard({ title, children }: { readonly title: string; readonly children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 p-3 shadow-2xs">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-1.5">
        {title}
      </h4>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export function PlayerMatchStatsModal({
  player,
  stats,
  team,
  teamColor,
  textColor,
  onClose,
}: PlayerMatchStatsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isGk = stats?.isGoalkeeper ?? player.position === "goalkeeper";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-stats-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-6 shadow-2xl max-h-[88vh] overflow-y-auto flex flex-col gap-4">
        {/* Indicador de arrastre en móvil */}
        <div className="mx-auto h-1 w-10 rounded-full bg-neutral-300 sm:hidden" aria-hidden="true" />

        {/* 1. Cabecera Hero con foto, nombre, equipo y nota de partido */}
        <PlayerModalHeader
          player={player}
          stats={stats}
          team={team}
          teamColor={teamColor}
          textColor={textColor}
          onClose={onClose}
        />

        {/* 2. Cuerpo del modal: estadísticas o mensaje de aviso */}
        {!stats ? (
          <div className="py-10 text-center text-xs text-[var(--foreground-muted)]">
            No se dispone de desglose estadístico detallado para este jugador en este partido.
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {/* Banner de Impacto Rápido */}
            <PlayerImpactBanner stats={stats} isGk={isGk} />

            {/* Cuadrícula de métricas estructuradas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pases y Precisión */}
              <StatCard title="Pases y Toques">
                <PlayerStatBar label="Precisión de pases" successful={stats.accuratePasses} total={stats.totalPasses} />
                <PlayerStatBar label="Balones en largo" successful={stats.accurateLongBalls} total={stats.totalLongBalls} />
                <StatItem label="Pases último tercio" value={stats.passesFinalThird} />
                <StatItem label="Toques totales" value={stats.touches} />
                <StatItem label="Pérdidas de posesión" value={stats.dispossessed} />
              </StatCard>

              {/* Duelos y Físico */}
              <StatCard title="Duelos y Pugnas">
                <PlayerStatBar label="Duelos totales" successful={stats.duelsWon} total={stats.duelsWon + stats.duelsLost} />
                <PlayerStatBar label="Duelos en el suelo" successful={stats.groundDuelsWon} total={stats.totalGroundDuels} />
                <PlayerStatBar label="Duelos aéreos" successful={stats.aerialDuelsWon} total={stats.totalAerialDuels} />
                <StatItem label="Faltas recibidas / cometidas" value={`${stats.wasFouled} / ${stats.foulsCommitted}`} />
              </StatCard>

              {/* Defensa */}
              <StatCard title="Defensa y Recuperación">
                <StatItem label="Acciones defensivas" value={stats.defensiveActions} />
                <StatItem label="Entradas ganadas" value={stats.tacklesWon} />
                <StatItem label="Intercepciones" value={stats.interceptions} />
                <StatItem label="Recuperaciones" value={stats.recoveries} />
                <StatItem label="Despejes" value={stats.clearances} />
                <StatItem label="Tiros bloqueados" value={stats.blocks} />
              </StatCard>

              {/* Ataque / Portería extra */}
              {isGk ? (
                <StatCard title="Juego Aéreo y Portería">
                  <StatItem label="Salidas por alto" value={stats.highClaims ?? 0} />
                  <StatItem label="Despejes de puño" value={stats.punches ?? 0} />
                  <StatItem label="Goles encajados" value={stats.goalsConceded ?? 0} />
                </StatCard>
              ) : (
                <StatCard title="Peligro en Ataque">
                  <StatItem label="Calidad remate (xGOT)" value={stats.expectedGoalsOnTarget !== null ? stats.expectedGoalsOnTarget.toFixed(2) : "—"} />
                  <StatItem label="Toques en área rival" value={stats.touchesInBox} />
                  <StatItem label="Ocasiones creadas" value={stats.chancesCreated} />
                </StatCard>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
