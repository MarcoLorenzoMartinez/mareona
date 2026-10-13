// Client: Maneja la selección interactiva de vista (Tabla / Distancia Real / Evolución) y ámbito (General / En Casa / A Domicilio)
"use client";

import { useState, useMemo } from "react";
import { TeamCrest } from "@/components/media/team-crest";
import {
  getSortedStandings,
  type DomainStandingRow,
  type StandingsViewScope,
  type MatchdayEvolutionPoint,
} from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { RealDistanceView } from "./real-distance-view";
import { EvolutionChart, type DisplayMode } from "./evolution-chart";

export type ClassificationViewMode = "table" | "distance" | "evolution";

interface StandingsViewProps {
  readonly initialStandings: readonly DomainStandingRow[];
  readonly seasonLabel: string;
  readonly evolution?: readonly MatchdayEvolutionPoint[];
}

/**
 * Interactive full standings view component with instant home/away filtering,
 * responsive scaling, view mode toggling (Table / Real Distance / Evolution),
 * and WCAG 2.2 AA compliant tabular indicators.
 */
export function StandingsView({
  initialStandings,
  seasonLabel,
  evolution = [],
}: StandingsViewProps) {
  const dict = getDictionary();
  const t = dict.season.standings;

  const [mode, setMode] = useState<ClassificationViewMode>("table");
  const [scope, setScope] = useState<StandingsViewScope>("total");
  const [evolutionMode, setEvolutionMode] = useState<DisplayMode>("both");

  const viewModeOptions: readonly { readonly id: ClassificationViewMode; readonly label: string }[] = useMemo(
    () => [
      { id: "table", label: t.views.table },
      { id: "distance", label: t.views.distance },
      { id: "evolution", label: t.views.evolution },
    ],
    [t.views]
  );

  const scopeOptions: readonly { readonly id: StandingsViewScope; readonly label: string }[] = useMemo(
    () => [
      { id: "total", label: t.scopes.total },
      { id: "home", label: t.scopes.home },
      { id: "away", label: t.scopes.away },
    ],
    [t.scopes]
  );

  const evolutionModeOptions: readonly { readonly id: DisplayMode; readonly label: string }[] = useMemo(
    () => [
      { id: "both", label: t.evolution.metrics.both },
      { id: "points", label: t.evolution.metrics.points },
      { id: "position", label: t.evolution.metrics.position },
    ],
    [t.evolution.metrics]
  );

  // Recalculates position ranks and sorts instantly upon scope change
  const currentStandings = useMemo(() => {
    return getSortedStandings(initialStandings, scope);
  }, [initialStandings, scope]);

  if (initialStandings.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center shadow-2xs">
        <p className="text-sm text-[var(--foreground-muted)]">{t.noData}</p>
      </div>
    );
  }

  const activeScopeLabel =
    scopeOptions.find((o) => o.id === scope)?.label ?? t.scopes.total;

  return (
    <div className="flex flex-col gap-5">
      {/* Encabezado semántico para lectores de pantalla (WCAG 2.2 AA) */}
      <h1 className="sr-only">
        {t.title} — {dict.season.competitionName} {seasonLabel}
      </h1>

      {/* Barra de Controles Superior: Vista (izquierda) y Filtro contextual redondeado y rojo (derecha) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Selector de Modo Principal: Tabla / Distancia Real / Evolución */}
        <div
          role="radiogroup"
          aria-label="Tipo de visualización"
          className="inline-flex self-start rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 sm:self-auto"
        >
          {viewModeOptions.map((opt) => {
            const isSelected = mode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setMode(opt.id)}
                className={`inline-flex min-h-[34px] items-center justify-center rounded-full px-3.5 py-1 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] ${
                  isSelected
                    ? "bg-white text-[var(--foreground)] shadow-xs font-bold"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Selector Secundario (derecha): Estilo más redondeado y rojo */}
        {mode === "evolution" ? (
          <div
            role="radiogroup"
            aria-label="Series de evolución"
            className="inline-flex self-start rounded-full border border-red-200 bg-red-50/50 p-1 sm:self-auto"
          >
            {evolutionModeOptions.map((opt) => {
              const isSelected = evolutionMode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setEvolutionMode(opt.id)}
                  className={`inline-flex min-h-[34px] items-center justify-center rounded-full px-3.5 py-1 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] ${
                    isSelected
                      ? "bg-[var(--primary)] text-white shadow-xs font-bold"
                      : "text-neutral-700 hover:text-[var(--primary)] hover:bg-red-100/50"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div
            role="radiogroup"
            aria-label="Filtro de ámbito"
            className="inline-flex self-start rounded-full border border-red-200 bg-red-50/50 p-1 sm:self-auto"
          >
            {scopeOptions.map((opt) => {
              const isSelected = scope === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setScope(opt.id)}
                  className={`inline-flex min-h-[34px] items-center justify-center rounded-full px-3.5 py-1 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] ${
                    isSelected
                      ? "bg-[var(--primary)] text-white shadow-xs font-bold"
                      : "text-neutral-700 hover:text-[var(--primary)] hover:bg-red-100/50"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Renderizado de vista condicional según el modo seleccionado */}
      {mode === "evolution" ? (
        <EvolutionChart evolution={evolution} mode={evolutionMode} />
      ) : mode === "distance" ? (
        <RealDistanceView standings={currentStandings} />
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs sm:p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                {t.title} {seasonLabel} ({activeScopeLabel})
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs font-semibold text-[var(--foreground-muted)] uppercase">
                  <th scope="col" className="w-10 sm:w-12 py-2.5 pl-3 text-center">
                    {t.columns.pos}
                  </th>
                  <th scope="col" className="py-2.5 pr-2">
                    {t.columns.team}
                  </th>
                  <th scope="col" className="w-10 sm:w-12 py-2.5 text-center" title={t.columnTitles.played}>
                    {t.columns.played}
                  </th>
                  <th scope="col" className="hidden sm:table-cell w-10 sm:w-12 py-2.5 text-center" title={t.columnTitles.won}>
                    {t.columns.won}
                  </th>
                  <th scope="col" className="hidden sm:table-cell w-10 sm:w-12 py-2.5 text-center" title={t.columnTitles.drawn}>
                    {t.columns.drawn}
                  </th>
                  <th scope="col" className="hidden sm:table-cell w-10 sm:w-12 py-2.5 text-center" title={t.columnTitles.lost}>
                    {t.columns.lost}
                  </th>
                  <th scope="col" className="hidden md:table-cell w-10 sm:w-12 py-2.5 text-center" title={t.columnTitles.goalsFor}>
                    {t.columns.goalsFor}
                  </th>
                  <th scope="col" className="hidden md:table-cell w-10 sm:w-12 py-2.5 text-center" title={t.columnTitles.goalsAgainst}>
                    {t.columns.goalsAgainst}
                  </th>
                  <th scope="col" className="w-12 sm:w-14 py-2.5 text-center" title={t.columnTitles.goalDifference}>
                    {t.columns.goalDifference}
                  </th>
                  <th scope="col" className="w-12 sm:w-14 py-2.5 pr-3 text-right" title={t.columnTitles.points}>
                    {t.columns.points}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {currentStandings.map((row) => {
                  const isDirectPromotion = scope === "total" && row.position <= 2;
                  const isPlayoff = scope === "total" && row.position >= 3 && row.position <= 6;
                  const isRelegation =
                    scope === "total" && currentStandings.length > 4
                      ? row.position > currentStandings.length - 4
                      : false;
                  const goalDiff = row.goalsFor - row.goalsAgainst;

                  return (
                    <tr
                      key={row.teamExternalId}
                      className={`transition-colors text-sm ${
                        row.isSporting
                          ? "bg-red-50/70 font-semibold text-[var(--foreground)]"
                          : "hover:bg-[var(--surface)] text-[var(--foreground)]"
                      }`}
                    >
                      {/* Posición */}
                      <td className="py-2.5 pl-3 text-center">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-sm text-xs font-bold ${
                            isDirectPromotion
                              ? "bg-neutral-800 text-white"
                              : isPlayoff
                                ? "bg-neutral-200 text-neutral-800"
                                : isRelegation
                                  ? "bg-red-700 text-white"
                                  : "text-[var(--foreground-muted)]"
                          }`}
                          aria-label={`Posición ${row.position}${
                            isDirectPromotion
                              ? `, ${t.zones.promotion}`
                              : isPlayoff
                                ? `, ${t.zones.playoff}`
                                : isRelegation
                                  ? `, ${t.zones.relegation}`
                                  : ""
                          }`}
                        >
                          {row.position}
                        </span>
                      </td>

                      {/* Equipo */}
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <TeamCrest
                            crestUrl={row.crestUrl}
                            teamName={row.teamName}
                            size="sm"
                            isSporting={row.isSporting}
                          />
                          <span
                            className={`truncate ${
                              row.isSporting ? "font-bold text-[var(--primary)]" : "font-medium"
                            }`}
                          >
                            {row.teamName}
                          </span>
                        </div>
                      </td>

                      {/* PJ */}
                      <td className="py-2.5 text-center tabular-nums text-[var(--foreground-muted)]">
                        {row.played}
                      </td>

                      {/* PG */}
                      <td className="hidden sm:table-cell py-2.5 text-center tabular-nums text-[var(--foreground-muted)]">
                        {row.won}
                      </td>

                      {/* PE */}
                      <td className="hidden sm:table-cell py-2.5 text-center tabular-nums text-[var(--foreground-muted)]">
                        {row.drawn}
                      </td>

                      {/* PP */}
                      <td className="hidden sm:table-cell py-2.5 text-center tabular-nums text-[var(--foreground-muted)]">
                        {row.lost}
                      </td>

                      {/* GF */}
                      <td className="hidden md:table-cell py-2.5 text-center tabular-nums text-[var(--foreground-muted)]">
                        {row.goalsFor}
                      </td>

                      {/* GC */}
                      <td className="hidden md:table-cell py-2.5 text-center tabular-nums text-[var(--foreground-muted)]">
                        {row.goalsAgainst}
                      </td>

                      {/* DG */}
                      <td className="py-2.5 text-center tabular-nums text-xs sm:text-sm font-medium">
                        <span
                          className={
                            goalDiff > 0
                              ? "text-emerald-700 font-semibold"
                              : goalDiff < 0
                              ? "text-red-700"
                              : "text-[var(--foreground-muted)]"
                          }
                        >
                          {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                        </span>
                      </td>

                      {/* Pts */}
                      <td className="py-2.5 pr-3 text-right font-black tabular-nums text-[var(--foreground)]">
                        {row.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Leyenda de Posiciones (activa en ámbito General) */}
          {scope === "total" && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3 text-[11px] text-[var(--foreground-muted)]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs bg-neutral-800" aria-hidden="true" />
                  {t.zones.promotion}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs bg-neutral-300" aria-hidden="true" />
                  {t.zones.playoff}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs bg-red-700" aria-hidden="true" />
                  {t.zones.relegation}
                </span>
              </div>
              <span>{t.subtitle}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
