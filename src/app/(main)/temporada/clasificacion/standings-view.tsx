// Client: Maneja la selección interactiva de vista (Tabla / Distancia Real / Evolución) y ámbito (General / En Casa / A Domicilio)
"use client";

import { useState, useMemo } from "react";
import {
  getSortedStandings,
  type DomainStandingRow,
  type StandingsViewScope,
  type MatchdayEvolutionPoint,
} from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { RealDistanceView } from "./real-distance-view";
import { EvolutionChart, type DisplayMode } from "./evolution-chart";
import { StandingsTable } from "./standings-table";
import { StandingsViewControls } from "./standings-view-controls";

export type ClassificationViewMode = "table" | "distance" | "evolution";

interface StandingsViewProps {
  readonly initialStandings: readonly DomainStandingRow[];
  readonly seasonLabel: string;
  readonly evolution?: readonly MatchdayEvolutionPoint[];
}

/**
 * Interactive full standings view coordinator with home/away filtering,
 * view mode switching (Table / Real Distance / Evolution), and WCAG 2.2 AA compliance.
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

  const viewModeOptions = useMemo(
    () => [
      { id: "table" as const, label: t.views.table },
      { id: "distance" as const, label: t.views.distance },
      { id: "evolution" as const, label: t.views.evolution },
    ],
    [t.views]
  );

  const scopeOptions = useMemo(
    () => [
      { id: "total" as const, label: t.scopes.total },
      { id: "home" as const, label: t.scopes.home },
      { id: "away" as const, label: t.scopes.away },
    ],
    [t.scopes]
  );

  const evolutionModeOptions = useMemo(
    () => [
      { id: "both" as const, label: t.evolution.metrics.both },
      { id: "points" as const, label: t.evolution.metrics.points },
      { id: "position" as const, label: t.evolution.metrics.position },
    ],
    [t.evolution.metrics]
  );

  const currentStandings = useMemo(
    () => getSortedStandings(initialStandings, scope),
    [initialStandings, scope]
  );

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
      <h1 className="sr-only">
        {t.title} — {dict.season.competitionName} {seasonLabel}
      </h1>

      <StandingsViewControls
        mode={mode}
        onSelectMode={setMode}
        viewModeOptions={viewModeOptions}
        scope={scope}
        onSelectScope={setScope}
        scopeOptions={scopeOptions}
        evolutionMode={evolutionMode}
        onSelectEvolutionMode={setEvolutionMode}
        evolutionModeOptions={evolutionModeOptions}
      />

      {mode === "evolution" ? (
        <EvolutionChart evolution={evolution} mode={evolutionMode} />
      ) : mode === "distance" ? (
        <RealDistanceView standings={currentStandings} />
      ) : (
        <StandingsTable
          standings={currentStandings}
          scope={scope}
          seasonLabel={seasonLabel}
          activeScopeLabel={activeScopeLabel}
        />
      )}
    </div>
  );
}
