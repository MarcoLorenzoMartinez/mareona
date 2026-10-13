import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { TeamCrest } from "@/components/media/team-crest";
import { fetchStandings, fetchNextFixture } from "@/lib/sports-api/client";
import {
  getSeasonLabel,
  type DomainStandingRow,
  type DomainMatchSummary,
} from "@/lib/sports-api/types";

export const metadata: Metadata = {
  title: "Temporada — Mareona",
  description: "Partidos, clasificación y actualidad del Real Sporting de Gijón.",
};

/**
 * Formats match kickoff timestamp according to Europe/Madrid timezone.
 */
function formatKickoff(dateStr: string): { date: string; time: string } {
  try {
    const d = new Date(dateStr);
    const date = new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid",
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(d);
    const time = new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
    return { date, time };
  } catch {
    return { date: "Próximamente", time: "--:--" };
  }
}

/**
 * Loading skeleton matching the minimalist Hero card and table layout.
 */
function SeasonSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" aria-busy="true">
      {/* Hero skeleton */}
      <div className="h-44 rounded-xl border border-[var(--border)] bg-white p-6 shadow-2xs" />
      {/* Table skeleton */}
      <div className="h-96 rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs" />
    </div>
  );
}

/**
 * Async content component fetching and rendering live sports data.
 */
