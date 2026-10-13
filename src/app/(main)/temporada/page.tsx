import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getDictionary } from "@/i18n";
import { TeamCrest } from "@/components/media/team-crest";
import { fetchStandings, fetchNextFixture } from "@/lib/sports-api/client";
import { getStadiumAsset } from "@/lib/sports-api/stadiums";
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
      fetchStandings(undefined, undefined, { includeSplits: false }),
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

  const matchKickoff = match ? formatKickoff(match.kickoffAt) : null;
  const seasonLabel = getSeasonLabel();
  const dict = getDictionary();
  const stadiumAsset = match
    ? getStadiumAsset({
        teamExternalId: match.homeTeam.externalId,
        isSporting: match.homeTeam.isSporting,
        venueName: match.venue,
      })
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* ================================================================= */}
      {/* HERO: Partido Destacado                                          */}
      {/* ================================================================= */}
      <section aria-label="Partido del Real Sporting" className="w-full">
        <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-white p-6 shadow-2xs">
          {stadiumAsset && (
            <div
              className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden"
              aria-hidden="true"
            >
              <Image
                src={stadiumAsset.imagePath}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover opacity-10"
                priority
              />
            </div>
          )}

          <div className="relative z-10 flex items-center justify-between border-b border-[var(--border)] pb-3">
            <span className="text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">
              {match
                ? `${dict.season.match.matchday} ${match.matchday ?? "—"} · ${dict.season.competitionName}`
                : dict.season.match.nextFixture}
            </span>
          </div>

          {match && matchKickoff ? (
            <div className="relative z-10">
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
                <div className="flex flex-col items-center justify-center rounded-md bg-[var(--surface)]/90 backdrop-blur-xs py-3 px-4 text-center md:col-span-1 shadow-2xs border border-[var(--border)]/40">
                  <span className="text-xs font-bold tracking-widest text-[var(--foreground-muted)] uppercase">
                    {matchKickoff.date}
                  </span>
                  <span className="text-2xl font-black tracking-tight text-[var(--foreground)]">
                    {match.status === "finished" && match.homeScore !== null && match.awayScore !== null
                      ? `${match.homeScore} - ${match.awayScore}`
                      : match.isTimeConfirmed === false
                      ? dict.season.match.vs
                      : matchKickoff.time}
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

              {/* Estadio donde se disputa el partido */}
              {match.venue && (
                <div className="flex items-center justify-center border-t border-[var(--border)]/60 pt-3 text-center">
                  <span className="text-xs font-medium text-[var(--foreground-muted)]">
                    {match.venue}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="relative z-10 py-8 text-center">
              <p className="text-sm text-[var(--foreground-muted)]">
                {dict.season.match.noMatchInfo}
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
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">
                {dict.season.standings.title}
              </h2>
              <span className="text-xs text-[var(--foreground-muted)]">
                {dict.season.competitionName} {seasonLabel}
              </span>
            </div>
            <Link
              href="/temporada/clasificacion"
              className="text-xs font-semibold text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] rounded-xs"
            >
              {dict.common.viewAll} &rarr;
            </Link>
          </div>

          {standings.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">
                    {dict.season.standings.title} de {dict.season.competitionName} {seasonLabel}
                  </caption>
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs font-semibold text-[var(--foreground-muted)] uppercase">
                      <th scope="col" className="w-10 sm:w-12 py-2.5 pl-3 text-center">
                        {dict.season.standings.columns.pos}
                      </th>
                      <th scope="col" className="py-2.5 pr-2">
                        {dict.season.standings.columns.team}
                      </th>
                      <th scope="col" className="w-14 sm:w-16 py-2.5 text-center" title={dict.season.standings.columnTitles.played}>
                        {dict.season.standings.columns.played}
                      </th>
                      <th scope="col" className="w-14 sm:w-16 py-2.5 pr-3 text-right" title={dict.season.standings.columnTitles.points}>
                        {dict.season.standings.columns.points}
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

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3 text-[11px] text-[var(--foreground-muted)]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-xs bg-neutral-800" aria-hidden="true" />
                    {dict.season.standings.zones.promotion}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-xs bg-neutral-300" aria-hidden="true" />
                    {dict.season.standings.zones.playoff}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-xs bg-red-700" aria-hidden="true" />
                    {dict.season.standings.zones.relegation}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm text-[var(--foreground-muted)]">
                {dict.season.standings.noData}
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
