// Client: Vista completa de récords históricos y palmarés individual
"use client";

import { useState } from "react";
import type { IndividualAward, LegacyPlayerRecord } from "@/lib/historical/legacy-types";
import { PlayerPhoto } from "@/components/media/player-photo";
import { LegacyPodium } from "./legacy-podium";

interface LegacyRankingsViewProps {
  readonly topAppearances: readonly LegacyPlayerRecord[];
  readonly topScorers: readonly LegacyPlayerRecord[];
  readonly topSeasons: readonly LegacyPlayerRecord[];
  readonly individualAwards: readonly IndividualAward[];
}

type RankingCategory = "appearances" | "scorers" | "seasons" | "awards";

const CATEGORIES: readonly { readonly id: RankingCategory; readonly label: string }[] = [
  { id: "appearances", label: "Más Partidos" },
  { id: "scorers", label: "Máximos Goleadores" },
  { id: "seasons", label: "Más Temporadas" },
  { id: "awards", label: "Pichichis y Zamoras" },
];

export function LegacyRankingsView({
  topAppearances,
  topScorers,
  topSeasons,
  individualAwards,
}: LegacyRankingsViewProps) {
  const [activeCategory, setActiveCategory] = useState<RankingCategory>("appearances");

  const currentList =
    activeCategory === "appearances"
      ? topAppearances
      : activeCategory === "scorers"
      ? topScorers
      : topSeasons;

  const metricLabel =
    activeCategory === "appearances"
      ? "partidos"
      : activeCategory === "scorers"
      ? "goles"
      : "temporadas";

  const getMetric = (p: LegacyPlayerRecord) =>
    activeCategory === "appearances"
      ? p.totalPlayed
      : activeCategory === "scorers"
      ? p.totalGoals
      : p.seasonCount;

  return (
    <div className="flex flex-col gap-6">
      {/* Subcategory Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-sans transition-all active:scale-95 ${
                isSelected
                  ? "bg-[var(--primary)] text-white font-bold shadow-2xs"
                  : "border border-[var(--border)] bg-white text-[var(--muted-foreground)] font-semibold hover:border-neutral-300 hover:text-[var(--foreground)]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Mode A: Individual Awards */}
      {activeCategory === "awards" ? (
        <section aria-label="Trofeos individuales oficiales" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {individualAwards.map((award, index) => (
              <article
                key={`${award.season}-${award.awardName}-${index}`}
                className="flex items-center gap-3.5 rounded-xl border border-[var(--border)] bg-white p-3.5 shadow-2xs"
              >
                <div className="overflow-hidden rounded-full border border-neutral-100 shadow-2xs shrink-0">
                  <PlayerPhoto
                    photoUrl={award.photoUrl}
                    playerName={award.winnerName}
                    size="sm"
                    className="h-12 w-12 object-cover object-top"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-[var(--primary)] px-2 py-0.2 text-[10px] font-bold text-white font-sans tabular-nums">
                      {award.season}
                    </span>
                    <span className="text-[10px] font-semibold text-neutral-500 truncate">
                      {award.division}
                    </span>
                  </div>
                  <h4 className="mt-1 text-xs font-bold text-[var(--foreground)] truncate">
                    {award.winnerName}
                  </h4>
                  <span className="text-xs font-black text-neutral-900 font-sans tabular-nums">
                    {award.awardName} ({award.statLabel})
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        /* Mode B: Top 20 Rankings with Podium and Table */
        <section aria-label={`Ranking de ${metricLabel}`} className="flex flex-col gap-6">
          <LegacyPodium
            topPlayers={currentList.slice(0, 3)}
            metricLabel={metricLabel}
            getMetricValue={getMetric}
          />

          {/* Ranking Table */}
          <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-neutral-50/70 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  <th scope="col" className="py-2.5 px-3 text-center w-12">Pos</th>
                  <th scope="col" className="py-2.5 px-3">Futbolista</th>
                  <th scope="col" className="py-2.5 px-3">Posición</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Años Activo</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Récord</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/70 font-sans tabular-nums">
                {currentList.map((player) => (
                  <tr key={player.name} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-2.5 px-3 text-center font-bold text-neutral-500">
                      {player.rank <= 3 ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-white text-[10px] font-black">
                          {player.rank}
                        </span>
                      ) : (
                        `${player.rank}º`
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[var(--foreground)]">
                      <div className="flex items-center gap-2">
                        <PlayerPhoto
                          photoUrl={player.photoUrl}
                          playerName={player.name}
                          size="sm"
                          className="h-7 w-7 rounded-full object-cover object-top shrink-0"
                        />
                        <span className="truncate">{player.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600 font-medium">{player.position}</td>
                    <td className="py-2.5 px-3 text-center text-neutral-500 font-medium">
                      {player.startSeason} – {player.endSeason} ({player.seasonCount} temp.)
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-neutral-900 text-sm">
                      {getMetric(player)} {metricLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