async function SeasonContent() {
  await connection();

  let standings: readonly DomainStandingRow[] = [];
  let match: DomainMatchSummary | null = null;

  try {
    const [standingsRes, matchRes] = await Promise.allSettled([
      fetchStandings(),
      fetchNextFixture(),
    ]);

    if (standingsRes.status === "fulfilled" && standingsRes.value.length > 0) {
      standings = standingsRes.value;
    }

    if (matchRes.status === "fulfilled") {
      match = matchRes.value;
    }
  } catch {
    // Si la llamada falla, no se inventan datos de muestra: se muestra aviso informativo al usuario
  }

  const sportingRow = standings.find((s) => s.isSporting);
  const matchKickoff = match ? formatKickoff(match.kickoffAt) : null;
  const seasonLabel = getSeasonLabel();

  return (
    <div className="flex flex-col gap-6">
      {/* ================================================================= */}
      {/* HERO: Partido Destacado                                          */}
      {/* ================================================================= */}
      <section aria-label="Partido del Real Sporting" className="w-full">
        <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <span className="text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">
              {match ? `Jornada ${match.matchday ?? "—"} · LaLiga Hypermotion` : "Próximo Encuentro"}
            </span>
            {match && (
              <span className="text-xs font-medium text-[var(--foreground-muted)]">
                {match.status === "finished" ? "Finalizado" : "Programado"}
              </span>
            )}
          </div>

          {match && matchKickoff ? (
            <div className="grid grid-cols-1 items-center gap-6 py-6 md:grid-cols-7">
              {/* Equipo Local */}
              <div className="flex items-center justify-start gap-3.5 md:col-span-3 md:justify-end">
                <span className="text-lg font-bold text-[var(--foreground)] md:text-xl">
                  {match.homeTeam.name}
                </span>
                <TeamCrest
                  crestUrl={match.homeTeam.crestUrl}
                  teamName={match.homeTeam.name}
                  size="lg"
                  isSporting={match.homeTeam.isSporting}
                />
              </div>

              {/* Marcador / Horario */}
              <div className="flex flex-col items-center justify-center rounded-md bg-[var(--surface)] py-3 px-4 text-center md:col-span-1">
                <span className="text-xs font-bold tracking-widest text-[var(--foreground-muted)] uppercase">
                  {matchKickoff.date}
                </span>
                <span className="text-2xl font-black tracking-tight text-[var(--foreground)]">
                  {match.status === "finished" && match.homeScore !== null && match.awayScore !== null
                    ? `${match.homeScore} - ${match.awayScore}`
                    : matchKickoff.time}
                </span>
                <span className="truncate text-[11px] font-medium text-[var(--foreground-muted)]">
                  {match.venue ?? "El Molinón"}
                </span>
              </div>

              {/* Equipo Visitante */}
              <div className="flex items-center justify-start gap-3.5 md:col-span-3">
                <TeamCrest
                  crestUrl={match.awayTeam.crestUrl}
                  teamName={match.awayTeam.name}
                  size="lg"
                  isSporting={match.awayTeam.isSporting}
                />
                <span className="text-lg font-bold text-[var(--foreground)] md:text-xl">
                  {match.awayTeam.name}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-[var(--foreground-muted)]">
                No se dispone de información del próximo partido en este momento.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================= */}
      {/* BLOQUE INFERIOR: Clasificación Real LaLiga Hypermotion           */}
      {/* ================================================================= */}
      <section aria-label="Clasificación" className="w-full">
        <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h2 className="text-base font-bold text-[var(--foreground)]">
              Clasificación
            </h2>
            <span className="text-xs text-[var(--foreground-muted)]">
              LaLiga Hypermotion {seasonLabel}
            </span>
          </div>

          {standings.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">
                    Clasificación de LaLiga Hypermotion {seasonLabel}
                  </caption>
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs font-semibold text-[var(--foreground-muted)] uppercase">
                      <th scope="col" className="w-12 py-2.5 pl-3 text-center">
                        Pos
                      </th>
                      <th scope="col" className="py-2.5">
                        Equipo
                      </th>
                      <th scope="col" className="w-16 py-2.5 text-center">
                        PJ
                      </th>
                      <th scope="col" className="w-16 py-2.5 pr-3 text-right">
                        Pts
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {standings.map((row) => {
                      const isDirectPromotion = row.position <= 2;
                      const isPlayoff = row.position >= 3 && row.position <= 6;
                      const isRelegation =
                        standings.length > 4 ? row.position > standings.length - 4 : false;

                      return (
                        <tr
                          key={row.teamExternalId}
                          className={`transition-colors ${
                            row.isSporting
                              ? "bg-red-50/70 font-semibold text-[var(--foreground)]"
                              : "hover:bg-[var(--surface)] text-[var(--foreground)]"
                          }`}
                        >
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
                                  ? ", Ascenso directo"
                                  : isPlayoff
                                    ? ", Playoff de ascenso"
                                    : isRelegation
                                      ? ", Descenso"
                                      : ""
                              }`}
                            >
                              {row.position}
                            </span>
                          </td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-2.5">
                              <TeamCrest
                                crestUrl={row.crestUrl}
                                teamName={row.teamName}
                                size="sm"
                                isSporting={row.isSporting}
                              />
                              <span
                                className={`truncate text-sm ${
                                  row.isSporting ? "font-bold text-[var(--primary)]" : ""
                                }`}
                              >
                                {row.teamName}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 text-center text-[var(--foreground-muted)]">
                            {row.played}
                          </td>
                          <td className="py-2.5 pr-3 text-right font-bold text-[var(--foreground)]">
                            {row.points}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3 text-[11px] text-[var(--foreground-muted)]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-xs bg-neutral-800" aria-hidden="true" />
                    Ascenso directo
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-xs bg-neutral-300" aria-hidden="true" />
                    Playoff
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-xs bg-red-700" aria-hidden="true" />
                    Descenso
                  </span>
                </div>
                {sportingRow && (
                  <span className="font-medium text-[var(--primary)]">
                    Sporting: {sportingRow.position}ª posición · {sportingRow.points} pts
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm text-[var(--foreground-muted)]">
                No se dispone de datos de la clasificación en este momento.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/**
 * Root Server Component for /temporada.
 * Wraps dynamic content inside Suspense for streaming and Partial Prerendering compliance.
 */
export default function TemporadaPage() {
  return (
    <Suspense fallback={<SeasonSkeleton />}>
      <SeasonContent />
    </Suspense>
  );
}
